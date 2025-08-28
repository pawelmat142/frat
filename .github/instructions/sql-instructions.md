---
applyTo: '**/*.sql'
---

/** Created by Pawel Malek **/
---
applyTo: '**/*.sql'
---

# SQL code generation instructions (PostgreSQL)

## General rules
- Use English language for all names and comments
- Use PostgreSQL syntax and functions (no Oracle-specific features)
- Optimize scripts for performance and readability
- Use table/column comments for documentation
- Design for integration with NestJS (DTOs, validation, repository pattern) and React (mappers, API types)
- Enable flexible search for entities like `EmployeeProfile` (use ILIKE, full-text search, GIN indexes)

## Naming rules
- Table names should start with `jh_` (e.g. `jh_employee_profile`)
- Use snake_case for all identifiers (PostgreSQL convention)
- Maximum identifier length: 32 characters; shorten by removing vowels if needed
- Primary key columns must end with `_id`
- Foreign key columns must end with `_id`
- Use clear, descriptive names

## Structure rules
- Each column must have a comment describing its purpose
- Foreign key columns must be integer or bigint
- All foreign keys must have an index
- Use GIN or BTREE indexes for columns used in search (e.g. name, description)
- For flexible search (e.g. `EmployeeProfile`), consider full-text search columns and indexes

## Type rules (PostgreSQL)
- bigint for long/Long
- double precision for double/Double
- integer for integer/Integer
- numeric for BigDecimal
- varchar(255) for default string
- text for extended string
- varchar(255) for enum
- date for LocalDate/CountryDate
- timestamp for LocalTime/CountryTime/SystemDateTime
- varchar(3) for Country

## Search optimization
- For entities like `EmployeeProfile`, add indexes on searchable fields (e.g. name, skills)
- Use `ILIKE` for case-insensitive search
- For advanced search, use PostgreSQL full-text search (`tsvector`, `to_tsvector`, GIN index)
- Avoid N+1 query problems; design relations for efficient joins

## Integration notes
- Structure tables for easy mapping to NestJS DTOs and React types
- Use constraints and validation compatible with class-validator
- Avoid hardcoding values; use configuration/environment variables
- Ensure all sensitive data is protected (OWASP)
