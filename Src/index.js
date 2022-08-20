const express = require("express")
const http = require("http")
const socket = require("socket.io")
const path = require("path")
const { disconnect } = require("process")
const Filter = require("bad-words")
const {generateMessages, generateLocation} = require("./utils/messages")
const {addUser, removeUser, getUser, getUserInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socket(server)
const port = process.env.PORT || 4000

const public = path.join(__dirname, "../Public")

app.use(express.static(public))

io.on("connection", (socket)=>{
    
    
    socket.on('join', ({username, room}, callback)=>{
        const {error, user}= addUser({id: socket.id, username, room})
        
        if(error){
            return callback(error)

        }   
        
        socket.join(user.room)
    socket.emit("message", generateMessages("Admin", "welcome!"))
    socket.broadcast.to(user.room).emit("message", generateMessages("Admin",`${user.username} has joined! `))
        io.to(user.room).emit('roomData',{  
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()
    })
    socket.on("message", (message, callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profane")
        }
       
        const user =  getUser(socket.id)
         if(user.room){

            io.to(user.room).emit("message", generateMessages(user.username, message))
         }   

        
        callback()

    })
    socket.on("disconnect", ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit("message", generateMessages("Admin", `${user.username} has left`))
            io.to(user.room).emit('roomData',{  
            room:user.room,
            users:getUserInRoom(user.room)
        })

        }
        

    })

    socket.on("location",(location, callback)=>{
        const user =  getUser(socket.id)
        if(user.room){
            
        io.to(user.room).emit("location", generateLocation(user.username, `https://www.google.com/maps?q=${location.lat},${location.long}`))
        callback()
        }
    })
})




server.listen(port, ()=>{

    
})