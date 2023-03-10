import express from 'express';
import cors from 'cors'
import { Socket } from 'socket.io';
import process from 'process';

require('dotenv').config()
const app = express();
const http = require('http').Server(app);

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const socketIO = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
});

type userData = {
  id: string
  nickname: string
  status: 'Conectado' | 'Ausente'
}

let users : userData[] = []

socketIO.on('connection', (socket: Socket) => {
  socketIO.emit("userResponse", users)

  socket.on("message", data => {
    console.log(data)
    socketIO.emit("messageResponse", data)
  })

  socket.on("newUser", data => {
    if(!users.find(ele => ele.id === data.id)) users.push(data)
    socketIO.emit("userResponse", users)
  })

  socket.on("changeStatus", data => {
    let user = users.find(ele => ele.id === data.id)
    if(user) user.status = data.status;
    socketIO.emit("userResponse", users)
  })

  socket.on("logout", data => {
    users = users.filter(user => user.id !== data.id)
    socketIO.emit("userResponse", users)
  })

  socket.on('disconnect', () => {
    users = users.filter(user => user.id !== socket.id)
    socketIO.emit("userResponse", users)
    socket.disconnect()
  });
});

http.listen(port, () => {
  return console.log(`Express ready port:${port}`);
});