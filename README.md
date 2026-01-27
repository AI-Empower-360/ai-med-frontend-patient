# AI Med Frontend - Patient Portal (Read-only)

A Next.js 14 frontend application for the AI Med platform, providing patients a **read-only portal** for viewing labs, medications, appointments, and visit summaries.

## 🎯 Project Purpose

The Patient Portal enables patients to:

* View lab results
* View medications
* View appointments
* View visit summaries

No clinical data is editable from this application.

## 🛠 Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** React Hooks
* **Testing:** Jest, React Testing Library, Playwright
* **PDF Export:** jsPDF

## 📁 Folder Structure

```
ai-med-frontend-patient/
├── app/                    # Next.js App Router
│   ├── portal/            # Patient portal pages and layout (read-only)
│   │   ├── layout.tsx     # Portal layout with navigation
│   │   ├── page.tsx       # Overview page
│   │   ├── labs/          # Labs page with PDF export
│   │   ├── medications/   # Medications page
│   │   ├── appointments/  # Appointments page
│   │   └── summaries/     # Summaries page with PDF export
│   ├── login/             # Authentication
│   │   └── page.tsx       # Patient login page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with error boundary
│   └── page.tsx           # Home page (redirects to login)
├── components/            # React components
│   ├── error-boundary.tsx # Error boundary component
│   └── env-validator.tsx # Environment validator
├── lib/                   # Core libraries
│   ├── api-client.ts      # REST API client + demo data
│   ├── env-validation.ts  # Environment variable validation
│   ├── backend-connection.ts # Backend connection testing
│   ├── error-handler.ts   # Centralized error handling
│   └── pdf-utils.ts       # PDF export utilities
├── shared/                # Shared code
│   ├── hooks/             # Custom React hooks
│   │   ├── usePatientAuth.ts    # Patient auth hook
│   │   └── useAuth.ts           # Backwards-compatible alias
│   └── ui/                # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── spinner.tsx
│       └── date-range-filter.tsx
├── e2e/                   # End-to-end tests (Playwright)
│   ├── login.spec.ts
│   ├── portal.spec.ts
│   └── labs.spec.ts
├── lib/__tests__/         # Unit tests
├── shared/__tests__/      # Integration tests
├── components/__tests__/   # Component tests
├── API_CONTRACTS.md       # API and WebSocket schemas
├── HIPAA_COMPLIANCE.md    # HIPAA compliance documentation
├── SETUP_GUIDE.md         # Setup and configuration guide
├── TESTING.md             # Testing guide
├── package.json
├── tsconfig.json
├── jest.config.js         # Jest configuration
├── playwright.config.ts    # Playwright configuration
└── README.md
```

## 🚀 Local Setup

### Prerequisites

* Node.js 18+ and npm/yarn/pnpm
* Backend API running (optional; demo mode works without backend)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AI-Empower-360/ai-med-frontend-patient.git
   cd ai-med-frontend-patient
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   npm run setup
   ```
   This creates `.env.local` from `.env.example`. Edit `.env.local` with your configuration.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

| Variable                     | Description                              | Required | Default                           |
| ---------------------------- | ---------------------------------------- | -------- | --------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`   | Base URL for REST API                    | Yes      | `http://localhost:3001`           |
| `NEXT_PUBLIC_WS_BASE_URL`    | Base URL for WebSocket (ws:// or wss://) | No       | Uses `NEXT_PUBLIC_API_BASE_URL`   |
| `NEXT_PUBLIC_DEMO_MODE`      | Enable demo mode (uses mock data)        | No       | `true`                            |

### Production Configuration

For production, set:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.aimed.example.com
NEXT_PUBLIC_WS_BASE_URL=wss://api.aimed.example.com
NEXT_PUBLIC_DEMO_MODE=false
```

## 📡 API Integration

### Backend Requirements

The frontend expects the following backend endpoints (read-only):

* **Authentication:** `POST /auth/patient/login`
* **Labs:** `GET /api/patient/labs`
* **Medications:** `GET /api/patient/medications`
* **Appointments:** `GET /api/patient/appointments`
* **Summaries:** `GET /api/patient/summaries`

See `API_CONTRACTS.md` for detailed API schemas and WebSocket event formats.

## 🔐 HIPAA Compliance

This application is designed with HIPAA compliance in mind:

* ✅ No PHI stored in browser storage (localStorage, sessionStorage, cookies)
* ✅ JWT tokens stored in memory only
* ✅ Secure WebSocket connections (WSS in production)
* ✅ Automatic data cleanup on logout
* ✅ No PHI in error messages or console logs
* ✅ Error message sanitization
* ✅ Centralized error handling

See `HIPAA_COMPLIANCE.md` for detailed compliance documentation.

## 🎨 Features

### Authentication

* Patient login with email + access code
* JWT token-based authentication
* Automatic session management
* Secure logout with data cleanup

### Read-only portal

* **Labs:** View lab results with search, date filtering, PDF export, and print
* **Medications:** View medications with active/inactive filtering and print
* **Appointments:** View appointments with status filtering, date range, and print
* **Summaries:** View visit summaries with search, date filtering, individual PDF export, and print

### Additional Features

* **PDF Export:** Export labs and summaries to PDF
* **Print Functionality:** Print-friendly layouts for all pages
* **Date Range Filters:** Filter data by date range
* **Search:** Full-text search across all data types
* **Mobile Responsive:** Optimized for mobile devices
* **Error Handling:** Comprehensive error handling with user-friendly messages

## 🧪 Testing

### Run Tests

```bash
# Unit and integration tests
npm test

# Tests in watch mode
npm run test:watch

# Tests with coverage
npm run test:coverage

# End-to-end tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Test Coverage

Current test coverage targets:
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

See `TESTING.md` for detailed testing documentation.

## 🧪 Development

### Available Scripts

* `npm run dev` - Start development server
* `npm run build` - Build for production
* `npm run start` - Start production server
* `npm run lint` - Run ESLint
* `npm run lint:fix` - Run ESLint and auto-fix issues
* `npm run type-check` - Run TypeScript type checking
* `npm run setup` - Initialize environment configuration
* `npm run validate-env` - Validate environment variables
* `npm test` - Run unit and integration tests
* `npm run test:watch` - Run tests in watch mode
* `npm run test:coverage` - Run tests with coverage
* `npm run test:e2e` - Run end-to-end tests

### Code Structure

* **Components:** Reusable UI components in `components/` and `shared/ui/`
* **Hooks:** Custom React hooks in `shared/hooks/`
* **API Client:** Centralized API communication in `lib/api-client.ts`
* **Error Handling:** Centralized error handling in `lib/error-handler.ts`
* **PDF Utilities:** PDF export functions in `lib/pdf-utils.ts`

## 🐛 Error Handling

The application includes comprehensive error handling:

* **API Errors:** Centralized error handling with user-friendly messages
* **Network Errors:** Graceful handling of network failures and timeouts
* **Error Boundary:** React error boundary for unhandled errors
* **PHI Protection:** Error messages sanitized to prevent PHI exposure
* **Retry Logic:** Automatic retry for retryable errors
* **User Feedback:** Clear, actionable error messages

## 🔄 State Management

State is managed using React hooks:

* **Authentication:** `usePatientAuth` hook
* **Component State:** React `useState` and `useEffect`
* **No External State:** No Redux or other state management libraries

## 📱 Responsive Design

The dashboard is designed desktop-first with responsive breakpoints:

* **Desktop:** Full grid layout with all panels visible
* **Tablet:** Adjusted grid columns
* **Mobile:** Stacked layout with touch-optimized interactions

## 🚧 Future Enhancements

- [ ] Mobile app support
- [ ] Offline mode with service workers
- [ ] Email notifications for new lab results
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Advanced filtering options
- [ ] Data visualization for lab trends

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure HIPAA compliance
4. Write tests for new features
5. Test thoroughly
6. Submit a pull request

## 📄 License

See `LICENSE` file for details.

## 🔗 Related Repositories

* **Backend:** [ai-med-backend](https://github.com/AI-Empower-360/ai-med-backend)
* **Infrastructure:** [ai-med-infrastructure](https://github.com/AI-Empower-360/ai-med-infrastructure)

## 📚 Documentation

Comprehensive documentation is available:

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup and configuration guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for all platforms
- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - Backend API integration guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Troubleshooting common issues
- **[TESTING.md](./TESTING.md)** - Testing guide and best practices
- **[HIPAA_COMPLIANCE.md](./HIPAA_COMPLIANCE.md)** - HIPAA compliance documentation
- **[API_CONTRACTS.md](./API_CONTRACTS.md)** - API contracts and WebSocket schemas

### Quick Links

- 🚀 [Getting Started](./SETUP_GUIDE.md#quick-start)
- 🔧 [Environment Setup](./SETUP_GUIDE.md#environment-variables)
- 📡 [API Integration](./API_INTEGRATION.md)
- 🐛 [Troubleshooting](./TROUBLESHOOTING.md)
- 🚢 [Deployment](./DEPLOYMENT.md)

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first
2. Review relevant documentation
3. Open an issue in the repository

---

**Built with ❤️ for healthcare professionals**
