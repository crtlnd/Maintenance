Maintenance App Backend

Node.js/Express backend for the Maintenance App, supporting asset management, maintenance tools (FMEA, RCA, RCM), provider matching, user accounts, admin features, and Grok AI integration.

Setup





Install dependencies: npm install



Create .env with:

MONGO_URI=mongodb://localhost:27017/maintenance
JWT_SECRET=your-random-secure-secret
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
XAI_API_KEY=your_xai_api_key



Run: node index.js

Endpoints





Assets: /api/assets, /api/assets/:id/status, /api/assets/fmea



RCA: /api/rca



RCM: /api/rcm



Providers: /api/providers



Users: /api/auth/signup, /api/auth/login, /api/users/profile, /api/users/subscribe



Admin: /api/admin/users, /api/admin/providers



AI: /api/ai/query

Deployment





Backend: Deploy to AWS Elastic Beanstalk or Heroku.



Frontend: Deploy to Vercel.



MongoDB: Use MongoDB Atlas for production.



Stripe: Use live-mode keys (https://dashboard.stripe.com/apikeys).



xAI: Ensure valid API key from https://console.x.ai.
