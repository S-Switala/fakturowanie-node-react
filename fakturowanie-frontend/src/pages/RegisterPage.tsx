import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { HiCheck } from 'react-icons/hi'
import { ENDPOINTS } from "../config";

import {
	validateField,
	validateAll,
	getInputBorder,
	isValid,
	requiredFieldsFor,
	optionalFields,
} from '../validation/validators'

import type { RegisterFormData } from '../validation/validators'

export default function RegisterPage() {
	const [formData, setFormData] = useState<RegisterFormData>({
		email: '',
		password: '',
		fullName: '',
		street: '',
		houseNumber: '',
		postalCode: '',
		city: '',
		companyName: '',
		nip: '',
		bank: '',
		account: '',
		phoneNumber: '',
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const navigate = useNavigate()

	const required = requiredFieldsFor('register') // email + password są wymagane przy rejestracji

	const handleChange = (field: keyof RegisterFormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		setErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
	}

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault()
		const newErrors = validateAll(formData, required, optionalFields)
		setErrors(newErrors)
		if (Object.keys(newErrors).length) return

		try {
			await axios.post(ENDPOINTS.register, formData)
			alert('Rejestracja zakończona sukcesem!')
			navigate('/login')
		} catch (err) {
			console.error(err)
			alert('Rejestracja nie powiodła się.')
		}
	}

	const Label = (props: {
		label: string
		field: keyof RegisterFormData // w ProfilePage: keyof ProfileForm
		required?: boolean // domyślnie true
		isOptional?: boolean // dla companyName / nip
	}) => {
		const required = props.required ?? true
		const val = formData?.[props.field as keyof RegisterFormData] ?? ''
		const err = errors[props.field as string]
		const valid = isValid(val as string | undefined, err)

		// Pola opcjonalne: jeśli puste → nic nie pokazujemy
		if (props.isOptional && !val) {
			return <label className='block mb-1 text-sm font-medium text-left'>{props.label}</label>
		}

		return (
			<label className='block mb-1 text-sm font-medium text-left flex items-center gap-1'>
				{props.label}
				{required &&
					(valid ? <HiCheck className='text-green-600 inline w-4 h-4' /> : <span className='text-red-600'>*</span>)}
			</label>
		)
	}
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='bg-white shadow-md rounded p-8 w-full max-w-md'>
				<h2 className='text-2xl font-bold mb-6 text-center text-blue-700'>Rejestracja</h2>

				<form onSubmit={handleRegister} className='grid gap-4'>
					{/* Imię i nazwisko */}
					<div>
						<Label label='Imię i nazwisko' field='fullName' />
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.fullName, errors.fullName)}`}
							value={formData.fullName}
							onChange={e => handleChange('fullName', e.target.value)}
						/>
						{errors.fullName && <p className='text-red-500 text-sm'>{errors.fullName}</p>}
					</div>

					{/* Email */}
					<div>
						<Label label='Email' field='email' />
						<input
							type='email'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.email, errors.email)}`}
							value={formData.email}
							onChange={e => handleChange('email', e.target.value)}
						/>
						{errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
					</div>

					{/* Hasło */}
					<div>
						<Label label='Hasło' field='password' />
						<input
							type='password'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.password, errors.password)}`}
							value={formData.password}
							onChange={e => handleChange('password', e.target.value)}
						/>
						{errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}
					</div>

					{/* Ulica */}
					<div>
						<Label label='Ulica' field='street' />
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.street, errors.street)}`}
							value={formData.street}
							onChange={e => handleChange('street', e.target.value)}
						/>
						{errors.street && <p className='text-red-500 text-sm'>{errors.street}</p>}
					</div>

					{/* Numer domu */}
					<div>
						<Label label='Numer domu' field='houseNumber' />
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.houseNumber, errors.houseNumber)}`}
							value={formData.houseNumber}
							onChange={e => handleChange('houseNumber', e.target.value)}
						/>
						{errors.houseNumber && <p className='text-red-500 text-sm'>{errors.houseNumber}</p>}
					</div>

					{/* Kod pocztowy */}
					<div>
						<Label label='Kod pocztowy' field='postalCode' />
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.postalCode, errors.postalCode)}`}
							value={formData.postalCode}
							onChange={e => handleChange('postalCode', e.target.value)}
						/>
						{errors.postalCode && <p className='text-red-500 text-sm'>{errors.postalCode}</p>}
					</div>

					{/* Miejscowość */}
					<div>
						<Label label='Miejscowość' field='city' />
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.city, errors.city)}`}
							value={formData.city}
							onChange={e => handleChange('city', e.target.value)}
						/>
						{errors.city && <p className='text-red-500 text-sm'>{errors.city}</p>}
					</div>

					{/* Telefon */}
					<div>
						<Label label='Numer telefonu' field='phoneNumber' />
						<input
							type='tel'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.phoneNumber, errors.phoneNumber)}`}
							value={formData.phoneNumber}
							onChange={e => handleChange('phoneNumber', e.target.value)}
						/>
						{errors.phoneNumber && <p className='text-red-500 text-sm'>{errors.phoneNumber}</p>}
					</div>

					{/* Nazwa firmy (opcjonalnie) */}
					<div>
						<label className='block mb-1 text-sm font-medium'>Nazwa firmy (opcjonalnie)</label>
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.companyName, undefined, true)}`}
							value={formData.companyName}
							onChange={e => handleChange('companyName', e.target.value)}
						/>
					</div>

					{/* NIP (opcjonalnie) */}
					<div>
						<label className='block mb-1 text-sm font-medium'>NIP (opcjonalnie)</label>
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.nip, errors.nip, true)}`}
							value={formData.nip}
							onChange={e => handleChange('nip', e.target.value)}
						/>
						{errors.nip && <p className='text-red-500 text-sm'>{errors.nip}</p>}
					</div>

					{/* Bank */}
					<div>
						<Label label='Bank' field='bank' />
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.bank, errors.bank)}`}
							value={formData.bank}
							onChange={e => handleChange('bank', e.target.value)}
						/>
						{errors.bank && <p className='text-red-500 text-sm'>{errors.bank}</p>}
					</div>

					{/* Numer konta */}
					<div>
						<Label label='Numer konta' field='account' />
						<input
							type='text'
							className={`border rounded px-3 py-2 w-full ${getInputBorder(formData.account, errors.account)}`}
							value={formData.account}
							onChange={e => handleChange('account', e.target.value)}
						/>
						{errors.account && <p className='text-red-500 text-sm'>{errors.account}</p>}
					</div>

					<button type='submit' className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'>
						Zarejestruj się
					</button>
				</form>
			</div>
		</div>
	)
}
