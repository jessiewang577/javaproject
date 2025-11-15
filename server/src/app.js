 import express from 'express';
  import http from 'http';
  import { Server } from 'socket.io';
  import cors from 'cors';
  import helmet from 'helmet';
  import morgan from 'morgan';
  import dotenv from 'dotenv';
  import db from './config/database.js';

  // 路由导入
  import authRoutes from './routes/auth.js';
  import userRoutes from './routes/user.js';
  import messageRoutes from './routes/message.js';

  // WebSocket处理
  import { setupWebSocket } from './websocket/handler.js';

  dotenv.config();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',  // Vue 开发服务器地址
      methods: ['GET', 'POST']
    }
  });

  // 中间件
  app.use(helmet());  // 安全头部
  app.use(cors());    // 跨域
  app.use(morgan('dev'));  // 日志
  app.use(express.json());  // 解析 JSON
  app.use(express.urlencoded({ extended: true }));  // 解析 URL 编码
  app.use('/uploads', express.static('uploads'));  // 静态文件

  // 测试路由
  app.get('/', (req, res) => {
    res.json({
      message: '聊天应用 API 正在运行！',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        user: '/api/user',
        messages: '/api/messages'
      }
    });
  });

  // 数据库测试路由
  app.get('/api/test-db', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
      res.json({
        success: true,
        message: '数据库连接正常',
        userCount: rows[0].count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // API 路由
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/messages', messageRoutes);

  // WebSocket 初始化
  setupWebSocket(io);

  // 404 处理
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: '路由不存在'
    });
  });

  // 错误处理中间件
  app.use((err, req, res, next) => {
    console.error('错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // 启动服务器
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`� 服务器运行在 http://localhost:${PORT}`);
    console.log(`� WebSocket 运行在 ws://localhost:${PORT}`);
  });