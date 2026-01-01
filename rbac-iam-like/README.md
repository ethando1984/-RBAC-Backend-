# RBAC IAM-like Monorepo

This project contains a Spring Boot backend and React frontend for a generic RBAC system with IAM-like features.

## Structure
- `/backend`: Spring Boot 3 + MyBatis + H2
- `/frontend`: React + Vite + MUI

## Prerequisites
- Java 17+
- Maven 3+
- Node.js 18+

## Quick Start

### Backend
1. Navigate to `/backend`
2. Run `mvn spring-boot:run`
3. Swagger UI: http://localhost:8080/swagger-ui.html
4. H2 Console: http://localhost:8080/h2-console (sa / empty password)

**Seed Data**:
- User: `admin` / `admin`
- Has full access to System resources.

### Frontend
1. Navigate to `/frontend`
2. Run `npm install` (already done)
3. Run `npm run dev`
4. Browser: http://localhost:5173

## Key Features
- **Effective Access Visualization**: See flattened role->permission->namespace->action tree.
- **Assignment**: Assign roles to users.
- **Monorepo**: Clean separation.

## APIs (Sample CURL)

**Login**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"admin"}'
```

**Get Effective Access**:
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8080/api/access/{userId}
```
