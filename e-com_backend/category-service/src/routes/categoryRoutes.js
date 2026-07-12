const router = require('express').Router();
const controller = require('../controllers/categoryController');
const {createRules,updateRules} = require('../validations/categoryValidation');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');


router.post('/',
    authMiddleware,
    authorize('Admin'),
    createRules,
    controller.createCategory
);

router.get(
  "/",
  authMiddleware,
  authorize("Admin", "Customer"),
  controller.getCategories
);

router.get(
  "/:id",
  authMiddleware,
  authorize("Admin", "Customer"),
  controller.getCategory
);

router.put(
  "/:id",
  authMiddleware,
  authorize("Admin"),
  updateRules,
  controller.updateCategory
);

module.exports = router;