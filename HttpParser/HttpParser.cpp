#include "HttpParser.h"
#include <sstream>
#include <cstdlib>
using namespace std;

HttpParser::HttpParser() { reset(); }

void HttpParser::reset()
{
    m_state = PARSE_REQ_LINE;
    m_req = HttpRequest{};
    m_buf.clear();
    m_bodyPart.clear();
    m_bodyNeed = 0;
}

void HttpParser::parseReqLine(const string& line)
{
    istringstream ss(line);
    ss >> m_req.method >> m_req.path;
}

void HttpParser::parseHeader(const string& line)
{
    size_t pos = line.find(':');
    if (pos == string::npos) return;
    string key = line.substr(0, pos);
    // Content-Length: 123
    if (key == "Content-Length" || key == "content-length") {
        m_req.contentLen = atoi(line.c_str() + pos + 2);
    }
}

HttpState HttpParser::feed(const char* data, size_t len)
{
    m_buf.append(data, len);

    if (m_state == PARSE_BODY) {
        // body 不经过行解析，直接按字节累积
        size_t take = min((size_t)m_bodyNeed, m_buf.size());
        m_bodyPart.append(m_buf, 0, take);
        m_buf.erase(0, take);
        m_bodyNeed -= take;
        if (m_bodyNeed <= 0) {
            m_req.body = m_bodyPart;
            m_state = PARSE_DONE;
        }
        return m_state;
    }

    // 按行解析（REQ_LINE / HEADERS）
    while (true) {
        size_t crlf = m_buf.find("\r\n");
        if (crlf == string::npos) break;

        string line = m_buf.substr(0, crlf);
        m_buf.erase(0, crlf + 2);

        if (m_state == PARSE_REQ_LINE) {
            if (line.empty()) { m_state = PARSE_ERR; return m_state; }
            parseReqLine(line);
            m_state = PARSE_HEADERS;
        } else if (m_state == PARSE_HEADERS) {
            if (line.empty()) {
                // 空行 → headers 结束
                if (m_req.contentLen > 0) {
                    m_state = PARSE_BODY;
                    m_bodyNeed = m_req.contentLen;
                    // 检查 buf 中是否已经有 body 数据
                    if (!m_buf.empty()) {
                        size_t take = min((size_t)m_bodyNeed, m_buf.size());
                        m_bodyPart.append(m_buf, 0, take);
                        m_buf.erase(0, take);
                        m_bodyNeed -= take;
                        if (m_bodyNeed <= 0) {
                            m_req.body = m_bodyPart;
                            m_state = PARSE_DONE;
                        }
                    }
                } else {
                    m_state = PARSE_DONE;
                }
                return m_state;
            }
            parseHeader(line);
        }
    }
    return m_state;
}
