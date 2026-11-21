const express = require("express")
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const http = require('http')
const { Server } = require('socket.io')
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])
require("dotenv").config()
const connect = require("./db/connect.js")
const authroute = require("./routes/auth.js")
const conversationroute = require("./routes/conversation.js")
const userroute = require("./routes/user.js")
const messageroute = require("./routes/message.js")
const { notFoundMiddleware } = require('./middleware/notFound.js')
const { errorHandlerMiddleware } = require('./middleware/errorHandler.js')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const parseCookie = cookie.parseCookie || cookie.parse
const app = express()
const server = http.createServer(app)
const port = process.env.PORT

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
})
app.set("io", io)

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())

io.use((socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie
        if (!cookieHeader) {
            return next(new Error('Access token not found'))
        }
        const cookies = parseCookie(cookieHeader)
        const accessToken = cookies.accesstoken
        if (!accessToken) {
            return next(new Error('Access token not found'))
        }
        const decoded = jwt.verify(accessToken, process.env.access_Token_Secret)
        socket.user = decoded
        next()
    } catch (error) {
        console.log('Socket auth error:', error.message)
        next(new Error('Invalid or expired access token'))
    }
})

io.on('connection', (socket) => {
    const userId = socket.user._id
    const roomName = `user:${userId}`
    socket.join(roomName)
    console.log('User connected:', socket.id, 'Joined room:', roomName)

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})

app.use('/api/v1', authroute)
app.use('/api/v1', conversationroute)
app.use('/api/v1', userroute)
app.use('/api/v1', messageroute)
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const connection = async () => {
    try {
        await connect(process.env.MONGO_URI)
        console.log("Connection successful!!!!")
        server.listen(port, () => {
            console.log('Server running on port', port)
        })
    } catch (err) {
        console.log(err.message)
    }
}
connection()