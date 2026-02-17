// Products Controller
const Product = require('../models/product.model');

// Get all products
exports.getProducts = async (event, context) => {
  try {
    const products = await Product.find();
    return {
      statusCode: 200,
      body: JSON.stringify(products)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Create a new product
exports.createProduct = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const product = new Product(data);
    await product.save();
    return {
      statusCode: 201,
      body: JSON.stringify(product)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Get product by ID
exports.getProductById = async (event, context) => {
  try {
    const product = await Product.findById(event.pathParameters.id);
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(product)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Update a product
exports.updateProduct = async (event, context) => {
  try {
    const product = await Product.findByIdAndUpdate(
      event.pathParameters.id,
      JSON.parse(event.body),
      { new: true }
    );
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(product)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Delete a product
exports.deleteProduct = async (event, context) => {
  try {
    const product = await Product.findByIdAndDelete(event.pathParameters.id);
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product deleted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
