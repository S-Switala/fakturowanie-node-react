interface Client {
	id: string
	name: string
	email: string
	street?: string
	houseNumber?: string
	postalCode?: string
	city?: string
	pesel?: string
}

interface Props {
	client: Client
	onEdit: () => void
	onDelete: () => void
}

export default function ClientCard({ client, onEdit, onDelete }: Props) {
	return (
		<div className='bg-white p-4 rounded shadow'>
			<h2 className='text-xl font-semibold'>{client.name}</h2>
			<p className='text-sm text-gray-600'>{client.email}</p>
			<p className='text-sm text-gray-600'>
				{client.street} {client.houseNumber}, {client.postalCode} {client.city}
			</p>
			<p className='text-sm text-gray-600'>PESEL: {client.pesel}</p>
			<div className='flex gap-2 mt-2'>
				<button onClick={onEdit} className='bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600'>Edytuj</button>
				<button onClick={onDelete} className='bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700'>Usuń</button>
			</div>
		</div>
	)
}
