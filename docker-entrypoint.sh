#!/bin/sh

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
while ! nc -z mysql 3306; do
  sleep 1
done
echo "✅ Database is ready!"

# Wait a bit more for MySQL to fully start
sleep 5

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy || echo "⚠️ Migrations may already exist or failed"

# Seed database with sample data (only in development)
if [ "$NODE_ENV" = "development" ]; then
    echo "🌱 Seeding database with sample data..."
    npm run seed:all || echo "⚠️ Seeding may have failed or data already exists"
fi

echo "🚀 Starting application..."
exec npm start
