// Netlify Function for /api/events - Analytics Events Handler
const analyticsController = require('../../src/api/controllers/analytics.controller');

exports.handler = async (event, context) => {
  const httpMethod = event.httpMethod;
  const path = event.path;

  // Connect to database
  const connectDB = require('../../src/config/database');
  await connectDB();

  // Route handling based on HTTP method and path
  try {
    // POST /api/events - Create new event
    if (httpMethod === 'POST') {
      return analyticsController.createEvent(event, context);
    }

    // GET /api/events - Get events with filters
    if (httpMethod === 'GET') {
      // Check for summary endpoint
      if (path.includes('/summary')) {
        return analyticsController.getSummary(event, context);
      }
      // Check for element endpoint
      if (path.includes('/element')) {
        return analyticsController.getEventsByElement(event, context);
      }
      // Default events list
      return analyticsController.getEvents(event, context);
    }

    // DELETE /api/events/cleanup - Delete old events
    if (httpMethod === 'DELETE') {
      return analyticsController.cleanupOldEvents(event, context);
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  } catch (error) {
    console.error('Error in events handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
