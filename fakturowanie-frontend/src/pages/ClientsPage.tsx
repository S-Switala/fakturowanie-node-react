import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import ClientCard from '../components/clients/ClientCard'
import ClientEditForm from '../components/clients/ClientEditForm'
import ClientAddForm from '../components/clients/ClientAddForm'
import { ENDPOINTS } from "../config";
import { type Client } from '@/types'



export default function ClientsPage() {
	const [clients, setClients] = useState<Client[]>([])
	const [loading, setLoading] = useState(true)
	const [editId, setEditId] = useState<string | null>(null)
	const [showAddForm, setShowAddForm] = useState(false)

	useEffect(() => {
		const fetchClients = async () => {
			try {
				const token = localStorage.getItem('token')
				const res = await axios.get(ENDPOINTS.clients, {
					headers: { Authorization: `Bearer ${token}` },
				})
				setClients(res.data)
			} catch (err) {
				console.error('Błąd podczas pobierania klientów', err)
			} finally {
				setLoading(false)
			}
		}
		fetchClients()
	}, [])

	const deleteClient = async (id: string) => {
		if (!confirm('Na pewno usunąć klienta?')) return
		const token = localStorage.getItem('token')
		await axios.delete(`${ENDPOINTS.clients}/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
		setClients(prev => prev.filter(c => c.id !== id))
	}

	const saveEdit = async (updatedClient: Client) => {
		if (!editId) return
		try {
			const token = localStorage.getItem('token')

			// Aktualizacja klienta
			await axios.put(`${ENDPOINTS.clients}/${editId}`, updatedClient, {
				headers: { Authorization: `Bearer ${token}` },
			})

			// Ponowne pobranie wszystkich klientów
			const res = await axios.get(ENDPOINTS.clients, {
				headers: { Authorization: `Bearer ${token}` },
			})

			setClients(res.data)
			setEditId(null)
		} catch (err) {
			console.error('Błąd zapisu edycji:', err)
			alert('Nie udało się zapisać zmian.')
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-100'>
				<p className='text-gray-600'>Ładowanie klientów...</p>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-100'>
			<Navbar />
			<div className='p-6 max-w-3xl mx-auto'>
				<h1 className='text-3xl font-bold text-center mb-6 text-blue-700'>Twoi Klienci</h1>
				<div className='grid gap-4'>
					{clients.map(client =>
						editId === client.id ? (
							<ClientEditForm key={client.id} client={client} onCancel={() => setEditId(null)} onSave={saveEdit} />
						) : (
							<ClientCard
								key={client.id}
								client={client}
								onEdit={() => setEditId(client.id)}
								onDelete={() => deleteClient(client.id)}
							/>
						)
					)}
				</div>
				<div className='mt-10 text-center'>
					{showAddForm ? (
						<ClientAddForm
							onAdd={client => {
								setClients(prev => [...prev, client])
								setShowAddForm(false) // ukryj formularz po dodaniu
							}}
						/>
					) : (
						<button
							onClick={() => setShowAddForm(true)}
							className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow'>
							Dodaj nowego klienta
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
