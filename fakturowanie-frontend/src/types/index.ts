// src/types/index.ts
export type ID = string

export interface Client {
  id: ID
  name: string
  email: string
  address?: string
  street?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  pesel?: string
  paymentMethod?: 'cash' | 'transfer' | 'card' | string
}

export interface LineItem {
  name: string
  quantity: number
  unit: string
  price: number
}

// Faktury jak te z listy na InvoicesPage – mają wbudowanego klienta (id+name)
export interface InvoiceListItem {
  id: ID
  title: string
  amount: number
  status: string
  client: Pick<Client, 'id' | 'name'>
  createdAt: string
  dueDate: string
  paymentMethod?: string
  items: LineItem[]
}

// Dane, które edytujesz w formularzu edycji (zastępuje "typeof editData")
export type EditInvoiceData = {
  title: string
  amount: number
  status: string
  clientId: ID
  dueDate: string
  paymentMethod?: string
}
