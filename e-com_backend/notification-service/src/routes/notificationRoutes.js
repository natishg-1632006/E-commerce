const router = require('express').Router();
const ctrl = require('../controllers/notificationController');

router.get('/health', ctrl.healthCheck);
router.post('/send', ctrl.sendTestNotification);

module.exports = router;
