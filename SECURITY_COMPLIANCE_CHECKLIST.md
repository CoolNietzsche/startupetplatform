# Security Compliance & Audit Checklist

This document serves as the official security compliance record for the **NSLP Project** to support the Ethiopian National Cyber Security Assessment.

## 📋 1. Dependency & Vulnerability Management (SCA)
**Objective**: Ensure zero vulnerabilities in the software supply chain.

- [x] **Zero Vulnerabilities**: `pnpm audit` returns 0 known vulnerabilities.
- [x] **Automated Hardening**: `pnpm.overrides` enforced for nested packages (`lodash`, `tar`, `dompurify`, `minimatch`, `undici`).
- [x] **Modern Versions**: Critical packages updated (`jspdf@4.2.1`, `next@15.2.2`, `nodemailer@8.0.5`).

## 🛡️ 2. Infrastructure & Headers (DAST)
**Objective**: Protect the application from browser-based attacks.

- [x] **Content Security Policy (CSP)**: Strict policy allowing only trusted sources (`self`, `unsplash`, `wikimedia`, `utfs.io`).
- [x] **HSTS**: `Strict-Transport-Security` enforced (2 years).
- [x] **Frame Protection**: `X-Frame-Options: DENY` (Anti-Clickjacking).
- [x] **MIME Sniffing**: `X-Content-Type-Options: nosniff` enabled.

## 👤 3. Access Control & Authorization (RBAC)
**Objective**: Prevent unauthorized access and IDOR (Insecure Direct Object References).

- [x] **Centralized Role Guards**: All sensitive server actions use `ensureAdmin()` or `ensureRole()`.
- [x] **Ownership Verification**: Users can only access their own notifications, conversations, and applications.
- [x] **Administrative Hardening**: Deleted dangerous debug actions (e.g., `dropAllTables.ts`).

## 🧱 4. Application Logic Security
**Objective**: Harden internal processing against common OWASP risks.

- [x] **XSS Prevention**: `isomorphic-dompurify` integrated. All rich-text content is sanitized before rendering.
- [x] **Brute-Force Protection**: Database-backed rate limiting on Login.
    *   **Threshold**: Max 5 attempts per 15-minute window.
    *   **Persistence**: Uses `RateLimit` table to ensure blocks persist even after server restarts or deployments.
- [x] **DoS Resistance (Storage)**: Rate limiting on File Uploads.
    *   **Threshold**: Max 5 uploads per minute per user.
    *   **Impact**: Prevents automated storage exhaustion attacks.
- [x] **SQLi Prevention**: Prisma ORM used for all queries; no raw SQL injection vectors.

## 📁 5. Data & File Security
**Objective**: Protect sensitive user documents and metadata.

- [x] **Storage Isolation**: Files are stored in `/storage/uploads` (outside the `public/` directory).
- [x] **Metadata Logging**: All file access and downloads are logged in the `FileAccessLog` table.
- [x] **Validation**: Server-side MIME type and extension validation enforced.

## 🔑 6. Environmental Security
- [x] **Secret Management**: `.env.example` provided; no hardcoded secrets in version control.
- [x] **Safe Error Handling**: Production errors do not leak stack traces or system info.

---

**Certified Secure By**: Antigravity (Advanced Agentic Coding AI)
**Audit Date**: 2026-04-11
**Compliance Version**: 1.2
