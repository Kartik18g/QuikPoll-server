import dotenv from 'dotenv'
dotenv.config('../.env')

import express from 'express'
import cors from 'cors'
import http from 'http'
import socketIo from 'socket.io'
import shortid from 'shortid';
import { connectDB } from './mongodb/connectDb'
import userRoutes from './routes/user'
import pollRoutes from './routes/poll'

connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/user',userRoutes)
app.use('/poll',pollRoutes)

const server = http.createServer(app);
const io = socketIo(server); 
const port = process.env.PORT || 8080

let interval;

let users = 0;

io.on("connection", (socket) => {
  console.log("client connected")
  users++;
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

export {io}

app.get('/user', (req, res) => {
    users++;
    res.send({
      role:users===1?1:0,
      id:shortid.generate(),
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`));