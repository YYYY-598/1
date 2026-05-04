-- 论坛数据库初始化脚本
-- 使用前先手动创建数据库：CREATE DATABASE forum CHARACTER SET utf8 COLLATE utf8_unicode_ci;

USE forum;

-- ============================================================
-- 用户
-- ============================================================
CREATE TABLE user (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
    role        ENUM('user','admin') NOT NULL DEFAULT 'user',
    is_banned   TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- 板块
-- ============================================================
CREATE TABLE board (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(200) NOT NULL DEFAULT '',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- 帖子
-- ============================================================
CREATE TABLE post (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    content     TEXT         NOT NULL,
    user_id     INT          NOT NULL,
    board_id    INT          NOT NULL,
    like_count  INT          NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)  REFERENCES user(id)  ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES board(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- 评论
-- ============================================================
CREATE TABLE comment (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    content     TEXT     NOT NULL,
    user_id     INT      NOT NULL,
    post_id     INT      NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- 点赞（user_id + post_id 联合唯一，防重复点赞）
-- ============================================================
CREATE TABLE post_like (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT      NOT NULL,
    post_id     INT      NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_user_post (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- 增量变更：用户个人中心字段
-- 已执行过旧版 init.sql 时，继续执行下面语句即可
-- ============================================================
ALTER TABLE user
    ADD COLUMN avatar_url VARCHAR(255) NOT NULL DEFAULT '' AFTER is_banned,
    ADD COLUMN signature VARCHAR(200) NOT NULL DEFAULT '' AFTER avatar_url;
