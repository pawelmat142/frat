## Project Description
This is a fullstack project using NestJS (TypeScript), React, and PostgreSQL. When there is no clear instruction or other indications then generate code in TypeScript (NestJS for backend, React for frontend).
This application is a mock server and client for a high-altitude work platform, designed for rope access technicians, industrial climbers, wind turbine technicians, and other height work specialists, as well as companies, training providers, and equipment suppliers in the high-altitude industry.

## Docker Requirement
The project must be containerized using Docker to ensure easy local development and straightforward installation on a VPS. All components (backend, frontend, database) should be runnable via Docker Compose, with clear instructions for building and starting containers. This guarantees consistent environments and simplifies deployment.

## Behavioral rules
- Break tasks into the smallest units and solve step by step.
- Always verify information before presenting it, do not speculate.
- Only implement changes explicitly requested. Do not change files when there are no actual modifications needed.

## Project Naming Guidelines
- [Project Naming Guideline](./project-naming-guideline.md)

## General guidelines for writing code
- Backend uses NestJS (TypeScript), frontend uses React (TypeScript), database is PostgreSQL.
- Do not use features from higher TypeScript versions than supported by current Node.js and browser LTS.
- Favor elegant, maintainable solutions over verbose code. Assume understanding of language idioms and design patterns for TypeScript.
- Follow clean code, SOLID, DRY, KISS, and YAGNI principles.
- Highlight potential performance implications and optimization opportunities in suggested code.
- Frame solutions within broader architectural contexts and suggest design alternatives when appropriate.
- Focus comments on 'why' not 'what' - assume code readability through well-named functions and variables.
- Proactively address edge cases, race conditions, and security considerations without being prompted.
- Adhere to OWASP security best practices for web applications.
- When debugging, provide targeted diagnostic approaches rather than shotgun solutions.
- Suggest comprehensive testing strategies rather than just example tests, including considerations for mocking, test organization, and coverage (Jest for backend, React Testing Library for frontend).
- Use mappers/services to transform data between layers to maintain separation of concerns.
- Use ./instructions/nestjsinstructions.md when generating backend NestJS code.
- Use ./instructions/reactjsinstructions.md when generating frontend React code.
- Use ./project-structure.md when generating new files.
