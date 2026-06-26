const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const {
  createRules,
  updateRules,
  stockAdjustRules,
  reserveRules,
  reduceStockRules,
} = require('../validations/inventoryValidation');

// Static action routes — must come BEFORE /:productId to avoid being shadowed
router.get('/low-stock',          ctrl.getLowStockProducts);
router.get('/check/:productId',   ctrl.checkStockAvailability);
router.post('/increase',          stockAdjustRules,  ctrl.increaseStock);
router.post('/decrease',          stockAdjustRules,  ctrl.decreaseStock);
router.post('/reserve',           reserveRules,      ctrl.reserveStock);
router.post('/release',           reserveRules,      ctrl.releaseStock);
router.patch('/reduce-stock',     reduceStockRules,  ctrl.reduceStock);

// CRUD routes
router.post('/',              createRules, ctrl.createInventory);
router.get('/',                            ctrl.getAllInventory);
router.get('/:productId',                  ctrl.getInventoryByProductId);
router.put('/:productId',     updateRules, ctrl.updateInventory);
router.delete('/:productId',               ctrl.deleteInventory);

module.exports = router;
