// Netlify Function for /api/products
const productsController = require('../../src/api/controllers/products.controller');

exports.handler = async (event, context) => {
  // Connect to database
  const connectDB = require('../../src/config/database');
  await connectDB();

  const httpMethod = event.httpMethod;
  const pathParameters = event.pathParameters || {};
  
  if (httpMethod === 'GET') {
    // Check if it's a get by ID request
    if (pathParameters && pathParameters.id) {
      return productsController.getProductById(event, context);
    }
    return productsController.getProducts(event, context);
  } else if (httpMethod === 'POST') {
    return productsController.createProduct(event, context);
  } else if (httpMethod === 'PUT' || httpMethod === 'PATCH') {
    return productsController.updateProduct(event, context);
  } else if (httpMethod === 'DELETE') {
    return productsController.deleteProduct(event, context);
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
};
