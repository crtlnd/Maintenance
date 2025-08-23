import React from 'react';
import { Helmet } from 'react-helmet';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Helmet>
        <title>Maintenance App - Asset Management & Provider Matching</title>
        <meta name="description" content="Manage assets, perform FMEA, RCA, and RCM, and connect with verified service providers for oil/gas, construction, and manufacturing industries." />
        <meta name="keywords" content="maintenance, asset management, FMEA, RCA, RCM, service providers, oil and gas, construction, manufacturing, AI-powered maintenance" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Maintenance App" />
        <meta property="og:description" content="Streamline asset maintenance with AI-powered tools and connect with top service providers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-domain.com" />
      </Helmet>
      <header>
        <h1>Welcome to Maintenance App</h1>
        <p>Streamline asset management with AI-powered tools and connect with verified service providers.</p>
        <a href="/signup" className="cta-button">Get Started</a>
      </header>
      <section className="features">
        <h2>Features</h2>
        <ul>
          <li>Asset Management: Track and manage assets with real-time dashboards.</li>
          <li>Maintenance Tools: Perform FMEA, RCA, and RCM with guided workflows.</li>
          <li>Provider Matching: Find mechanics, welders, and engineers within 10-50 miles.</li>
          <li>AI-Powered Insights: Leverage AI for predictive maintenance (AI-Powered plan).</li>
        </ul>
      </section>
      <section className="pricing">
        <h2>User Pricing</h2>
        <div className="pricing-tiers">
          <div className="tier">
            <h3>Free</h3>
            <p>$0/month</p>
            <p>Basic asset management and maintenance tools.</p>
          </div>
          <div className="tier">
            <h3>Pro</h3>
            <p>$20/month</p>
            <p>Advanced features and provider matching.</p>
          </div>
          <div className="tier">
            <h3>AI-Powered</h3>
            <p>$50/month</p>
            <p>AI-driven insights and priority support.</p>
          </div>
        </div>
      </section>
      <footer>
        <p>&copy; 2025 Maintenance App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
