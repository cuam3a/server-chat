"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const process_1 = __importDefault(require("process"));
require('dotenv').config();
const app = (0, express_1.default)();
const http = require('http').Server(app);
const port = process_1.default.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});
let users = [];
socketIO.on('connection', (socket) => {
    socketIO.emit("userResponse", users);
    socket.on("message", data => {
        console.log(data);
        socketIO.emit("messageResponse", data);
    });
    socket.on("newUser", data => {
        if (!users.find(ele => ele.id === data.id))
            users.push(data);
        socketIO.emit("userResponse", users);
    });
    socket.on("changeStatus", data => {
        let user = users.find(ele => ele.id === data.id);
        if (user)
            user.status = data.status;
        socketIO.emit("userResponse", users);
    });
    socket.on("logout", data => {
        users = users.filter(user => user.id !== data.id);
        socketIO.emit("userResponse", users);
    });
    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        socketIO.emit("userResponse", users);
        socket.disconnect();
    });
});
http.listen(port, () => {
    return console.log(`Express ready port:${port}`);
});
