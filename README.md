# Base44 - Penetration Testing Management Platform

A comprehensive SaaS application for managing penetration tests, vulnerabilities, targets, and security reports.

## 🚀 Features

- **Authentication & Authorization**: Multi-company support with RBAC (ADMIN, PENTESTER, CLIENT)
- **Dashboard**: Real-time statistics, vulnerability charts, and compliance tracking
- **Pentest Management**: Complete lifecycle from scheduling to reporting
- **Target Management**: Track web apps, APIs, mobile apps, cloud, hosts, and networks
- **Finding Management**: CVSS scoring, evidence collection, and remediation tracking
- **Templates**: Reusable templates for findings and reports
- **Reports**: Generate executive, technical, and full reports
- **Collaboration**: Comments, notifications, and activity tracking

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/base44.git
cd base44
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and NextAuth configuration:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Test Accounts

After seeding the database, you can log in with:

**Admin:**
- Email: `admin@base44.com`
- Password: `admin123`

**Pentester:**
- Email: `pentester@base44.com`
- Password: `pentester123`

**Client:**
- Email: `client@base44.com`
- Password: `client123`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:seed` - Seed database with initial data
- `npm run prisma:studio` - Open Prisma Studio

## 🚀 Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database (Supabase)

1. Create a project on [supabase.com](https://supabase.com)
2. Get the connection string (Transaction mode)
3. Add to `DATABASE_URL` in environment variables
4. Run migrations and seed

## 📁 Project Structure

```
base44/
├── app/                  # Next.js app directory
│   ├── (auth)/          # Authentication pages
│   ├── api/             # API routes
│   └── dashboard/       # Dashboard pages
├── components/          # React components
│   ├── ui/             # UI components
│   ├── layout/         # Layout components
│   └── charts/         # Chart components
├── lib/                 # Utility functions
├── prisma/             # Database schema and seeds
├── types/              # TypeScript types
└── contexts/           # React contexts
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- RBAC with three roles
- Input validation with Zod
- SQL injection prevention with Prisma

## 📊 API Endpoints

The application provides 47 API endpoints covering:
- Authentication (4)
- Companies (4)
- Pentests (5)
- Targets (5)
- Findings (5)
- Comments (5)
- Reports (5)
- Templates (5)
- Notifications (6)
- Dashboard (1)
- Upload (2)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@base44.com or open an issue on GitHub.

---

Built with ❤️ by Base44 Team
