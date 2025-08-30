# High-Altitude Work Professional Network Platform

A fullstack application built with NestJS, React, and PostgreSQL, designed for rope access technicians, industrial climbers, wind turbine technicians, and other height work specialists.

## Features

- **Dictionary Management**: Create, edit, and manage dictionaries with flexible structure
- **Dynamic Field Configuration**: Configure form fields and search filters
- **Professional Networking**: Connect height work specialists and companies
- **Equipment & Training**: Manage equipment suppliers and training providers

## Technology Stack

- **Backend**: NestJS (TypeScript)
- **Frontend**: React (TypeScript)
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Styling**: SCSS modules + Tailwind CSS

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jobHigh
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Database: localhost:5432

### Production Deployment

1. **Setup production environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy with production configuration**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Project Structure

```
jobHigh/
├── backend/          # NestJS backend application
├── frontend/         # React frontend application
├── db/               # Database scripts and migrations
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

## Development

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Database

The database is automatically initialized with Docker Compose. Migration scripts are located in `db/init/`.

## API Documentation

Once the backend is running, visit http://localhost:3000/api for Swagger documentation.

## Contributing

1. Follow the coding guidelines in `.github/instructions/`
2. Use TypeScript for all new code
3. Follow SOLID, DRY, KISS, and YAGNI principles
4. Adhere to OWASP security best practices

## License

[Add your license here]
