# RestoLover API

A NestJS API for the RestoLover application with PostgreSQL database integration.

## Features

- **Restaurants Management**: Full CRUD operations for restaurants
- **Users Management**: User registration and management with password hashing
- **PostgreSQL Integration**: TypeORM with PostgreSQL database
- **Swagger Documentation**: Auto-generated API documentation
- **Validation**: Request validation using class-validator
- **CORS Support**: Configured for frontend integration

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `env.example` to `.env` and configure your database settings:
   ```bash
   cp env.example .env
   ```

3. **Configure your `.env` file:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=restolover

   # Application Configuration
   PORT=3001
   NODE_ENV=development
   ```

4. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE restolover;
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
- **URL**: http://localhost:3001/api
- **Features**: Interactive API documentation with testing capabilities

## API Endpoints

### Restaurants
- `GET /restaurants` - Get all restaurants
- `GET /restaurants/:id` - Get restaurant by ID
- `POST /restaurants` - Create new restaurant
- `PATCH /restaurants/:id` - Update restaurant
- `DELETE /restaurants/:id` - Delete restaurant (soft delete)
- `GET /restaurants/search?q=query` - Search restaurants

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (soft delete)

### Health Check
- `GET /health` - Application health check
- `GET /` - Welcome message

## Database Schema

### Restaurants Table
- `id` (Primary Key)
- `name` (Required)
- `description` (Optional)
- `address` (Required)
- `phone` (Optional)
- `website` (Optional)
- `latitude` (Optional)
- `longitude` (Optional)
- `rating` (Optional, 0-5)
- `status` (Default: 'active')
- `createdAt` (Auto-generated)
- `updatedAt` (Auto-generated)

### Users Table
- `id` (Primary Key)
- `firstName` (Required)
- `lastName` (Required)
- `email` (Required, Unique)
- `password` (Required, Hashed)
- `phone` (Optional)
- `role` (Default: 'user')
- `isActive` (Default: true)
- `createdAt` (Auto-generated)
- `updatedAt` (Auto-generated)

## Development

### Available Scripts
- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start in production mode
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure
```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── app.controller.ts      # Main controller
├── app.service.ts         # Main service
├── restaurants/           # Restaurants module
│   ├── entities/
│   ├── dto/
│   ├── restaurants.controller.ts
│   ├── restaurants.service.ts
│   └── restaurants.module.ts
└── users/                # Users module
    ├── entities/
    ├── dto/
    ├── users.controller.ts
    ├── users.service.ts
    └── users.module.ts
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **Input Validation**: All inputs are validated using class-validator
- **CORS Configuration**: Configured for secure cross-origin requests
- **Soft Deletes**: Data is not permanently deleted, just marked as inactive

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 