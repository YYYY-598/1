(function () {
  'use strict';

  var displayName = document.getElementById('displayName');
  var greeting = document.getElementById('greeting');
  var logoutBtn = document.getElementById('logoutBtn');

  var hour = new Date().getHours();
  var greetText;
  if (hour < 6)       greetText = '深夜好';
  else if (hour < 9)  greetText = 'おはよう';
  else if (hour < 12) greetText = '上午好';
  else if (hour < 14) greetText = '中午好';
  else if (hour < 18) greetText = '下午好';
  else                greetText = 'こんばんは';
  greeting.textContent = greetText;

  displayName.textContent = ApiClient.storage.getUser() || '旅人';

  function loadStats() {
    ApiClient.getDashboardStats().then(function (res) {
      if (!res.ok || !res.data) return;

      var cards = document.querySelectorAll('.stat-value');
      if (cards.length >= 1) cards[0].textContent = Number(res.data.activeUsers || 0).toLocaleString();
      if (cards.length >= 2) cards[1].textContent = (res.data.uptime || 0) + '%';
      if (cards.length >= 3) cards[2].textContent = res.data.activeTasks || 0;

      var list = document.querySelector('.activity-list');
      if (!list || !res.data.recentActivity) return;

      list.innerHTML = '';
      res.data.recentActivity.forEach(function (item, i) {
        var li = document.createElement('div');
        li.className = 'activity-item';

        var dot = document.createElement('div');
        dot.className = i === 0 ? 'activity-dot' : 'activity-dot activity-dot--muted';
        li.appendChild(dot);

        var content = document.createElement('div');
        content.className = 'activity-content';

        var text = document.createElement('span');
        text.className = 'activity-text';
        text.textContent = item.action || '';
        content.appendChild(text);

        var time = document.createElement('span');
        time.className = 'activity-time';
        time.textContent = item.time || '';
        content.appendChild(time);

        li.appendChild(content);
        list.appendChild(li);
      });
    }).catch(function () { /* 仪表盘数据加载失败，保持静态占位 */ });
  }

  loadStats();

  logoutBtn.addEventListener('click', function () {
    ApiClient.logout().then(function () {
      ApiClient.storage.removeUser();
      window.location.href = 'LoginPage.html';
    }).catch(function () {
      ApiClient.storage.removeUser();
      window.location.href = 'LoginPage.html';
    });
  });
})();
