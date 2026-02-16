// Netlify Function for /api/blog
const blogController = require('../../src/api/controllers/blog.controller');

exports.handler = async (event, context) => {
  // Connect to database
  const connectDB = require('../../src/config/database');
  await connectDB();

  const httpMethod = event.httpMethod;
  const pathParameters = event.pathParameters || {};

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    // GET /api/blog - Get posts by site
    if (httpMethod === 'GET') {
      // Check if it's a get by ID request
      if (pathParameters && pathParameters.id) {
        return blogController.getPostByIdOrSlug(event, context);
      }
      return blogController.getPostsBySite(event, context);
    }

    // POST /api/blog - Create new post
    if (httpMethod === 'POST') {
      return blogController.createPost(event, context);
    }

    // PUT /api/blog/:id - Update post
    if (httpMethod === 'PUT' || httpMethod === 'PATCH') {
      return blogController.updatePost(event, context);
    }

    // DELETE /api/blog/:id - Delete post
    if (httpMethod === 'DELETE') {
      return blogController.deletePost(event, context);
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
