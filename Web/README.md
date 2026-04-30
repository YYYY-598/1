# Web

樱花风登录注册系统，纯 HTML/CSS/JS，无框架依赖。

## 页面

| 文件 | 功能 |
|------|------|
| `LoginPage.html` | 登录 — 邮箱/用户名 + 密码，记住我，忘记密码 |
| `RegisterPage.html` | 注册 — 用户名 + 邮箱 + 密码 + 确认密码，密码强度计 |
| `IndexPage.html` | 仪表盘 — 时段问候，统计卡片，最近活动，退出登录 |

页面流：`LoginPage` ↔ `RegisterPage` → `IndexPage` → `LoginPage`

## 接口需求

Base: `/api`

### 注册

```
POST /auth/register
{"username":"","email":"","password":"","confirmPassword":""}

→ 201 {"code":201,"data":{"userId":1001}}
→ 400 {"code":400,"message":"用户名已存在"}
```

### 登录

```
POST /auth/login
{"login":"","password":"","remember":true}

→ 200 {"code":200,"data":{"userId":1001,"token":"jwt...","expiresIn":86400}}
→ 401 {"code":401,"message":"用户名或密码错误"}
```

### 用户信息

```
GET /user/profile
Authorization: Bearer <token>

→ 200 {"code":200,"data":{"userId":1001,"username":"","email":""}}
```

### 仪表盘

```
GET /dashboard/stats
Authorization: Bearer <token>

→ 200 {"code":200,"data":{"activeUsers":1284,"uptime":99.9,"activeTasks":42,"recentActivity":[...]}}
```

### 退出

```
POST /auth/logout
Authorization: Bearer <token>

→ 200 {"code":200,"message":"退出成功"}
```

### 忘记密码

```
POST /auth/forgot-password
{"email":""}

→ 200 {"code":200,"message":"重置链接已发送"}
```

### 状态码

| 码 | 前端处理 |
|----|----------|
| 200 | 正常 |
| 400 | 字段标红 + 显示 message |
| 401 | 聚焦密码框 + 提示错误 |
| 409 | 用户名/邮箱标红 |
| 500 | 全局提示「服务异常」 |

## 数据库

```sql
CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(32) NOT NULL UNIQUE,
    email      VARCHAR(128) NOT NULL UNIQUE,
    password   VARCHAR(256) NOT NULL COMMENT 'bcrypt',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 设计

二次元樱花风 · 标题 ZCOOL XiaoWei · 正文 Noto Sans SC · 主色暖粉渐变 `#fce4ec` · 强调 `#ec407a` · 12 片 CSS 花瓣飘落

## 文件

```
shared.css         公共变量/重置/花瓣动画/表单/按钮
LoginPage.html     登录结构（左装饰+右卡片）
LoginPage.css      登录布局
LoginPage.js       登录逻辑（校验/记住我/模拟提交）
RegisterPage.html  注册结构（左卡片+右装饰）
RegisterPage.css   注册布局
RegisterPage.js    注册逻辑（校验/强度计/模拟提交）
IndexPage.html     仪表盘结构
IndexPage.css      仪表盘布局
IndexPage.js       问候语/用户名/退出
```

## 预览

```bash
cd Web && python3 -m http.server 8080
# → http://localhost:8080/LoginPage.html
```
