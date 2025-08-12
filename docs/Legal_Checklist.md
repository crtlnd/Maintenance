{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # Legal Checklist for Maintenance App\
\
## 1. Data Scraping\
- **Requirement**: Ethical automated scraping of Texas service providers (mechanics, welders, pump repair, engine repair, tire repair) using Google Maps API, primarily within 125 miles of Houston, TX.\
- **Compliance**:\
  - Use Google Maps API in accordance with its [Terms of Service](https://cloud.google.com/maps-platform/terms).\
  - Ensure scraping respects robots.txt and API usage limits (e.g., request quotas).\
  - Store only necessary data (e.g., provider name, location, contact info, service type).\
  - Allow manual provider signup to supplement scraped data.\
- **Action**: Obtain a Google Maps API key (free tier available) and review terms for ethical use.\
\
## 2. Privacy\
- **Requirement**: Comply with Texas Data Privacy and Security Act (TDPSA) for user data collection and sharing.\
- **Compliance**:\
  - Implement user consent at signup for data collection and sharing contact info with providers.\
  - Provide a clear privacy policy linked at signup, detailing data usage (e.g., asset details, location, provider messaging).\
  - Ensure secure storage of user data (e.g., email, asset list) in MongoDB with encryption.\
  - Allow users to opt out of data sharing or delete their account.\
- **Action**: Draft a basic privacy policy template (can use free online generators like Termly.io) and integrate into signup flow.\
\
## 3. Payments\
- **Requirement**: PCI compliance for provider subscriptions ($10/$25/$100 per month, 20% annual discount) via Stripe.\
- **Compliance**:\
  - Use Stripe\'92s hosted payment pages to ensure PCI compliance (no direct credit card handling).\
  - Provide transparent terms of service for subscriptions, including pricing, discounts, and cancellation policies.\
  - Display terms during provider signup for $10/$25/$100 tiers.\
- **Action**: Set up a Stripe account (free to start) and review PCI compliance guidelines at [stripe.com/docs/security](https://stripe.com/docs/security).\
\
## 4. Provider Verification\
- **Requirement**: $10/month tier requires account claim, payment, and email verification to website domain; potential third-party location verification later.\
- **Compliance**:\
  - Implement email verification via domain check (e.g., provider@company.com must match their website domain).\
  - Plan for optional third-party location verification (e.g., Google Maps, manual review) in future phases.\
  - Ensure verification process is transparent and documented in terms of service.\
- **Action**: Design verification flow in Figma (Phase 2) and note potential third-party services (e.g., Google Places API) for location checks.\
\
## Next Steps\
- Upload this checklist to GitHub (`docs/Legal_Checklist.md`).\
- In Phase 2, draft privacy policy and terms of service using free templates.\
- Obtain Google Maps API key and Stripe account in Phase 3 or 4.}