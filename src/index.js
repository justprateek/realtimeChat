const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { genrateMessage } = require('./utils/message.js')
const {addUser, removeUser, getUser,getUsersInRoom} = require('./utils/users')

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))


// let count=0
// const msg ="hello sexy"

io.on('connection',(socket)=>{
    console.log('connection established')

    // socket.emit('message',msg)
    
    // socket.broadcast.emit('message',genrateMessage('new user has joined'))

    socket.on('join',({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username, room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',genrateMessage('sys','welcome!'))
        socket.broadcast.to(user.room).emit('message', genrateMessage( 'sys',`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    socket.on('sendMessage',(message, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
      
        if(filter.isProfane(message)){
            return callback('dont be profane')
        }
        io.to(user.room).emit('message',genrateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',genrateMessage('sys', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
       
    })
    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count++;
    //     io.emit('countUpdated',count)
    // })
})





server.listen(port,()=>{
    console.log('server running on 3000')
})