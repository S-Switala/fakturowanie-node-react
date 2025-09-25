import React from 'react'
import { type Client } from '@/types'

type Order = 'asc' | 'desc'

interface Props {
	clientId: string
	sortBy: string // '', 'amount', 'dueDate'
	order: Order // 'asc' | 'desc'
	clients: Pick<Client, 'id' | 'name'>[]
	setClientId: (val: string) => void
	setSortBy: (val: string) => void
	setOrder: React.Dispatch<React.SetStateAction<Order>>
}

export default function InvoiceFilters({ clientId, sortBy, order, clients, setClientId, setSortBy, setOrder }: Props) {
	// gdy użytkownik wybierze sortowanie kwoty
	const onAmountSortChange = (val: string) => {
		if (val === '') {
			if (sortBy === 'amount') setSortBy('')
			return
		}
		// ustaw sort po kwocie i "wyzeruj" alternatywę (dueDate)
		setSortBy('amount')
		setOrder(val as Order)
	}

	// gdy użytkownik wybierze sortowanie terminu płatności
	const onDueDateSortChange = (val: string) => {
		if (val === '') {
			if (sortBy === 'dueDate') setSortBy('')
			return
		}
		// ustaw sort po dueDate i "wyzeruj" alternatywę (amount)
		setSortBy('dueDate')
		setOrder(val as Order)
	}

	return (
		<div
			className='
        bg-white p-4 rounded shadow mb-6
        grid gap-4 grid-cols-1 sm:grid-cols-2
        lg:flex lg:flex-col lg:space-y-4
      '>
			{/* Klient */}
			<div>
				<label className='block text-sm font-semibold mb-1'>Klient</label>
				<select
					value={clientId}
					onChange={e => setClientId(e.target.value)}
					className='border px-3 py-2 rounded w-full'>
					<option value=''>Wszyscy klienci</option>
					{clients.map(c => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</select>
			</div>

			{/* Cena (kwota) */}
			<div>
				<label className='block text-sm font-semibold mb-1'>Cena</label>
				<select
					// jeśli aktywny sort to amount → pokaż wartość order, inaczej "brak"
					value={sortBy === 'amount' ? order : ''}
					onChange={e => onAmountSortChange((e.target as HTMLSelectElement).value)}
					className='border px-3 py-2 rounded w-full'>
					<option value=''>Brak sortowania</option>
					<option value='asc'>Rosnąco</option>
					<option value='desc'>Malejąco</option>
				</select>
			</div>

			{/* Termin zapłaty (dueDate) */}
			<div>
				<label className='block text-sm font-semibold mb-1'>Termin zapłaty</label>
				<select
					// jeśli aktywny sort to dueDate → pokaż order, inaczej "brak"
					value={sortBy === 'dueDate' ? order : ''}
					onChange={e => onDueDateSortChange((e.target as HTMLSelectElement).value)}
					className='border px-3 py-2 rounded w-full'>
					<option value=''>Brak sortowania</option>
					<option value='asc'>Rosnąco</option>
					<option value='desc'>Malejąco</option>
				</select>
			</div>
		</div>
	)
}
