 <template>
    <div class="login-container">
      <el-card class="login-card">
        <template #header>
          <div class="card-header">
            <h2>欢迎登录</h2>
          </div>
        </template>

        <el-form :model="loginForm" label-position="top">
          <el-form-item label="邮箱">
            <el-input
              v-model="loginForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              style="width: 100%"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider>或</el-divider>

        <el-button @click="handleGoogleLogin" style="width: 100%">     
          <el-icon><Connection /></el-icon>
          <span style="margin-left: 8px;">Google
  登录（敬请期待）</span>
        </el-button>

        <div class="footer-text">
          还没有账号？
          <router-link to="/register"
  class="link">立即注册</router-link>
        </div>
      </el-card>
    </div>
  </template>

  <script setup>
  import { reactive, ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { Connection, Message, Lock } from
  '@element-plus/icons-vue';

  const loginForm = reactive({
    email: '',
    password: ''
  });

  const loading = ref(false);

  const handleLogin = () => {
    loading.value = true;

    setTimeout(() => {
      loading.value = false;
      ElMessage.info('⏳ 登录功能敬请期待...');
    }, 1000);
  };

  const handleGoogleLogin = () => {
    ElMessage.warning('� Google 登录功能开发中！');
  };
  </script>

  <style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);     
  }

  .login-card {
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