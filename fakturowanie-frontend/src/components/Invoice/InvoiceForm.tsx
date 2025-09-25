import React from 'react'
import { type Client, type LineItem } from '@/types'

interface Props {
	title: string
	amount?: number
	items: LineItem[]
	clientId: string
	dueDate: string
	paymentMethod: string
	clients: Pick<Client, 'id' | 'name'>[]
	setTitle: (val: string) => void
	setAmount?: (val: number) => void
	setItems: (items: LineItem[]) => void
	setClientId: (val: string) => void
	setDueDate: (val: string) => void
	setPaymentMethod: (val: string) => void
	onSubmit: (e: React.FormEvent) => Promise<void> | void
	/** NEW: zamyka formularz (rodzic ustawia np. setIsOpen(false)) */
	onCancel: () => void
}

export default function InvoiceForm({
	title,
	items,
	clientId,
	dueDate,
	paymentMethod,
	clients,
	setTitle,
	setItems,
	setClientId,
	setDueDate,
	setPaymentMethod,
	setAmount,
	onSubmit,
	onCancel, // NEW
}: Props) {
	const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
		const updated = [...items]
		if (field === 'quantity' || field === 'price') {
			const numberValue = Number(value)
			if (numberValue < 0) return
			updated[index][field] = numberValue
		} else {
			updated[index][field] = String(value)
		}
		setItems(updated)
	}

	const addItem = () => {
		setItems([...items, { name: '', quantity: 1, unit: 'szt.', price: 0 }])
	}

	const removeItem = (index: number) => {
		const updated = [...items]
		updated.splice(index, 1)
		setItems(updated)
	}

	const resetForm = () => {
		setTitle('')
		setClientId('')
		setDueDate('')
		setPaymentMethod('')
		setItems([{ name: '', quantity: 1, unit: 'szt.', price: 0 }])
		if (setAmount) setAmount(0)
	}

	const handleCancel = () => {
		resetForm()
		onCancel()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await onSubmit(e) // rodzic dodaje fakturę
			// jeśli się udało — czyścimy i zamykamy
			resetForm()
			onCancel()
		} catch (err) {
			// zostaw formularz otwarty, żeby user poprawił
			console.error('Submit invoice failed:', err)
		}
	}

	const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

	return (
		<form onSubmit={handleSubmit} className='bg-white p-4 rounded shadow mb-6 grid gap-4'>
			<h2 className='text-xl font-semibold'>Dodaj nową fakturę</h2>

			<div>
				<label className='block mb-1 font-medium'>Tytuł</label>
				<input
					type='text'
					className='border rounded px-3 py-2 w-full'
					value={title}
					onChange={e => setTitle(e.target.value)}
				/>
			</div>

			<div>
				<label className='block mb-1 font-medium'>Pozycje</label>
				<div className='grid gap-3'>
					{items.map((item, index) => (
						<div key={index} className='grid grid-cols-6 gap-2 items-start'>
							<div>
								<label className='block text-sm text-gray-600'>Nazwa</label>
								<input
									type='text'
									className='border rounded px-2 py-1 w-full'
									value={item.name}
									onChange={e => handleItemChange(index, 'name', e.target.value)}
								/>
							</div>
							<div>
								<label className='block text-sm text-gray-600'>Ilość</label>
								<input
									type='number'
									min='0'
									className='border rounded px-2 py-1 w-full'
									value={item.quantity}
									onChange={e => handleItemChange(index, 'quantity', e.target.value)}
								/>
							</div>
							<div>
								<label className='block text-sm text-gray-600'>J.m.</label>
								<input
									type='text'
									className='border rounded px-2 py-1 w-full'
									value={item.unit}
									onChange={e => handleItemChange(index, 'unit', e.target.value)}
								/>
							</div>
							<div>
								<label className='block text-sm text-gray-600'>Cena [zł]</label>
								<input
									type='number'
									min='0'
									className='border rounded px-2 py-1 w-full'
									value={item.price}
									onChange={e => handleItemChange(index, 'price', e.target.value)}
								/>
							</div>
							<div>
								<label className='block text-sm text-gray-600'>Suma [zł]</label>
								<div className='border rounded px-2 py-1 w-full bg-gray-100'>
									{(item.quantity * item.price).toFixed(2)}
								</div>
							</div>
							<div className='flex items-end'>
								<button
									type='button'
									onClick={() => removeItem(index)}
									className='text-red-500 text-sm hover:underline'>
									Usuń
								</button>
							</div>
						</div>
					))}

					<button type='button' onClick={addItem} className='text-sm text-blue-600 hover:underline'>
						+ Dodaj pozycję
					</button>
				</div>
			</div>

			<div>
				<strong>Łączna kwota: {amount.toFixed(2)} zł</strong>
			</div>

			<div>
				<label className='block mb-1 font-medium'>Klient</label>
				<select
					className='border rounded px-3 py-2 w-full'
					value={clientId}
					onChange={e => setClientId(e.target.value)}>
					<option value=''>Wybierz klienta</option>
					{clients.map(client => (
						<option key={client.id} value={client.id}>
							{client.name}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className='block mb-1 font-medium'>Termin płatności</label>
				<input
					type='date'
					className='border rounded px-3 py-2 w-full'
					value={dueDate}
					onChange={e => setDueDate(e.target.value)}
				/>
			</div>

			<div>
				<label className='block mb-1 font-medium'>Forma płatności</label>
				<select
					className='border rounded px-3 py-2 w-full'
					value={paymentMethod}
					onChange={e => setPaymentMethod(e.target.value)}>
					<option value=''>Wybierz formę</option>
					<option value='TRANSFER'>Przelew</option>
					<option value='CASH'>Gotówka</option>
					<option value='CARD'>Karta</option>
					<option value='OTHER'>Inne</option>
				</select>
			</div>

			{/* Przyciski: Dodaj + Anuluj */}
			<div className='flex gap-2 justify-end'>
				<button
					type='button'
					onClick={handleCancel}
					className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'>
					Anuluj
				</button>
				<button type='submit' className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'>
					Dodaj fakturę
				</button>
			</div>
		</form>
	)
}
