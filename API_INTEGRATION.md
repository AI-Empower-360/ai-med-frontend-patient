# API Integration Guide - AI Med Patient Portal

Complete guide for integrating the Patient Portal with your backend API.

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [WebSocket Integration](#websocket-integration)
7. [Testing Integration](#testing-integration)
8. [Troubleshooting](#troubleshooting)

## Overview

The Patient Portal communicates with your backend API via REST endpoints and WebSocket connections. All API calls are read-only for patient data.

### Base Configuration

Configure the API base URL in your environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.aimed.example.com
NEXT_PUBLIC_WS_BASE_URL=wss://api.aimed.example.com
```

## API Endpoints

### Authentication

#### POST `/auth/patient/login`

Patient login endpoint.

**Request:**
```json
{
  "email": "patient@example.com",
  "accessCode": "12345678"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "patient": {
    "id": "patient-123",
    "name": "John Doe",
    "email": "patient@example.com"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing or invalid fields
- `500 Internal Server Error`: Server error

### Patient Data Endpoints

All patient endpoints require authentication via Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

#### GET `/api/patient/labs`

Retrieve patient lab results.

**Response (200 OK):**
```json
[
  {
    "id": "lab-1",
    "testName": "Hemoglobin A1c",
    "date": "2024-01-15T10:00:00Z",
    "value": "5.6",
    "unit": "%",
    "referenceRange": "4.0–5.6",
    "flag": null
  },
  {
    "id": "lab-2",
    "testName": "LDL Cholesterol",
    "date": "2024-01-10T09:00:00Z",
    "value": "132",
    "unit": "mg/dL",
    "referenceRange": "< 100",
    "flag": "high"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Patient doesn't have access
- `500 Internal Server Error`: Server error

#### GET `/api/patient/medications`

Retrieve patient medications.

**Response (200 OK):**
```json
[
  {
    "id": "med-1",
    "name": "Atorvastatin",
    "dose": "20 mg",
    "frequency": "Once daily",
    "status": "active",
    "prescriber": "Dr. Smith",
    "startDate": "2023-10-01T00:00:00Z",
    "endDate": null
  },
  {
    "id": "med-2",
    "name": "Metformin",
    "dose": "500 mg",
    "frequency": "Twice daily",
    "status": "inactive",
    "prescriber": "Dr. Patel",
    "startDate": "2023-05-01T00:00:00Z",
    "endDate": "2023-11-15T00:00:00Z"
  }
]
```

#### GET `/api/patient/appointments`

Retrieve patient appointments.

**Response (200 OK):**
```json
[
  {
    "id": "appt-1",
    "type": "Primary care follow-up",
    "start": "2024-02-01T14:00:00Z",
    "location": "Clinic A",
    "provider": "Dr. Smith",
    "status": "scheduled",
    "notes": "Annual checkup"
  },
  {
    "id": "appt-2",
    "type": "Lab draw",
    "start": "2024-01-05T09:00:00Z",
    "location": "Lab B",
    "provider": null,
    "status": "completed",
    "notes": null
  }
]
```

#### GET `/api/patient/summaries`

Retrieve visit summaries.

**Response (200 OK):**
```json
[
  {
    "id": "sum-1",
    "title": "Annual physical",
    "date": "2023-11-20T10:00:00Z",
    "summary": "Reviewed preventive screenings and discussed lifestyle. Continued current medications. Plan for repeat labs in 3 months.",
    "followUps": [
      "Repeat lipid panel in 3 months",
      "Schedule annual flu shot"
    ]
  },
  {
    "id": "sum-2",
    "title": "Follow-up visit",
    "date": "2023-12-15T14:00:00Z",
    "summary": "Discussed blood pressure readings at home and adjusted diet plan. No medication changes at this time.",
    "followUps": null
  }
]
```

## Authentication

### Token Management

The frontend stores JWT tokens **in memory only** (HIPAA compliant - no localStorage).

### Token Flow

1. **Login:**
   - User submits email and access code
   - Frontend calls `POST /auth/patient/login`
   - Backend returns JWT token
   - Frontend stores token in memory

2. **Authenticated Requests:**
   - Frontend includes token in `Authorization` header
   - Backend validates token
   - Backend returns data or 401 if invalid

3. **Token Expiration:**
   - Backend returns `401 Unauthorized`
   - Frontend clears token from memory
   - Frontend redirects to login page

### Implementing Authentication in Your Backend

Example middleware (Node.js/Express):

```javascript
const jwt = require('jsonwebtoken');

function authenticatePatient(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.patientId = decoded.patientId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Use in routes
app.get('/api/patient/labs', authenticatePatient, async (req, res) => {
  const labs = await getPatientLabs(req.patientId);
  res.json(labs);
});
```

## Request/Response Formats

### Date Formats

All dates use ISO 8601 format:
- Format: `YYYY-MM-DDTHH:mm:ssZ`
- Example: `2024-01-15T10:00:00Z`
- Timezone: UTC

### Pagination (Future)

For large datasets, consider implementing pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Filtering (Future)

Consider adding query parameters for filtering:

```
GET /api/patient/labs?startDate=2024-01-01&endDate=2024-01-31
GET /api/patient/medications?status=active
GET /api/patient/appointments?status=scheduled
```

## Error Handling

### Error Response Format

All errors should follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### HTTP Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `502 Bad Gateway`: Backend unavailable
- `503 Service Unavailable`: Service temporarily unavailable

### Frontend Error Handling

The frontend automatically handles:
- Network errors (timeout, connection failure)
- HTTP errors (401, 403, 500, etc.)
- Token expiration
- Invalid responses

Error messages are sanitized to prevent PHI exposure.

## WebSocket Integration

### Connection

The frontend can connect to WebSocket for real-time updates:

```typescript
const wsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:3001';
const socket = io(wsUrl, {
  auth: {
    token: authToken
  }
});
```

### Events

#### Client → Server

**`authenticate`**
```json
{
  "token": "jwt-token"
}
```

#### Server → Client

**`lab_result:new`**
```json
{
  "id": "lab-123",
  "testName": "Hemoglobin A1c",
  "date": "2024-01-20T10:00:00Z",
  "value": "5.7",
  "unit": "%",
  "referenceRange": "4.0–5.6",
  "flag": null
}
```

**`appointment:updated`**
```json
{
  "id": "appt-123",
  "status": "cancelled"
}
```

**`error`**
```json
{
  "message": "Authentication failed",
  "code": "AUTH_ERROR"
}
```

### WebSocket Implementation Example

Backend (Node.js with Socket.IO):

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.patientId = decoded.patientId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`Patient ${socket.patientId} connected`);
  
  // Send new lab result
  socket.on('lab_result:new', (labResult) => {
    socket.emit('lab_result:new', labResult);
  });
  
  socket.on('disconnect', () => {
    console.log(`Patient ${socket.patientId} disconnected`);
  });
});
```

## Testing Integration

### Local Testing

1. **Start backend API:**
   ```bash
   cd ../ai-med-backend
   npm run dev
   ```

2. **Configure frontend:**
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   NEXT_PUBLIC_WS_BASE_URL=ws://localhost:3001
   NEXT_PUBLIC_DEMO_MODE=false
   ```

3. **Test endpoints:**
   ```bash
   # Test login
   curl -X POST http://localhost:3001/auth/patient/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","accessCode":"1234"}'
   
   # Test labs (with token)
   curl http://localhost:3001/api/patient/labs \
     -H "Authorization: Bearer <token>"
   ```

### Integration Testing

Use the frontend's test suite:

```bash
# Run integration tests
npm test

# Test API client
npm test api-client.test.ts
```

### Postman Collection

Create a Postman collection for API testing:

```json
{
  "info": {
    "name": "AI Med Patient Portal API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/patient/login",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"patient@example.com\",\n  \"accessCode\": \"12345678\"\n}"
        }
      }
    }
  ]
}
```

## Troubleshooting

### Common Issues

**Issue: CORS Errors**

**Solution:** Configure CORS on backend:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Issue: 401 Unauthorized**

**Solutions:**
- Verify token is being sent in `Authorization` header
- Check token expiration
- Verify JWT secret matches
- Check token format: `Bearer <token>`

**Issue: Network Timeout**

**Solutions:**
- Increase timeout in frontend (default: 30 seconds)
- Check backend response times
- Verify network connectivity
- Check firewall rules

**Issue: WebSocket Connection Fails**

**Solutions:**
- Verify WebSocket URL uses `ws://` or `wss://`
- Check CORS settings for WebSocket
- Verify authentication token
- Check firewall/proxy settings

### Debugging

Enable debug logging:

```typescript
// In lib/api-client.ts
if (process.env.NODE_ENV === 'development') {
  console.log('API Request:', { endpoint, options });
}
```

Check browser Network tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Inspect requests and responses

## Security Considerations

### HIPAA Compliance

- ✅ No PHI in URLs or query parameters
- ✅ All API calls over HTTPS (production)
- ✅ Tokens stored in memory only
- ✅ Error messages sanitized (no PHI)
- ✅ CORS properly configured
- ✅ Rate limiting (recommended)

### Best Practices

1. **Use HTTPS in production:**
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.aimed.example.com
   ```

2. **Validate all inputs:**
   - Email format
   - Access code format
   - Date ranges
   - Query parameters

3. **Implement rate limiting:**
   - Prevent brute force attacks
   - Limit API calls per patient
   - Use tokens or IP-based limiting

4. **Monitor API usage:**
   - Track failed authentication attempts
   - Monitor API response times
   - Alert on unusual patterns

## API Versioning

For future API changes, consider versioning:

```
/api/v1/patient/labs
/api/v2/patient/labs
```

Update frontend to use versioned endpoints:

```typescript
const API_VERSION = 'v1';
const endpoint = `/api/${API_VERSION}/patient/labs`;
```

## Support

For API integration issues:
1. Check this guide
2. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Check backend API documentation
4. Open an issue in the repository

---

**Last Updated:** January 2026
