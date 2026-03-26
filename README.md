# CRM Portal

A Next.js CRM portal with client management, scripts, calendars, resources, and performance dashboards.

## Tech Stack
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS + Radix UI

## Local Development
1. Install dependencies:
```bash
npm install
```
2. Create environment file:
```bash
cp .env.example .env.local
```
3. Run Supabase SQL setup in order:
```bash
scripts/001_create_tables.sql
scripts/002_add_referral_system.sql
scripts/003_storage_setup.sql
```
4. Start dev server:
```bash
npm run dev
```
5. Open [http://localhost:3000](http://localhost:3000)

## Build
```bash
npm run build
npm run start
```

## Project Structure
- `app/` - Next.js App Router pages
- `components/` - UI and feature components
- `lib/` - static data and shared utilities
- `public/` - static assets

## Deployment
This repo includes `netlify.toml` configured for Next.js via `@netlify/plugin-nextjs`.

## License
MIT
