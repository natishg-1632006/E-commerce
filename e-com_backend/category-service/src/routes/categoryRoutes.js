const router = require('express').Router();
const controller = require('../controllers/categoryController');
const {createRules,} = require('../validations/categoryValidation');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.post('/',
    authMiddleware,
    authorize('Admin'),
    createRules,
    controller.createCategory
);

module.exports = router;