const Router = require('express')
const router = new Router()
const departmentController = require('../controllers/departmentController')

router.post('/', departmentController.create)
router.delete('/', departmentController.delete)
router.get('/search', departmentController.searchByAddress)
router.put('/', departmentController.update)

module.exports = router