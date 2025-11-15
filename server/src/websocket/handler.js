// WebSocket 连接处理（临时占位符）
  export function setupWebSocket(io) {
    console.log('✅ WebSocket 服务已初始化');

    io.on('connection', (socket) => {
      console.log('用户连接:', socket.id);

      socket.on('disconnect', () => {
        console.log('用户断开:', socket.id);
      });
    });
  }