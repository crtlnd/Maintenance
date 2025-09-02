const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { priceId, email } = req.body;
  console.log('Received create-checkout-session request:', { priceId, email });
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
    });
    console.log('Stripe session created:', session.url);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
