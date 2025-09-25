import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { ENDPOINTS } from '../config'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const res = await axios.post(ENDPOINTS.login, {
				email,
				password,
			})
			const token = res.data.access_token
			localStorage.setItem('token', token)
			navigate('/clients') // przekierowanie po zalogowaniu
		} catch (err) {
			alert('Błąd logowania. Sprawdź dane.')
		}
	}

	return (
		<div className='min-h-screen bg-gray-100 flex items-center justify-center'>
			<div className='w-80'>
				{/* Sekcja z przykładowym użytkownikiem */}
				<div className="mb-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 shadow">
					<p className="font-semibold mb-1">Przykładowy użytkownik:</p>
					<p><span className="font-medium">Login:</span> demo@example.com</p>
					<p><span className="font-medium">Hasło:</span> Demo1234!</p>
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
					<button type='submit' className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700'>
						Zaloguj
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
