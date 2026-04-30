(function () {
  'use strict';

  var displayName = document.getElementById('displayName');
  var greeting = document.getElementById('greeting');
  var logoutBtn = document.getElementById('logoutBtn');

  /* ---- Greeting based on time ---- */
  var hour = new Date().getHours();
  var greetText;
  if (hour < 6)       greetText = '深夜好';
  else if (hour < 9)  greetText = 'おはよう';
  else if (hour < 12) greetText = '上午好';
  else if (hour < 14) greetText = '中午好';
  else if (hour < 18) greetText = '下午好';
  else                greetText = 'こんばんは';

  greeting.textContent = greetText;

  /* ---- Display user name ---- */
  var user = '旅人';
  try {
    var saved = localStorage.getItem('sakura_user');
    if (saved) user = saved;
  } catch (_) {}
  displayName.textContent = user;

  /* ---- Logout ---- */
  logoutBtn.addEventListener('click', function () {
    try { localStorage.removeItem('sakura_user'); } catch (_) {}
    window.location.href = 'LoginPage.html';
  });
})();
