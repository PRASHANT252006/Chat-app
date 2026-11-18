const notFoundMiddleware=(req,res,next)=>{
    res.send(`No such route with ${req.url}`);
}
module.exports= {notFoundMiddleware};