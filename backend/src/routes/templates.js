const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/jwt');
const { listTemplates, createTemplate, updateTemplate } = require('../controllers/designerTemplateController');

router.get('/', listTemplates);
router.post('/', authMiddleware, createTemplate);
router.put('/:id', authMiddleware, updateTemplate);

module.exports = router;
