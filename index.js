require('dotenv').config()
const port = process.env.PORT || 5000
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const fileUpload = require('express-fileupload')
const http = require('http').createServer(app)
const cors = require('cors')

// Connect Mongodb
const db_options = { 
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useFindAndModify: false, 
    useCreateIndex: true 
}
mongoose
    .connect(process.env.MONGODB_URI, db_options)
    .then(() => console.log('Database Connected'))
    .catch((err) => console.log(err))

app.use(fileUpload())
app.use(express.json({ limit: '50mb', type: 'application/json' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cors())
app.use(express.static('public'))
app.use(require('./routes'))

// socket.io connection
const options = {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
}
let io = require('socket.io')(http, options)
// const { chat_io } = require('./controllers/socket.controller')
// chat_io(io)

http.listen(port, () => {
    console.log(`Node app is running on port ${port}`)
})
