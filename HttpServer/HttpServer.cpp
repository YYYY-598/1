#include "HttpServer.h"
#include "../HttpParser/HttpParser.h"
#include "../ConnectionPool/ConnectionPool.h"
#include <unistd.h>
#include <json/json.h>
#include <iostream>
using namespace std;

static const int MIN_PW    = 6;
static const int TOKEN_TTL = 86400;

/* ---- 工具 ---- */

static string esc(const string& s) {
    string o; o.reserve(s.size() + 8);
    for (char c : s) { if (c == '\'' || c == '\\') o += c; o += c; }
    return o;
}

static int safeInt(const string& s, int fb = 0) {
    try { return stoi(s); } catch (...) { return fb; }
}

static string jwt(int uid) {
    return "jwt_" + to_string(uid);
}

static void err(int fd, int code, const string& msg) {
    char buf[256];
    int n = snprintf(buf, sizeof(buf),
        "HTTP/1.1 %d\r\nContent-Type: application/json; charset=utf-8\r\n"
        "Content-Length: %zu\r\nConnection: close\r\n\r\n"
        "{\"code\":%d,\"message\":\"%s\",\"data\":null}",
        code, 50 + msg.size(), code, msg.c_str());
    send(fd, buf, n, 0);
}

static void ok(int fd, int code, const Json::Value& v) {
    Json::StreamWriterBuilder w;
    string body = Json::writeString(w, v);
    char hdr[128];
    int n = snprintf(hdr, sizeof(hdr),
        "HTTP/1.1 %d\r\nContent-Type: application/json; charset=utf-8\r\n"
        "Content-Length: %zu\r\nConnection: close\r\n\r\n",
        code, body.size());
    send(fd, hdr, n, 0);
    send(fd, body.c_str(), body.size(), 0);
}

static bool parse(const string& raw, Json::Value& v) {
    Json::CharReaderBuilder b;
    string e;
    istringstream ss(raw);
    return Json::parseFromStream(b, ss, &v, &e);
}

/* ---- 主入口 ---- */

void HttpServer::handle(int fd)
{
    // 读全部数据
    string raw;
    if (!readAll(fd, raw)) { err(fd, 400, "读取请求失败"); return; }

    // 状态机解析
    HttpParser p;
    p.feed(raw.c_str(), raw.size());
    if (p.error() || !p.done()) { err(fd, 400, "请求解析失败"); return; }

    auto& req = p.req();
    route(fd, req.method, req.path, req.body);
}

bool HttpServer::readAll(int fd, string& out)
{
    char buf[4096];
    out.clear();
    while (true) {
        ssize_t n = recv(fd, buf, sizeof(buf), 0);
        if (n < 0)  return !out.empty();
        if (n == 0) return !out.empty();
        out.append(buf, n);
        // 简单判断：如果 body 收完了就停
        size_t hdrEnd = out.find("\r\n\r\n");
        if (hdrEnd == string::npos) continue;
        // 找 Content-Length
        size_t cl = out.find("Content-Length:");
        if (cl == string::npos) cl = out.find("content-length:");
        if (cl == string::npos) return true;
        int len = atoi(out.c_str() + cl + 15);
        if ((int)(out.size() - hdrEnd - 4) >= len) return true;
    }
}

void HttpServer::route(int fd, const string& method,
                       const string& path, const string& body)
{
    if (method == "POST" && path == "/api/auth/register")
        handleRegister(fd, body);
    else if (method == "POST" && path == "/api/auth/login")
        handleLogin(fd, body);
    else if (method == "GET" && path == "/api/user/profile")
        handleUserProfile(fd);
    else if (method == "GET" && path == "/api/dashboard/stats")
        handleDashboardStats(fd);
    else if (method == "POST" && path == "/api/auth/logout")
        handleLogout(fd);
    else if (method == "POST" && path == "/api/auth/forgot-password")
        handleForgotPassword(fd, body);
    else
        err(fd, 404, "接口不存在");
}

/* ---- POST /api/auth/register ---- */

void HttpServer::handleRegister(int fd, const string& body)
{
    Json::Value req;
    if (!parse(body, req)) { err(fd, 400, "JSON 格式错误"); return; }

    string u = esc(req["username"].asString());
    string e = esc(req["email"].asString());
    string p = esc(req["password"].asString());
    string c = esc(req["confirmPassword"].asString());

    if (u.empty() || e.empty() || p.empty()) { err(fd, 400, "参数不完整"); return; }
    if (p != c)  { err(fd, 400, "两次密码不一致"); return; }
    if (req["password"].asString().size() < MIN_PW) { err(fd, 400, "密码至少6位"); return; }

    auto db = ConnectionPool::getConnectPool()->getConnection();

    if (!db->query("SELECT id FROM users WHERE username='"+u+"' OR email='"+e+"' LIMIT 1"))
        { err(fd, 500, "数据库错误"); return; }
    if (db->next()) { err(fd, 409, "用户名或邮箱已存在"); return; }

    if (!db->update("INSERT INTO users (username,email,password) VALUES ('"+u+"','"+e+"','"+p+"')"))
        { err(fd, 500, "注册失败"); return; }

    db->query("SELECT LAST_INSERT_ID()");
    db->next();
    int uid = safeInt(db->value(0));

    Json::Value r;
    r["code"]=201; r["message"]="注册成功";
    r["data"]["userId"]=uid; r["data"]["username"]=req["username"];
    ok(fd, 201, r);
}

/* ---- POST /api/auth/login ---- */

void HttpServer::handleLogin(int fd, const string& body)
{
    Json::Value req;
    if (!parse(body, req)) { err(fd, 400, "JSON 格式错误"); return; }

    string login = esc(req["login"].asString());
    string pass  = req["password"].asString();

    if (login.empty() || pass.empty()) { err(fd, 400, "参数不完整"); return; }

    auto db = ConnectionPool::getConnectPool()->getConnection();

    if (!db->query("SELECT id,username,password FROM users WHERE username='"+login+"' OR email='"+login+"' LIMIT 1"))
        { err(fd, 500, "数据库错误"); return; }
    if (!db->next() || pass != db->value(2)) { err(fd, 401, "用户名或密码错误"); return; }

    int uid = safeInt(db->value(0));
    db->update("INSERT INTO login_logs (user_id) VALUES ("+to_string(uid)+")");

    Json::Value r;
    r["code"]=200; r["message"]="登录成功";
    r["data"]["userId"]=uid; r["data"]["username"]=db->value(1);
    r["data"]["token"]=jwt(uid); r["data"]["expiresIn"]=TOKEN_TTL;
    ok(fd, 200, r);
}

/* ---- GET /api/user/profile ---- */

void HttpServer::handleUserProfile(int fd) { err(fd, 401, "请先登录"); }

/* ---- GET /api/dashboard/stats ---- */

void HttpServer::handleDashboardStats(int fd)
{
    auto db = ConnectionPool::getConnectPool()->getConnection();
    Json::Value r, d;

    db->query("SELECT COUNT(*) FROM users");
    if (db->next()) d["activeUsers"] = safeInt(db->value(0));

    d["uptime"]=99.9; d["activeTasks"]=42;

    Json::Value acts(Json::arrayValue);
    db->query("SELECT user_id,login_at FROM login_logs ORDER BY login_at DESC LIMIT 3");
    while (db->next()) {
        Json::Value it;
        it["action"]="用户 "+db->value(0)+" 登录";
        it["time"]=db->value(1);
        acts.append(it);
    }
    d["recentActivity"]=acts;
    r["code"]=200; r["message"]="OK"; r["data"]=d;
    ok(fd, 200, r);
}

/* ---- POST /api/auth/logout ---- */

void HttpServer::handleLogout(int fd)
{
    Json::Value r;
    r["code"]=200; r["message"]="退出成功"; r["data"]=Json::Value::nullSingleton();
    ok(fd, 200, r);
}

/* ---- POST /api/auth/forgot-password ---- */

void HttpServer::handleForgotPassword(int fd, const string& body)
{
    Json::Value req;
    if (!parse(body, req) || req["email"].asString().empty())
        { err(fd, 400, "请输入邮箱"); return; }

    Json::Value r;
    r["code"]=200; r["message"]="重置链接已发送"; r["data"]=Json::Value::nullSingleton();
    ok(fd, 200, r);
}
