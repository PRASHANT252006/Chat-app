const express =require("express")
const dns=require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1']);
require("dotenv").config()
const connect=require("./db/connect.js")
const authMiddleware=require("./middleware/auth.js")
const authroute=require("./routes/auth.js")
const conversationroute=require("./routes/conversation.js")
const userroute=require("./routes/user.js")
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
app.use('/api/v1',authMiddleware,conversationroute);
app.use('/api/v1',userroute);
app.use(notFoundMiddleware);
// app.use(errorHandlerMiddleware);
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


