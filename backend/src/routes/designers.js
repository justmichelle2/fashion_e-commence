const express = require('express');
const router = express.Router();
const { listDesigners, getDesigner } = require('../controllers/designerController');

router.get('/', listDesigners);
router.get('/:id', getDesigner);

module.exports = router;
