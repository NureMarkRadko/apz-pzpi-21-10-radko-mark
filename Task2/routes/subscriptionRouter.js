const Router = require('express')
const router = new Router()
const subscriptionController = require('../controllers/subscriptionController.js')

router.post('/', subscriptionController.create)
router.get('/:SubscriptionId/is-valid')

module.exports = router