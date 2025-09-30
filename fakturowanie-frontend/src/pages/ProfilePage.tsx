// src/pages/ProfilePage.tsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { HiCheck } from 'react-icons/hi'
import { ENDPOINTS } from '../config'

import {
	validateField,
	validateAll,
	getInputBorder,
	isValid,
	requiredFieldsFor,
	optionalFields,
} from '../validation/validators'
import type { RegisterFormData } from '../validation/validators'

// Uwaga: używamy tego samego zestawu pól co w RegisterFormData,
// ale email jest tylko do odczytu, a password w profilu nie edytujemy.
type ProfileForm = Omit<RegisterFormData, 'password'>

const toNullable = (v?: string) => {
	const t = (v ?? '').trim()
	return t === '' ? null : t
}
const trim = (v?: string) => (typeof v === 'string' ? v.trim() : v)

export default function ProfilePage() {
	const [user, setUser] = useState<ProfileForm | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const required = requiredFieldsFor('profile')

	useEffect(() => {
		const fetchUser = async () => {
			try {
				// safety: jeśli ktoś odświeży stronę, przywróć nagłówek
				const token = localStorage.getItem('token')
				if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`

				const res = await axios.get(ENDPOINTS.me)
				// null-e z backendu zamieniamy na '' do pól formularza
				const data: ProfileForm = {
					email: res.data.email ?? '',
					fullName: res.data.fullName ?? '',
					street: res.data.street ?? '',
					houseNumber: res.data.houseNumber ?? '',
					postalCode: res.data.postalCode ?? '',
					city: res.data.city ?? '',
					phoneNumber: res.data.phoneNumber ?? '',
					bank: res.data.bank ?? '',
					account: res.data.account ?? '',
					companyName: res.data.companyName ?? '',
					nip: res.data.nip ?? '',
				}
				setUser(data)
				setErrors(validateAll(data, required, optionalFields))
			} catch (err) {
				console.error('Błąd pobierania danych użytkownika', err)
				alert('Nie udało się pobrać danych profilu')
			} finally {
				setLoading(false)
			}
		}
		fetchUser()
	}, [])

	const handleChange = (field: keyof ProfileForm, value: string) => {
		if (!user) return
		const updated = { ...user, [field]: value }
		setUser(updated)
		setErrors(prev => ({
			...prev,
			[field as string]: validateField(field as keyof RegisterFormData, value),
		}))
	}

	const handleSave = async () => {
		if (!user) return

		// walidacja całości przed zapisem
		const newErrors = validateAll(user as RegisterFormData, required, optionalFields)
		setErrors(newErrors)
		if (Object.keys(newErrors).length) {
			alert('Popraw błędy w formularzu.')
			return
		}

		// ✨ NORMALIZACJA: trim dla wymaganych, "" → null dla opcjonalnych (w tym NIP)
		const payload = {
			fullName: trim(user.fullName),
			street: trim(user.street),
			houseNumber: trim(user.houseNumber),
			postalCode: trim(user.postalCode),
			city: trim(user.city),

			companyName: toNullable(user.companyName),
			nip: toNullable(user.nip),
			bank: toNullable(user.bank),
			account: toNullable(user.account),
			phoneNumber: toNullable(user.phoneNumber),

			// email NIE jest tu wysyłany (jest readonly na froncie)
		}

		setSaving(true)
		try {
			const res = await axios.put(ENDPOINTS.me, payload)
			// odśwież stan formularza wartościami z backendu (zamień null -> '')
			const updated: ProfileForm = {
				email: res.data.email ?? user.email,
				fullName: res.data.fullName ?? '',
				street: res.data.street ?? '',
				houseNumber: res.data.houseNumber ?? '',
				postalCode: res.data.postalCode ?? '',
				city: res.data.city ?? '',
				phoneNumber: res.data.phoneNumber ?? '',
				bank: res.data.bank ?? '',
				account: res.data.account ?? '',
				companyName: res.data.companyName ?? '',
				nip: res.data.nip ?? '',
			}
			setUser(updated)
			setErrors(validateAll(updated, required, optionalFields))
			alert('Dane zostały zapisane')
		} catch (err: any) {
			const status = err?.response?.status
			const msg: string | undefined = err?.response?.data?.message
			if (status === 409) {
				// Prisma P2002 zmapowane w API (email/nip)
				alert(msg || 'Konflikt danych (np. NIP/E-mail już istnieje).')
			} else if (status === 400) {
				alert(msg || 'Nieprawidłowe dane formularza.')
			} else {
				console.error('Błąd zapisu profilu', err)
				alert('Wystąpił błąd podczas zapisu danych')
			}
		} finally {
			setSaving(false)
		}
	}

	const Label = (props: { label: string; field: keyof ProfileForm; required?: boolean }) => {
		const val = user?.[props.field]
		const err = errors[props.field as string]
		const required = props.required ?? true
		const valid = isValid(val as string | undefined, err)

		return (
			<label className='block mb-1 text-sm font-medium text-left flex items-center gap-1'>
				{props.label}
				{required &&
					(valid ? <HiCheck className='text-green-600 inline w-4 h-4' /> : <span className='text-red-600'>*</span>)}
			</label>
		)
	}

	if (loading) return <div className='p-4 text-center'>Ładowanie profilu...</div>
	if (!user) return <div className='p-4 text-center text-red-600'>Nie udało się załadować profilu.</div>

	return (
		<div className='min-h-screen bg-gray-100'>
			<Navbar />
			<div className='max-w-2xl mx-auto p-6 mt-6 bg-white rounded shadow'>
				<h1 className='text-2xl font-bold mb-6 text-blue-700'>Twój Profil</h1>

				<div className='grid gap-4'>
					{/* Imię i nazwisko */}
					<div>
						<Label label='Imię i nazwisko' field='fullName' />
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.fullName, errors.fullName)}`}
							value={user.fullName}
							onChange={e => handleChange('fullName', e.target.value)}
						/>
						{errors.fullName && <p className='text-red-500 text-sm'>{errors.fullName}</p>}
					</div>

					{/* Email – tylko do odczytu */}
					<div>
						<label className='block mb-1 text-sm font-medium text-gray-600 text-left'>Email</label>
						<input
							type='email'
							className='border px-3 py-2 rounded w-full bg-gray-100 cursor-not-allowed'
							value={user.email}
							disabled
						/>
					</div>

					{/* Telefon */}
					<div>
						<Label label='Numer telefonu' field='phoneNumber' />
						<input
							type='tel'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.phoneNumber, errors.phoneNumber)}`}
							value={user.phoneNumber}
							onChange={e => handleChange('phoneNumber', e.target.value)}
						/>
						{errors.phoneNumber && <p className='text-red-500 text-sm'>{errors.phoneNumber}</p>}
					</div>

					{/* Bank */}
					<div>
						<Label label='Bank' field='bank' />
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.bank, errors.bank)}`}
							value={user.bank}
							onChange={e => handleChange('bank', e.target.value)}
						/>
						{errors.bank && <p className='text-red-500 text-sm'>{errors.bank}</p>}
					</div>

					{/* Numer konta */}
					<div>
						<Label label='Numer konta' field='account' />
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.account, errors.account)}`}
							value={user.account}
							onChange={e => handleChange('account', e.target.value)}
						/>
						{errors.account && <p className='text-red-500 text-sm'>{errors.account}</p>}
					</div>

					{/* Nazwa firmy (opcjonalnie) */}
					<div>
						<label className='block mb-1 text-sm font-medium text-left'>Nazwa firmy (opcjonalnie)</label>
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.companyName, undefined, true)}`}
							value={user.companyName ?? ''}
							onChange={e => handleChange('companyName', e.target.value)}
						/>
					</div>

					{/* NIP (opcjonalnie) */}
					<div>
						<label className='block mb-1 text-sm font-medium text-left'>NIP (opcjonalnie)</label>
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.nip, errors.nip, true)}`}
							value={user.nip ?? ''}
							onChange={e => handleChange('nip', e.target.value)}
						/>
						{errors.nip && <p className='text-red-500 text-sm'>{errors.nip}</p>}
					</div>

					{/* Ulica */}
					<div>
						<Label label='Ulica' field='street' />
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.street, errors.street)}`}
							value={user.street}
							onChange={e => handleChange('street', e.target.value)}
						/>
						{errors.street && <p className='text-red-500 text-sm'>{errors.street}</p>}
					</div>

					{/* Numer domu / lokalu */}
					<div>
						<Label label='Numer domu / lokalu' field='houseNumber' />
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.houseNumber, errors.houseNumber)}`}
							value={user.houseNumber}
							onChange={e => handleChange('houseNumber', e.target.value)}
						/>
						{errors.houseNumber && <p className='text-red-500 text-sm'>{errors.houseNumber}</p>}
					</div>

					{/* Kod pocztowy */}
					<div>
						<Label label='Kod pocztowy' field='postalCode' />
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.postalCode, errors.postalCode)}`}
							value={user.postalCode}
							onChange={e => handleChange('postalCode', e.target.value)}
						/>
						{errors.postalCode && <p className='text-red-500 text-sm'>{errors.postalCode}</p>}
					</div>

					{/* Miejscowość */}
					<div>
						<Label label='Miejscowość' field='city' />
						<input
							type='text'
							className={`border px-3 py-2 rounded w-full ${getInputBorder(user.city, errors.city)}`}
							value={user.city}
							onChange={e => handleChange('city', e.target.value)}
						/>
						{errors.city && <p className='text-red-500 text-sm'>{errors.city}</p>}
					</div>

					<button
						onClick={handleSave}
						className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50'
						disabled={saving}>
						{saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
					</button>
				</div>
			</div>
		</div>
	)
}
