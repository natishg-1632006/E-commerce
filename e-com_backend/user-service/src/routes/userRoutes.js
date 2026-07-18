const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { profileUpdateRules } = require('../validations/userValidation');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/profile', authMiddleware, authorize('Customer', 'Admin'), ctrl.getProfile);
router.put('/profile', authMiddleware, authorize('Customer', 'Admin'), profileUpdateRules, ctrl.updateProfile);

router.get('/', authMiddleware, authorize('Admin'), ctrl.getAllUsers);
router.get('/:userId', authMiddleware, authorize('Admin'), ctrl.getUserById);
router.put('/:userId', authMiddleware, authorize('Admin'), profileUpdateRules, ctrl.updateUserByIdAdmin);

module.exports = router;
