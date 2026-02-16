// API Routes Index
const express = require('express');
const router = express.Router();

const sitesRoutes = require('./sites.routes');
const productsRoutes = require('./products.routes');
const contentRoutes = require('./content.routes');
const eventsRoutes = require('./events.routes');

router.use('/sites', sitesRoutes);
router.use('/products', productsRoutes);
router.use('/content', contentRoutes);
router.use('/events', eventsRoutes);

module.exports = router;
