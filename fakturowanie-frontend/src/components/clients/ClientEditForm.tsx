// src/components/clients/ClientEditForm.tsx
import { useState } from 'react'
import { HiCheck } from 'react-icons/hi'
import { getInputBorder, isValid, clientValidateField, clientValidateAll } from '../../validation/validators'
import type { ClientFormData } from '../../validation/validators'
import { type Client } from '@/types'

interface Props {
  client: Client
  onCancel: () => void
  onSave: (client: Client) => Promise<void> | void
}

export default function ClientEditForm({ client, onCancel, onSave }: Props) {
	const [form, setForm] = useState<ClientFormData>({
		name: client.name || '',
		email: client.email || '',
		street: client.street || '',
		houseNumber: client.houseNumber || '',
		postalCode: client.postalCode || '',
		city: client.city || '',
		pesel: client.pesel || '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleChange = (key: keyof ClientFormData, value: string) => {
		setForm(prev => ({ ...prev, [key]: value }))
		setErrors(prev => ({ ...prev, [key]: clientValidateField(key, value) }))
	}

	const handleSave = () => {
		const newErrors = clientValidateAll(form)
		setErrors(newErrors)
		if (Object.keys(newErrors).length) {
			alert('Popraw błędy w formularzu.')
			return
		}
		// mergujemy istniejącego klienta z edytowanym formularzem
		const updated: Client = { ...client, ...form }
		onSave(updated)
	}

	const Label = (props: { label: string; value?: string; error?: string }) => {
		const valid = isValid(props.value, props.error)
		return (
			<label className='block mb-1 text-sm font-medium text-left flex items-center gap-1'>
				{props.label}
				{valid ? <HiCheck className='text-green-600 inline w-4 h-4' /> : <span className='text-red-600'>*</span>}
			</label>
		)
	}

	return (
		<div className='bg-yellow-50 p-4 rounded shadow grid gap-4'>
			{/* Imię i nazwisko */}
			<div>
				<Label label='Imię i nazwisko' value={form.name} error={errors.name} />
				<input
					className={`w-full border px-3 py-2 rounded ${getInputBorder(form.name, errors.name)}`}
					value={form.name}
					onChange={e => handleChange('name', e.target.value)}
				/>
				{errors.name && <p className='text-red-500 text-sm'>{errors.name}</p>}
			</div>

			{/* Email */}
			<div>
				<Label label='Email' value={form.email} error={errors.email} />
				<input
					className={`w-full border px-3 py-2 rounded ${getInputBorder(form.email, errors.email)}`}
					value={form.email}
					onChange={e => handleChange('email', e.target.value)}
				/>
				{errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
			</div>

			{/* Ulica */}
			<div>
				<Label label='Ulica' value={form.street} error={errors.street} />
				<input
					className={`w-full border px-3 py-2 rounded ${getInputBorder(form.street, errors.street)}`}
					value={form.street}
					onChange={e => handleChange('street', e.target.value)}
				/>
				{errors.street && <p className='text-red-500 text-sm'>{errors.street}</p>}
			</div>

			{/* Numer domu */}
			<div>
				<Label label='Numer domu' value={form.houseNumber} error={errors.houseNumber} />
				<input
					className={`w-full border px-3 py-2 rounded ${getInputBorder(form.houseNumber, errors.houseNumber)}`}
					value={form.houseNumber}
					onChange={e => handleChange('houseNumber', e.target.value)}
				/>
				{errors.houseNumber && <p className='text-red-500 text-sm'>{errors.houseNumber}</p>}
			</div>

			{/* Kod pocztowy */}
			<div>
				<Label label='Kod pocztowy' value={form.postalCode} error={errors.postalCode} />
				<input
					className={`w-full border px-3 py-2 rounded ${getInputBorder(form.postalCode, errors.postalCode)}`}
					value={form.postalCode}
					onChange={e => handleChange('postalCode', e.target.value)}
				/>
				{errors.postalCode && <p className='text-red-500 text-sm'>{errors.postalCode}</p>}
			</div>

			{/* Miejscowość */}
			<div>
				<Label label='Miejscowość' value={form.city} error={errors.city} />
				<input
					className={`w-full border px-3 py-2 rounded ${getInputBorder(form.city, errors.city)}`}
					value={form.city}
					onChange={e => handleChange('city', e.target.value)}
				/>
				{errors.city && <p className='text-red-500 text-sm'>{errors.city}</p>}
			</div>

			{/* PESEL */}
			<div>
				<Label label='PESEL' value={form.pesel} error={errors.pesel} />
				<input
					className={`w-full border px-3 py-2 rounded ${getInputBorder(form.pesel, errors.pesel)}`}
					value={form.pesel}
					onChange={e => handleChange('pesel', e.target.value)}
				/>
				{errors.pesel && <p className='text-red-500 text-sm'>{errors.pesel}</p>}
			</div>

			<div className='flex gap-2 mt-2'>
				<button onClick={handleSave} className='bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700'>
					Zapisz
				</button>
				<button onClick={onCancel} className='bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500'>
					Anuluj
				</button>
			</div>
		</div>
	)
}
