# AI Med Frontend - Patient Portal (Read-only)

A Next.js 14 frontend application for the AI Med platform, providing patients a **read-only portal** for viewing labs, medications, appointments, and visit summaries.

## 🎯 Project Purpose

The Patient Portal enables patients to:
- View lab results
- View medications
- View appointments
- View visit summaries

No clinical data is editable from this application.

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks

## 📁 Folder Structure

```
ai-med-frontend-patient/
├── app/                    # Next.js App Router
│   ├── portal/            # Patient portal pages and layout (read-only)
│   │   ├── layout.tsx     # Portal layout with navigation
│   │   ├── page.tsx       # Overview page
│   │   ├── labs/          # Labs
│   │   ├── medications/   # Medications
│   │   ├── appointments/  # Appointments
│   │   └── summaries/     # Summaries
│   ├── login/             # Authentication
│   │   └── page.tsx       # Patient login page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to login)
├── lib/                   # Core libraries
│   └── api-client.ts      # REST API client + demo data
├── shared/                # Shared code
│   ├── hooks/             # Custom React hooks
│   │   ├── usePatientAuth.ts    # Patient auth hook
│   │   └── useAuth.ts           # Backwards-compatible alias
│   └── ui/                # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── spinner.tsx
├── API_CONTRACTS.md       # API and WebSocket schemas
├── HIPAA_COMPLIANCE.md    # HIPAA compliance documentation
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🚀 Local Setup

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (optional; demo mode works without backend)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AI-Empower-360/ai-med-frontend-patient.git
   cd ai-med-frontend-patient
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   NEXT_PUBLIC_DEMO_MODE=true
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for REST API | Yes | `http://localhost:3001` |
| `NEXT_PUBLIC_WS_BASE_URL` | Base URL for WebSocket (ws:// or wss://) | No | Uses `NEXT_PUBLIC_API_BASE_URL` |

### Production Configuration

For production, set:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.aimed.example.com
NEXT_PUBLIC_WS_BASE_URL=wss://api.aimed.example.com
```

## 📡 API Integration

### Backend Requirements

The frontend expects the following backend endpoints (read-only):

- **Authentication:** `POST /auth/patient/login`
- **Labs:** `GET /api/patient/labs`
- **Medications:** `GET /api/patient/medications`
- **Appointments:** `GET /api/patient/appointments`
- **Summaries:** `GET /api/patient/summaries`

See `API_CONTRACTS.md` for detailed API schemas and WebSocket event formats.

## 🔐 HIPAA Compliance

This application is designed with HIPAA compliance in mind:

- ✅ No PHI stored in browser storage (localStorage, sessionStorage, cookies)
- ✅ JWT tokens stored in memory only
- ✅ Secure WebSocket connections (WSS in production)
- ✅ Automatic data cleanup on logout
- ✅ No PHI in error messages or console logs

See `HIPAA_COMPLIANCE.md` for detailed compliance documentation.

## 🎨 Features

### Authentication
- Patient login with email + access code
- JWT token-based authentication
- Automatic session management
- Secure logout with data cleanup

### Read-only portal
- Labs
- Medications
- Appointments
- Visit summaries

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- **Components:** Reusable UI components in `components/` and `shared/ui/`
- **Hooks:** Custom React hooks in `shared/hooks/`
- **API Client:** Centralized API communication in `lib/api-client.ts`
- **WebSocket:** Real-time communication in `lib/websocket.ts`

## 🐛 Error Handling

The application includes comprehensive error handling:

- **API Errors:** Centralized error handling with user-friendly messages
- **WebSocket Disconnects:** Automatic reconnection with exponential backoff
- **Microphone Denial:** Graceful permission request handling
- **Session Expiration:** Automatic redirect to login
- **Network Timeouts:** User-friendly error messages

## 🔄 State Management

State is managed using React hooks:

- **Authentication:** `useAuth` hook
- **WebSocket:** `useWebSocket` hook
- **Audio Recording:** `useAudioRecorder` hook
- **Component State:** React `useState` and `useEffect`

## 📱 Responsive Design

The dashboard is designed desktop-first with responsive breakpoints:

- **Desktop:** Full grid layout with all panels visible
- **Tablet:** Adjusted grid columns
- **Mobile:** Stacked layout (future enhancement)

## 🚧 Future Enhancements

- [ ] Mobile app support
- [ ] Offline mode with service workers
- [ ] PDF export for lab results and summaries
- [ ] Email notifications for new lab results
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1 AA)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure HIPAA compliance
4. Test thoroughly
5. Submit a pull request

## 📄 License

See `LICENSE` file for details.

## 🔗 Related Repositories

- **Backend:** [ai-med-backend](https://github.com/AI-Empower-360/ai-med-backend)
- **Infrastructure:** [ai-med-infrastructure](https://github.com/AI-Empower-360/ai-med-infrastructure)

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for healthcare professionals**
