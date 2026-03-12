const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const courtController = require('../controllers/courtController');

router.get('/', verifyToken, courtController.getCourts);
router.post('/', verifyToken, courtController.addCourt);
router.delete('/:id', verifyToken, courtController.deleteCourt);

module.exports = router;
