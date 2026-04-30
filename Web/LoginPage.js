(function () {
  'use strict';

  var form = document.getElementById('loginForm');
  var loginInput = document.getElementById('login');
  var passwordInput = document.getElementById('password');
  var loginError = document.getElementById('loginError');
  var passwordError = document.getElementById('passwordError');
  var togglePwBtn = document.getElementById('togglePw');
  var submitBtn = document.getElementById('submitBtn');
  var btnText = submitBtn.querySelector('.btn-text');
  var rememberCb = document.getElementById('remember');
  var forgotBtn = document.getElementById('forgotBtn');

  var MIN_LEN = ApiClient.MIN_PW_LEN;

  togglePwBtn.addEventListener('click', function () {
    var showing = passwordInput.type === 'password';
    passwordInput.type = showing ? 'text' : 'password';
    togglePwBtn.classList.toggle('show', showing);
    togglePwBtn.setAttribute('aria-label', showing ? '隐藏密码' : '显示密码');
  });

  function showError(input, errorEl, msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
    input.classList.add('error');
    input.classList.remove('success');
  }

  function clearFieldError(input, errorEl) {
    errorEl.classList.remove('visible');
    input.classList.remove('error');
    input.classList.add('success');
  }

  function clearAllErrors() {
    [loginError, passwordError].forEach(function (el) { el.classList.remove('visible'); });
    [loginInput, passwordInput].forEach(function (el) { el.classList.remove('error', 'success'); });
  }

  loginInput.addEventListener('blur', function () {
    var val = loginInput.value.trim();
    if (!val) return showError(loginInput, loginError, '请输入邮箱或用户名');
    clearFieldError(loginInput, loginError);
  });

  passwordInput.addEventListener('blur', function () {
    var val = passwordInput.value;
    if (!val) return showError(passwordInput, passwordError, '请输入密码');
    if (val.length < MIN_LEN) return showError(passwordInput, passwordError, '密码长度至少' + MIN_LEN + '位');
    clearFieldError(passwordInput, passwordError);
  });

  loginInput.addEventListener('input', function () {
    if (loginInput.value.trim() && loginError.classList.contains('visible')) {
      clearFieldError(loginInput, loginError);
    }
  });

  passwordInput.addEventListener('input', function () {
    if (passwordInput.value.length >= MIN_LEN && passwordError.classList.contains('visible')) {
      clearFieldError(passwordInput, passwordError);
    }
  });

  forgotBtn.addEventListener('click', function () {
    var email = loginInput.value.trim();
    if (!email) { showError(loginInput, loginError, '请先输入邮箱地址'); return; }
    ApiClient.forgotPassword(email).then(function (res) {
      if (res.ok) {
        submitBtn.classList.add('success-state');
        btnText.textContent = '已发送';
        setTimeout(function () { submitBtn.classList.remove('success-state'); btnText.textContent = '登 录'; }, 2000);
      } else {
        showError(loginInput, loginError, res.message);
      }
    }).catch(function () {
      showError(loginInput, loginError, '网络异常');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors();

    var loginVal = loginInput.value.trim();
    var passwordVal = passwordInput.value;
    var valid = true;

    if (!loginVal)  { showError(loginInput, loginError, '请输入邮箱或用户名'); valid = false; }
    if (!passwordVal) { showError(passwordInput, passwordError, '请输入密码'); valid = false; }
    else if (passwordVal.length < MIN_LEN) {
      showError(passwordInput, passwordError, '密码长度至少' + MIN_LEN + '位'); valid = false;
    }

    if (!valid) {
      if (loginInput.classList.contains('error')) loginInput.focus();
      else if (passwordInput.classList.contains('error')) passwordInput.focus();
      return;
    }

    submitBtn.classList.add('loading');

    ApiClient.login({ login: loginVal, password: passwordVal, remember: rememberCb.checked })
      .then(function (res) {
        submitBtn.classList.remove('loading');
        if (res.ok) {
          if (rememberCb.checked) ApiClient.storage.setUser(loginVal);
          else ApiClient.storage.removeUser();
          if (res.data && res.data.token) ApiClient.setToken(res.data.token);
          submitBtn.classList.add('success-state');
          btnText.textContent = '欢迎回来';
          setTimeout(function () { window.location.href = 'IndexPage.html'; }, 600);
        } else {
          showError(passwordInput, passwordError, res.message);
          passwordInput.focus();
        }
      }).catch(function () {
        submitBtn.classList.remove('loading');
        showError(passwordInput, passwordError, '网络异常');
      });
  });

  var saved = ApiClient.storage.getUser();
  if (saved) { loginInput.value = saved; rememberCb.checked = true; }
})();
