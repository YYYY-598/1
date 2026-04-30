#pragma once
#include <iostream>
#include <mysql.h>
#include <chrono>
using namespace std;
using namespace chrono;
class MysqlConn
{
public:

    MysqlConn();

    ~MysqlConn();

    bool connect(string user, string passwd, string dbName, string ip, unsigned short port = 3306);
    
    bool update(string sql);
    
    bool query(string sql);

    bool next();

    string value(int index);

    bool transaction();

    bool commit();

    bool rollback();

    void refreshAliveTime();

    long long getAliveTime();
private:
    void freeResult();
    MYSQL* m_conn = nullptr;
    MYSQL_RES* m_result = nullptr;
    MYSQL_ROW m_row = nullptr;
    steady_clock::time_point m_alivetime;
};

