const Router = require('express')
const router = new Router()
const companyController = require('../controllers/companyController')

router.post('/', companyController.create)
router.put('/', companyController.update)
router.delete('/', companyController.delete)

module.exports = router