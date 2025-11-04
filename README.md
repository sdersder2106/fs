# 🔐 BASE44 - Professional Security Audit Platform

A comprehensive SaaS application for managing penetration tests, tracking vulnerabilities, and generating professional security reports.

## 🚀 Features

- **Multi-tenant Architecture** - Complete data isolation per company
- **Role-based Access Control** - Admin, Auditor, and Client roles
- **Target Management** - Track web apps, APIs, networks, and cloud resources
- **Penetration Test Management** - Full lifecycle from planning to completion
- **Vulnerability Tracking** - CVSS 3.1 scoring with detailed findings
- **Real-time Collaboration** - Comments, mentions, and live updates via Pusher
- **Professional Reports** - Generate executive and technical reports
- **Dashboard & Analytics** - Comprehensive metrics and visualizations
- **Activity Logging** - Complete audit trail for compliance

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **State Management**: Zustand + React Query

### Backend
- **API**: Next.js API Routes
- **ORM**: Prisma 5.7
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js 4.24
- **Real-time**: Pusher (Railway compatible)
- **File Upload**: Multer

### Deployment
- **Platform**: Railway
- **Node Version**: 18+

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL database
- Pusher account (free tier available)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd base44
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/base44"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key"

# Pusher (get from pusher.com)
PUSHER_APP_ID="your-pusher-app-id"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with demo data
npm run prisma:seed
```

### 5. Start the development server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔑 Default Credentials

After seeding, use these credentials to log in:

```
Admin:
Email: admin@base44.com
Password: Admin123!

Auditor:
Email: auditor@base44.com
Password: Admin123!

Client:
Email: client@base44.com
Password: Admin123!
```

## 🚢 Deployment to Railway

### 1. Prerequisites
- Railway account
- GitHub repository with your code

### 2. Deploy to Railway

1. Click "New Project" in Railway
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will auto-detect Next.js

### 3. Configure Environment Variables

Add these in Railway dashboard:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=your-32-character-secret
PUSHER_APP_ID=your-pusher-app-id
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_CLUSTER=eu
NODE_ENV=production
```

### 4. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically links it to your app

### 5. Deploy

```bash
git push origin main
```

Railway will automatically build and deploy your application.

## 📁 Project Structure

```
base44/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── dashboard/           # Dashboard components
│   ├── targets/             # Target management
│   ├── pentests/            # Pentest management
│   ├── findings/            # Finding management
│   └── providers/           # Context providers
├── lib/                     # Utility functions
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Auth configuration
│   └── utils.ts            # Helper functions
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
├── prisma/                  # Database schema
│   ├── schema.prisma       # Prisma schema
│   ├── seed.ts             # Seed data
│   └── migrations/         # Database migrations
├── public/                  # Static assets
├── middleware.ts            # Route protection
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

## 🧪 Development

### Running Prisma Studio

View and edit your database:

```bash
npm run prisma:studio
```

### Creating a new migration

```bash
npx prisma migrate dev --name description-of-changes
```

### Resetting the database

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Recreate it
3. Run all migrations
4. Run the seed file

## 📊 Database Schema

The application uses the following main entities:

- **User** - Application users with roles
- **Company** - Multi-tenant organizations
- **Target** - Security assessment targets
- **Pentest** - Penetration test projects
- **Finding** - Security vulnerabilities
- **FindingTemplate** - Reusable finding templates
- **Comment** - Collaboration comments
- **Report** - Generated security reports
- **Notification** - User notifications
- **ActivityLog** - Audit trail
- **ApiKey** - API access keys

## 🔒 Security Features

- JWT-based authentication with NextAuth.js
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Route protection middleware
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection
- CSRF tokens
- Rate limiting on APIs
- Secure headers (CSP, HSTS)
- Session timeout

## 🎨 UI/UX Features

- Dark mode by default (light mode available)
- Responsive design (mobile, tablet, desktop)
- Loading states with skeletons
- Empty states with helpful messages
- Error boundaries
- Toast notifications
- Modal dialogs
- Collapsible sidebar
- Breadcrumb navigation
- Global search (Cmd+K)

## 📈 Performance

- Code splitting and lazy loading
- Image optimization with Next.js Image
- Database query optimization
- Optimistic UI updates
- Background job processing
- CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Contact support@base44.com

## 🚀 Roadmap

- [ ] Two-factor authentication
- [ ] Jira integration
- [ ] Slack notifications
- [ ] Advanced report templates
- [ ] Bulk import/export
- [ ] Mobile app
- [ ] AI-powered vulnerability detection

---

Built with ❤️ by the BASE44 team
