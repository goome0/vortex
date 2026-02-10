# Vortex/Heeho Server - Frontend

A modern, secure, and performant web application for the Vortex/Heeho Server post-apocalyptic MMORPG.

## 🚀 Features

### Core Features
- **User Authentication** - Complete login/register flow with JWT tokens
- **Dashboard** - User dashboard with character info and activity
- **Admin Panel (GM)** - Full administrative tools for game masters
- **Modern Design** - Post-apocalyptic themed UI with animations

### Pages
- **Home** - Epic landing page with hero section, features, and news
- **Login/Register** - Authentication pages with validation
- **Dashboard** - User profile and game statistics
- **News** - Latest updates and announcements
- **Rankings** - Level, PvP, and Guild leaderboards
- **Download** - Game client download with system requirements
- **Admin Panel** - GM tools for managing the server

### Admin Panel Features
- Account management (search, view, edit, ban)
- Online players monitoring
- Promo code management
- Send items to players
- World broadcast messages

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Server State**: [TanStack Query](https://tanstack.com/query)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin panel pages
│   │   ├── accounts/       # Account management
│   │   ├── items/          # Send items to players
│   │   ├── online/         # Online players
│   │   ├── promos/         # Promo code management
│   │   ├── world/          # World broadcast
│   │   └── layout.tsx      # Admin layout with sidebar
│   ├── dashboard/          # User dashboard
│   ├── download/           # Game download page
│   ├── login/              # Login page
│   ├── news/               # News page
│   ├── rankings/           # Leaderboards
│   ├── register/           # Registration page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── providers.tsx       # App providers
├── components/
│   ├── layout/             # Layout components
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── index.ts
│   └── ui/                 # UI components
│       ├── Alert.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       └── index.ts
├── lib/
│   ├── api.ts              # Axios instance and API functions
│   ├── constants.ts        # App constants and routes
│   └── utils.ts            # Utility functions
├── stores/
│   ├── auth.store.ts       # Authentication store
│   └── index.ts
└── middleware.ts           # Route protection middleware
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd vortex/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Vortex/Heeho Server"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors
- **Primary**: Red/Orange gradient for action elements
- **Background**: Dark gradients (slate/gray tones)
- **Accents**: Yellow (currency), Green (success), Blue (info)

### Typography
- **Display**: Orbitron (headers, titles)
- **Body**: Outfit (general text)

### Effects
- Glassmorphism cards
- Glow effects on interactive elements
- Smooth animations with Framer Motion
- Post-apocalyptic noise overlay

## 🔐 Authentication

Authentication is handled by Zustand store with persistence. The flow:

1. User logs in via `/login`
2. JWT tokens are stored in cookies and localStorage
3. Axios interceptors automatically add token to requests
4. Token refresh is handled automatically on 401 errors
5. User state is persisted across page reloads

## 🔒 Route Protection

Routes are protected at two levels:

1. **Middleware** (`src/middleware.ts`) - Server-side route protection
2. **Client-side** - Individual pages check auth state

Protected routes:
- `/dashboard` - Requires authentication
- `/admin/*` - Requires admin privileges

## 📦 API Integration

The API client is configured in `src/lib/api.ts` with:

- Base URL from environment variables
- Automatic token injection
- Token refresh on 401 errors
- Typed API functions for all endpoints

### Available API Functions

```typescript
// Auth
api.auth.signIn(credentials)
api.auth.signUp(userData)
api.auth.getProfile()
api.auth.refreshToken(token)

// WebGame
api.webGame.getCoins()
api.webGame.startGame()
api.webGame.updateGame(data)

// Admin
api.admin.getAccounts(params)
api.admin.getAccount(username)
api.admin.updateAccount(data)
api.admin.deleteAccount(id)
api.admin.kickPlayer(characterId)
api.admin.messageWorld(message)
api.admin.getOnline()
api.admin.postItems(data)
api.admin.getPromos()
api.admin.createPromo(data)
api.admin.deletePromo(id)
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Submit a pull request

## 📄 License

Private - All rights reserved.
