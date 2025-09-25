// src/validation/validators.ts

/** ===== TYPY – Rejestracja/Profil ===== */
export type RegisterFormData = {
  email: string
  password: string
  fullName: string
  street: string
  houseNumber: string
  postalCode: string
  city: string
  companyName?: string
  nip?: string
  bank: string
  account: string
  phoneNumber: string
}

/** tylko te dwa opcjonalne */
export const optionalFields: (keyof RegisterFormData)[] = ['companyName', 'nip']

/** wymagane pola zależnie od kontekstu */
export const requiredFieldsFor = (ctx: 'register' | 'profile'): (keyof RegisterFormData)[] => {
  const base: (keyof RegisterFormData)[] = [
    'email',
    'password',
    'fullName',
    'street',
    'houseNumber',
    'postalCode',
    'city',
    'phoneNumber',
    'bank',
    'account',
  ]
  return ctx === 'register'
    ? base
    : base.filter(f => f !== 'email' && f !== 'password') // profil nie edytuje email/hasła
}

/** ===== Reguły – Rejestracja/Profil ===== */
export const validators: Record<keyof RegisterFormData, (v: string) => string> = {
  fullName: v => (!/^\p{L}+\s+\p{L}+$/u.test(v) ? 'Podaj imię i nazwisko' : ''),
  email: v => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Niepoprawny email' : ''),
  password: v =>
    !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(v)
      ? 'Min. 8 znaków, wielka litera, cyfra i znak specjalny'
      : '',
  street: v => (v.trim().length < 3 ? 'Podaj poprawną ulicę' : ''),
  houseNumber: v => (!/^\d+[A-Za-z]?$/.test(v) ? 'Podaj poprawny numer domu' : ''),
  postalCode: v => (!/^\d{2}-\d{3}$/.test(v) ? 'Format: 00-000' : ''),
  city: v => (v.trim().length < 2 ? 'Podaj poprawną miejscowość' : ''),
  phoneNumber: v => (!/^\+?\d{9,15}$/.test(v) ? 'Niepoprawny numer' : ''),
  bank: v => (v.trim().length < 3 ? 'Podaj poprawną nazwę banku' : ''),
  account: v => (!/^\d{26}$/.test(v) ? 'Numer konta powinien mieć 26 cyfr' : ''),
  companyName: _ => '',
  nip: v => (v && !/^\d{10}$/.test(v) ? 'NIP powinien mieć 10 cyfr' : ''),
}

/** pojedyncze pole – rejestracja/profil */
export function validateField<K extends keyof RegisterFormData>(name: K, value: string): string {
  return validators[name] ? validators[name](value ?? '') : ''
}

/** cały formularz – rejestracja/profil */
export function validateAll(
  data: Partial<RegisterFormData>,
  required: (keyof RegisterFormData)[],
  optional: (keyof RegisterFormData)[] = optionalFields
): Record<string, string> {
  const errs: Record<string, string> = {}

  required.forEach((k) => {
    const v = (data[k] as string) ?? ''
    const err = validators[k]?.(v) || (v ? '' : 'Pole wymagane')
    if (err) errs[k as string] = err
  })

  optional.forEach((k) => {
    const v = (data[k] as string) ?? ''
    if (v && validators[k]) {
      const err = validators[k](v)
      if (err) errs[k as string] = err
    }
  })

  return errs
}

/** ===== Wspólny UX helper ===== */
export function getInputBorder(value: string | undefined, error?: string, isOptional = false) {
  const v = value ?? ''
  if (isOptional && !v) return 'border-gray-300'
  if (error) return 'border-red-500'
  if (v && !error) return 'border-green-500'
  return 'border-gray-300'
}
export function isValid(value: string | undefined, error?: string) {
  return Boolean(value) && !error
}

/** =========================================================
 *  KLIENT – wszystko w tym samym pliku (ClientAddForm)
 *  =======================================================*/

/** Typ dla formularza klienta */
export type ClientFormData = {
  name: string
  email: string
  street: string
  houseNumber: string
  postalCode: string
  city: string
  pesel: string
}

/** walidacja PESEL z sumą kontrolną */
export function validatePesel(v: string): string {
  if (!/^\d{11}$/.test(v)) return 'PESEL powinien mieć 11 cyfr'
  const w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
  const sum = w.reduce((acc, weight, i) => acc + weight * parseInt(v[i], 10), 0) % 10
  const control = (10 - sum) % 10
  return control === parseInt(v[10], 10) ? '' : 'Niepoprawny PESEL'
}

/** reguły dla klienta – spójne ze stylami reszty */
export const clientValidators: Record<keyof ClientFormData, (v: string) => string> = {
  name: v => (!/^\p{L}+\s+\p{L}+(\s+\p{L}+)*$/u.test(v) ? 'Podaj imię i nazwisko' : ''),
  email: v => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Niepoprawny email' : ''),
  street: v => (v.trim().length < 3 ? 'Podaj poprawną ulicę' : ''),
  houseNumber: v => (!/^\d+[A-Za-z]?$/.test(v) ? 'Podaj poprawny numer domu' : ''),
  postalCode: v => (!/^\d{2}-\d{3}$/.test(v) ? 'Format: 00-000' : ''),
  city: v => (v.trim().length < 2 ? 'Podaj poprawną miejscowość' : ''),
  pesel: validatePesel,
}

/** pojedyncze pole – klient */
export function clientValidateField<K extends keyof ClientFormData>(name: K, value: string): string {
  return clientValidators[name] ? clientValidators[name](value ?? '') : ''
}

/** cały formularz – klient (wszystko wymagane) */
export function clientValidateAll(data: Partial<ClientFormData>): Record<string, string> {
  const errs: Record<string, string> = {}
  ;(Object.keys(clientValidators) as (keyof ClientFormData)[]).forEach(k => {
    const v = (data[k] as string) ?? ''
    const err = clientValidators[k](v)
    if (err) errs[k as string] = err
  })
  return errs
}
