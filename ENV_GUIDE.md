# Environment Configuration Validation
# This file documents all required environment variables

## Backend Environment Variables (.env file)

### Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=sevensem_project

### Authentication
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

### Email Configuration (for OTP)
EMAIL_SERVICE=gmail
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=PulseQueue <noreply@pulsequeue.com>

### Server Configuration
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173

### Logging
DEBUG=false
LOG_LEVEL=info

## Frontend Environment Variables (.env or .env.local in Frontend directory)

### API Configuration
VITE_API_URL=http://localhost:5000
VITE_QUEUE_UPDATE_INTERVAL=5000

### App Configuration
VITE_APP_NAME=PulseQueue
VITE_MAX_FILE_SIZE=5242880

## Security Best Practices
- Never commit .env files to version control
- Use strong, unique JWT_SECRET in production
- Store sensitive data in environment variables, not in code
- Enable HTTPS in production
- Implement rate limiting on all API endpoints
- Validate all user inputs server-side
- Use CORS appropriately to restrict access
