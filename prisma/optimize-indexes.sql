-- Performance Optimization Indexes for Base44
-- Run this script in Supabase SQL Editor to improve query performance

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_company ON "User"("companyId");
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_user_created ON "User"("createdAt" DESC);

-- Company table indexes
CREATE INDEX IF NOT EXISTS idx_company_domain ON "Company"(domain);
CREATE INDEX IF NOT EXISTS idx_company_name ON "Company"(name);

-- Pentest table indexes
CREATE INDEX IF NOT EXISTS idx_pentest_company ON "Pentest"("companyId");
CREATE INDEX IF NOT EXISTS idx_pentest_status ON "Pentest"(status);
CREATE INDEX IF NOT EXISTS idx_pentest_dates ON "Pentest"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS idx_pentest_created ON "Pentest"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_pentest_assigned ON "Pentest"("assignedToId");

-- Finding table indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_finding_company ON "Finding"("companyId");
CREATE INDEX IF NOT EXISTS idx_finding_severity ON "Finding"(severity);
CREATE INDEX IF NOT EXISTS idx_finding_status ON "Finding"(status);
CREATE INDEX IF NOT EXISTS idx_finding_pentest ON "Finding"("pentestId");
CREATE INDEX IF NOT EXISTS idx_finding_target ON "Finding"("targetId");
CREATE INDEX IF NOT EXISTS idx_finding_created ON "Finding"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_finding_compliance ON "Finding"("complianceStatus");
-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_finding_company_severity_status 
  ON "Finding"("companyId", severity, status);

-- Target table indexes
CREATE INDEX IF NOT EXISTS idx_target_company ON "Target"("companyId");
CREATE INDEX IF NOT EXISTS idx_target_pentest ON "Target"("pentestId");
CREATE INDEX IF NOT EXISTS idx_target_risk ON "Target"(risk);
CREATE INDEX IF NOT EXISTS idx_target_type ON "Target"(type);
CREATE INDEX IF NOT EXISTS idx_target_created ON "Target"("createdAt" DESC);

-- Report table indexes
CREATE INDEX IF NOT EXISTS idx_report_company ON "Report"("companyId");
CREATE INDEX IF NOT EXISTS idx_report_pentest ON "Report"("pentestId");
CREATE INDEX IF NOT EXISTS idx_report_type ON "Report"(type);
CREATE INDEX IF NOT EXISTS idx_report_created ON "Report"("createdAt" DESC);

-- Comment table indexes
CREATE INDEX IF NOT EXISTS idx_comment_finding ON "Comment"("findingId");
CREATE INDEX IF NOT EXISTS idx_comment_author ON "Comment"("authorId");
CREATE INDEX IF NOT EXISTS idx_comment_created ON "Comment"("createdAt" DESC);

-- Notification table indexes
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS idx_notification_read ON "Notification"("isRead");
CREATE INDEX IF NOT EXISTS idx_notification_created ON "Notification"("createdAt" DESC);
-- Composite index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notification_user_unread 
  ON "Notification"("userId", "isRead") 
  WHERE "isRead" = false;

-- Template table indexes
CREATE INDEX IF NOT EXISTS idx_template_company ON "Template"("companyId");
CREATE INDEX IF NOT EXISTS idx_template_type ON "Template"(type);
CREATE INDEX IF NOT EXISTS idx_template_category ON "Template"(category);

-- Session table indexes (for NextAuth)
CREATE INDEX IF NOT EXISTS idx_session_token ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS idx_session_user ON "Session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_expires ON "Session"(expires);

-- Analyze tables for query optimization
ANALYZE "User";
ANALYZE "Company";
ANALYZE "Pentest";
ANALYZE "Finding";
ANALYZE "Target";
ANALYZE "Report";
ANALYZE "Comment";
ANALYZE "Notification";
ANALYZE "Template";
ANALYZE "Session";

-- Enable query performance insights
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_duration = on;

-- Vacuum to reclaim storage and update statistics
VACUUM ANALYZE;

-- Check index usage (run this query to monitor index performance)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check slow queries (queries taking > 100ms)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;