import { type Client, type LineItem, type InvoiceListItem, type EditInvoiceData } from '@/types'

interface Props {
	invoice: InvoiceListItem
	clients: Pick<Client, 'id' | 'name'>[]
	isEditing: boolean
	editData: EditInvoiceData
	onStartEdit: () => void
	setEditFields: (data: EditInvoiceData & { id: string }) => void
	saveEdit: () => void
	cancelEdit: () => void
	deleteInvoice: (id: string) => void
	downloadPdf: (id: string) => void
	setField: (field: keyof EditInvoiceData, val: string | number) => void
	items: LineItem[]
	setItems: (val: LineItem[]) => void
}

export default function InvoiceItem({
	invoice,
	clients,
	isEditing,
	editData,
	onStartEdit,
	saveEdit,
	cancelEdit,
	deleteInvoice,
	downloadPdf,
	setField,
	items,
	setItems,
}: Props) {
	return (
		<div className='bg-white p-4 rounded shadow'>
			<h2 className='text-xl font-semibold'>{invoice.title}</h2>
			<p className='text-sm text-gray-600'>Klient: {invoice.client?.name || 'Brak'}</p>
			<p className='text-sm text-gray-600'>Kwota: {invoice.amount} zł</p>
			<p className='text-sm text-gray-500'>Data wystawienia: {new Date(invoice.createdAt).toLocaleDateString()}</p>
			<p className='text-sm text-gray-500'>Termin płatności: {new Date(invoice.dueDate).toLocaleDateString('pl-PL')}</p>

			<div className='flex gap-2 mt-2'>
				<button onClick={onStartEdit} className='bg-yellow-600 text-white px-3 py-1 rounded'>
					Edytuj
				</button>
				<button onClick={() => deleteInvoice(invoice.id)} className='bg-red-600 text-white px-3 py-1 rounded'>
					Usuń
				</button>
				<button onClick={() => downloadPdf(invoice.id)} className='bg-blue-600 text-white px-3 py-1 rounded'>
					Pobierz PDF
				</button>
			</div>

			{isEditing && (
				<form
					onSubmit={e => {
						e.preventDefault()
						saveEdit()
					}}
					className='mt-4 grid gap-4 bg-gray-100 p-4 rounded'>
					<h3 className='text-lg font-semibold'>Edycja faktury</h3>

					{/* Tytuł */}
					<div>
						<label className='block mb-1 font-medium'>Tytuł</label>
						<input
							type='text'
							className='border rounded px-3 py-2 w-full'
							value={editData.title}
							onChange={e => setField('title', e.target.value)}
						/>
					</div>

					{/* Pozycje */}
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
											onChange={e => {
												const newItems = [...items]
												newItems[index].name = e.target.value
												setItems(newItems)
											}}
										/>
									</div>
									<div>
										<label className='block text-sm text-gray-600'>Ilość</label>
										<input
											type='number'
											min='0'
											className='border rounded px-2 py-1 w-full'
											value={item.quantity}
											onChange={e => {
												const newItems = [...items]
												const value = Number(e.target.value)
												if (value >= 0) {
													newItems[index].quantity = value
													setItems(newItems)
												}
											}}
										/>
									</div>
									<div>
										<label className='block text-sm text-gray-600'>J.m.</label>
										<input
											type='text'
											className='border rounded px-2 py-1 w-full'
											value={item.unit}
											onChange={e => {
												const newItems = [...items]
												newItems[index].unit = e.target.value
												setItems(newItems)
											}}
										/>
									</div>
									<div>
										<label className='block text-sm text-gray-600'>Cena</label>
										<input
											type='number'
											min='0'
											className='border rounded px-2 py-1 w-full'
											value={item.price}
											onChange={e => {
												const newItems = [...items]
												const value = Number(e.target.value)
												if (value >= 0) {
													newItems[index].price = value
													setItems(newItems)
												}
											}}
										/>
									</div>
									<div>
										<label className='block text-sm text-gray-600'>Suma</label>
										<div className='border rounded px-2 py-1 w-full bg-gray-100'>
											{(item.quantity * item.price).toFixed(2)} zł
										</div>
									</div>
									<div className='flex items-end'>
										<button
											type='button'
											className='text-red-500 text-sm hover:underline'
											onClick={() => {
												const newItems = items.filter((_, i) => i !== index)
												setItems(newItems)
											}}>
											Usuń
										</button>
									</div>
								</div>
							))}
							<button
								type='button'
								className='text-sm text-blue-600 hover:underline'
								onClick={() => setItems([...items, { name: '', quantity: 1, unit: 'szt.', price: 0 }])}>
								+ Dodaj pozycję
							</button>
						</div>
					</div>

					{/* Łączna kwota */}
					<div>
						<strong>
							Łączna kwota: {items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} zł
						</strong>
					</div>

					{/* Klient */}
					<div>
						<label className='block mb-1 font-medium'>Klient</label>
						<select
							className='border rounded px-3 py-2 w-full'
							value={editData.clientId}
							onChange={e => setField('clientId', e.target.value)}>
							{clients.map(client => (
								<option key={client.id} value={client.id}>
									{client.name}
								</option>
							))}
						</select>
					</div>

					{/* Termin płatności */}
					<div>
						<label className='block mb-1 font-medium'>Termin płatności</label>
						<input
							type='date'
							className='border rounded px-3 py-2 w-full'
							value={editData.dueDate}
							onChange={e => setField('dueDate', e.target.value)}
						/>
					</div>

					{/* Forma płatności */}
					<div>
						<label className='block mb-1 font-medium'>Forma płatności</label>
						<select
							className='border rounded px-3 py-2 w-full'
							value={editData.paymentMethod || ''}
							onChange={e => setField('paymentMethod', e.target.value)}>
							<option value=''>Wybierz formę</option>
							<option value='TRANSFER'>Przelew</option>
							<option value='CASH'>Gotówka</option>
							<option value='CARD'>Karta</option>
							<option value='OTHER'>Inne</option>
						</select>
					</div>

					{/* Przyciski */}
					<div className='flex gap-2 mt-2'>
						<button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded'>
							Zapisz
						</button>
						<button type='button' onClick={cancelEdit} className='bg-gray-400 text-white px-4 py-2 rounded'>
							Anuluj
						</button>
					</div>
				</form>
			)}
		</div>
	)
}
