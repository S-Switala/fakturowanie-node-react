import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { ENDPOINTS, API_URL } from '../config'

export const anon = axios.create({ baseURL: API_URL, timeout: 8000 })

// gwarancja: brak Authorization i zbędnych X-* nagłówków
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

export async function warmup(max = 6) {
	for (let i = 0; i < max; i++) {
		try {
			await anon.get('/health', { params: { t: Date.now() } }) // prosty GET, brak preflightu
			return true
		} catch {
			await new Promise(r => setTimeout(r, 400 * (i + 1)))
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

	// lekki warmup przy wejściu (nie blokuje UI)
	useEffect(() => {
		warmup()
	}, [])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setMsg(null)
		setBusy(true)

		const tryLogin = async () => {
			const res = await axios.post(ENDPOINTS.login, { email, password }, { timeout: 12000 })
			const token = res?.data?.access_token || res?.data?.accessToken || res?.data?.token
			if (!token) throw new Error('Brak tokenu w odpowiedzi serwera')
			localStorage.setItem('token', token)
			axios.defaults.headers.common.Authorization = `Bearer ${token}`
			navigate('/clients')
		}

		try {
			// PRZED pierwszym logowaniem budzimy backend (to często załatwia sprawę)
			setMsg('Budzenie serwera…')
			await warmup(3)

			await tryLogin()
			setMsg(null)
		} catch (err: any) {
			if (isColdStart(err)) {
				setMsg('Serwer się budzi… próbuję ponownie')
				const ok = await warmup(6)
				if (ok) {
					try {
						await tryLogin()
						setMsg(null)
						return
					} catch (e2: any) {
						err = e2
					}
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
				<div className='mb-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 shadow'>
					<p className='font-semibold mb-1'>Przykładowy użytkownik:</p>
					<p>
						<span className='font-medium'>Login:</span> demo@example.com
					</p>
					<p>
						<span className='font-medium'>Hasło:</span> Demo1234!
					</p>
				</div>

				<form onSubmit={handleLogin} className='bg-white p-6 rounded shadow-md'>
					<h2 className='text-xl font-bold mb-4 text-center'>Logowanie</h2>

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

					{msg && <p className='text-center mt-3 text-sm text-blue-700'>{msg}</p>}

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
