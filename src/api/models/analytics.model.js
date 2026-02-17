// AnalyticsEvent Model - Internal analytics tracking for user interactions
const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  // Site association - each event belongs to a specific site
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true,
    index: true
  },
  // Type of event (click, view, scroll, submit, etc.)
  eventType: {
    type: String,
    required: true,
    enum: ['click', 'view', 'scroll', 'submit', 'hover', 'download', 'share', 'search', 'purchase', 'signup', 'custom'],
    index: true
  },
  // ID of the element that triggered the event
  elementId: {
    type: String,
    trim: true
  },
  // Element class name for categorization
  elementClass: {
    type: String,
    trim: true
  },
  // Element tag name
  elementTag: {
    type: String,
    trim: true
  },
  // Session ID to track user journey
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  // User ID if authenticated (optional)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Page URL where event occurred
  pageUrl: {
    type: String,
    trim: true
  },
  // Page title
  pageTitle: {
    type: String,
    trim: true
  },
  // Referrer URL
  referrer: {
    type: String,
    trim: true
  },
  // Event timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Additional metadata as key-value pairs
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  // Device information
  device: {
    type: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile', 'unknown'],
      default: 'unknown'
    },
    browser: String,
    os: String,
    screenWidth: Number,
    screenHeight: Number
  },
  // Geographic location (if available from IP)
  location: {
    country: String,
    region: String,
    city: String
  }
});

// Compound indexes for efficient analytics queries
analyticsEventSchema.index({ siteId: 1, timestamp: -1 });
analyticsEventSchema.index({ siteId: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
analyticsEventSchema.index({ siteId: 1, timestamp: -1, eventType: 1 });

// TTL index to auto-delete events after 1 year (optional retention policy)
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
