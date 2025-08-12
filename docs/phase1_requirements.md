# Phase 1: Planning and Research Requirements

## Feature Details
- **Asset Management**:
  - Hierarchy: Organization, Location, Asset, Sub-Asset (e.g., Tommy's Trucking, Pasadena, TX, semitrailer, diesel engine; Bill's Paper Mill, Waco, TX, conveyor, bearings).
  - Flexible taxonomy for industries (oil/gas, construction, manufacturing, chemical plants, paper mills, on-highway, off-highway).
  - Track asset details: type, physical location, maintenance history, condition.
- **Maintenance Tools**:
  - **FMEA**: Auto-populate failure modes from known documentation based on asset type; allow custom FMEA for unique/one-off assets. Output risk priority number.
  - **RCA**: Guided process with 5 Whys, fishbone diagram.
  - **RCM**: Follow SAE JA1011 standards/templates.
- **Service Provider Matching**:
  - Match based on asset’s physical location (e.g., Houston, Dallas, Austin sub-locations for one organization).
  - Support city-level or radius-based matching (e.g., 10-50 miles, initial focus within 125 miles of Houston, TX).
  - Filter by service type (e.g., mechanics, welders, pump repair, engine repair, tire repair).
- **User Account**: Free signup/login, profile with asset list, notification preferences.
- **Provider Features**:
  - Profile claiming with verification (company name, personal name, location, phone, email, number of assets managed; potential third-party location verification later).
  - Subscription tiers: $10/month (verified badge via account claim, payment, and email verification to website domain), $25/month (contact users via platform messaging with user notifications), $100/month (promoted listing). 20% discount for annual payments.
- **Admin Features**: Dashboard to manage users, providers, payments, matching logic.

## User Stories
1. **Asset Management**:
   - As a user, I want to register my organization (e.g., Tommy's Trucking) and specify asset locations (e.g., Pasadena, TX), so I can manage multiple assets in different cities.
   - As a user, I want to add assets (e.g., semitrailer, diesel engine) with details like type, location, maintenance history, and condition, so I can track their status.
   - As a user, I want a flexible hierarchy (Organization, Location, Asset, Sub-Asset) to work for my industry (e.g., oil/gas, manufacturing), so I can organize assets intuitively.
2. **Maintenance Tools**:
   - As a user, I want to input an asset type (e.g., diesel engine) and have FMEA failure modes auto-populated from known documentation, so I can assess risks quickly.
   - As a user, I want to create a custom FMEA for unique assets, including failure modes and risk priority numbers, so I can analyze one-off machinery.
   - As a user, I want a guided RCA process with 5 Whys and a fishbone diagram, so I can identify and document root causes of asset failures.
   - As a user, I want RCM templates based on SAE JA1011 standards, so I can plan preventive maintenance for my assets.
3. **Service Provider Matching**:
   - As a user, I want to find service providers (e.g., mechanics, welders) within 125 miles of my asset’s location (e.g., Houston, TX), so I can get local support.
   - As a user, I want to filter providers by service type (e.g., pump repair, tire repair), so I can match my asset’s needs.
   - As a user, I want to see verified and promoted providers first, so I can trust their services.
4. **User Account**:
   - As a user, I want to sign up for free with my email and consent to data collection/sharing, so I can access the platform easily.
   - As a user, I want to manage my profile with my asset list and notification preferences, so I can stay updated on provider messages.
   - As a user, I want to receive notifications when a provider messages me, so I can check my portal for details.
5. **Provider Features**:
   - As a provider, I want to claim my profile by providing my company name, personal name, location, phone, email, and number of assets managed, so I can join the platform.
   - As a provider, I want to verify my account for the $10/month tier with payment and email verification to my website domain, so I can display a verified badge.
   - As a provider, I want to message users through the platform ($25/month tier), so I can offer my services directly.
   - As a provider, I want to pay $100/month to appear as a promoted listing, so I can increase my visibility to users.
6. **Admin Features**:
   - As an admin, I want a dashboard to view and manage users, providers, payments, and matching logic, so I can oversee platform operations.
   - As an admin, I want to review provider verification status and subscription payments, so I can ensure compliance and revenue.

## User and Provider Experience
- **UI Design**: Minimalist, black-and-white (inspired by Grok), optimized for mobile and desktop, future HTML-wrapped app.

## Technical Preferences
- **Frontend**: React (via Anima from Figma) for ease and integration.
- **Backend**: Node.js/Express for simplicity and scalability.
- **Database**: MongoDB for flexibility with asset/provider data.
- **Authentication**: JWT for secure login.
- **Payments**: Stripe for $10/$25/$100 subscriptions.
- **Geolocation**: Google Maps API or OpenStreetMap for location matching.
- **SEO**: Google Analytics, sitemaps, meta tags. Target keywords: “asset maintenance Texas,” “Pasadena TX mechanics,” “diesel engine repair Houston,” “chemical plant maintenance Dallas,” “FMEA oil and gas Texas,” “RCM construction equipment Austin,” etc.
- **Data Scraping**: Automated scraping via Google Maps API for Texas providers (mechanics, welders, pump repair, engine repair, tire repair), primarily within 125 miles of Houston; allow manual provider signup.

## Legal/Compliance
- **Data Scraping**: Ethical automated scraping via Google Maps API for Texas providers (mechanics, welders, engineers, pump repair, engine repair, tire repair).
- **Privacy**: Comply with Texas Data Privacy and Security Act, user consent at signup for data collection and sharing contact info with providers.
- **Payments**: PCI compliance via Stripe, transparent terms.
- **Verification**: $10 tier requires account claim, payment, and email verification to website domain; potential third-party location verification TBD.

## Project Management
- **Tools**: GitHub repo (/frontend, /backend, /docs), VS Code (Prettier, ESLint, React Snippets, GitLens), Figma/Anima, GitHub Projects for task tracking. Prioritize free/low-cost options (e.g., Figma free tier, Vercel free hosting).
- **Timeline**: 1-2 weeks for Phase 1, confirmed as realistic.
- **Deliverables**:
  - Requirements document with user stories (completed: sample stories drafted and approved).
  - Finalized tech stack (completed).
  - Initialized GitHub repo (in progress: repo created at https://github.com/crtlnd/Maintenance, folder structure pending).
  - Legal checklist (scraping, privacy, payments).
  - Refined timeline for Phases 2-7.

## Scope and Scale
- **Target Users**: Initial goal of 10 users, scaling to 100, with expectation of at least one provider lead from 10 users.
- **Industries**: Equal focus on oil/gas, construction, manufacturing, chemical plants, paper mills, on-highway, off-highway.
- **Geographic Focus**: Initial focus on providers within 125 miles of Houston, TX; app usable statewide (e.g., Dallas users supported).
- **Future Features**: None planned beyond maintenance and matching at this stage.