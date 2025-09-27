
# Project Structure: High-Altitude Work Professional Network Platform

## Root
- README.md
- docker-compose.yml
- .env.example
- .gitignore


## Frontend (React, TypeScript)
- frontend
	- package.json
	- tsconfig.json
	- Dockerfile
	- public
		- index.html
	- src
        - App.tsx
        - index.tsx
		- path.ts 

		- admin
			- views
				- dictionaries
					- AdminDictionaries.tsx
					- AddDictionaryView.tsx
					- DictionaryElementForm.tsx
					- DictionaryGroupForm.tsx
					- DictionaryGroups.tsx
					- DictionaryView.tsx

				- translations
					- AdminTranslations.tsx

				- AdminPanelPage.tsx
				- AdminPanelSidebar.tsx

			- services
                - DictionaryAdminService.ts
            - utils
                - AdminUtil.ts
                - DictionaryUtil.ts
            - hooks
                - useAdmin.ts
            - model
                - Dictionary.ts

		
		- global
			- views
                - HomePage.tsx

			- components
				- controls
					- Buton.tsx
					- Checkbox.tsx
					- ControlLabel.tsx
					- DateInput.tsx
					- Dropdown.tsx
					- DropdownOptions.tsx
					- IconButon.tsx
					- Input.tsx
					- ThemeSwitch.tsx
					- TypedInput.tsx
                - Header.tsx
                - Footer.tsx
                - Loading.tsx
				- DesktopMenu.tsx
				- Logo.tsx
				- MobileMenu.tsx
				- MobileMock.tsx
			- services
                - ApiClient.ts
	        - utils
                - DateUtil.ts
                - Util.ts
			- hooks
                - isMobile.ts
			- interface
				- controls.interface.ts
			- providers
				- ConfirmProvider.tsx
				- MenuProvider.tsx
				- ThemeProvider.tsx
		
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
			- variables.scss
			- default.scss
			- styles.scss

## Backend (NestJS, TypeScript)
- backend
	- package.json
	- tsconfig.json
	- Dockerfile.dev
	- Dockerfile.prod
	- src
		- main.ts
		- AppModule.ts

		- admin
			- dictionaries
				- services
					- DictionariesService.ts
					- DictionariesRepo.ts
				- DictionariesModule.ts
				- DictionariesController.ts

			   - model 
					- DictionaryEntity.ts
					- DictionaryI.ts

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


		- global
			- exceptions
				- BusinessException.ts
				- ValidationException.ts
			- guards
				- RolesGuard.ts
			- interceptors
				- ResponseInterceptor.ts
		
		- test

## Shared
- shared
	- interfaces
		- DictionaryI.ts
## Database (PostgreSQL)
- db
	- tables
		- users
		- employee_profiles
		- dictionaries
	- indexes

## Configuration & Deployment
- docker-compose.yml (NestJS backend, React frontend, PostgreSQL)
- docker-compose.prod.yml (production config)
- .env (environment variables template)
- .gitignore