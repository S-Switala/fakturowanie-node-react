import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { ENDPOINTS, API_URL } from '../config'

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

// traktujemy to jako "zimny start" / sieciówka — robimy warmup i retry
function isColdStart(err: any) {
	const status = err?.response?.status
	return !status || status === 0 || status === 502 || status === 503 || status === 504
}

// lekki ping do backendu z małym backoffem
async function warmup(maxTries = 6) {
	for (let i = 0; i < maxTries; i++) {
		try {
			await axios.get(`${API_URL}/health`, { params: { t: Date.now() } })
			return true
		} catch {
			await sleep(400 * (i + 1)) // 0.4s, 0.8s, 1.2s, ...
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

	// delikatne rozgrzanie przy wejściu na stronę
	useEffect(() => {
		warmup()
	}, [])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setMsg(null)
		setBusy(true)

		const tryLogin = async () => {
			const res = await axios.post(ENDPOINTS.login, {
				email,
				password,
			})
			const token = res.data?.access_token || res.data?.accessToken || res.data?.token
			if (!token) throw new Error('Brak tokenu w odpowiedzi serwera')
			localStorage.setItem('token', token)
			// jeśli w innych miejscach też używasz axiosa, możesz ustawić nagłówek globalnie:
			axios.defaults.headers.common.Authorization = `Bearer ${token}`
			navigate('/clients')
		}

		try {
			await tryLogin()
		} catch (err: any) {
			// jeżeli to zimny start / błąd sieci – rozgrzej i spróbuj ponownie
			if (isColdStart(err)) {
				setMsg('Budzenie serwera… próbuję ponownie')
				const ok = await warmup()
				if (ok) {
					try {
						await tryLogin()
						return
					} catch (e2: any) {
						// jeśli po rozgrzaniu wciąż błąd – wpada do niższej gałęzi
						err = e2
					}
				} else {
					err = err || new Error('Serwer nie odpowiedział po rozgrzaniu')
				}
			}

			const status = err?.response?.status
			if (status === 401) setMsg('Nieprawidłowy e-mail lub hasło.')
			else if (status === 409) setMsg('Konflikt danych (np. e-mail już istnieje).')
			else if (status === 503) setMsg('Serwer się budzi… spróbuj ponownie za chwilę.')
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

					{msg && <p className='text-center mt-3 text-sm text-red-600'>{msg}</p>}

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
