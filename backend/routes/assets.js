// routes/assets.js - Main assets router (redirects to modular structure)
const assetsRouter = require('./assets/index');

// Export a function that returns the router (to match your existing pattern)
module.exports = () => {
  return assetsRouter;
};
