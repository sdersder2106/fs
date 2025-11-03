const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed (JavaScript version)...');

  try {
    // Clear existing data
    console.log('🧹 Cleaning database...');
    await prisma.notification.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.report.deleteMany();
    await prisma.finding.deleteMany();
    await prisma.pentest.deleteMany();
    await prisma.target.deleteMany();
    await prisma.template.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    console.log('🏢 Creating companies...');
    // Create companies
    const company1 = await prisma.company.create({
      data: {
        name: 'TechCorp Inc.',
        domain: 'techcorp.com',
        description: 'Leading technology company specializing in enterprise solutions',
      },
    });

    const company2 = await prisma.company.create({
      data: {
        name: 'SecureNet Solutions',
        domain: 'securenet.com',
        description: 'Cybersecurity consulting and penetration testing services',
      },
    });

    const company3 = await prisma.company.create({
      data: {
        name: 'DataGuard Systems',
        domain: 'dataguard.com',
        description: 'Data protection and compliance management platform',
      },
    });

    console.log('👤 Creating users...');
    // Hash passwords
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordPentester = await bcrypt.hash('pentester123', 10);
    const hashedPasswordClient = await bcrypt.hash('client123', 10);

    // Company 1 users
    const admin1 = await prisma.user.create({
      data: {
        email: 'admin@base44.com',
        password: hashedPasswordAdmin,
        fullName: 'Admin User',
        role: 'ADMIN',
        phone: '+1-234-567-8900',
        bio: 'System administrator with full platform access',
        companyId: company1.id,
      },
    });

    const pentester1 = await prisma.user.create({
      data: {
        email: 'pentester@base44.com',
        password: hashedPasswordPentester,
        fullName: 'John Pentester',
        role: 'PENTESTER',
        phone: '+1-234-567-8901',
        bio: 'Senior penetration tester specializing in web applications',
        companyId: company1.id,
      },
    });

    const client1 = await prisma.user.create({
      data: {
        email: 'client@base44.com',
        password: hashedPasswordClient,
        fullName: 'Client User',
        role: 'CLIENT',
        phone: '+1-234-567-8902',
        bio: 'Client representative with read-only access',
        companyId: company1.id,
      },
    });

    // Company 2 users
    const admin2 = await prisma.user.create({
      data: {
        email: 'admin@securenet.com',
        password: hashedPasswordAdmin,
        fullName: 'Sarah Admin',
        role: 'ADMIN',
        companyId: company2.id,
      },
    });

    const pentester2 = await prisma.user.create({
      data: {
        email: 'pentester@securenet.com',
        password: hashedPasswordPentester,
        fullName: 'Mike Security',
        role: 'PENTESTER',
        companyId: company2.id,
      },
    });

    console.log('🎯 Creating targets...');
    // Create targets
    const target1 = await prisma.target.create({
      data: {
        name: 'Main Website',
        type: 'WEB_APP',
        url: 'https://techcorp.com',
        status: 'ACTIVE',
        riskScore: 65,
        description: 'Company main website and customer portal',
        companyId: company1.id,
      },
    });

    const target2 = await prisma.target.create({
      data: {
        name: 'API Gateway',
        type: 'API',
        url: 'https://api.techcorp.com',
        status: 'ACTIVE',
        riskScore: 75,
        description: 'Main API gateway for all services',
        companyId: company1.id,
      },
    });

    const target3 = await prisma.target.create({
      data: {
        name: 'Mobile App',
        type: 'MOBILE_APP',
        status: 'ACTIVE',
        riskScore: 45,
        description: 'iOS and Android mobile application',
        companyId: company1.id,
      },
    });

    const target4 = await prisma.target.create({
      data: {
        name: 'Internal Network',
        type: 'NETWORK',
        ipAddress: '192.168.1.0/24',
        status: 'ACTIVE',
        riskScore: 80,
        description: 'Internal corporate network infrastructure',
        companyId: company2.id,
      },
    });

    console.log('🔍 Creating pentests...');
    // Create pentests
    const pentest1 = await prisma.pentest.create({
      data: {
        title: 'Q4 2024 Security Assessment',
        description: 'Comprehensive security assessment of web application and API endpoints',
        status: 'IN_PROGRESS',
        progress: 45,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-31'),
        methodology: 'OWASP Testing Guide v4.2, PTES',
        companyId: company1.id,
        targetId: target1.id,
        createdById: admin1.id,
      },
    });

    const pentest2 = await prisma.pentest.create({
      data: {
        title: 'API Security Testing',
        description: 'Focused API security testing including authentication and authorization',
        status: 'SCHEDULED',
        progress: 0,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        companyId: company1.id,
        targetId: target2.id,
        createdById: admin1.id,
      },
    });

    const pentest3 = await prisma.pentest.create({
      data: {
        title: 'Mobile App Assessment',
        description: 'Security assessment of mobile application',
        status: 'COMPLETED',
        progress: 100,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-30'),
        companyId: company1.id,
        targetId: target3.id,
        createdById: admin1.id,
      },
    });

    console.log('🐛 Creating findings...');
    // Create findings
    const finding1 = await prisma.finding.create({
      data: {
        title: 'SQL Injection in Login Form',
        description: 'The login form is vulnerable to SQL injection attacks through the username parameter',
        severity: 'CRITICAL',
        cvssScore: 9.8,
        status: 'OPEN',
        category: 'Injection',
        proofOfConcept: "Username: admin' OR '1'='1' --\nPassword: anything",
        reproductionSteps: '1. Navigate to /login\n2. Enter SQL payload in username field\n3. Submit form\n4. Observe successful authentication bypass',
        requestExample: 'POST /api/login HTTP/1.1\nHost: techcorp.com\n\n{"username":"admin\' OR \'1\'=\'1\' --","password":"test"}',
        responseExample: 'HTTP/1.1 200 OK\n\n{"success":true,"token":"..."}',
        evidenceImages: [],
        remediation: 'Implement parameterized queries or prepared statements for all database interactions',
        remediationCode: 'const user = await prisma.user.findUnique({ where: { username: sanitizedUsername } });',
        references: ['https://owasp.org/www-community/attacks/SQL_Injection'],
        companyId: company1.id,
        pentestId: pentest1.id,
        targetId: target1.id,
        reporterId: pentester1.id,
      },
    });

    const finding2 = await prisma.finding.create({
      data: {
        title: 'Cross-Site Scripting (XSS) in Search',
        description: 'Reflected XSS vulnerability in the search functionality',
        severity: 'HIGH',
        cvssScore: 7.5,
        status: 'IN_PROGRESS',
        category: 'XSS',
        proofOfConcept: '<script>alert("XSS")</script>',
        reproductionSteps: '1. Navigate to /search\n2. Enter XSS payload\n3. Submit search\n4. Observe script execution',
        remediation: 'Implement proper output encoding and Content Security Policy',
        companyId: company1.id,
        pentestId: pentest1.id,
        targetId: target1.id,
        reporterId: pentester1.id,
        assignedToId: pentester1.id,
      },
    });

    const finding3 = await prisma.finding.create({
      data: {
        title: 'Weak Password Policy',
        description: 'The application allows weak passwords',
        severity: 'MEDIUM',
        cvssScore: 5.3,
        status: 'RESOLVED',
        category: 'Authentication',
        remediation: 'Implement strong password requirements',
        companyId: company1.id,
        pentestId: pentest3.id,
        targetId: target3.id,
        reporterId: pentester1.id,
      },
    });

    const finding4 = await prisma.finding.create({
      data: {
        title: 'Missing Security Headers',
        description: 'Several security headers are missing from HTTP responses',
        severity: 'LOW',
        cvssScore: 3.1,
        status: 'OPEN',
        category: 'Configuration',
        remediation: 'Add security headers: X-Frame-Options, X-Content-Type-Options, etc.',
        companyId: company1.id,
        pentestId: pentest1.id,
        targetId: target1.id,
        reporterId: pentester1.id,
      },
    });

    const finding5 = await prisma.finding.create({
      data: {
        title: 'Outdated JavaScript Libraries',
        description: 'Several JavaScript libraries are outdated with known vulnerabilities',
        severity: 'INFO',
        cvssScore: 0,
        status: 'OPEN',
        category: 'Vulnerable Components',
        remediation: 'Update all JavaScript libraries to latest versions',
        companyId: company1.id,
        pentestId: pentest1.id,
        targetId: target1.id,
        reporterId: pentester1.id,
      },
    });

    console.log('💬 Creating comments...');
    // Create comments
    await prisma.comment.create({
      data: {
        text: 'Great progress on this assessment! The SQL injection finding is critical.',
        pentestId: pentest1.id,
        authorId: admin1.id,
      },
    });

    await prisma.comment.create({
      data: {
        text: 'I have started working on the fix for this issue. Should be resolved by end of week.',
        findingId: finding1.id,
        authorId: pentester1.id,
      },
    });

    await prisma.comment.create({
      data: {
        text: 'Can we get an update on the remediation progress?',
        findingId: finding2.id,
        authorId: client1.id,
      },
    });

    console.log('📝 Creating templates...');
    // Create templates
    await prisma.template.create({
      data: {
        name: 'SQL Injection Template',
        description: 'Standard template for SQL injection findings',
        type: 'FINDING',
        category: 'Injection',
        content: `## SQL Injection Vulnerability

**Severity:** {{severity}}
**CVSS Score:** {{cvssScore}}

### Description
The application is vulnerable to SQL injection attacks through {{parameter}}.

### Impact
An attacker could:
- Bypass authentication
- Extract sensitive data
- Modify or delete data
- Execute administrative operations

### Remediation
1. Use parameterized queries or prepared statements
2. Implement input validation
3. Apply the principle of least privilege
4. Enable SQL query logging`,
        isPublic: true,
        companyId: company1.id,
      },
    });

    await prisma.template.create({
      data: {
        name: 'Executive Report Template',
        description: 'Template for executive summary reports',
        type: 'REPORT',
        content: `# Executive Summary

## Overview
This report summarizes the security assessment conducted for {{company}} between {{startDate}} and {{endDate}}.

## Key Findings
- Critical: {{criticalCount}}
- High: {{highCount}}
- Medium: {{mediumCount}}
- Low: {{lowCount}}
- Info: {{infoCount}}

## Recommendations
1. Immediate action required for critical findings
2. Plan remediation for high-risk issues
3. Schedule fixes for medium and low findings`,
        isPublic: true,
        companyId: company1.id,
      },
    });

    await prisma.template.create({
      data: {
        name: 'XSS Template',
        description: 'Template for Cross-Site Scripting findings',
        type: 'FINDING',
        category: 'XSS',
        content: `## Cross-Site Scripting (XSS)

**Type:** {{xssType}}
**Location:** {{location}}

### Proof of Concept
{{poc}}

### Remediation
- Implement proper output encoding
- Use Content Security Policy (CSP)
- Validate and sanitize input`,
        isPublic: false,
        companyId: company2.id,
      },
    });

    console.log('📊 Creating reports...');
    // Create reports
    await prisma.report.create({
      data: {
        title: 'Q4 2024 Assessment - Executive Summary',
        reportType: 'EXECUTIVE',
        status: 'DRAFT',
        format: 'PDF',
        pentestId: pentest1.id,
        companyId: company1.id,
        generatedBy: admin1.id,
      },
    });

    await prisma.report.create({
      data: {
        title: 'Mobile App Assessment - Technical Report',
        reportType: 'TECHNICAL',
        status: 'FINAL',
        format: 'PDF',
        fileUrl: '/reports/mobile-app-technical-2024.pdf',
        pentestId: pentest3.id,
        companyId: company1.id,
        generatedBy: pentester1.id,
        generatedAt: new Date('2024-09-30'),
      },
    });

    console.log('🔔 Creating notifications...');
    // Create notifications
    await prisma.notification.create({
      data: {
        title: 'New Critical Finding',
        message: 'A critical SQL injection vulnerability has been discovered in the login form',
        type: 'ERROR',
        link: `/dashboard/findings/${finding1.id}`,
        userId: admin1.id,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Pentest Started',
        message: 'Q4 2024 Security Assessment has started',
        type: 'INFO',
        link: `/dashboard/pentests/${pentest1.id}`,
        userId: client1.id,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Finding Assigned',
        message: 'You have been assigned to work on XSS vulnerability',
        type: 'WARNING',
        link: `/dashboard/findings/${finding2.id}`,
        userId: pentester1.id,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Report Available',
        message: 'Mobile App Assessment report is now available',
        type: 'SUCCESS',
        link: '/dashboard/reports',
        isRead: true,
        userId: admin1.id,
      },
    });

    console.log('✅ Seed completed successfully!');
    console.log('📊 Database statistics:');
    console.log(`   - Companies: 3`);
    console.log(`   - Users: 5`);
    console.log(`   - Targets: 4`);
    console.log(`   - Pentests: 3`);
    console.log(`   - Findings: 5`);
    console.log(`   - Comments: 3`);
    console.log(`   - Templates: 3`);
    console.log(`   - Reports: 2`);
    console.log(`   - Notifications: 4`);
    
    console.log('\n🔐 Test accounts:');
    console.log('   Admin: admin@base44.com / admin123');
    console.log('   Pentester: pentester@base44.com / pentester123');
    console.log('   Client: client@base44.com / client123');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
