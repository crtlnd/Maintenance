const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { priceId, email, metadata } = req.body;
  console.log('Received create-checkout-session request:', { priceId, email, metadata });

  // Map priceId to plan name since frontend might not send metadata
  const planMapping = {
    'price_1S2E1zGi9H80HINUlSIJ5u1v': 'Basic',
    'price_1S2E2rGi9H80HINU3SVfZwFn': 'Professional',
    'price_1S2E3nGi9H80HINU7PLjhbQs': 'Annual'
  };

  // Determine plan from metadata or priceId mapping
  const plan = metadata?.plan || planMapping[priceId] || 'Basic';
  console.log('Determined plan:', plan, 'from priceId:', priceId);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
      },
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
      customer_email: email,
      metadata: { plan }, // Always include the determined plan
    });

    console.log('Stripe session created with plan:', plan, 'metadata:', { plan });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = () => router;
