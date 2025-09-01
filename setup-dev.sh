#!/bin/bash

# Development setup script with SQLite
echo "🛠️  Setting up development environment..."

# Ensure we're using SQLite schema
node switch-db.js dev

# Set the DATABASE_URL for this session
export DATABASE_URL="file:./prisma/dev.db"

# Push schema and seed
echo "📊 Pushing schema to SQLite..."
DATABASE_URL="file:./prisma/dev.db" npx prisma db push

echo "🌱 Seeding database..."
DATABASE_URL="file:./prisma/dev.db" npx tsx prisma/seed.ts

echo "✅ Development setup complete!"
echo "💡 Your local database is ready at ./prisma/dev.db"
