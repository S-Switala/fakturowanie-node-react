import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { ENDPOINTS, API_URL } from '../config'

// --- klucze do tymczasowego przechowania formularza/flag ---
const PRELOGIN_KEY = 'prelogin'
const WARMED_RELOADED = 'warmed_reloaded'

// --- anonimowy klient do /health (bez Authorization, brak preflight) ---
export const anon = axios.create({ baseURL: API_URL, timeout: 8000 })
anon.interceptors.request.use(cfg => {
	if (cfg.headers) {
		delete (cfg.headers as any).Authorization
		delete (cfg.headers as any)['X-Requested-With']
	}
	return cfg
})

function isColdStart(err: any) {
	const status = err?.response?.status
	const code = err?.code
	return (
		!status ||
		status === 0 ||
		status === 500 ||
		status === 502 ||
		status === 503 ||
		status === 504 ||
		code === 'ECONNABORTED'
	)
}

/** Warmup backendu — kilka prób GET /health?deep=1 */
export async function warmup(max = 6) {
	for (let i = 0; i < max; i++) {
		try {
			await anon.get('/health', {
				params: { t: Date.now(), deep: 1 },
				timeout: 15000,
			})
			return true
		} catch {
			await new Promise(r => setTimeout(r, 500 * (i + 1)))
		}
	}
	return false
}

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [busy, setBusy] = useState(false)
	const [msg, setMsg] = useState<string | null>(null)
	const navigate = useNavigate()

	// --- wspólna funkcja logowania (na klik i auto-po-reloadzie) ---
	const tryLogin = async (e: string, p: string) => {
		const res = await axios.post(ENDPOINTS.login, { email: e, password: p }, { timeout: 20000 })
		const token = res?.data?.access_token || res?.data?.accessToken || res?.data?.token
		if (!token) throw new Error('Brak tokenu w odpowiedzi serwera')
		localStorage.setItem('token', token)
		axios.defaults.headers.common.Authorization = `Bearer ${token}`
		navigate('/clients')
	}

	// Przy wejściu:
	// - odtwarzamy dane zapisane przed auto-reloadem,
	// - jeśli przyszliśmy z warmupu (flaga), od razu robimy auto-logowanie,
	// - lekki warmup w tle (dla „normalnego” wejścia).
	useEffect(() => {
		const pre = sessionStorage.getItem(PRELOGIN_KEY)
		const wasReloaded = sessionStorage.getItem(WARMED_RELOADED) === '1'

		if (pre) {
			try {
				const { email: e, password: p } = JSON.parse(pre)
				if (e) setEmail(e)
				if (p) setPassword(p)
				// UWAGA: nie kasujemy tu prelogina dopóki nie spróbujemy auto-logowania
			} catch {
				sessionStorage.removeItem(PRELOGIN_KEY)
			}
		}

		const autoLoginAfterReload = async () => {
			try {
				setMsg('Kończę wybudzanie… loguję automatycznie')
				// krótka zwłoka + 1-2 szybkie pingi, by dać DB czas na „ustabilizowanie”
				await new Promise(r => setTimeout(r, 600))
				await warmup(2)
				const saved = sessionStorage.getItem(PRELOGIN_KEY)
				if (saved) {
					const { email: e, password: p } = JSON.parse(saved)
					await tryLogin(e, p)
				}
			} catch (err: any) {
				// nic—po prostu zostawiamy formularz wypełniony, user kliknie ręcznie
			} finally {
				sessionStorage.removeItem(PRELOGIN_KEY)
				sessionStorage.removeItem(WARMED_RELOADED)
				setMsg(null)
			}
		}

		if (wasReloaded) {
			autoLoginAfterReload()
		} else {
			// „miękki” warmup przy zwykłym wejściu
			warmup()
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setMsg(null)
		setBusy(true)

		try {
			// pre-warmup przed 1. próbą logowania
			setMsg('Budzenie serwera…')
			await warmup(3)

			await tryLogin(email, password)
			setMsg(null)
		} catch (err: any) {
			// jeśli wygląda na zimny start — budzimy agresywniej i robimy auto-odświeżenie + auto-logowanie
			if (isColdStart(err)) {
				setMsg('Serwer się budzi… odświeżę stronę automatycznie')
				const ok = await warmup(6)
				if (ok) {
					// zapisz formularz (w produkcji możesz pominąć hasło)
					sessionStorage.setItem(PRELOGIN_KEY, JSON.stringify({ email, password }))
					sessionStorage.setItem(WARMED_RELOADED, '1')
					// krótka zwłoka zanim przeładujemy, żeby Railway/DB miały chwilę
					setTimeout(() => {
						window.location.replace(window.location.href) // bez dodawania wpisu do historii
					}, 800)
					return
				}
			}

			const status = err?.response?.status
			if (status === 401) setMsg('Nieprawidłowy e-mail lub hasło.')
			else if (status === 409) setMsg('Konflikt danych (np. e-mail już istnieje).')
			else if (status === 503) setMsg('Usługa wstaje… spróbuj ponownie za moment.')
			else setMsg('Błąd logowania. Spróbuj ponownie.')
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className='min-h-screen bg-gray-100 flex items-center justify-center'>
			<div className='w-80'>
				{/* Sekcja z przykładowym użytkownikiem */}
				<div className='mb-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 shadow'>
					<p className='font-semibold mb-1'>Przykładowy użytkownik:</p>
					<p>
						<span className='font-medium'>Login:</span> demo@example.com
					</p>
					<p>
						<span className='font-medium'>Hasło:</span> Demo1234!
					</p>
				</div>

				{/* Formularz logowania */}
				<form onSubmit={handleLogin} className='bg-white p-6 rounded shadow-md'>
					<h2 className='text-xl font-bold mb-2 text-center'>Logowanie</h2>
					{msg && <p className='text-center text-sm mb-3 text-blue-700'>{msg}</p>}

					<input
						type='email'
						placeholder='Email'
						className='w-full mb-2 px-3 py-2 border rounded'
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
					/>
					<input
						type='password'
						placeholder='Hasło'
						className='w-full mb-4 px-3 py-2 border rounded'
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
					/>

					<button
						type='submit'
						className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60'
						disabled={busy}>
						{busy ? 'Logowanie…' : 'Zaloguj'}
					</button>

					<p className='text-center mt-4 text-sm'>
						Nie masz konta?{' '}
						<Link to='/register' className='text-blue-600 hover:underline'>
							Zarejestruj się
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}
