# Product Requirements Document (PRD)

**Product Name:** Verified Wealth (Working Title)  
**Version:** 1.0 — MVP Scope  
**Prepared For:** Product, Engineering, and Design Teams  
**Author:** [Founder / Product Lead]  
**Date:** October 2025

---

## 1. Product Overview

### Summary
Verified Wealth is a status-driven personal finance platform that enables users to connect their financial accounts securely, view their verified net worth, benchmark themselves against peers, and engage anonymously in a financial community.

Unlike budgeting apps (e.g., Mint, YNAB, Empower), Verified Wealth emphasizes social status and authenticity — users get real, data-backed comparisons and community credibility through verified financial data (via Plaid).

**Goal:**  
To become the default platform where users answer:  
*"How am I really doing financially compared to people like me?"*

---

## 2. Objectives & Success Metrics

### Primary Objectives
1. Deliver a seamless, verified financial overview for users in the US and Canada.  
2. Build a trust-based, anonymous social layer around verified financial data.  
3. Drive strong engagement through status-oriented features (ranking, benchmarking).  
4. Convert engaged users into paying subscribers through feature-based tiers.

### Success Metrics

| Metric | Target |
|--------|--------|
| MVP Active Users (Month 3) | 2,500+ |
| Free → Paid Conversion Rate | ≥ 5% |
| WAU/MAU | ≥ 40% |
| Avg. Session Time | ≥ 5 minutes |
| User Retention (90 days) | ≥ 50% |
| Blended ARPU | $4–5/month |
| Avg. Plaid API Cost/User | ≤ $1.20/month |

---

## 3. Target Users

### Primary Segment
**Status-Driven Young Professionals (Ages 25–40)**  
- Occupations: Tech, Finance, Consulting, Engineering  
- Income: $80k–$250k/year  
- Motivation: Financial self-knowledge, social comparison, self-improvement  
- Traits: Competitive, data-driven, privacy-conscious, early fintech adopters  

### Secondary Segment
**Crypto-savvy or FIRE-minded users**  
- Interested in long-term net worth growth and peer benchmarking  
- Value privacy and verified, non-fake financial data  

---

## 4. Core Product Features

### 4.1 Account Integration (Plaid)

**Goal:** Enable users to securely connect bank, credit, and investment accounts.

**User Stories:**
- As a user, I want to connect my bank and investment accounts via a trusted aggregator so my net worth is automatically calculated.  
- As a user, I want my account linking to be secure and verified without exposing credentials.  
- As a user, I want my data to refresh automatically, based on my subscription tier.

**Requirements:**
- Use Plaid Link SDK (React Native) for account onboarding  
- Use Plaid Transactions + Balance APIs to fetch data  
- Data stored securely in PostgreSQL (encrypted at rest)  
- Refresh frequency:  
  - Free: weekly  
  - Premium/Pro: daily (or on-demand)  
- Display “Verified” badge upon successful Plaid connection

**Acceptance Criteria:**
- Users can connect at least 2 accounts on Free tier and unlimited on paid tiers  
- Account balances update correctly and reflect Plaid data within 10 minutes of refresh  
- Verified badge appears only when at least one valid Plaid account is connected  

---

### 4.2 Net Worth Dashboard

**Goal:** Give users an intuitive, visually clean view of their financial position.

**User Stories:**
- As a user, I want to see my total assets, liabilities, and net worth in one place.  
- As a user, I want a breakdown by category (cash, investments, crypto, loans).  
- As a user, I want to see how my net worth changes over time.  

**Requirements:**
- Aggregate all linked account balances  
- Classify accounts into categories automatically (Plaid metadata + rules)  
- Display:  
  - Current Net Worth (total assets – liabilities)  
  - Trendline (last 6 months minimum)  
  - Category Pie Chart  
  - Optional: “AI Insights” placeholder (for future expansion)

**Acceptance Criteria:**
- Dashboard loads within 2 seconds after login  
- All financial data displayed is accurate to within $1 of Plaid source  
- No identifiable bank info (account numbers, names) visible  

---

### 4.3 Peer Benchmarking / Ranking System

**Goal:** Deliver the status-oriented core value — show users how they rank vs peers.

**User Stories:**
- As a user, I want to see where my net worth ranks among peers of similar age, location, and income.  
- As a user, I want the ranking to be anonymous and percentile-based.  
- As a user, I want to see how my rank changes over time.  

**Requirements:**
- Demographic filters:  
  - Age Range (e.g., 25–29, 30–34)  
  - Location (Country → State → City)  
  - Income Bracket (optional at onboarding)  
- Ranking Model:  
  - Compute user’s percentile for net worth, savings rate, or debt ratio  
  - Show textual output: “You are in the top 25% among peers.”  
  - Anonymized leaderboard view (optional in Phase 2)  
  - Use aggregated averages (never display raw data of individuals)

**Acceptance Criteria:**
- Rankings calculate correctly within 1 percentile of expected values  
- Filters dynamically adjust benchmarks (e.g., changing city updates instantly)  
- No personal or identifiable info shown  

---

### 4.4 Anonymous Verified Profiles

**Goal:** Allow users to express identity without revealing personal details.

**User Stories:**
- As a user, I want an automatically generated anonymous username.  
- As a user, I want others to see that my data is verified (but not who I am).  
- As a user, I want to share insights or ask questions under my verified identity.  

**Requirements:**
- Auto-generate username/avatar (e.g., “User#A7F9”)  
- Display:  
  - Verified badge  
  - Age range, city, percentile rank  
  - Optional short bio  
- Store minimal profile data (no real names, no emails required for free tier)

**Acceptance Criteria:**
- Every new user gets a unique anonymous identity  
- Verified status is correctly synced with Plaid data  

---

### 4.5 Community Feed (Anonymous Discussions)

**Goal:** Build a private, Reddit-style feed for verified users to discuss finances.

**User Stories:**
- As a user, I want to ask financial questions anonymously and get answers from verified peers.  
- As a user, I want to upvote/downvote useful posts.  
- As a user, I want to filter posts by topic (Investing, Debt, Savings).  

**Requirements:**
- Feed sorted by “Hot,” “New,” “Top”  
- Posts contain: title, body, author alias, verified tag, timestamp, votes  
- Comments support threading (1 level deep)  
- Moderation system:  
  - Auto-flag profanity/spam  
  - Admin dashboard for manual review  
  - Only verified users can post/comment (Free users can read)

**Acceptance Criteria:**
- Posts render in under 1.5s  
- Voting updates reflected in real time  
- Admins can remove flagged content from dashboard  

---

### 4.6 Subscription & Billing System

**Goal:** Monetize user base via tiered freemium model.

**User Stories:**
- As a user, I want to upgrade easily to premium for more features.  
- As a user, I want my billing handled securely with Stripe.  
- As a user, I want to see what’s included in each tier before paying.  

**Requirements:**
- Integrate Stripe Checkout for web and mobile  
- Handle subscription status in backend (active, canceled, expired)  
- Feature gating:  
  - Free: up to 3 accounts, weekly refresh, limited benchmarks  
  - Premium ($15): unlimited accounts, daily refresh, deeper filters, no ads  
  - Pro ($40): AI insights (once available), extended analytics, private channels  
- Users can manage/cancel subscriptions in-app  

**Acceptance Criteria:**
- Successful payment updates user tier instantly  
- Downgrades preserve data but restrict premium access  
- Billing complies with App Store/Google Play rules (for in-app payments)  

---

## 5. Future Features (Phase 2+)

1. **AI Benchmarking Insights**  
   - GPT-based personalized reports comparing user spending vs peers  
   - Conversational “Ask AI” advisor for financial Q&A  
2. **Custom Peer Groups**  
   - Create peer segments (e.g., “Tech workers in SF”)  
3. **Gamified Achievements**  
   - Badges for top percentile improvements or milestones  
4. **Referral & Sharing System**  
   - Users can share anonymized ranking snapshots  

---

## 6. Technical Architecture

| Layer | Tech | Description |
|-------|------|-------------|
| Frontend | React Native (Expo) | Cross-platform app (iOS, Android, Web) |
| Backend | Node.js (TypeScript) | API + business logic layer |
| Database | PostgreSQL (RDS) | Store user profiles, benchmarks, posts |
| Auth | Firebase Auth / Cognito | Anonymous + optional email login |
| Data Integration | Plaid API | Financial account linking & updates |
| Hosting | AWS / GCP | Managed, scalable infrastructure |
| Payments | Stripe | Subscription management |
| Analytics | Mixpanel / Amplitude | Track usage and conversions |

**Security:**
- End-to-end encryption (HTTPS/TLS)  
- Encrypted at rest (PostgreSQL AES-256)  
- Use Plaid Link tokenization (no credentials stored)  

---

## 8. Analytics & KPIs

**Core Events:**
- account_linked (Plaid success)  
- dashboard_viewed  
- ranking_viewed  
- post_created  
- subscription_upgraded  
- session_duration  
- user_retention_cohort  

**KPIs:**
- MAU/DAU ratios  
- Churn rate per tier  
- ARPU (revenue/user)  
- Conversion funnel (signup → link → engage → pay)  

---

## 9. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|---------|------------|
| High Plaid API cost per free user | High | Limit free tier refreshes; prioritize conversion to paid |
| Data privacy concerns | High | Emphasize anonymity and secure architecture |
| Low community quality | Medium | Use verified-only posting + moderation tools |
| Slow growth (network effect dependency) | Medium | Start with niche (tech/finance professionals) |
| Competitive retaliation | Medium | Build strong brand around verified anonymity early |

---

## 10. MVP Completion Criteria

- Users can link financial accounts via Plaid  
- Net worth is auto-calculated and displayed correctly  
- Anonymous profiles with verified badges exist  
- Peer ranking functions with real benchmark data  
- Community feed is live with moderation  
- Stripe payments operational  
- App stable on iOS, Android, and Web  

---

## 11. Product Vision Statement

*"Verified Wealth is the first social finance app built on trust and transparency — where real people, verified by real data, can finally compare and talk about money without fear or fakery."*
