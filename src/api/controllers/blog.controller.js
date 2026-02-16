// Blog Controller - Handle all blog operations
const BlogPost = require('../models/blog.model');

/**
 * Get all posts by site ID
 */
const getPostsBySite = async (event, context) => {
  try {
    const { siteId, status = 'published', limit = 20, skip = 0 } = event.queryStringParameters || {};
    
    if (!siteId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'El ID del sitio es requerido' })
      };
    }

    const query = { siteId };
    if (status) query.status = status;

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await BlogPost.countDocuments(query);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: posts,
        pagination: { total, limit: parseInt(limit), skip: parseInt(skip) }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Get a single blog post by ID or slug
 */
const getPostByIdOrSlug = async (event, context) => {
  try {
    const { id } = event.pathParameters || {};
    const { siteId } = event.queryStringParameters || {};

    if (!id || !siteId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID del post y siteId son requeridos' })
      };
    }

    let post;
    // Try to find by ID first, then by slug
    post = await BlogPost.findById(id);
    if (!post) {
      post = await BlogPost.findOne({ slug: id, siteId });
    }

    if (!post) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Post no encontrado' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: post })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Create a new blog post
 */
const createPost = async (event, context) => {
  try {
    const postData = JSON.parse(event.body);
    
    if (!postData.siteId || !postData.title || !postData.slug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'siteId, title y slug son requeridos' })
      };
    }

    const newPost = new BlogPost(postData);
    await newPost.save();

    return {
      statusCode: 201,
      body: JSON.stringify({ success: true, data: newPost })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Update a blog post
 */
const updatePost = async (event, context) => {
  try {
    const { id } = event.pathParameters || {};
    const updateData = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID del post es requerido' })
      };
    }

    const post = await BlogPost.findByIdAndUpdate(id, updateData, { new: true });

    if (!post) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Post no encontrado' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: post })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Delete a blog post
 */
const deletePost = async (event, context) => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID del post es requerido' })
      };
    }

    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Post no encontrado' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Post eliminado correctamente' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

module.exports = {
  getPostsBySite,
  getPostByIdOrSlug,
  createPost,
  updatePost,
  deletePost
};
