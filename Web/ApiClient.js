var ApiClient = (function () {
  'use strict';

  var BASE  = 'http://localhost:9999/api';
  var USER_KEY = 'sakura_user';
  var token = null;

  /* ---- 状态码解析 ---- */
  function parseStatus(res, data) {
    var code = res.status;
    if (code >= 200 && code < 300) return { ok: true,  status: code, data: data.data, message: data.message };
    if (code === 400) return { ok: false, status: 400, message: data.message || '参数错误' };
    if (code === 401) return { ok: false, status: 401, message: data.message || '认证失败' };
    if (code === 409) return { ok: false, status: 409, message: data.message || '数据冲突' };
    if (code >= 500) return { ok: false, status: 500, message: '服务异常，请稍后重试' };
    return { ok: false, status: code, message: '未知错误' };
  }

  /* ---- 通用请求 ---- */
  function request(method, path, body) {
    var opts = { method: method, headers: { 'Content-Type': 'application/json' } };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body) opts.body = JSON.stringify(body);

    return fetch(BASE + path, opts)
      .then(function (res) { return res.json().then(function (d) { return parseStatus(res, d); }); })
      .catch(function () { return { ok: false, status: 0, message: '网络异常' }; });
  }

  return {
    MIN_PW_LEN: 6,

    setToken: function (t) { token = t; },

    login: function (d)           { return request('POST', '/auth/login', d); },
    register: function (d)        { return request('POST', '/auth/register', d); },
    getUserProfile: function ()   { return request('GET', '/user/profile'); },
    getDashboardStats: function (){ return request('GET', '/dashboard/stats'); },
    logout: function ()           { return request('POST', '/auth/logout'); },
    forgotPassword: function (e)  { return request('POST', '/auth/forgot-password', { email: e }); },

    storage: {
      getUser: function () {
        try { return localStorage.getItem(USER_KEY); } catch (_) { return null; }
      },
      setUser: function (v) {
        try { localStorage.setItem(USER_KEY, v); } catch (_) {}
      },
      removeUser: function () {
        try { localStorage.removeItem(USER_KEY); } catch (_) {}
      }
    }
  };
})();
