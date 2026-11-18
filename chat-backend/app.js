const express =require("express")
const dns=require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1']);
require("dotenv").config()
const connect=require("./db/connect.js")
const authroute=require("./routes/auth.js")
const app=express();
const port=process.env.PORT;
const {notFoundMiddleware}=require('./middleware/notFound.js')
const {errorHandlerMiddleware}=require('./middleware/errorHandler.js')
const cors=require('cors')
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api/v1',authroute);
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);
const connection=async()=>{
    try{
        await connect(process.env.MONGO_URI);
        console.log("Connection successful!!!!");
app.listen(port,()=>{
    console.log(`Server is listening on ${port}`);
})
    }
    catch(err){
        console.log(err.message);
    }
}
connection();


