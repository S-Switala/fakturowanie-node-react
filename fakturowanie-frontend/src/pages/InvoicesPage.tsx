// src/pages/InvoicesPage.tsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import InvoiceForm from '../components/Invoice/InvoiceForm'
import InvoiceFilters from '../components/Invoice/InvoiceFilters'
import InvoiceItem from '../components/Invoice/InvoiceItem'
import { ENDPOINTS } from '../config'

// ➜ JEDYNE źródło typów
import { type Client, type LineItem, type InvoiceListItem, type EditInvoiceData } from '@/types'

export default function InvoicesPage() {
	const [showForm, setShowForm] = useState(false)

	const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
	const [clients, setClients] = useState<Pick<Client, 'id' | 'name'>[]>([])

	const [title, setTitle] = useState('')
	const [amount, setAmount] = useState(0)
	const [clientId, setClientId] = useState('')
	const [dueDate, setDueDate] = useState('')
	const [paymentMethod, setPaymentMethod] = useState('')

	const [items, setItems] = useState<LineItem[]>([{ name: '', quantity: 1, unit: 'szt.', price: 0 }])

	const [sortBy, setSortBy] = useState('')
	const [order, setOrder] = useState<'asc' | 'desc'>('asc')

	const [editId, setEditId] = useState<string | null>(null)
	const [editData, setEditData] = useState<EditInvoiceData>({
		title: '',
		amount: 0,
		status: 'unpaid',
		clientId: '',
		dueDate: '',
		paymentMethod: '',
	})
	const [editItems, setEditItems] = useState<LineItem[]>([{ name: '', quantity: 1, unit: 'szt.', price: 0 }])
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

	const token = localStorage.getItem('token')

	// Pobieranie klientów
	useEffect(() => {
		axios
			.get(ENDPOINTS.clients, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then(res => {
				const list = (res.data as Client[]).map(c => ({ id: c.id, name: c.name }))
				setClients(list)
			})
			.catch(console.error)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Pobieranie faktur z filtrami
	useEffect(() => {
		const fetchFilteredInvoices = async () => {
			const params = new URLSearchParams()
			if (status) params.append('status', status)
			if (clientId) params.append('clientId', clientId)
			if (sortBy) params.append('sortBy', sortBy)
			if (order) params.append('order', order)

			const res = await axios.get(`${ENDPOINTS.invoices}?${params.toString()}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			setInvoices(res.data as InvoiceListItem[])
		}

		fetchFilteredInvoices().catch(console.error)
	}, [status, clientId, sortBy, order, token])

	// Dodawanie faktury
	const addInvoice = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!clientId || !title || items.some(i => !i.name || i.quantity <= 0 || i.price <= 0)) {
			alert('Wypełnij poprawnie wszystkie pozycje faktury.')
			return
		}

		// Mapy UI -> enumy backendowe
		const statusMap: Record<string, 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'> = {
			szkic: 'DRAFT',
			'do zapłaty': 'SENT', // <- dostosuj jeśli wolisz inny stan startowy
			opłacona: 'PAID',
			'po terminie': 'OVERDUE',
			anulowana: 'CANCELLED',
		}

		const paymentMap: Record<string, 'TRANSFER' | 'CASH' | 'CARD' | 'OTHER'> = {
			przelew: 'TRANSFER',
			gotówka: 'CASH',
			karta: 'CARD',
			inne: 'OTHER',
		}

		const payload: any = {
			title: title.trim(),
			clientId,
			status: statusMap[status] ?? 'SENT',
			dueDate: new Date(dueDate).toISOString(), // jeśli masz datepicker, który daje stringa
			items: items.map(it => ({
				name: it.name.trim(),
				unit: it.unit || 'szt.',
				quantity: Number(it.quantity),
				price: Number(it.price),
			})),
		}

		// Dołącz paymentMethod tylko jeśli ustawione i nie jest pustym stringiem
		if (paymentMethod && paymentMethod.trim() !== '') {
			payload.paymentMethod = paymentMap[paymentMethod] ?? paymentMethod // jeśli już trzymasz enuma – przejdzie bez mapy
		}

		const res = await axios.post(ENDPOINTS.invoices, payload, {
			headers: { Authorization: `Bearer ${token}` },
		})

		setInvoices(prev => [...prev, res.data as InvoiceListItem])

		setTitle('')
		setClientId('')
		setDueDate('')
		setPaymentMethod('')
		setItems([{ name: '', quantity: 1, unit: 'szt.', price: 0 }])
	}

	// Usuwanie faktury
	const deleteInvoice = async (id: string) => {
		if (!confirm('Na pewno usunąć fakturę?')) return
		await axios.delete(`${ENDPOINTS.invoices}/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
		setInvoices(prev => prev.filter(i => i.id !== id))
	}

	// Zapis edycji
	const saveEdit = async () => {
		if (!editId) return

		// Zbuduj payload zgodny z UpdateInvoiceDto
		const payload: any = {
			title: editData.title?.trim(),
			items: editItems.map(({ name, unit, quantity, price }) => ({
				name: name.trim(),
				unit: unit || 'szt.',
				quantity: Number(quantity),
				price: Number(price),
			})),
		}

		// status (jeśli używasz w edycji)
		if (editData.status) payload.status = editData.status // 'DRAFT' | 'SENT' | ...

		// paymentMethod – nie wysyłaj pustego stringa
		if (editData.paymentMethod && editData.paymentMethod !== '') {
			payload.paymentMethod = editData.paymentMethod // 'TRANSFER' | 'CASH' | ...
		}

		// dueDate: '' -> nie wysyłaj; 'YYYY-MM-DD' -> ISO
		if (editData.dueDate === '') {
			// nic – undefined => nie aktualizuj pola
		} else if (editData.dueDate) {
			const d = new Date(editData.dueDate)
			if (isNaN(d.getTime())) {
				alert('Nieprawidłowy termin płatności')
				return
			}
			payload.dueDate = d.toISOString()
		}

		// WAŻNE: NIE wysyłaj clientId (dopóki backend go nie obsługuje)
		// NIE rozlewaj całego editData: {...editData,...}

		try {
			const res = await axios.put(`${ENDPOINTS.invoices}/${editId}`, payload, {
				headers: { Authorization: `Bearer ${token}` },
			})

			setInvoices(prev =>
				prev.map(inv =>
					inv.id === editId
						? {
								...inv,
								// aktualizuj pola, które realnie mogły się zmienić
								title: payload.title ?? inv.title,
								paymentMethod: payload.paymentMethod ?? inv.paymentMethod,
								dueDate: payload.dueDate ?? inv.dueDate,
								status: payload.status ?? inv.status,
								// klienta NIE zmieniamy tutaj (bo nie szedł do backendu)
								items: res.data.items,
								amount: res.data.amount,
						  }
						: inv
				)
			)

			setEditId(null)
		} catch (err: any) {
			console.error('Update invoice error:', err?.response?.data ?? err)
			alert(JSON.stringify(err?.response?.data ?? {}, null, 2))
		}
	}

	// PDF
	const downloadPdf = async (id: string) => {
		if (!token) return alert('Brak tokena – zaloguj się')

		try {
			const res = await axios.get(`${ENDPOINTS.invoices}/${id}/pdf`, {
				headers: { Authorization: `Bearer ${token}` },
				responseType: 'blob',
			})

			const blob = new Blob([res.data], { type: 'application/pdf' })
			const url = URL.createObjectURL(blob)
			window.open(url, '_blank')
			setTimeout(() => URL.revokeObjectURL(url), 60_000)
		} catch (e: any) {
			const status = e?.response?.status
			if (status === 401) {
				alert('Sesja wygasła – zaloguj się ponownie.')
			} else if (status === 404) {
				alert('Nie znaleziono faktury.')
			} else {
				console.error('PDF error:', e?.response?.data ?? e)
				alert('Nie udało się pobrać PDF.')
			}
		}
	}

	// Start edycji z faktury (np. klik „Edytuj”)
	const startEdit = (invoice: InvoiceListItem) => {
		setEditId(invoice.id)
		setEditItems(invoice.items || [])
		setEditData({
			title: invoice.title,
			amount: invoice.amount,
			status: invoice.status,
			clientId: invoice.client.id,
			dueDate: invoice.dueDate.split('T')[0],
			paymentMethod: invoice.paymentMethod || '',
		})
	}

	// Wariant „setEditFields” wywoływany z dziecka (InvoiceItem) – przyjmuje dane + ID
	const setEditFieldsFromChild = (data: EditInvoiceData & { id: string }, currentInvoiceItems?: LineItem[]) => {
		setEditId(data.id)
		setEditData({
			title: data.title,
			amount: data.amount,
			status: data.status,
			clientId: data.clientId,
			dueDate: data.dueDate,
			paymentMethod: data.paymentMethod,
		})
		if (currentInvoiceItems) {
			setEditItems(currentInvoiceItems)
		}
	}

	return (
		<div className='min-h-screen bg-gray-100'>
			<Navbar />

			<div className='p-6 max-w-6xl mx-auto'>
				<h1 className='text-3xl font-bold mb-6 text-blue-700 text-center lg:text-center'>Faktury</h1>

				{/* Desktop: sidebar + main; Mobile: jedna kolumna */}
				<div className='lg:grid lg:grid-cols-[260px_1fr] lg:gap-6'>
					{/* ===== LEFT SIDEBAR (DESKTOP) ===== */}
					<aside className='hidden lg:block'>
						<div className='sticky top-6'>
							<InvoiceFilters
								clientId={clientId}
								sortBy={sortBy}
								order={order}
								clients={clients}
								setClientId={setClientId}
								setSortBy={setSortBy}
								setOrder={setOrder}
							/>
						</div>
					</aside>

					{/* ===== RIGHT MAIN ===== */}
					<main>
						{/* MOBILE: wysuwane filtry */}
						<div className='lg:hidden mb-4'>
							<button
								type='button'
								onClick={() => setMobileFiltersOpen(o => !o)}
								className='w-full bg-white border rounded px-4 py-3 shadow flex items-center justify-between'>
								<span className='font-semibold'>Filtry</span>
								<span className='text-sm text-blue-600 underline'>{mobileFiltersOpen ? 'Schowaj' : 'Pokaż'}</span>
							</button>

							{mobileFiltersOpen && (
								<div className='mt-2'>
									<InvoiceFilters
										clientId={clientId}
										sortBy={sortBy}
										order={order}
										clients={clients}
										setClientId={setClientId}
										setSortBy={setSortBy}
										setOrder={setOrder}
									/>
								</div>
							)}
						</div>

						{/* Przycisk toggle formularza */}
						<div className='text-center lg:text-right mb-6'>
							<button
								onClick={() => setShowForm(prev => !prev)}
								className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
								{showForm ? 'Ukryj formularz' : 'Dodaj nową fakturę'}
							</button>
						</div>

						{/* Formularz dodawania (po prawej kolumnie) */}
						{showForm && (
							<InvoiceForm
								title={title}
								amount={amount}
								clientId={clientId}
								clients={clients}
								dueDate={dueDate}
								setDueDate={setDueDate}
								paymentMethod={paymentMethod}
								setPaymentMethod={setPaymentMethod}
								setTitle={setTitle}
								setAmount={setAmount}
								setClientId={setClientId}
								items={items}
								setItems={setItems}
								onSubmit={addInvoice}
								onCancel={() => setShowForm(false)}
							/>
						)}

						{/* Lista faktur */}
						<div className='grid gap-4'>
							{invoices.map(invoice => (
								<InvoiceItem
									key={invoice.id}
									invoice={invoice as unknown as any}
									clients={clients as any}
									isEditing={editId === invoice.id}
									editData={editData}
									setEditFields={data => setEditFieldsFromChild(data, invoice.items)}
									onStartEdit={() => startEdit(invoice)}
									saveEdit={saveEdit}
									cancelEdit={() => setEditId(null)}
									deleteInvoice={deleteInvoice}
									downloadPdf={downloadPdf}
									setField={(field, val) => setEditData(prev => ({ ...prev, [field]: val } as EditInvoiceData))}
									items={editItems}
									setItems={setEditItems}
								/>
							))}
						</div>
					</main>
				</div>
			</div>
		</div>
	)
}
