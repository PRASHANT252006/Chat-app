const {getUsers,getMe}=require('../controllers/user.js')
const express=require ('express')
const router=express.Router();
const authMiddleware = require('../middleware/auth.js')

router.get('/getUsers', authMiddleware, getUsers)
router.get('/getMe', authMiddleware, getMe)

module.exports=router