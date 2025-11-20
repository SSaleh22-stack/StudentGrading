# Student Grading

A bilingual (Arabic + English) web application for university teachers to manage student grades.

## Tech Stack

- **Next.js 15** (App Router)
- **React 18** with **TypeScript**
- **Tailwind CSS** for styling
- **react-i18next** for internationalization
- **PapaParse** for CSV parsing

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your database:
   - Copy `.env.example` to `.env.local`
   - Add your database connection string to `DATABASE_URL`
   - See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions

3. Initialize the database:
```bash
# Generate Prisma Client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `lib/` - Utilities, types, and helpers
- `public/` - Static assets

## Development Phases

- ✅ Phase 1: Project setup (Current)
- ⏳ Phase 2: Landing page
- ⏳ Phase 3: Auth + Dashboard
- ⏳ Phase 4: File creation flow
- ⏳ Phase 5: Grading table
- ⏳ Phase 6: i18n support
- ⏳ Phase 7: Polish & animations

