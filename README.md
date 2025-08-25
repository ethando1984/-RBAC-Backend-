# RBAC Backend (Spring Boot 3 + MyBatis + PostgreSQL)

## Overview
This project implements a **Role-Based Access Control (RBAC)** backend using:
- **Spring Boot 3.x**
- **Java 17**
- **MyBatis** (annotation-based mappers)
- **PostgreSQL**
- **Lombok**

It supports management of:
- Users
- Roles
- Permissions
- Namespaces
- Action Types
- User-Role assignments
- Role-Permission assignments
- Resource access mappings (link permissions to namespaces and action types)
- Querying a user’s complete access (role → permission → namespace → action)

---

## Features
- CRUD APIs for core RBAC entities
- Assign/remove roles for users
- Assign/remove permissions to roles
- Get user’s access rights via multi-table join
- PostgreSQL schema with UUID primary keys
- Annotation-based MyBatis mappers (no XML)
- DTO support for nested access results

---

## Prerequisites
- **Java 17**
- **Maven 3.8+**
- **PostgreSQL 13+**

---

## Database Setup
1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE rbacdb;
   ```
2. Update `src/main/resources/application.yml` with your database credentials.
3. Start the application:
   ```bash
   mvn spring-boot:run
   ```
4. The schema will be created automatically at startup.

## RBAC Best Practices

- **Principle of least privilege** – grant users only the permissions they need.
- **Keep role hierarchies simple** to avoid confusing chains of inheritance.
- **Separate duties** by splitting high‑risk tasks across multiple roles.
- **Review roles and permissions regularly** to remove obsolete access.
- **Document roles and permissions** so stakeholders understand their purpose.
- **Namespace resources when possible** to support multi‑tenancy and isolation.
- **Audit changes** to roles and permissions for accountability.
