// Sites Controller
const Site = require('../models/site.model');

// Get all sites
exports.getSites = async (event, context) => {
  try {
    const sites = await Site.find();
    return {
      statusCode: 200,
      body: JSON.stringify(sites)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Create a new site
exports.createSite = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const site = new Site(data);
    await site.save();
    return {
      statusCode: 201,
      body: JSON.stringify(site)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Get site by ID
exports.getSiteById = async (event, context) => {
  try {
    const site = await Site.findById(event.pathParameters.id);
    if (!site) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Site not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(site)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Update a site
exports.updateSite = async (event, context) => {
  try {
    const site = await Site.findByIdAndUpdate(
      event.pathParameters.id,
      JSON.parse(event.body),
      { new: true }
    );
    if (!site) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Site not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(site)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Delete a site
exports.deleteSite = async (event, context) => {
  try {
    const site = await Site.findByIdAndDelete(event.pathParameters.id);
    if (!site) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Site not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Site deleted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
