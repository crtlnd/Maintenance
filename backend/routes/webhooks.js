// backend/src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const User = require('../models/user');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'customer.subscription.trial_will_end') {
    const subscription = event.data.object;
    console.log(`Trial ending for subscription ${subscription.id}`);
    await User.updateOne(
      { stripeCustomerId: subscription.customer },
      { $set: { trialEnding: true } }
    );
  } else if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const plan = session.metadata.plan || 'Basic';
    await User.updateOne(
      { email: session.customer_email },
      {
        $set: {
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          subscriptionTier: plan,
        },
      }
    );
    console.log(`Subscription ${session.subscription} created for ${session.customer_email}`);
  }

  res.json({ received: true });
});

module.exports = router;
