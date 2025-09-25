// src/components/clients/ClientAddForm.tsx
import { useState } from 'react'
import axios from 'axios'
import { getInputBorder, isValid, clientValidateField, clientValidateAll } from '../../validation/validators'
import type { ClientFormData } from '../../validation/validators'
import { HiCheck } from 'react-icons/hi'
import { ENDPOINTS } from "../../config";

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
	onAdd: (client: Client) => void
}

export default function ClientAddForm({ onAdd }: Props) {
	const [form, setForm] = useState<ClientFormData>({
		name: '',
		email: '',
		street: '',
		houseNumber: '',
		postalCode: '',
		city: '',
		pesel: '',
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleChange = (key: keyof ClientFormData, value: string) => {
		setForm(prev => ({ ...prev, [key]: value }))
		setErrors(prev => ({ ...prev, [key]: clientValidateField(key, value) }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const newErrors = clientValidateAll(form)
		setErrors(newErrors)
		if (Object.keys(newErrors).length) {
			alert('Popraw błędy w formularzu.')
			return
		}

		try {
			const token = localStorage.getItem('token')
			const res = await axios.post(ENDPOINTS.clients, form, {
				headers: { Authorization: `Bearer ${token}` },
			})
			onAdd(res.data)
			setForm({
				name: '',
				email: '',
				street: '',
				houseNumber: '',
				postalCode: '',
				city: '',
				pesel: '',
			})
			setErrors({})
		} catch (err) {
			console.error('Błąd dodawania klienta:', err)
			alert('Błąd dodawania klienta')
		}
	}

	const Label = (props: { label: string; field: keyof ClientFormData }) => {
		const val = form[props.field]
		const err = errors[props.field as string]
		const valid = isValid(val, err)

		return (
			<label className='block mb-1 text-sm font-medium text-left flex items-center gap-1'>
				{props.label}
				{valid ? <HiCheck className='text-green-600 inline w-4 h-4' /> : <span className='text-red-600'>*</span>}
			</label>
		)
	}

	return (
		<form onSubmit={handleSubmit} className='bg-white p-4 rounded shadow grid gap-4'>
			<h2 className='text-lg font-semibold text-left'>Dodaj nowego klienta</h2>

			<div className='grid gap-4'>
				{/* Imię i nazwisko */}
				<div>
					<Label label='Imię i nazwisko' field='name' />
					<input
						type='text'
						className={`border rounded px-3 py-2 w-full ${getInputBorder(form.name, errors.name)}`}
						value={form.name}
						onChange={e => handleChange('name', e.target.value)}
					/>
					{errors.name && <p className='text-red-500 text-sm'>{errors.name}</p>}
				</div>

				{/* Email */}
				<div>
					<Label label='Email' field='email' />
					<input
						type='email'
						className={`border rounded px-3 py-2 w-full ${getInputBorder(form.email, errors.email)}`}
						value={form.email}
						onChange={e => handleChange('email', e.target.value)}
					/>
					{errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
				</div>

				{/* Ulica */}
				<div>
					<Label label='Ulica' field='street' />
					<input
						type='text'
						className={`border rounded px-3 py-2 w-full ${getInputBorder(form.street, errors.street)}`}
						value={form.street}
						onChange={e => handleChange('street', e.target.value)}
					/>
					{errors.street && <p className='text-red-500 text-sm'>{errors.street}</p>}
				</div>

				{/* Numer domu */}
				<div>
					<Label label='Numer domu' field='houseNumber' />
					<input
						type='text'
						className={`border rounded px-3 py-2 w-full ${getInputBorder(form.houseNumber, errors.houseNumber)}`}
						value={form.houseNumber}
						onChange={e => handleChange('houseNumber', e.target.value)}
					/>
					{errors.houseNumber && <p className='text-red-500 text-sm'>{errors.houseNumber}</p>}
				</div>

				{/* Kod pocztowy */}
				<div>
					<Label label='Kod pocztowy' field='postalCode' />
					<input
						type='text'
						className={`border rounded px-3 py-2 w-full ${getInputBorder(form.postalCode, errors.postalCode)}`}
						value={form.postalCode}
						onChange={e => handleChange('postalCode', e.target.value)}
					/>
					{errors.postalCode && <p className='text-red-500 text-sm'>{errors.postalCode}</p>}
				</div>

				{/* Miejscowość */}
				<div>
					<Label label='Miejscowość' field='city' />
					<input
						type='text'
						className={`border rounded px-3 py-2 w-full ${getInputBorder(form.city, errors.city)}`}
						value={form.city}
						onChange={e => handleChange('city', e.target.value)}
					/>
					{errors.city && <p className='text-red-500 text-sm'>{errors.city}</p>}
				</div>

				{/* PESEL */}
				<div>
					<Label label='PESEL' field='pesel' />
					<input
						type='text'
						className={`border rounded px-3 py-2 w-full ${getInputBorder(form.pesel, errors.pesel)}`}
						value={form.pesel}
						onChange={e => handleChange('pesel', e.target.value)}
					/>
					{errors.pesel && <p className='text-red-500 text-sm'>{errors.pesel}</p>}
				</div>
			</div>

			<button type='submit' className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'>
				Dodaj klienta
			</button>
		</form>
	)
}
