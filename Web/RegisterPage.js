(function () {
  'use strict';

  var form = document.getElementById('registerForm');
  var usernameInput = document.getElementById('username');
  var emailInput = document.getElementById('email');
  var passwordInput = document.getElementById('password');
  var confirmPasswordInput = document.getElementById('confirmPassword');
  var usernameError = document.getElementById('usernameError');
  var emailError = document.getElementById('emailError');
  var passwordError = document.getElementById('passwordError');
  var confirmPasswordError = document.getElementById('confirmPasswordError');
  var togglePwBtn = document.getElementById('togglePw');
  var submitBtn = document.getElementById('submitBtn');
  var btnText = submitBtn.querySelector('.btn-text');
  var strengthFill = document.getElementById('strengthFill');
  var strengthText = document.getElementById('strengthText');
  var strengthBar = document.getElementById('strengthBar');

  var MIN_PW_LEN = 6;
  var fields = [usernameInput, emailInput, passwordInput, confirmPasswordInput];
  var errors = [usernameError, emailError, passwordError, confirmPasswordError];

  /* ---- Password visibility toggle ---- */
  togglePwBtn.addEventListener('click', function () {
    var showing = passwordInput.type === 'password';
    passwordInput.type = showing ? 'text' : 'password';
    confirmPasswordInput.type = showing ? 'text' : 'password';
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
    errors.forEach(function (el) { el.classList.remove('visible'); });
    fields.forEach(function (el) { el.classList.remove('error', 'success'); });
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  /* ---- Password strength meter ---- */
  passwordInput.addEventListener('input', function () {
    var val = passwordInput.value;
    if (!val) {
      strengthFill.style.width = '0';
      strengthText.textContent = '';
      strengthBar.setAttribute('aria-valuenow', '0');
      return;
    }

    var score = 0;
    if (val.length >= MIN_PW_LEN) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    var pct = Math.min((score / 5) * 100, 100);
    strengthFill.style.width = pct + '%';
    strengthBar.setAttribute('aria-valuenow', String(Math.round(pct)));

    if (score <= 1) {
      strengthFill.style.background = 'var(--error)';
      strengthText.textContent = '弱';
      strengthText.style.color = 'var(--error)';
    } else if (score <= 3) {
      strengthFill.style.background = '#f4a261';
      strengthText.textContent = '中等';
      strengthText.style.color = '#e76f51';
    } else {
      strengthFill.style.background = 'var(--success)';
      strengthText.textContent = '强';
      strengthText.style.color = 'var(--success)';
    }
  });

  /* ---- Blur validations ---- */
  usernameInput.addEventListener('blur', function () {
    var val = usernameInput.value.trim();
    if (!val) return showError(usernameInput, usernameError, '请输入用户名');
    if (val.length < 2) return showError(usernameInput, usernameError, '用户名至少2个字符');
    clearFieldError(usernameInput, usernameError);
  });

  emailInput.addEventListener('blur', function () {
    var val = emailInput.value.trim();
    if (!val) return showError(emailInput, emailError, '请输入邮箱地址');
    if (!isValidEmail(val)) return showError(emailInput, emailError, '邮箱格式不正确');
    clearFieldError(emailInput, emailError);
  });

  passwordInput.addEventListener('blur', function () {
    var val = passwordInput.value;
    if (!val) return showError(passwordInput, passwordError, '请输入密码');
    if (val.length < MIN_PW_LEN) return showError(passwordInput, passwordError, '密码长度至少' + MIN_PW_LEN + '位');
    clearFieldError(passwordInput, passwordError);
  });

  confirmPasswordInput.addEventListener('blur', function () {
    var val = confirmPasswordInput.value;
    if (!val) return showError(confirmPasswordInput, confirmPasswordError, '请确认密码');
    if (val !== passwordInput.value) return showError(confirmPasswordInput, confirmPasswordError, '两次密码不一致');
    clearFieldError(confirmPasswordInput, confirmPasswordError);
  });

  /* ---- Submit ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors();

    var usernameVal = usernameInput.value.trim();
    var emailVal = emailInput.value.trim();
    var passwordVal = passwordInput.value;
    var confirmVal = confirmPasswordInput.value;
    var valid = true;

    if (!usernameVal) {
      showError(usernameInput, usernameError, '请输入用户名');
      valid = false;
    } else if (usernameVal.length < 2) {
      showError(usernameInput, usernameError, '用户名至少2个字符');
      valid = false;
    }

    if (!emailVal) {
      showError(emailInput, emailError, '请输入邮箱地址');
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      showError(emailInput, emailError, '邮箱格式不正确');
      valid = false;
    }

    if (!passwordVal) {
      showError(passwordInput, passwordError, '请输入密码');
      valid = false;
    } else if (passwordVal.length < MIN_PW_LEN) {
      showError(passwordInput, passwordError, '密码长度至少' + MIN_PW_LEN + '位');
      valid = false;
    }

    if (!confirmVal) {
      showError(confirmPasswordInput, confirmPasswordError, '请确认密码');
      valid = false;
    } else if (confirmVal !== passwordVal) {
      showError(confirmPasswordInput, confirmPasswordError, '两次密码不一致');
      valid = false;
    }

    if (!valid) {
      fields.some(function (f) {
        if (f.classList.contains('error')) { f.focus(); return true; }
        return false;
      });
      return;
    }

    submitBtn.classList.add('loading');

    setTimeout(function () {
      submitBtn.classList.remove('loading');
      submitBtn.classList.add('success-state');
      btnText.textContent = '注册成功 ✿';

      setTimeout(function () {
        window.location.href = 'IndexPage.html';
      }, 600);
    }, 1200);
  });
})();
