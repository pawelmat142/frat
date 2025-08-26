---
---
description: 'Generate SQL migration script that creates a table for the specified NestJS/TypeORM entity (TypeScript class).'
---

# Prompt:
Generate a PostgreSQL migration script that creates a table for the ${input.entityName} entity.
File name should be `YYYYMMDDHHmmss_create_table_${input.tableName}.sql`, where the prefix is the UTC timestamp of generation.

# SQL script instructions

## Behavior rules
- always use english language
- always write full response
- take into account TypeORM entity decorators and JSDoc for naming and comments
- use syntax and functions compatible with PostgreSQL 15+
- optimize for performance and readability
- avoid unnecessary comments in sql

## Naming rules
- table names and column names must use snake_case
- table name should be plural (e.g. users, orders)
- primary key column must be named 'id'
- foreign key columns must end with '_id'
- script language is standard PostgreSQL

## Structure rules
- each column should have its own COMMENT statement based on JSDoc or contextual meaning
- foreign key columns must be integer or bigint
- all foreign keys must have an index

## Type rules
- number (int, float, double, bigint) => integer, real, double precision, bigint
- string => varchar(255)
- text => text
- boolean => boolean
- date => date
- datetime/timestamp => timestamp with time zone
- enum => varchar(255)

# Example
[Example of creating table](./create-table-example.sql)
