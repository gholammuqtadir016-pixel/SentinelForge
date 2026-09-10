# 🛡️ SentinelForge

### Security Operations Center (SOC) Monitoring Platform

SentinelForge is a full-stack cybersecurity monitoring platform designed to simulate a Security Operations Center (SOC).

It provides secure user authentication, role-based access control, security event monitoring, incident management, dashboard statistics, and audit logging.

---

## 🚀 Features

- 🔐 JWT-based authentication
- 🔑 Secure password hashing with bcrypt
- 👥 Role-Based Access Control (RBAC)
- 🚨 Security event management
- 📊 SOC dashboard with event statistics
- 🔎 Filter events by severity and status
- ✅ Acknowledge security events
- ✔️ Resolve security events
- 📜 Security audit logging
- 🛡️ Helmet security headers
- 🚦 API rate limiting
- 🌐 RESTful API architecture
- 🗄️ PostgreSQL database
- 🔄 Prisma ORM
- 📱 Responsive dashboard interface

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │     Vite + JSX      │
                    └──────────┬──────────┘
                               │
                          Axios / REST
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │    Node + TypeScript│
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        JWT Authentication    RBAC       Security Events
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                         Prisma ORM
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    └─────────────────────┘
                               │
                               ▼
                         Audit Logs
