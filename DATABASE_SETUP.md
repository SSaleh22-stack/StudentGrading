# Database Setup Guide

This project now uses a database instead of localStorage. Follow these steps to set up your database connection.

## Step 1: Choose Your Database

This project uses Prisma, which supports:
- **PostgreSQL** (recommended for production)
- **MySQL**
- **SQLite** (good for development)
- **MongoDB**

## Step 2: Get Your Database Connection String

### For PostgreSQL:
```
postgresql://username:password@host:5432/database?schema=public
```

### For MySQL:
```
mysql://username:password@host:3306/database
```

### For SQLite (development):
```
file:./dev.db
```

### For MongoDB:
```
mongodb://username:password@host:27017/database
```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your database connection string:
```env
DATABASE_URL="your-database-connection-string-here"
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

## Step 4: Update Prisma Schema (if needed)

If you're using a different database type, edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql" // Change to "mysql", "sqlite", or "mongodb"
  url      = env("DATABASE_URL")
}
```

## Step 5: Generate Prisma Client and Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

## Step 6: Test the Connection

Start your development server:
```bash
npm run dev
```

The app will now use your database instead of localStorage!

## Migration from localStorage

If you have existing data in localStorage, you can:

1. Export your localStorage data
2. Create a migration script to import it into the database
3. Or manually recreate your files through the UI

## Troubleshooting

### Connection Errors
- Verify your `DATABASE_URL` is correct
- Check that your database server is running
- Ensure your database user has proper permissions

### Prisma Errors
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations
- Check Prisma logs for detailed error messages

### Authentication Issues
- Make sure `JWT_SECRET` is set in your `.env.local`
- Clear browser localStorage and try logging in again

## Production Deployment

For production:
1. Set `DATABASE_URL` in your hosting platform's environment variables
2. Set `JWT_SECRET` to a strong, random string
3. Run migrations: `npx prisma migrate deploy`
4. Ensure your database is accessible from your hosting platform

