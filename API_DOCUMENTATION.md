# PulseQueue API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### 1. Send OTP
**POST** `/auth/send-otp`

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword123" (only for signup)
}
```

Response:
```json
{
  "message": "OTP sent to email",
  "emailSent": true
}
```

---

### 2. Verify OTP
**POST** `/auth/verify-otp`

Request body:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "message": "Email verified successfully"
}
```

---

### 3. Login
**POST** `/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

---

### 4. Refresh Token
**POST** `/auth/refresh-token`

Request body:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response:
```json
{
  "message": "Token refreshed successfully.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

---

## OPD Endpoints

### 1. Book Token
**POST** `/opd/book-token`

**Requires Authentication**

Request body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "age": 30,
  "gender": "Male",
  "address": "123 Main Street",
  "contact": "9876543210",
  "department": "Cardiology",
  "doctor": "Dr. Sharma",
  "appointmentDate": "2026-03-23"
}
```

Response:
```json
{
  "message": "Token booked successfully",
  "tokenNumber": 101,
  "eta": "10:45 AM",
  "appointmentDate": "2026-03-23",
  "estimatedWaitMinutes": 30
}
```

---

### 2. Get Queue Count
**GET** `/opd/queue-count?doctorName=Dr.%20Sharma&departmentName=Cardiology`

Response:
```json
{
  "count": 5,
  "doctorName": "Dr. Sharma",
  "departmentName": "Cardiology"
}
```

---

### 3. Get Tokens by Doctor
**GET** `/opd/doctors/{doctorId}/tokens/{date}`

Response:
```json
[
  {
    "token_id": 1,
    "doctor_id": 1,
    "token_number": 101,
    "appointment_date": "2026-03-23",
    "status": "waiting",
    "patient_id": 1,
    "first_name": "John",
    "last_name": "Doe"
  }
]
```

---

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "timestamp": "2026-03-21T10:30:00.000Z"
  }
}
```

### Common Error Codes
- `INVALID_INPUT`: Invalid request parameters
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Token expired or insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting
Current limits (subject to change):
- Auth endpoints: 5 requests per minute per IP
- OPD endpoints: 30 requests per minute per user

---

## Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
