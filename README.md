# Verified Wealth - Frontend (React Native)

A status-driven personal finance platform built with React Native and Expo that enables users to securely connect financial accounts, view verified net worth, benchmark against peers, and engage in an anonymous financial community.

## Features

### Core Features (MVP)
- ✅ **Authentication** - Email/password registration and login
- ✅ **Account Integration** - Plaid SDK integration for secure account linking
- ✅ **Net Worth Dashboard** - Real-time aggregated financial overview
- ✅ **Peer Benchmarking** - Percentile ranking vs similar demographics
- ✅ **Anonymous Profiles** - Auto-generated usernames with verified badges
- ✅ **Community Feed** - Reddit-style discussions with verified users
- ✅ **Subscription Management** - Three-tier freemium model (Free/Premium/Pro)

## Tech Stack

- **Framework:** React Native with Expo (~53.0.20)
- **Language:** TypeScript
- **Navigation:** Expo Router
- **State Management:** Zustand
- **API Client:** Axios
- **Charts:** React Native Chart Kit
- **Financial Integration:** Plaid Link SDK
- **Storage:** AsyncStorage

## Project Structure

```
wealth-tracker-fe/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── dashboard.tsx         # Net worth dashboard
│   │   ├── ranking.tsx           # Peer benchmarking
│   │   ├── community.tsx         # Community feed
│   │   └── profile.tsx           # User profile
│   ├── _layout.tsx               # Root layout with auth check
│   ├── index.tsx                 # Entry point (auth redirect)
│   ├── login.tsx                 # Login screen
│   ├── register.tsx              # Registration screen
│   ├── link-account.tsx          # Plaid account linking
│   └── subscription.tsx          # Subscription management
├── src/
│   ├── components/               # Reusable UI components
│   ├── config/                   # App configuration
│   ├── screens/                  # Screen components
│   ├── services/                 # API service layer
│   ├── store/                    # Zustand state management
│   └── types/                    # TypeScript type definitions
└── package.json
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- iOS: macOS with Xcode
- Android: Android Studio with emulator
- Expo CLI: `npm install -g expo-cli`

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on platform**
   - iOS: Press `i` or run `npm run ios`
   - Android: Press `a` or run `npm run android`
   - Web: Press `w` or run `npm run web`

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
API_BASE_URL=http://localhost:4000/api
PLAID_LINK_TOKEN_URL=http://localhost:4000/api/plaid/create-link-token
```

**Note:** For Android emulator, use `http://10.0.2.2:4000/api` instead of `localhost`.

## Backend Integration

This frontend expects the backend API documented in `/wealth-tracker-be/postman/wealth-tracker-api.postman_collection.json`.

### Key Endpoints
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Accounts: `/api/accounts/link`, `/api/accounts/:userId`
- Net Worth: `/api/net-worth/:userId`, `/api/net-worth/:userId/cache`
- Ranking: `/api/ranking/assess`, `/api/ranking/profile`
- Community: `/api/community`, `/api/community/:postId`
- Subscription: `/api/subscription/:userId`, `/api/subscription/upgrade`

## Key Libraries

| Library | Purpose |
|---------|---------|
| `expo-router` | File-based routing |
| `zustand` | State management |
| `axios` | HTTP client |
| `react-native-plaid-link-sdk` | Plaid integration |
| `react-native-chart-kit` | Charts and visualizations |
| `@react-native-async-storage/async-storage` | Persistent storage |

## App Flow

1. **Launch** → Check auth → Redirect to login or dashboard
2. **Register** → Enter details → Create account → Dashboard
3. **Login** → Enter credentials → Authenticate → Dashboard
4. **Dashboard** → View net worth → Link accounts → Refresh data
5. **Ranking** → View percentile → Adjust filters → Compare
6. **Community** → Browse posts → Create/engage
7. **Profile** → Manage subscription → Logout

## Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 3 accounts, weekly refresh, basic benchmarks |
| **Premium** | $15/mo | Unlimited accounts, daily refresh, full community |
| **Pro** | $40/mo | + On-demand refresh, AI insights, analytics |

## Troubleshooting

**"Network request failed"**
- Check backend is running
- Verify API_BASE_URL in .env
- For Android emulator, use `10.0.2.2` instead of `localhost`

**"Unable to resolve module"**
```bash
npm install
npx expo start -c  # Clear cache
```

## License

Proprietary - All rights reserved

---

**Version:** 1.0.0 (MVP) | **Last Updated:** October 2025
