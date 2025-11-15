import express from 'express';
  import { authenticateToken } from '../middlewares/auth.js';
  import User from '../models/User.js';

  const router = express.Router();

  // 所有路由都需要认证
  router.use(authenticateToken);

  /**
   * 获取当前用户信息
   * GET /api/user/profile
   */
  router.get('/profile', async (req, res) => {
    try {
      // req.user 由 authenticateToken 中间件提供
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  });

  /**
   * 更新用户个人资料
   * PUT /api/user/profile
   */
  router.put('/profile', async (req, res) => {
    try {
      const { nickname, age, bio, avatar_url } = req.body;
      const userId = req.user.id;

      // 构建更新对象
      const updates = {};
      if (nickname !== undefined) updates.nickname = nickname;
      if (age !== undefined) updates.age = age;
      if (bio !== undefined) updates.bio = bio;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;

      // 更新用户信息
      await User.update(userId, updates);

      // 获取更新后的用户信息
      const updatedUser = await User.findById(userId);

      res.json({
        success: true,
        message: '个人资料更新成功',
        user: updatedUser
      });
    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误',
        error: error.message
      });
    }
  });

  export default router;