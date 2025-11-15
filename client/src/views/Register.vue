<template>
    <div class="register-container">
      <el-card class="register-card">
        <template #header>
          <div class="card-header">
            <h2>创建账号</h2>
          </div>
        </template>

        <el-form :model="registerForm" label-position="top">
          <el-form-item label="用户名">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="昵称（可选）">
            <el-input
              v-model="registerForm.nickname"
              placeholder="请输入昵称"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleRegister"
              style="width: 100%"
              :loading="loading"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>

        <div class="footer-text">
          已有账号？
          <router-link to="/login"
  class="link">立即登录</router-link>
        </div>
      </el-card>
    </div>
  </template>

  <script setup>
  import { reactive, ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { User, Message, Lock } from '@element-plus/icons-vue';       

  const registerForm = reactive({
    username: '',
    email: '',
    password: '',
    nickname: ''
  });

  const loading = ref(false);

  const handleRegister = () => {
    loading.value = true;

    setTimeout(() => {
      loading.value = false;
      ElMessage.info('⏳ 注册功能敬请期待...');
    }, 1000);
  };
  </script>

  <style scoped>
  .register-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);     
  }

  .register-card {
    width: 420px;
  }

  .card-header h2 {
    margin: 0;
    text-align: center;
    color: #303133;
  }

  .footer-text {
    text-align: center;
    margin-top: 20px;
    color: #606266;
  }

  .link {
    color: #409eff;
    text-decoration: none;
  }

  .link:hover {
    text-decoration: underline;
  }
  </style>