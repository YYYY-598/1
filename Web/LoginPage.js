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

  var MIN_PW_LEN = 6;

  /* ---- Password visibility toggle ---- */
  togglePwBtn.addEventListener('click', function () {
    var showing = passwordInput.type === 'password';
    passwordInput.type = showing ? 'text' : 'password';
    togglePwBtn.classList.toggle('show', showing);
    togglePwBtn.setAttribute('aria-label', showing ? '隐藏密码' : '显示密码');
  });

  /* ---- Validation helpers ---- */
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

  /* ---- Real-time validation on blur ---- */
  loginInput.addEventListener('blur', function () {
    var val = loginInput.value.trim();
    if (!val) return showError(loginInput, loginError, '请输入邮箱或用户名');
    clearFieldError(loginInput, loginError);
  });

  passwordInput.addEventListener('blur', function () {
    var val = passwordInput.value;
    if (!val) return showError(passwordInput, passwordError, '请输入密码');
    if (val.length < MIN_PW_LEN) return showError(passwordInput, passwordError, '密码长度至少' + MIN_PW_LEN + '位');
    clearFieldError(passwordInput, passwordError);
  });

  /* ---- Clear errors on input ---- */
  loginInput.addEventListener('input', function () {
    if (loginInput.value.trim() && loginError.classList.contains('visible')) {
      clearFieldError(loginInput, loginError);
    }
  });

  passwordInput.addEventListener('input', function () {
    if (passwordInput.value.length >= MIN_PW_LEN && passwordError.classList.contains('visible')) {
      clearFieldError(passwordInput, passwordError);
    }
  });

  /* ---- Forgot password ---- */
  forgotBtn.addEventListener('click', function () {
    var email = loginInput.value.trim();
    if (email) {
      alert('如果账户 "' + email + '" 存在，重置链接已发送至关联邮箱。（演示模式）');
    } else {
      alert('请先输入您的邮箱地址。（演示模式）');
    }
  });

  /* ---- Submit ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors();

    var loginVal = loginInput.value.trim();
    var passwordVal = passwordInput.value;
    var valid = true;

    if (!loginVal) {
      showError(loginInput, loginError, '请输入邮箱或用户名');
      valid = false;
    }

    if (!passwordVal) {
      showError(passwordInput, passwordError, '请输入密码');
      valid = false;
    } else if (passwordVal.length < MIN_PW_LEN) {
      showError(passwordInput, passwordError, '密码长度至少' + MIN_PW_LEN + '位');
      valid = false;
    }

    if (!valid) {
      if (loginInput.classList.contains('error')) loginInput.focus();
      else if (passwordInput.classList.contains('error')) passwordInput.focus();
      return;
    }

    submitBtn.classList.add('loading');

    setTimeout(function () {
      if (rememberCb.checked) {
        try { localStorage.setItem('sakura_user', loginVal); } catch (_) {}
      } else {
        try { localStorage.removeItem('sakura_user'); } catch (_) {}
      }

      submitBtn.classList.remove('loading');
      submitBtn.classList.add('success-state');
      btnText.textContent = '欢迎回来 ✿';

      setTimeout(function () {
        window.location.href = 'IndexPage.html';
      }, 600);
    }, 1000);
  });

  /* ---- Restore remembered user ---- */
  try {
    var saved = localStorage.getItem('sakura_user');
    if (saved) {
      loginInput.value = saved;
      rememberCb.checked = true;
    }
  } catch (_) {}
})();
