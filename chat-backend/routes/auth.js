const express=require("express");
const {upload}=require('../middleware/multer.js');
const authMiddleware=require("../middleware/auth.js")
const router=express.Router();
const {login,register,refreshaccessToken}=require('../controllers/auth.js');
router.post('/',login);
router.post('/register', upload.single('avatar'), register);
router.get('/refreshAccessToken',refreshaccessToken);
module.exports=router;