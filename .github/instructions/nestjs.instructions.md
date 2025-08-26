---
applyTo: '**/*.java'
---

Always add "/** Created by Comarch **/" at the top of the file.

# Java code generation instructions

## General rules
- Use `Optional` to avoid `NullPointerException`.
- REST controllers should handle only routing and I/O mapping, not business logic.
- Prefer using lambdas and streams over imperative loops and conditionals where appropriate.
- Use custom exceptions for business-related scenarios.

## Project Naming Guidelines
- [Project Naming Guildeline](./project-naming-guideline.md)

## Logging
- Use Log4j for logging
- Use Lombok’s `@Log4j2` to generate loggers

## Lombok
- Use Lombok where it clearly simplifies the code
- Use constructor injection with `@RequiredArgsConstructor`
- Prefer Java `record` over Lombok’s `@Value` when applicable
- Avoid using `@Data` in non-DTO classes, instead, use specific annotations like `@Getter`, `@Setter`, and `@ToString`
- Apply Lombok annotations to fields rather than the class if only some fields require them

## Spring Boot
- Use Spring Boot for simplified configuration and rapid development with sensible defaults
- Prefer constructor-based dependency injection over `@Autowired`
- Avoid hardcoding values that may change externally, use configuration parameters instead
- If a well-known library simplifies the solution, suggest using it instead of generating a custom implementation
- Use DTOs as immutable `record` types
- Use Bean Validation annotations (e.g., `@Size`, `@Email`, etc.) instead of manual validation logic

## Spring Data JPA
- Use `@Transactional` at the service layer for state-changing methods, and keep transactions as short as possible
- Use `@Transactional(readOnly = true)` for read-only operations
- Use `@EntityGraph` or fetch joins to avoid the N+1 select problem
- Use Specifications for dynamic filtering
- Avoid `CascadeType.REMOVE` on large entity relationships
