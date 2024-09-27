const express = require('express');
const router = express.Router();
const userController = require('../controllers/settingJS.controller');
const middleware = require('../middleware/middleware');


router.put('/js/change-email', middleware,userController.changeEmail);
router.put('/js/change-password', middleware,userController.changePassword);
router.put('/js/deactivate', middleware,userController.deactivateUser);
router.delete('/js/delete', middleware,userController.deleteUser);

module.exports = router;
