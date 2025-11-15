 import { io } from 'socket.io-client';

  const socket = io('http://localhost:3000');

  export function connectSocket(token) {
    // TODO: 实现 WebSocket 认证
    socket.emit('authenticate', token);
  }

  export function sendMessage(message) {
    // TODO: 实现发送消息
    socket.emit('send-message', message);
  }

  export function onNewMessage(callback) {
    // TODO: 监听新消息
    socket.on('new-message', callback);
  }

  export default socket;