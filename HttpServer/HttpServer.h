#pragma once
#include <string>

class HttpServer {
public:
    static void handle(int fd);

private:
    static bool readAll(int fd, std::string& out);
    static void sendResp(int fd, int code, const std::string& body);
    static void sendJson(int fd, int code, const std::string& json);

    static void route(int fd, const std::string& method,
                      const std::string& path, const std::string& body);

    static void handleRegister(int fd, const std::string& body);
    static void handleLogin(int fd, const std::string& body);
    static void handleUserProfile(int fd);
    static void handleDashboardStats(int fd);
    static void handleLogout(int fd);
    static void handleForgotPassword(int fd, const std::string& body);
};
