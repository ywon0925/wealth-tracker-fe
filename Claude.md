# Verified Wealth - Frontend Implementation

## Repository Scope
**This repository contains ONLY the frontend implementation.** All work should focus on React Native/Expo UI components, screens, navigation, state management, and client-side logic.

## Project Overview
Verified Wealth is a status-driven personal finance platform that enables users to connect their financial accounts securely, view their verified net worth, benchmark themselves against peers, and engage anonymously in a financial community. This is the React Native (Expo) frontend application.

**Key Differentiator:** Unlike budgeting apps (Mint, YNAB), this emphasizes social status and authenticity through verified financial data via Plaid.

**Backend Note:** Backend APIs, database, authentication services, and Plaid/Stripe integrations are handled in a separate repository. This repo focuses solely on consuming those APIs and presenting data to users.

## Target Users
- **Primary:** Status-driven young professionals (25-40 years old)
- **Income Range:** $80k-$250k/year
- **Occupations:** Tech, Finance, Consulting, Engineering
- **Traits:** Competitive, data-driven, privacy-conscious, early fintech adopters

## Tech Stack

### Frontend (This Repository)
- **Framework:** React Native with Expo
- **Platforms:** iOS, Android, Web (cross-platform)
- **Language:** TypeScript

### Backend & Infrastructure
- **API:** Node.js with TypeScript
- **Database:** PostgreSQL (AWS RDS)
- **Auth:** Firebase Auth / AWS Cognito (anonymous + optional email login)
- **Financial Data:** Plaid API (account linking & updates)
- **Payments:** Stripe (subscription management)
- **Hosting:** AWS / GCP
- **Analytics:** Mixpanel / Amplitude

## Core Features (MVP - Frontend Implementation Focus)

**Note:** Feature descriptions below outline the UI/UX requirements. Backend API endpoints and data processing are handled separately.

### 1. Account Integration (Plaid) - UI Components
- Implement Plaid Link SDK for React Native (client-side integration)
- **UI Requirements:**
  - "Connect Account" button/screen
  - Account connection flow UI
  - Display "Verified" badge upon successful connection
  - Show connected accounts list
  - Display connection status and last sync time
  - Account limit indicator (3 for free, unlimited for paid)
  - Refresh/sync UI controls

### 2. Net Worth Dashboard - UI Components
- **UI Requirements:**
  - Main dashboard screen with clean, visual layout
  - Display total net worth (large, prominent)
  - Assets vs liabilities breakdown
  - Category cards (cash, investments, crypto, loans)
  - Interactive 6-month trend line chart
  - Category pie/donut chart
  - Pull-to-refresh functionality
  - Loading states and skeletons
  - Error handling UI
  - Must render within 2 seconds (optimize chart libraries)

### 3. Peer Benchmarking / Ranking System - UI Components
- **UI Requirements:**
  - Ranking/benchmarking screen
  - Percentile display with visual indicator (e.g., progress bar, percentile chart)
  - Filter controls (dropdowns/pickers):
    - Age Range selector (25-29, 30-34, etc.)
    - Location selector (Country → State → City)
    - Income Bracket selector (optional)
  - Dynamic text: "You are in the top X% among peers"
  - Comparison visualizations (bar charts, distribution curves)
  - Anonymous peer data visualization
  - Real-time filter updates

### 4. Anonymous Verified Profiles - UI Components
- **UI Requirements:**
  - Profile screen/modal
  - Display auto-generated username (e.g., "User#A7F9")
  - Show verified badge component
  - Display demographic info: age range, city, percentile rank
  - Bio text input/display (optional)
  - Profile avatar/icon component
  - Edit profile UI (for own profile)
  - View profile UI (for other users)

### 5. Community Feed (Anonymous Discussions) - UI Components
- **UI Requirements:**
  - Feed screen with list/scroll view
  - Post cards showing: title, body preview, author alias, verified badge, votes, timestamp
  - Sort controls: Hot, New, Top
  - Post detail screen with full content
  - Comment thread view (1 level deep)
  - Upvote/downvote buttons with vote counts
  - Create post screen/modal (verified users only)
  - Comment input (verified users only)
  - Read-only mode for free users
  - Topic/tag filters
  - Infinite scroll/pagination

### 6. Subscription System - UI Components
- **UI Requirements:**
  - Pricing/plans screen showing all tiers:
    - Free: Up to 3 accounts, weekly refresh, limited benchmarks
    - Premium ($15/mo): Unlimited accounts, daily refresh, deeper filters
    - Pro ($40/mo): AI insights, extended analytics, private channels
  - Feature comparison table
  - Subscribe/upgrade buttons (Stripe integration)
  - Subscription management screen
  - Current plan indicator
  - Cancel/downgrade UI
  - Payment method display
  - Receipt/billing history

## Success Metrics (MVP Targets)
- Month 3 Active Users: 2,500+
- Free → Paid Conversion: ≥ 5%
- WAU/MAU: ≥ 40%
- Avg. Session Time: ≥ 5 minutes
- 90-day Retention: ≥ 50%

## Security Requirements
- End-to-end encryption (HTTPS/TLS)
- Encrypted at rest (PostgreSQL AES-256)
- Plaid Link tokenization (no credential storage)
- Anonymous data handling (no exposure of account numbers or names)

## Future Features (Phase 2+)
- AI Benchmarking Insights (GPT-based personalized reports)
- Custom Peer Groups
- Gamified Achievements
- Referral & Sharing System

## Current Project Status
- Repository initialized with Expo React Native setup
- Many boilerplate files deleted (tabs, exploration screens, default components)
- Core app structure in progress
- Main entry point: `app/index.tsx`
- Custom layout: `app/_layout.tsx`

## Frontend Development Guidelines
1. **TypeScript Only:** Use TypeScript for all new code
2. **React Native/Expo Best Practices:** Follow framework conventions
3. **Performance Critical:** Dashboard load < 2 seconds, optimize renders
4. **Cross-Platform:** Design for iOS, Android, and Web simultaneously
5. **UI/UX Focus:** Clean, intuitive interfaces for status-driven users
6. **Privacy in UI:** Never display personally identifiable information
7. **API Integration:** Consume backend APIs (assume they exist, mock if needed)
8. **State Management:** Use appropriate state solution (Context, Redux, Zustand, etc.)
9. **Component Structure:** Reusable, modular components
10. **Frontend-Only Scope:** Do not implement backend logic, APIs, or database operations

## Key Considerations
- **Privacy First:** All data displays must be anonymous
- **Verification Badge:** Core trust element - only show when Plaid connected
- **Performance:** Fast load times critical for user retention
- **Freemium Model:** Design with feature gating in mind
- **Status-Driven:** UI should emphasize rankings, percentiles, and comparisons
