# Projekt Fakturowanie

Aplikacja webowa do zarządzania fakturami, zbudowana jako monorepo zawierające backend (NestJS + Prisma) oraz planowany frontend (React). Projekt pokazuje użycie nowoczesnych technologii i dobrej organizacji kodu.

## 📁 Struktura katalogów

```
projekt-fakturowanie/
├── server/                  # Backend (NestJS + Prisma)
├── fakturowanie-frontend/  # Frontend (React – w przygotowaniu)
└── README.md               # Główny opis projektu
```

## 🚀 Technologie

- **Backend**: [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), PostgreSQL
- **Frontend**: [React](https://reactjs.org/) *(planowany)*
- **Repozytorium**: Monorepo z podziałem na `server/` i `fakturowanie-frontend/`

## 🔧 Backend – uruchomienie

Aby uruchomić część backendową:

```bash
cd server
npm install
npx prisma generate
npm run start:dev
```

Więcej informacji znajdziesz w pliku [`server/README.md`](./server/README.md)

## 🎨 Frontend

Frontend (`fakturowanie-frontend/`) jest obecnie w przygotowaniu. Zostanie oparty na React i dodany do repozytorium w przyszłości.

## 📄 Licencja

Projekt udostępniony na licencji MIT.
