const notFoundMiddleware=(req,res,next)=>{
    res.status(404).send(`No such route with ${req.url}`);
}
module.exports= {notFoundMiddleware};