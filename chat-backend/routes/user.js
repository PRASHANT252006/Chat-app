const {getUsers,getMe}=require('../controllers/user.js')
const express=require ('express')
const router=express.Router();

router.get('/getUsers',getUsers)
router.get('/getMe',getMe)

module.exports=router