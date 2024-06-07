const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')

router.post('/register', userController.registration)
router.get('/login', userController.login)
router.put('/ban', userController.ban)
router.put('/unban', userController.unban)
router.get('/check', userController.check)

module.exports = router