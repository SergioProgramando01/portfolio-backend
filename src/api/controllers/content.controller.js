// Content Controller
const Content = require('../models/content.model');

// Get all content
exports.getContent = async (event, context) => {
  try {
    const content = await Content.find();
    return {
      statusCode: 200,
      body: JSON.stringify(content)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Create new content
exports.createContent = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const content = new Content(data);
    await content.save();
    return {
      statusCode: 201,
      body: JSON.stringify(content)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Get content by ID
exports.getContentById = async (event, context) => {
  try {
    const content = await Content.findById(event.pathParameters.id);
    if (!content) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Content not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(content)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Update content
exports.updateContent = async (event, context) => {
  try {
    const content = await Content.findByIdAndUpdate(
      event.pathParameters.id,
      JSON.parse(event.body),
      { new: true }
    );
    if (!content) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Content not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(content)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Delete content
exports.deleteContent = async (event, context) => {
  try {
    const content = await Content.findByIdAndDelete(event.pathParameters.id);
    if (!content) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Content not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Content deleted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
