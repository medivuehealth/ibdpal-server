# IBDPal Server

Backend API server for the IBDPal iOS application.

## Features

- User authentication (register/login)
- JWT token-based security
- PostgreSQL database integration
- Rate limiting and security middleware
- Health check endpoint

## Environment Variables

The following environment variables need to be set in Railway:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRES_IN`: JWT token expiration time (default: 7d)
- `NODE_ENV`: Environment (production/development)
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins

## Deployment on Railway

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway project**:
   ```bash
   railway init
   ```

4. **Set environment variables**:
   ```bash
   railway variables set DATABASE_URL="your-neon-postgresql-url"
   railway variables set JWT_SECRET="your-super-secret-jwt-key"
   railway variables set NODE_ENV="production"
   railway variables set CORS_ORIGINS="https://your-ios-app-domain.com"
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/health` - Health check
- `GET /api/users/me` - Get current user profile

## Database Setup

The server automatically creates the necessary database tables and functions on startup. 