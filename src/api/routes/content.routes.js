// Content Routes
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');

router.get('/', contentController.getContent);
router.post('/', contentController.createContent);
router.get('/:id', contentController.getContentById);
router.put('/:id', contentController.updateContent);
router.delete('/:id', contentController.deleteContent);

module.exports = router;
