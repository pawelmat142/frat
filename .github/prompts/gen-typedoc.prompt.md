---
description: 'Generate Typedoc comments for NestJS (TypeScript) and PostgreSQL code.'
---

# Prompt:
Generate Typedoc comments for [specific class, method, or function] in a NestJS (TypeScript) and PostgreSQL project.

## behaviour rules
- Always write a full response in English.
- Use Typedoc supported tags like `@param`, `@returns`, `@example`, `@see`, and Markdown formatting.
- Provide usage examples and output examples for functions/methods that return simple types (e.g., string, number, boolean).
- Be concise but informative, focusing on the purpose, behavior, and edge cases.
- Do not include obvious information (e.g., "This DTO is used for data transfer").
- Do not include `@author` or Java-specific tags.
- For NestJS, document controllers, services, DTOs, and database-related logic as appropriate.
- For PostgreSQL queries, explain the query purpose and expected result shape.

## examples

### example 1
```typescript
/**
 * Splits a string by the '|' character, trims each part, removes empty parts, and returns a distinct array of strings.
 *
 * @param value - The string to split.
 * @returns An array of distinct, non-empty, trimmed strings.
 *
 * @example
 * ```typescript
 * splitStringItems('a|b|c|a| |d'); // returns ['a', 'b', 'c', 'd']
 * splitStringItems(null); // returns []
 * ```
 */
```

### example 2
```typescript
/**
 * Retrieves a user by ID from the PostgreSQL database.
 *
 * @param id - The unique identifier of the user.
 * @returns The user entity if found, otherwise null.
 *
 * @example
 * ```typescript
 * await userService.getUserById(123); // returns { id: 123, name: 'Alice', ... }
 * ```
 * @see UserEntity
 */
```

````
