const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.report.deleteMany();
  await prisma.pentest.deleteMany();
  await prisma.target.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  console.log('✅ Data cleaned\n');

  // Create Companies
  console.log('🏢 Creating companies...');
  const company1 = await prisma.company.create({
    data: {
      name: 'TechCorp Inc.',
      domain: 'techcorp.com',
      description: 'Leading technology company',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'SecureNet Solutions',
      domain: 'securenet.com',
      description: 'Cybersecurity solutions provider',
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'DataGuard Systems',
      domain: 'dataguard.com',
      description: 'Data protection and security',
    },
  });
  console.log('✅ Companies created\n');

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedPasswordPentester = await bcrypt.hash('pentester123', 10);
  const hashedPasswordClient = await bcrypt.hash('client123', 10);

  // Company 1 users
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@base44.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
      companyId: company1.id,
    },
  });

  const pentester1 = await prisma.user.create({
    data: {
      email: 'pentester@base44.com',
      password: hashedPasswordPentester,
      fullName: 'John Pentester',
      role: 'PENTESTER',
      companyId: company1.id,
    },
  });

  const client1 = await prisma.user.create({
    data: {
      email: 'client@base44.com',
      password: hashedPasswordClient,
      fullName: 'Client User',
      role: 'CLIENT',
      companyId: company1.id,
    },
  });

  // Company 2 users
  await prisma.user.create({
    data: {
      email: 'admin@securenet.com',
      password: hashedPassword,
      fullName: 'Alice Admin',
      role: 'ADMIN',
      companyId: company2.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'pentester@securenet.com',
      password: hashedPasswordPentester,
      fullName: 'Bob Security',
      role: 'PENTESTER',
      companyId: company2.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'client@securenet.com',
      password: hashedPasswordClient,
      fullName: 'Carol Client',
      role: 'CLIENT',
      companyId: company2.id,
    },
  });

  // Company 3 users
  await prisma.user.create({
    data: {
      email: 'admin@dataguard.com',
      password: hashedPassword,
      fullName: 'David Manager',
      role: 'ADMIN',
      companyId: company3.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'pentester@dataguard.com',
      password: hashedPasswordPentester,
      fullName: 'Eve Tester',
      role: 'PENTESTER',
      companyId: company3.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'client@dataguard.com',
      password: hashedPasswordClient,
      fullName: 'Frank Client',
      role: 'CLIENT',
      companyId: company3.id,
    },
  });
  console.log('✅ Users created\n');

  // Create Targets
  console.log('🎯 Creating targets...');
  const target1 = await prisma.target.create({
    data: {
      name: 'Main Website',
      type: 'WEB_APP',
      url: 'https://techcorp.com',
      status: 'ACTIVE',
      riskScore: 65,
      companyId: company1.id,
      description: 'Company main website',
    },
  });

  const target2 = await prisma.target.create({
    data: {
      name: 'API Gateway',
      type: 'API',
      url: 'https://api.techcorp.com',
      status: 'ACTIVE',
      riskScore: 75,
      companyId: company1.id,
      description: 'Main API endpoint',
    },
  });

  const target3 = await prisma.target.create({
    data: {
      name: 'Admin Portal',
      type: 'WEB_APP',
      url: 'https://admin.securenet.com',
      status: 'ACTIVE',
      riskScore: 85,
      companyId: company2.id,
      description: 'Administrative portal',
    },
  });
  console.log('✅ Targets created\n');

  // Create Pentests
  console.log('🔍 Creating pentests...');
  const pentest1 = await prisma.pentest.create({
    data: {
      title: 'Q4 2024 Security Assessment',
      description: 'Comprehensive security assessment for Q4',
      status: 'IN_PROGRESS',
      progress: 45,
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      companyId: company1.id,
      targetId: target1.id,
    },
  });

  const pentest2 = await prisma.pentest.create({
    data: {
      title: 'API Security Review',
      description: 'Security review of API endpoints',
      status: 'SCHEDULED',
      progress: 0,
      startDate: new Date('2024-11-15'),
      endDate: new Date('2024-12-15'),
      companyId: company1.id,
      targetId: target2.id,
    },
  });

  const pentest3 = await prisma.pentest.create({
    data: {
      title: 'Admin Portal Pentest',
      description: 'Penetration testing of admin portal',
      status: 'COMPLETED',
      progress: 100,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-10-01'),
      companyId: company2.id,
      targetId: target3.id,
    },
  });
  console.log('✅ Pentests created\n');

  // Create Findings
  console.log('🐛 Creating findings...');
  const finding1 = await prisma.finding.create({
    data: {
      title: 'SQL Injection in Login Form',
      description: 'The login form is vulnerable to SQL injection attacks',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      status: 'OPEN',
      category: 'Injection',
      proofOfConcept: "' OR '1'='1' --",
      reproductionSteps: '1. Navigate to login page\n2. Enter payload in username field\n3. Click login',
      remediation: 'Use parameterized queries or prepared statements',
      companyId: company1.id,
      pentestId: pentest1.id,
      targetId: target1.id,
      reporterId: pentester1.id,
    },
  });

  const finding2 = await prisma.finding.create({
    data: {
      title: 'Cross-Site Scripting (XSS)',
      description: 'Reflected XSS vulnerability in search functionality',
      severity: 'HIGH',
      cvssScore: 7.5,
      status: 'IN_PROGRESS',
      category: 'XSS',
      proofOfConcept: '<script>alert("XSS")</script>',
      reproductionSteps: '1. Navigate to search page\n2. Enter XSS payload\n3. Submit search',
      remediation: 'Implement proper input validation and output encoding',
      companyId: company1.id,
      pentestId: pentest1.id,
      targetId: target1.id,
      reporterId: pentester1.id,
    },
  });

  const finding3 = await prisma.finding.create({
    data: {
      title: 'Weak Password Policy',
      description: 'Password policy allows weak passwords',
      severity: 'MEDIUM',
      cvssScore: 5.3,
      status: 'RESOLVED',
      category: 'Authentication',
      remediation: 'Implement strong password requirements',
      companyId: company2.id,
      pentestId: pentest3.id,
      targetId: target3.id,
      reporterId: pentester1.id,
    },
  });
  console.log('✅ Findings created\n');

  // Create Templates (ADMIN only)
  console.log('📄 Creating templates...');
  await prisma.template.create({
    data: {
      name: 'SQL Injection Template',
      description: 'Standard template for SQL injection findings',
      type: 'FINDING',
      category: 'Injection',
      content: '## SQL Injection Vulnerability\n\n**Severity:** {{severity}}\n**CVSS Score:** {{cvssScore}}\n\n### Description\n{{description}}\n\n### Proof of Concept\n{{proofOfConcept}}\n\n### Remediation\n{{remediation}}',
      isPublic: true,
      companyId: company1.id,
    },
  });

  await prisma.template.create({
    data: {
      name: 'XSS Template',
      description: 'Standard template for XSS findings',
      type: 'FINDING',
      category: 'XSS',
      content: '## Cross-Site Scripting (XSS)\n\n**Severity:** {{severity}}\n**CVSS Score:** {{cvssScore}}\n\n### Description\n{{description}}\n\n### Proof of Concept\n{{proofOfConcept}}\n\n### Remediation\n{{remediation}}',
      isPublic: true,
      companyId: company1.id,
    },
  });
  console.log('✅ Templates created\n');

  // Create Comments
  console.log('💬 Creating comments...');
  await prisma.comment.create({
    data: {
      text: 'This is a critical issue that needs immediate attention.',
      findingId: finding1.id,
      authorId: admin1.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: 'Working on a fix for this vulnerability.',
      findingId: finding2.id,
      authorId: pentester1.id,
    },
  });
  console.log('✅ Comments created\n');

  // Create Reports
  console.log('📊 Creating reports...');
  await prisma.report.create({
    data: {
      title: 'Q4 2024 Security Report',
      type: 'EXECUTIVE',
      status: 'COMPLETED',
      format: 'PDF',
      fileUrl: '/reports/q4-2024-report.pdf',
      generatedAt: new Date(),
      pentestId: pentest1.id,
      companyId: company1.id,
    },
  });
  console.log('✅ Reports created\n');

  console.log('✅ Database seeded successfully!\n');
  console.log('📧 Test Accounts:');
  console.log('');
  console.log('ADMIN:');
  console.log('  Email: admin@base44.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('PENTESTER:');
  console.log('  Email: pentester@base44.com');
  console.log('  Password: pentester123');
  console.log('');
  console.log('CLIENT:');
  console.log('  Email: client@base44.com');
  console.log('  Password: client123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
