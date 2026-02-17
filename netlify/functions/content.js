// Netlify Function for /api/content
const contentController = require('../../src/api/controllers/content.controller');

exports.handler = async (event, context) => {
  // Connect to database
  const connectDB = require('../../src/config/database');
  await connectDB();

  const httpMethod = event.httpMethod;
  const pathParameters = event.pathParameters || {};
  
  if (httpMethod === 'GET') {
    // Check if it's a get by ID request
    if (pathParameters && pathParameters.id) {
      return contentController.getContentById(event, context);
    }
    return contentController.getContent(event, context);
  } else if (httpMethod === 'POST') {
    return contentController.createContent(event, context);
  } else if (httpMethod === 'PUT' || httpMethod === 'PATCH') {
    return contentController.updateContent(event, context);
  } else if (httpMethod === 'DELETE') {
    return contentController.deleteContent(event, context);
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
};
