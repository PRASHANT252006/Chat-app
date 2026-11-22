const express=require("express");
const {upload}=require('../middleware/multer.js');
const rateLimit = require('../middleware/rateLimit');
const router=express.Router();

const loginLimiter = rateLimit(
    'login',
    5,
    60,
    (req) => `${req.ip}:${String(req.body.email || '').trim().toLowerCase()}`
);

const registerLimiter = rateLimit(
    'register',
    5,
    3600,
    (req) => req.ip
);
const {login,register,refreshaccessToken}=require('../controllers/auth.js');
router.post('/', loginLimiter, login);
router.post('/register', registerLimiter, upload.single('avatar'), register);
router.get('/refreshAccessToken',refreshaccessToken);
module.exports=router;