# 🎯 Base44 - Pentest Management Platform

![Base44 Logo](public/logo.png)

**Base44** is a comprehensive penetration testing management platform designed to streamline security assessment workflows, vulnerability tracking, and reporting for cybersecurity teams.

---

## ✨ Features

### 🔐 Authentication & Authorization
- Role-based access control (RBAC)
- Multi-company support
- Secure authentication with NextAuth.js

### 📊 Dashboard & Analytics
- Real-time security metrics
- Vulnerability severity charts
- Compliance tracking
- Recent activity feed

### 🎯 Pentest Management
- Complete CRUD operations
- Progress tracking
- Status workflow
- Timeline management

### 🔍 Target Management
- Multiple target types (Web App, API, Cloud, Host)
- Risk scoring
- Target scope definition
- IP address & URL tracking

### 🐛 Vulnerability Management
- Comprehensive finding tracking
- CVSS scoring
- Evidence management (POC, screenshots)
- Remediation guidance
- Status workflow

### 💬 Collaboration
- Comments system
- Real-time notifications
- Team assignments
- Activity tracking

### 📄 Reports & Templates
- Multiple report types (Executive, Technical, Full)
- Multiple formats (PDF, DOCX, HTML)
- Reusable templates (ADMIN)
- Automated generation

### ⚙️ Settings & Configuration
- User profile management
- Company settings (ADMIN)
- Notification preferences
- Security settings

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database management
- **PostgreSQL** - Database
- **NextAuth.js** - Authentication
- **Zod** - Schema validation

### Infrastructure
- **Vercel** - Deployment (recommended)
- **Supabase/Railway** - PostgreSQL hosting
- **Uploadcare/Cloudinary** - File storage

---

## 📋 Prerequisites

Before installing Base44, ensure you have:

- **Node.js** >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** >= 14.0
- **Git**

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/base44.git
cd base44
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/base44"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Login with test accounts

**ADMIN:**
- Email: `admin@base44.com`
- Password: `admin123`

**PENTESTER:**
- Email: `pentester@base44.com`
- Password: `pentester123`

**CLIENT:**
- Email: `client@base44.com`
- Password: `client123`

---

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

---

## 📁 Project Structure

```
base44/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   └── dashboard/           # Dashboard pages
├── components/              # React components
│   ├── ui/                  # UI components
│   └── ...                  # Feature components
├── lib/                     # Utilities & helpers
│   ├── auth/               # Auth utilities
│   ├── validation/         # Zod schemas
│   └── utils/              # Helper functions
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── public/                  # Static files
└── types/                   # TypeScript types
```

---

## 🔑 Key Features

### Role-Based Access Control (RBAC)

- **ADMIN**: Full access, company management, templates
- **PENTESTER**: Create pentests, findings, reports
- **CLIENT**: View pentests, findings, reports

### Workflow Management

```
Pentest Workflow:
SCHEDULED → IN_PROGRESS → REPORTED → RESCAN → COMPLETED

Finding Workflow:
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

### API Endpoints

Base44 provides 47+ REST API endpoints:

- `/api/auth/*` - Authentication
- `/api/companies/*` - Company management
- `/api/pentests/*` - Pentest CRUD
- `/api/targets/*` - Target CRUD
- `/api/findings/*` - Finding CRUD
- `/api/comments/*` - Comments
- `/api/reports/*` - Report generation
- `/api/templates/*` - Templates (ADMIN)
- `/api/notifications/*` - Notifications

See [API Documentation](docs/API_DOCUMENTATION.md) for details.

---

## 🔒 Security

Base44 implements multiple security layers:

- ✅ **Authentication**: NextAuth.js with bcrypt
- ✅ **Authorization**: RBAC with middleware
- ✅ **Input Validation**: Zod schemas
- ✅ **SQL Injection**: Prisma ORM
- ✅ **XSS Prevention**: React escaping
- ✅ **CSRF Protection**: NextAuth tokens

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📦 Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- Prisma for the excellent ORM
- All contributors and users

---

## 📞 Support

For support, email support@base44.com or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Advanced reporting with charts
- [ ] Integration with security tools (Burp, OWASP ZAP)
- [ ] Mobile app
- [ ] Real-time collaboration
- [ ] AI-powered vulnerability analysis
- [ ] Multi-language support

---

## 📊 Statistics

- **Pages**: 26 complete pages
- **API Endpoints**: 47 endpoints
- **Components**: 30+ reusable components
- **Database Tables**: 20 tables
- **Lines of Code**: ~12,000+

---

<div align="center">

**Built with ❤️ by the Base44 Team**

[Website](https://base44.com) • [Documentation](https://docs.base44.com) • [GitHub](https://github.com/your-username/base44)

</div>

---

**Version**: 1.0.0  
**Last Updated**: November 2, 2025
