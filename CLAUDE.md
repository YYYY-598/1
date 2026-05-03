# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

论坛系统，三端架构：用户端 Vue、管理端 Vue、后端 NestJS。当前前后端页面已完成，后端待开发。

## 常用命令

```bash
# 用户端前端（端口 3000，API 代理到 3001）
cd client && npm run dev

# 管理端前端（端口 3002，API 代理到 3001）
cd admin && npm run dev

# 构建验证
cd client && npx vite build
cd admin && npx vite build

# 数据库初始化（MySQL）
mysql -u root -p < docs/init.sql
```

## 架构要点

### 三端关系
- `client/` 用户端 (Vue 3 + Tailwind v4 + Lucide Icons)，无需登录可浏览，登录后可发帖/评论/点赞
- `admin/` 管理端 (Vue 3 + Tailwind v4)，深色侧边栏 + 浅色内容区布局，路由守卫拦截非 admin
- `server/` 后端 (NestJS + TypeORM + MySQL)，目录已建好（`server/src/`），代码待写

### 设计系统 — "墨纸" (Ink & Paper)
全局使用相同配色体系，定义在 `style.css` 的 `@theme` 块中：
- `--color-ink` (#1a1a18) 主文字，`--color-paper` (#faf8f5) 背景
- `--color-cinnabar` (#c44d34) 强调色（点赞、删除等交互），`--color-sage` (#4a7c82) 辅助色
- 字体：Serif 用于标题 (`font-serif`)，Sans 用于正文 (`font-sans`)
- 所有样式通过 Tailwind v4 CSS 变量引用，不要直接用硬编码颜色值

### 前端全局状态
- 用户端：`stores/useAuth.ts` — `useAuth()` composable，token 存 `localStorage('token')`，用户信息存 `localStorage('user')`
- 管理端：`stores/useAdminAuth.ts` — `useAdminAuth()` composable，key 为 `admin_token` / `admin_user`（与用户端隔离）

### API 约定
- 基础路径 `/api`，Token 通过 `Authorization: Bearer <token>` 携带
- 分页 query `?page=1&pageSize=10`，响应格式 `{ items, total, page, pageSize }`
- `request.ts` 中 Axios 拦截器已处理：请求自动注入 token，401 自动清除登录态
- 管理端 API 全部在 `/api/admin/*` 下，需 admin 角色

### 数据库（MySQL，字符集 utf8）
五张表：`user` → `board` / `post` / `comment` / `like`
- `post.like_count` 是冗余计数，点赞/取消时在 Like 表增删的同时更新
- `like` 表有 `UNIQUE(user_id, post_id)` 防重复
- 外键全部 `ON DELETE CASCADE`

### 点赞逻辑
Toggle 模式：POST `/api/posts/:id/like`，已赞则取消，未赞则点赞。响应返回 `{ liked: boolean, like_count: number }`，前端直接覆盖本地状态无需重新拉取帖子。

## 当前进度

| 模块 | 状态 |
|------|------|
| 设计文档 + SQL | 完成 |
| 用户端 Vue（5 页面 + 6 组件） | 完成，构建通过 |
| 管理端 Vue（5 页面 + 1 布局组件） | 完成，构建通过 |
| 后端 NestJS | **待开发**（目录已建，代码为空） |

后端开发顺序参考文档第九章：先搭 NestJS + TypeORM + 实体 → 认证模块 → 板块 → 帖子 → 评论 → 点赞 → 管理端 API。
