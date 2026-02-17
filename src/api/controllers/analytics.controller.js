// Analytics Controller - Handle all analytics event operations for Netlify Functions
const AnalyticsEvent = require('../models/analytics.model');

/**
 * Create a new analytics event
 * POST /api/events
 */
const createEvent = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const {
      siteId,
      eventType,
      elementId,
      elementClass,
      elementTag,
      sessionId,
      userId,
      pageUrl,
      pageTitle,
      referrer,
      timestamp,
      metadata,
      device,
      location
    } = data;

    // Validate required fields
    if (!siteId || !eventType || !sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'siteId, eventType, and sessionId are required'
        })
      };
    }

    const analyticsEvent = new AnalyticsEvent({
      siteId,
      eventType,
      elementId,
      elementClass,
      elementTag,
      sessionId,
      userId,
      pageUrl,
      pageTitle,
      referrer,
      timestamp: timestamp || Date.now(),
      metadata,
      device,
      location
    });

    await analyticsEvent.save();

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        data: analyticsEvent
      })
    };
  } catch (error) {
    console.error('Error creating analytics event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error creating analytics event',
        error: error.message
      })
    };
  }
};

/**
 * Get events for a specific site
 * GET /api/events?siteId=xxx&eventType=xxx&startDate=xxx&endDate=xxx
 */
const getEvents = async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    const { 
      siteId, 
      eventType, 
      sessionId,
      startDate, 
      endDate, 
      limit = 100, 
      skip = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = params;

    // Build query
    const query = {};

    if (siteId) query.siteId = siteId;
    if (eventType) query.eventType = eventType;
    if (sessionId) query.sessionId = sessionId;

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const events = await AnalyticsEvent.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await AnalyticsEvent.countDocuments(query);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: events,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          pages: Math.ceil(total / parseInt(limit))
        }
      })
    };
  } catch (error) {
    console.error('Error fetching analytics events:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error fetching analytics events',
        error: error.message
      })
    };
  }
};

/**
 * Get analytics summary for a site
 * GET /api/events/summary?siteId=xxx&startDate=xxx&endDate=xxx
 */
const getSummary = async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    const { siteId, startDate, endDate } = params;

    if (!siteId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'siteId is required'
        })
      };
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = { siteId: siteId };
    if (startDate || endDate) {
      matchStage.timestamp = dateFilter;
    }

    // Simple aggregation for event counts
    const eventCounts = await AnalyticsEvent.aggregate([
      { $match: matchStage },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);

    // Count unique sessions
    const uniqueSessions = await AnalyticsEvent.distinct('sessionId', matchStage);

    // Get total count
    const totalEvents = await AnalyticsEvent.countDocuments(matchStage);

    // Get most recent events
    const recentEvents = await AnalyticsEvent.find(matchStage)
      .sort({ timestamp: -1 })
      .limit(10);

    // Format event type counts
    const eventTypeCounts = {};
    eventCounts.forEach(item => {
      eventTypeCounts[item._id] = item.count;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: {
          summary: {
            totalEvents,
            uniqueSessions: uniqueSessions.length,
            eventTypeCounts
          },
          recentEvents
        }
      })
    };
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error fetching analytics summary',
        error: error.message
      })
    };
  }
};

/**
 * Get events by element
 * GET /api/events/element?siteId=xxx&elementId=xxx
 */
const getEventsByElement = async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    const { siteId, elementId, limit = 50 } = params;

    if (!siteId || !elementId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'siteId and elementId are required'
        })
      };
    }

    const events = await AnalyticsEvent.find({ siteId, elementId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    const count = await AnalyticsEvent.countDocuments({ siteId, elementId });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: events,
        total: count
      })
    };
  } catch (error) {
    console.error('Error fetching events by element:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error fetching events by element',
        error: error.message
      })
    };
  }
};

/**
 * Delete old events (cleanup)
 * DELETE /api/events/cleanup?days=30
 */
const cleanupOldEvents = async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    const { days = 90 } = params;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await AnalyticsEvent.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Deleted ${result.deletedCount} events older than ${days} days`
      })
    };
  } catch (error) {
    console.error('Error cleaning up events:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error cleaning up events',
        error: error.message
      })
    };
  }
};

module.exports = {
  createEvent,
  getEvents,
  getSummary,
  getEventsByElement,
  cleanupOldEvents
};
