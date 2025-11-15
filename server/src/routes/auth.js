 import express from 'express';
  import { register, login, logout } from '../controllers/authController.js';

  const router = express.Router();

  // 注册
  router.post('/register', register);

  // 登录
  router.post('/login', login);

  // 登出
  router.post('/logout', logout);

  export default router;