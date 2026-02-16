// Netlify Function for /api/sites
const sitesController = require('../../src/api/controllers/sites.controller');

exports.handler = async (event, context) => {
  // Connect to database
  const connectDB = require('../../src/config/database');
  await connectDB();

  const httpMethod = event.httpMethod;
  const pathParameters = event.pathParameters || {};
  
  if (httpMethod === 'GET') {
    // Check if it's a get by ID request
    if (pathParameters && pathParameters.id) {
      return sitesController.getSiteById(event, context);
    }
    return sitesController.getSites(event, context);
  } else if (httpMethod === 'POST') {
    return sitesController.createSite(event, context);
  } else if (httpMethod === 'PUT' || httpMethod === 'PATCH') {
    return sitesController.updateSite(event, context);
  } else if (httpMethod === 'DELETE') {
    return sitesController.deleteSite(event, context);
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
};
