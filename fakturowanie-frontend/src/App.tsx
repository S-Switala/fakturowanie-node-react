import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ClientsPage from './pages/ClientsPage'
import InvoicesPage from './pages/InvoicesPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'

function App() {
	const token = localStorage.getItem('token')

	return (
		<Routes>
			<Route path='/' element={<Navigate to='/login' />} />
			<Route path='/login' element={<LoginPage />} />
			<Route path='/register' element={<RegisterPage />} />
			<Route path='/clients' element={token ? <ClientsPage /> : <Navigate to='/login' />} />
			<Route path='/invoices' element={token ? <InvoicesPage /> : <Navigate to='/login' />} />
			<Route path='/profil' element={token ? <ProfilePage /> : <Navigate to='/login' />} />
		</Routes>
	)
}

export default App
