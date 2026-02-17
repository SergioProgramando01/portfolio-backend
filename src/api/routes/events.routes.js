// Analytics Events Routes
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// POST /api/events - Create a new analytics event
router.post('/', analyticsController.createEvent);

// GET /api/events - Get events with filters
router.get('/', analyticsController.getEvents);

// GET /api/events/summary - Get analytics summary
router.get('/summary', analyticsController.getSummary);

// GET /api/events/element - Get events by element
router.get('/element', analyticsController.getEventsByElement);

// DELETE /api/events/cleanup - Delete old events
router.delete('/cleanup', analyticsController.cleanupOldEvents);

module.exports = router;
