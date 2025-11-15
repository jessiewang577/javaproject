import request from '../utils/request';

  export function register(data) {
    // 注册
        return request({
        url: '/auth/register',    // 不需要完整 URL，request.js 里已经配置了 baseURL
        method: 'POST',
        data: {
        username: data.username,
        email: data.email,
        password: data.password,
        nickname: data.nickname
        }
    });
    }

    // 登录
    export function login(data) {
      return axios.post(`${API_BASE}/auth/login`, data);
    }

    // 登出
    export function logout() {
        return request({
            url: '/auth/logout',
            method: 'POST'
        });
    // 不需要手动传 token，request.js 的拦截器会自动添加
    }

    // Google 登录（占位符）
    googleLogin: () => {
      // TODO: 实现 Google OAuth 登录
      window.location.href = `${API_BASE}/auth/google`;
    }