// Sites Routes
const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/sites.controller');

router.get('/', sitesController.getSites);
router.post('/', sitesController.createSite);
router.get('/:id', sitesController.getSiteById);
router.put('/:id', sitesController.updateSite);
router.delete('/:id', sitesController.deleteSite);

module.exports = router;
