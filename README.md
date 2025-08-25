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
- Assign/remove roles to users
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
