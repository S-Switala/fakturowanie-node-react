import { useNavigate } from 'react-router-dom'

export default function Navbar() {
	const navigate = useNavigate()

	const logout = () => {
		localStorage.removeItem('token')
		navigate('/login')
	}

	return (
		<nav className='bg-white shadow'>
			<div className='max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4'>
				<div className='flex gap-4'>
					<button onClick={() => navigate('/clients')} className='text-blue-700 font-semibold hover:underline'>
						Klienci
					</button>
					<button onClick={() => navigate('/invoices')} className='text-blue-700 font-semibold hover:underline'>
						Faktury
					</button>
					<button onClick={() => navigate('/profil')} className='text-blue-700 font-semibold hover:underline'>
						Profil
					</button>
				</div>
				<button onClick={logout} className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'>
					Wyloguj
				</button>
			</div>
		</nav>
	)
}
