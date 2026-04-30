#pragma once
#include <string>

enum HttpState {
    PARSE_REQ_LINE,   // "POST /api/login HTTP/1.1"
    PARSE_HEADERS,    // "Content-Type: ..."
    PARSE_BODY,       // JSON body
    PARSE_DONE,
    PARSE_ERR
};

struct HttpRequest {
    std::string method;
    std::string path;
    std::string body;
    int contentLen = 0;
};

class HttpParser {
public:
    HttpParser();
    void reset();
    HttpState feed(const char* data, size_t len);
    bool done() const { return m_state == PARSE_DONE; }
    bool error() const { return m_state == PARSE_ERR; }
    const HttpRequest& req() const { return m_req; }

private:
    void parseReqLine(const std::string& line);
    void parseHeader(const std::string& line);

    HttpState   m_state;
    HttpRequest m_req;
    std::string m_buf;       // 累积缓冲
    std::string m_bodyPart;  // body 分段累积
    int         m_bodyNeed;  // 还需要读多少字节
};
