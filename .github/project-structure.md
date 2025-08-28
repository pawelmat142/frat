
# Project Structure: High-Altitude Work Professional Network Platform

## Root
- README.md
- docker-compose.yml
- .env.example
- .gitignore


## Frontend (React, TypeScript)
- frontend/
	- package.json
	- tsconfig.json
	- Dockerfile
	- public
		- index.html
	- src
        - App.tsx
        - index.tsx
        - index.css
		- path.ts 
		
		- global
			- views
                - HomePage.tsx
			- components
                - Header.tsx
                - Footer.tsx
                - LoadingSpinner.tsx
                - ErrorMessage.tsx
			- services
                - ApiClient.ts
	        - utils
                - DateUtil.ts
                - Util.ts
			- hooks
                - useApi.ts
		
		- auth
			- views
                - LoginPage.tsx
                - RegisterPage.tsx
			- components
                - LoginForm.tsx
                - RegisterForm.tsx
                - ProtectedRoute.tsx
			- services
                - AuthService.ts
            - utils
                - ValidationUtil.ts
            - hooks
                - useAuth.ts
            - model
                - Payload.ts

		- user
			- views
                - ProfilePage.tsx
			- components
                - ProfileView.tsx
                - ProfileEdit.tsx
			- services
                - UserService.ts
            - utils
                - UserUtil.ts
            - hooks
                - useUser.ts
            - model
                - User.ts

		- admin
			- views
                - AdminPanelPage.tsx
			- components
                - FieldConfigPanel.tsx
                - DictionaryManager.tsx
			- services
                - AdminService.ts
                - DictionaryAdminService.ts
            - utils
                - AdminUtil.ts
            - hooks
                - useAdmin.ts
            - model
                - Dictionary.ts

		- employee-profile
			- views
                - EmployeeProfileView.tsx
                - EmployeeProfileForm.tsx
                - EmployeeSearch.tsx
			- components
			- services
                - EmployeeProfileService.ts
	        - utils
                - EPUtil.ts
            - hooks
                - useEmployeeProfile.ts
			- types
				- EmployeeProfile.ts

		- styles
			- main.scss

## Backend (NestJS, TypeScript)
- backend/
	- package.json
	- tsconfig.json
	- Dockerfile
	- src
		- main.ts
		- AppModule.ts

		- config
			- AppConfig.ts
			- JwtConfig.ts
			- DatabaseConfig.ts

		- auth
			- AuthModule.ts
			- AuthController.ts
			- AuthService.ts
			- JwtStrategy.ts

			- dto
				- LoginDto.ts
				- RegisterDto.ts
				- RefreshTokenDto.ts

			- guards
				- JwtAuthGuard.ts
				- RolesGuard.ts
		
		- user
			   - UserModule.ts
			   - UserController.ts
			   - UserService.ts
			   - UserEntity.ts

			- dto
				- UserProfileDto.ts
				- UpdateUserProfileDto.ts

		- employee-profile
			- EmployeeProfileModule.ts
			- EmployeeProfileController.ts
			- EmployeeProfileService.ts
			- EmployeeProfileEntity.ts
			- dto
				- CreateEmployeeProfileDto.ts
				- UpdateEmployeeProfileDto.ts
				- SearchEmployeeProfileDto.ts

		- admin
			- AdminModule.ts
			- AdminController.ts
			- AdminService.ts
			- dto
				- FieldConfigDto.ts
				- DictionaryConfigDto.ts

		- dictionaries
			   - DictionariesModule.ts
			   - DictionariesController.ts
			   - DictionariesService.ts
			   - DictionaryEntity.ts

				- dto
					- DictionaryDto.ts
					- ImportDictionaryDto.ts
					- ExportDictionaryDto.ts

		- common/
			- exceptions/
				   - BusinessException.ts
				   - ValidationException.ts
			- guards/
				   - RolesGuard.ts
			- interceptors/
				   - ResponseInterceptor.ts
		
		- tests/
			- auth/
				   - AuthController.spec.ts
				   - AuthService.spec.ts
			- user/
				   - UserController.spec.ts
				   - UserService.spec.ts
			- employee-profile/
				   - EmployeeProfileController.spec.ts
				   - EmployeeProfileService.spec.ts
			- admin/
				   - AdminController.spec.ts
				   - AdminService.spec.ts
			- dictionaries/
				   - DictionariesController.spec.ts
				   - DictionariesService.spec.ts

## Database (PostgreSQL)
- Tables:
	- users
	- employee_profiles
	- dictionaries

- Indexes for search performance (fields, skills, certifications)
- Full-text search indexes for advanced queries

## Configuration & Deployment
- docker-compose.yml (NestJS backend, React frontend, PostgreSQL)
- docker-compose.prod.yml (production config)
- .env.example (environment variables template)
- .gitignore

## Security Features
- JWT-based authentication
- Password hashing (bcrypt)
- Role-based access control (guards)
- Input validation and sanitization (DTOs, pipes)
- CORS configuration
- Rate limiting (NestJS middleware)
- GDPR-compliant data handling

## Key Domain Features Implementation
- User Management: registration, login, profile
- Dynamic Employee Profile: configurable fields, edit/view
- Skills & Certifications: dropdowns from dictionaries
- Advanced Search: multi-criteria, paginated
- Admin Panel: field and dictionary management

## API Documentation
- Swagger/OpenAPI integration for backend API docs

## Notes
- All backend endpoints have corresponding Jest tests
- Frontend uses TypeScript and React Testing Library
- Dockerized for local and production deployment
- Follows 3-tier architecture: React frontend, NestJS backend, PostgreSQL database
- JWT tokens for stateless authentication
- Prepared for future extensions (e.g., job marketplace)