// const {user} =require("../models/user.js")
// const {session}=require("../models/session.js")
const {customApiError}=require("../error/customApiError.js")
const jwt=require('jsonwebtoken')
require("dotenv").config()
const auth=(req,res,next)=>{
    try{
         const authHeader = req.headers.authorization;

        const accesstoken =
            req.cookies?.accesstoken ||
            (authHeader?.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null);
     const info= jwt.verify(accesstoken,process.env.access_Token_Secret);
     if(!info){
         throw new customApiError(401,"You are not authorized to access this route");
     }
     req.user = info;
     console.log(req.user);
     next();
    }
    catch(error){
        next(error);
    }
    };

module.exports=auth;