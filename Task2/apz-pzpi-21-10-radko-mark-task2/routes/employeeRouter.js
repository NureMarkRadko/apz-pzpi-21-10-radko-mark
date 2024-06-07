const Router = require('express')
const router = new Router()
const employeeController = require('../controllers/employeeController')

router.post('/', employeeController.create)
router.put('/', employeeController.update)
router.delete('/', employeeController.delete)

module.exports = router