import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-id' },
    update: {},
    create: {
      id: 'demo-company-id',
      name: 'BASE44 Security',
      industry: 'Cybersecurity',
      size: '50-100',
      email: 'contact@base44.com',
      website: 'https://base44.com',
      phone: '+1234567890',
    },
  });

  console.log('✅ Company created:', company.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@base44.com' },
    update: {},
    create: {
      email: 'admin@base44.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      companyId: company.id,
      bio: 'System Administrator',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create auditor user
  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@base44.com' },
    update: {},
    create: {
      email: 'auditor@base44.com',
      name: 'John Auditor',
      password: hashedPassword,
      role: 'AUDITOR',
      companyId: company.id,
      bio: 'Senior Security Auditor',
      certifications: ['OSCP', 'CEH', 'CISSP'],
      emailVerified: new Date(),
    },
  });

  console.log('✅ Auditor user created:', auditor.email);

  // Create client user
  const client = await prisma.user.upsert({
    where: { email: 'client@base44.com' },
    update: {},
    create: {
      email: 'client@base44.com',
      name: 'Client User',
      password: hashedPassword,
      role: 'CLIENT',
      companyId: company.id,
      bio: 'Client Representative',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Client user created:', client.email);

  // Create demo targets
  const targets = await Promise.all([
    prisma.target.create({
      data: {
        name: 'Main Web Application',
        description: 'Customer-facing web portal',
        url: 'https://demo-app.example.com',
        targetType: 'WEB_APPLICATION',
        criticalityLevel: 'CRITICAL',
        technologyStack: ['React', 'Node.js', 'PostgreSQL'],
        businessImpact: 'High - Customer data and transactions',
        owner: 'Development Team',
        companyId: company.id,
      },
    }),
    prisma.target.create({
      data: {
        name: 'REST API',
        description: 'Backend API for mobile and web apps',
        url: 'https://api.example.com',
        targetType: 'API_ENDPOINT',
        criticalityLevel: 'HIGH',
        technologyStack: ['Express.js', 'MongoDB', 'Redis'],
        businessImpact: 'High - Core business logic',
        owner: 'Backend Team',
        companyId: company.id,
      },
    }),
    prisma.target.create({
      data: {
        name: 'Internal Network',
        description: 'Corporate network infrastructure',
        ipAddress: '192.168.1.0/24',
        targetType: 'NETWORK_INFRASTRUCTURE',
        criticalityLevel: 'CRITICAL',
        technologyStack: ['Cisco', 'pfSense', 'Active Directory'],
        businessImpact: 'Critical - Internal operations',
        owner: 'IT Team',
        companyId: company.id,
      },
    }),
  ]);

  console.log(`✅ ${targets.length} Targets created`);

  // Create demo pentest
  const pentest = await prisma.pentest.create({
    data: {
      title: 'Q4 2024 Security Assessment',
      description: 'Comprehensive security assessment of web applications and APIs',
      scope: 'Full testing of web app, API, and network infrastructure',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      status: 'IN_PROGRESS',
      progress: 45,
      methodology: 'OWASP Testing Guide',
      complianceFrameworks: ['OWASP Top 10', 'PCI-DSS', 'ISO 27001'],
      companyId: company.id,
      createdById: admin.id,
      assignees: {
        connect: [{ id: auditor.id }],
      },
      targets: {
        connect: targets.map(t => ({ id: t.id })),
      },
    },
  });

  console.log('✅ Pentest created:', pentest.title);

  // Create demo findings
  const findings = await Promise.all([
    prisma.finding.create({
      data: {
        title: 'SQL Injection in Login Form',
        description: 'The login form is vulnerable to SQL injection attacks through the username parameter.',
        severity: 'CRITICAL',
        status: 'OPEN',
        cvssScore: 9.8,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
        reproductionSteps: '1. Navigate to login page\n2. Enter \' OR 1=1-- in username field\n3. Enter any password\n4. Click submit',
        proofOfConcept: 'Username: \' OR 1=1--\nPassword: anything',
        businessImpact: 'Attackers can bypass authentication and gain unauthorized access to user accounts',
        technicalImpact: 'Complete database compromise possible',
        likelihood: 'High',
        riskScore: 9.5,
        affectedAssets: ['Login System', 'User Database'],
        owaspCategory: 'A03:2021 - Injection',
        recommendedFix: 'Use parameterized queries or prepared statements for all database operations',
        remediationPriority: 'Critical',
        companyId: company.id,
        pentestId: pentest.id,
        targetId: targets[0].id,
        createdById: auditor.id,
      },
    }),
    prisma.finding.create({
      data: {
        title: 'Cross-Site Scripting (XSS) in User Profile',
        description: 'Stored XSS vulnerability found in the user profile bio field.',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        cvssScore: 7.2,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N',
        reproductionSteps: '1. Login to application\n2. Navigate to profile settings\n3. Enter <script>alert(1)</script> in bio field\n4. Save profile\n5. View profile - XSS executes',
        proofOfConcept: '<script>alert(document.cookie)</script>',
        businessImpact: 'Attackers can steal session tokens and hijack user accounts',
        technicalImpact: 'Session hijacking, phishing, malware distribution',
        likelihood: 'Medium',
        riskScore: 7.0,
        affectedAssets: ['User Profile System'],
        owaspCategory: 'A03:2021 - Injection',
        recommendedFix: 'Implement proper input validation and output encoding',
        remediationPriority: 'High',
        companyId: company.id,
        pentestId: pentest.id,
        targetId: targets[0].id,
        createdById: auditor.id,
        assigneeId: auditor.id,
      },
    }),
    prisma.finding.create({
      data: {
        title: 'Weak Password Policy',
        description: 'The application allows weak passwords with no complexity requirements.',
        severity: 'MEDIUM',
        status: 'OPEN',
        cvssScore: 5.3,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        reproductionSteps: '1. Navigate to registration page\n2. Try creating account with password "123"\n3. Account successfully created',
        businessImpact: 'Increased risk of account compromise through brute force attacks',
        technicalImpact: 'Weak account security',
        likelihood: 'Medium',
        riskScore: 5.0,
        affectedAssets: ['Authentication System'],
        owaspCategory: 'A07:2021 - Identification and Authentication Failures',
        recommendedFix: 'Implement password complexity requirements (min 8 chars, uppercase, lowercase, numbers, special chars)',
        remediationPriority: 'Medium',
        companyId: company.id,
        pentestId: pentest.id,
        targetId: targets[0].id,
        createdById: auditor.id,
      },
    }),
  ]);

  console.log(`✅ ${findings.length} Findings created`);

  // Create demo comments
  await prisma.comment.create({
    data: {
      content: 'This is a critical issue that needs immediate attention. I recommend fixing this before the production release.',
      findingId: findings[0].id,
      authorId: auditor.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Acknowledged. Development team is working on this issue. ETA for fix: 2 days.',
      findingId: findings[0].id,
      authorId: admin.id,
    },
  });

  console.log('✅ Comments created');

  // Create demo finding templates
  await Promise.all([
    prisma.findingTemplate.create({
      data: {
        title: 'SQL Injection',
        description: 'SQL Injection vulnerability allowing unauthorized database access',
        severity: 'CRITICAL',
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
        reproductionSteps: '1. Identify injection point\n2. Test with single quote\n3. Craft SQL payload\n4. Execute payload',
        recommendedFix: 'Use parameterized queries, prepared statements, or ORMs',
        owaspCategory: 'A03:2021 - Injection',
        isPublic: true,
        companyId: company.id,
      },
    }),
    prisma.findingTemplate.create({
      data: {
        title: 'Cross-Site Scripting (XSS)',
        description: 'XSS vulnerability allowing execution of malicious scripts',
        severity: 'HIGH',
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N',
        reproductionSteps: '1. Identify input field\n2. Inject script tag\n3. Verify execution',
        recommendedFix: 'Implement input validation and output encoding',
        owaspCategory: 'A03:2021 - Injection',
        isPublic: true,
        companyId: company.id,
      },
    }),
  ]);

  console.log('✅ Finding templates created');

  // Create demo notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'CRITICAL_FINDING',
        title: 'Critical Finding Detected',
        message: 'SQL Injection vulnerability found in login form',
        link: `/findings/${findings[0].id}`,
        userId: admin.id,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'ASSIGNMENT',
        title: 'New Finding Assigned',
        message: 'You have been assigned to investigate XSS vulnerability',
        link: `/findings/${findings[1].id}`,
        userId: auditor.id,
      },
    }),
  ]);

  console.log('✅ Notifications created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:   admin@base44.com / Admin123!');
  console.log('Auditor: auditor@base44.com / Admin123!');
  console.log('Client:  client@base44.com / Admin123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
