# Setup Guide - AI Med Patient Portal

Complete setup guide for the AI Med Patient Portal frontend application.

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/AI-Empower-360/ai-med-frontend-patient.git
   cd ai-med-frontend-patient
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   npm run setup
   ```
   This will create `.env.local` from `.env.example`. Then edit `.env.local` with your configuration.

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3001` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_BASE_URL` | WebSocket base URL | Uses `NEXT_PUBLIC_API_BASE_URL` |
| `NEXT_PUBLIC_DEMO_MODE` | Enable demo mode (uses mock data) | `true` |
| `NODE_ENV` | Environment (development/staging/production) | `development` |

### Configuration Examples

#### Development (with local backend)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_DEMO_MODE=false
NODE_ENV=development
```

#### Development (demo mode - no backend required)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_DEMO_MODE=true
NODE_ENV=development
```

#### Production
```env
NEXT_PUBLIC_API_BASE_URL=https://api.aimed.example.com
NEXT_PUBLIC_WS_BASE_URL=wss://api.aimed.example.com
NEXT_PUBLIC_DEMO_MODE=false
NODE_ENV=production
```

## Development Workflow

### Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build for production
- **`npm run start`** - Start production server (requires build first)
- **`npm run lint`** - Run ESLint
- **`npm run lint:fix`** - Run ESLint and auto-fix issues
- **`npm run type-check`** - Run TypeScript type checking
- **`npm run setup`** - Initialize environment configuration
- **`npm run validate-env`** - Validate environment variables

### Development Workflow Steps

1. **Start backend API** (if not using demo mode):
   ```bash
   # In the backend repository
   npm run dev
   ```

2. **Start frontend**:
   ```bash
   npm run dev
   ```

3. **Validate environment** (optional):
   ```bash
   npm run validate-env
   ```

4. **Check for type errors**:
   ```bash
   npm run type-check
   ```

5. **Lint code**:
   ```bash
   npm run lint
   ```

## Backend API Connection

### Connecting to Backend

1. **Ensure backend is running**:
   - Backend should be accessible at the URL specified in `NEXT_PUBLIC_API_BASE_URL`
   - Default: `http://localhost:3001`

2. **Verify CORS configuration**:
   - Backend must allow requests from `http://localhost:3000` (development)
   - Backend must allow requests from your production domain (production)

3. **Test connection**:
   - Open browser console
   - Look for connection status messages
   - Check for any CORS errors

### Backend API Endpoints Required

The frontend expects these endpoints:

- `POST /auth/patient/login` - Patient authentication
- `GET /api/patient/labs` - Get lab results
- `GET /api/patient/medications` - Get medications
- `GET /api/patient/appointments` - Get appointments
- `GET /api/patient/summaries` - Get visit summaries

See `API_CONTRACTS.md` for detailed API specifications.

## Troubleshooting

### Environment Variables Not Loading

- Ensure `.env.local` exists in the project root
- Restart the development server after changing `.env.local`
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

### Backend Connection Issues

- Verify backend is running and accessible
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify CORS is configured on backend
- Check browser console for error messages
- Enable demo mode to test without backend: `NEXT_PUBLIC_DEMO_MODE=true`

### Build Errors

- Run `npm run type-check` to find TypeScript errors
- Run `npm run lint` to find linting errors
- Ensure all dependencies are installed: `npm install`

### Port Already in Use

- Next.js will automatically use the next available port
- Or specify a custom port: `npm run dev -- -p 3001`

## Production Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables in Production

- Set environment variables in your hosting platform
- For Vercel: Add in Project Settings → Environment Variables
- For other platforms: Follow their documentation for environment variable configuration

### Security Checklist

- ✅ Set `NEXT_PUBLIC_DEMO_MODE=false` in production
- ✅ Use HTTPS URLs for `NEXT_PUBLIC_API_BASE_URL`
- ✅ Use WSS URLs for `NEXT_PUBLIC_WS_BASE_URL`
- ✅ Ensure backend has proper CORS configuration
- ✅ Verify HIPAA compliance measures are in place

## Additional Resources

- [API Contracts](./API_CONTRACTS.md) - Detailed API specifications
- [HIPAA Compliance](./HIPAA_COMPLIANCE.md) - Compliance documentation
- [Project Structure](./PROJECT_STRUCTURE.md) - Code organization
- [README](./README.md) - General project information

## Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify environment configuration
3. Review the troubleshooting section above
4. Check backend API logs
5. Open an issue in the repository

---

**Happy coding! 🚀**
