---
description: 'Generate test for Java class or method.'
---

# Prompt:
Using the guidelines listed here, implement comprehensive tests for the [specific Java class, method, or component here].

## Guidelines for Java Unit Testing

### 1. Test Structure and Conventions
- Try to make better description in method name instead of naming tests. Use `@DisplayName` for more sophisticated descriptions.
- Group related tests within a test class named after the class being tested, e.g., `UserServiceTest`.
- Add comments to describe test purposes or to group related cases for better readability.
- For assertions use AssertJ library.
- Use static import if possible.
- If possible, prefer parametrized test over different test methods.
- For pojo, entities and other data classes prefer new instance objects instead of mocking.
- Tested class can be imperfect and contain bugs. If you find potential bug or inconsistency DO NOT modify tested class code, you can only suggest there is a potential bug.

### 2. Essential Libraries
- **JUnit 5 (org.junit.jupiter)**: Core Java testing framework.
- **Mockito (org.mockito)**: For mocking dependencies.
- **AssertJ (org.assertj)**: For assertions.

### 3. Types of Tests
- **Unit Tests**: Test individual methods or components, isolating dependencies with Mockito.
- **Parameterized Tests**: For testing multiple scenarios and inputs using `@ParameterizedTest`.

### 4. Mocking and Test Data
- Use Mockito to mock dependencies, use `Mockito.mock()` static.
- Use `when().thenReturn()` to define mock behaviors
- It's irrelevant in most cases to verify internal invocations so avoid it.
- Helper methods or factory classes can create and manage reusable test data.
- Configure default data in `beforeEach()` method.

### 5. Writing Effective Tests
- Follow the GWT (Given When Then) pattern: set up the context, invoke the method, and assert outcomes.
- Test both expected outcomes and edge cases, including error conditions and exceptional paths.
- Test multiple cases that cover a wide range of scenarios, including corner cases, data validation, null parameters, different combinations, small numbers, large numbers etc.
- Use assertions to check equality, null checks, and exception messages, leveraging AssertJ for complex assertions.
- Develop a comprehensive suite of unit tests. 

### 6. Test Coverage
- Aim for meaningful test coverage by focusing on core functionality and edge cases, rather than reaching 100%.
- Prioritize high-risk or complex code paths over trivial getters and setters.

### 7. Test location
- Place unit tests in the `src/test/java` directory, mirroring the package structure of the main code.

