-- Script to populate Base44 with test data
-- Run this in Supabase SQL Editor

-- First, ensure we have a company
INSERT INTO "Company" (id, name, domain, "createdAt", "updatedAt")
VALUES ('test-company-1', 'Demo Company', 'demo.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create a test user (password: Test123!)
INSERT INTO "User" (
  id, email, password, "fullName", role, "companyId", 
  "emailVerified", "createdAt", "updatedAt"
)
VALUES (
  'test-user-1',
  'demo@demo.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXe.pZyqcI4bZlYCuPpnR5Q5d5XI0hExG',
  'Demo User',
  'ADMIN',
  'test-company-1',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Add some pentests
INSERT INTO "Pentest" (id, title, description, status, type, "startDate", "endDate", "companyId", "createdById", "createdAt", "updatedAt")
VALUES 
  ('pentest-1', 'Q1 2024 Web Application Security Assessment', 'Comprehensive security testing of main web application', 'COMPLETED', 'WEB_APPLICATION', '2024-01-15', '2024-02-15', 'test-company-1', 'test-user-1', NOW(), NOW()),
  ('pentest-2', 'Network Infrastructure Pentest', 'Internal and external network security assessment', 'ACTIVE', 'NETWORK', '2024-03-01', '2024-03-30', 'test-company-1', 'test-user-1', NOW(), NOW()),
  ('pentest-3', 'Mobile App Security Review', 'iOS and Android application testing', 'SCHEDULED', 'MOBILE_APPLICATION', '2024-04-01', '2024-04-15', 'test-company-1', 'test-user-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add some targets
INSERT INTO "Target" (id, name, type, host, "ipAddress", description, status, risk, "riskScore", "companyId", "createdAt", "updatedAt")
VALUES
  ('target-1', 'Main Web Server', 'WEB_APPLICATION', 'app.demo.com', '192.168.1.10', 'Production web application server', 'ACTIVE', 'HIGH', 85, 'test-company-1', NOW(), NOW()),
  ('target-2', 'API Gateway', 'API', 'api.demo.com', '192.168.1.20', 'Main API endpoint', 'ACTIVE', 'MEDIUM', 60, 'test-company-1', NOW(), NOW()),
  ('target-3', 'Database Server', 'DATABASE', 'db.internal.com', '10.0.0.50', 'PostgreSQL database server', 'ACTIVE', 'CRITICAL', 95, 'test-company-1', NOW(), NOW()),
  ('target-4', 'Mobile Backend', 'MOBILE_BACKEND', 'mobile-api.demo.com', '192.168.1.30', 'Mobile app backend services', 'INACTIVE', 'LOW', 30, 'test-company-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add some findings
INSERT INTO "Finding" (
  id, title, description, severity, status, category, 
  "cweId", "cvssScore", "pentestId", "targetId", 
  "reporterId", "companyId", "createdAt", "updatedAt"
)
VALUES
  ('finding-1', 'SQL Injection in Login Form', 'The login form is vulnerable to SQL injection attacks through the username parameter', 'CRITICAL', 'OPEN', 'INJECTION', 'CWE-89', 9.8, 'pentest-1', 'target-1', 'test-user-1', 'test-company-1', NOW(), NOW()),
  ('finding-2', 'Cross-Site Scripting (XSS) in Comments', 'Stored XSS vulnerability in the comments section', 'HIGH', 'OPEN', 'XSS', 'CWE-79', 7.5, 'pentest-1', 'target-1', 'test-user-1', 'test-company-1', NOW(), NOW()),
  ('finding-3', 'Weak Password Policy', 'Password policy allows weak passwords', 'MEDIUM', 'IN_PROGRESS', 'AUTHENTICATION', 'CWE-521', 5.3, 'pentest-1', 'target-1', 'test-user-1', 'test-company-1', NOW(), NOW()),
  ('finding-4', 'Missing Security Headers', 'Several security headers are not implemented', 'LOW', 'RESOLVED', 'CONFIGURATION', 'CWE-16', 3.1, 'pentest-1', 'target-2', 'test-user-1', 'test-company-1', NOW(), NOW()),
  ('finding-5', 'Outdated TLS Version', 'Server still supports TLS 1.0 and 1.1', 'MEDIUM', 'OPEN', 'CRYPTOGRAPHY', 'CWE-326', 5.9, 'pentest-2', 'target-2', 'test-user-1', 'test-company-1', NOW(), NOW()),
  ('finding-6', 'Information Disclosure in Error Messages', 'Detailed error messages reveal system information', 'INFO', 'OPEN', 'INFORMATION_DISCLOSURE', 'CWE-209', 2.5, 'pentest-2', 'target-3', 'test-user-1', 'test-company-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add some reports
INSERT INTO "Report" (
  id, title, type, status, format, "executiveSummary",
  "pentestId", "companyId", "createdById", "createdAt", "updatedAt"
)
VALUES
  ('report-1', 'Q1 2024 Security Assessment Report', 'PENTEST', 'FINAL', 'PDF', 'Executive summary of Q1 security assessment findings and recommendations.', 'pentest-1', 'test-company-1', 'test-user-1', NOW(), NOW()),
  ('report-2', 'Network Security Report - Draft', 'PENTEST', 'DRAFT', 'DOCX', 'Initial findings from network infrastructure testing.', 'pentest-2', 'test-company-1', 'test-user-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Companies:', COUNT(*) FROM "Company";
SELECT 'Users:', COUNT(*) FROM "User";
SELECT 'Pentests:', COUNT(*) FROM "Pentest";
SELECT 'Targets:', COUNT(*) FROM "Target";
SELECT 'Findings:', COUNT(*) FROM "Finding";
SELECT 'Reports:', COUNT(*) FROM "Report";