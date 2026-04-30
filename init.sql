-- Horizon 数据库初始化
-- mysql -u root -p < init.sql

CREATE DATABASE IF NOT EXISTS horizon
  DEFAULT CHARACTER SET utf8
  COLLATE utf8_unicode_ci;

USE horizon;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(32)  NOT NULL,
    email      VARCHAR(128) NOT NULL,
    password   VARCHAR(256) NOT NULL COMMENT 'bcrypt hash',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 登录日志
CREATE TABLE IF NOT EXISTS login_logs (
    id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id  INT UNSIGNED NOT NULL,
    ip       VARCHAR(45) NOT NULL DEFAULT '',
    login_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_id (user_id),
    KEY idx_login_at (login_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
