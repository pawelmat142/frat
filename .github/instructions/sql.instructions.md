---
applyTo: '**/*.sql'
---

# SQL code generation instructions

## Behavior rules
- always use english language
- take into account java persistence annotations for naming
- use syntax and functions compatible with Oracle 19c database
- when generating complicated scripts optimize for performance primarily and readability

## Naming rules
- every table name should start with CMT prefix, example CMT_ORDER
- every object name should be written in CAMEL_CASE
- every object name must have max 32 characters, if a name exceeds this limit, remove vowels as needed to shorten it while preserving clarity
- script language is standard Oracle SQL
- identifier field must end with _id suffix
- column name must be CAMEL_CASE

## Structure rules
- each column should have own comment based on javadoc or contextual meaning or examples
- foreign keys columns must be numeric
- all foreign keys must have index

## Type rules
- long and Long MUST BE number
- double and Double MUST BE number
- integer and Integer MUST BE number
- Big Decimal MUST BE number
- default string MUST BE varchar(255 char)
- extended string MUST BE varchar(4000 char)
- enum MUST BE varchar(255 char)
- LocalDate MUST BE date
- LocalTime MUST BE timestamp(6)
- CountryDate MUST BE date
- CountryTime MUST BE timestamp(6)
- SystemDateTime MUST BE timestamp(6)
- Country MUST BE varchar(3 char)
