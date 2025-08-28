/** Created by Pawel Malek **/
---
applyTo: '**/*.tsx,**/*.ts'
---

# React code generation instructions

## General rules
- Use React with TypeScript
- Use SCSS modules for styling
- Use Tailwind CSS for utility-first styling and rapid prototyping
- Enable hot reload for fast development (e.g. Vite or Webpack with HMR)
- Use React Router for navigation
- Implement smooth transitions between views (default: horizontal, right-to-left, similar to Flutter)
- Use localStorage for client-side caching
- Use functional components and React hooks
- Organize code by feature/module
- Use context and custom hooks for state management when appropriate
- Prefer composition over inheritance
- Use TypeScript interfaces for component props
- Avoid hardcoding values; use configuration or environment variables
- Follow SOLID, DRY, KISS, YAGNI principles
- Adhere to OWASP security best practices
- Use error boundaries for global error handling
- Use lazy loading and code splitting for performance optimization
- Use Jest and React Testing Library for unit/integration testing
- Mock external dependencies in tests
- Use E2E tests for user flows
- Use ESLint and Prettier for code quality and formatting
- Use mappers/services to transform data between layers
- Use environment variables for secrets/configuration
- Use logging via browser console or custom logger
- Use Material Icons for iconography (e.g. @mui/icons-material or react-icons/material)
- The application must support both light and dark themes; all components and UI elements should be properly styled and clearly visible in both modes

## Project Naming Guidelines
- [Project Naming Guideline](./project-naming-guideline.md)
