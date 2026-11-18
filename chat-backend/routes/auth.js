const express=require("express");
const {upload}=require('../middleware/multer.js');

const router=express.Router();
const {login,register}=require('../controllers/auth.js');
router.post('/',login);
router.post('/register', upload.single('avatar'), register);
module.exports=router;