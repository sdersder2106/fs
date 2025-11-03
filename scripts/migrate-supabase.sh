#!/bin/bash

# =============================================
# SUPABASE MIGRATION SCRIPT FOR BASE44
# =============================================

echo "🚀 Starting Base44 Supabase Migration..."

# Check if environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$DIRECT_URL" ]; then
    echo "❌ Error: DATABASE_URL and DIRECT_URL must be set"
    echo "Please run: source .env.production"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Pushing schema to Supabase..."
npx prisma db push --skip-generate

echo "✅ Schema pushed successfully!"

# Ask if user wants to seed the database
read -p "Do you want to seed the database with test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
    echo "✅ Database seeded successfully!"
else
    echo "⏭️  Skipping seed data"
fi

echo "🔍 Verifying database connection..."
npx prisma db execute --stdin <<EOF
SELECT 'Connection successful!' as message;
EOF

echo "✨ Migration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Vercel dashboard"
echo "2. Add environment variables"
echo "3. Deploy your application"
echo ""
echo "Default login credentials (if seeded):"
echo "Email: admin@techcorp.com"
echo "Password: Admin123!"