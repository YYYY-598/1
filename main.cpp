#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <fcntl.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/epoll.h>
#include "threadpool/ThreadPool.h"
#include "ConnectionPool/ConnectionPool.h"
#include "HttpServer/HttpServer.h"

#define PORT 9999
#define MAX_EVENTS 1024

struct TaskArg { int fd; int lfd; int epfd; };

int main()
{
    int lfd = socket(AF_INET, SOCK_STREAM, 0);
    if (lfd == -1) { perror("socket"); exit(1); }

    int opt = 1;
    setsockopt(lfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(PORT);
    addr.sin_addr.s_addr = htonl(INADDR_ANY);

    if (bind(lfd, (struct sockaddr*)&addr, sizeof(addr)) == -1)
        { perror("bind"); exit(1); }
    if (listen(lfd, 128) == -1)
        { perror("listen"); exit(1); }

    printf("[main] listening on :%d\n", PORT);

    int epfd = epoll_create(1);
    struct epoll_event ev, evs[MAX_EVENTS];
    ev.events = EPOLLIN;
    ev.data.fd = lfd;
    epoll_ctl(epfd, EPOLL_CTL_ADD, lfd, &ev);

    ThreadPool pool(4, 32);
    ConnectionPool::getConnectPool();

    while (1) {
        int n = epoll_wait(epfd, evs, MAX_EVENTS, -1);
        for (int i = 0; i < n; i++) {
            int fd = evs[i].data.fd;
            if (fd == lfd) {
                epoll_ctl(epfd, EPOLL_CTL_DEL, lfd, NULL);
                TaskArg* arg = new TaskArg{0, lfd, epfd};
                Task t1([](void* a) {
                    TaskArg* t = (TaskArg*)a;
                    while (1) {
                        int cfd = accept(t->lfd, NULL, NULL);
                        if (cfd < 0) break;
                        fcntl(cfd, F_SETFL, O_NONBLOCK);
                        struct epoll_event ev;
                        ev.events = EPOLLIN | EPOLLET;
                        ev.data.fd = cfd;
                        epoll_ctl(t->epfd, EPOLL_CTL_ADD, cfd, &ev);
                    }
                    struct epoll_event ev;
                    ev.events = EPOLLIN;
                    ev.data.fd = t->lfd;
                    epoll_ctl(t->epfd, EPOLL_CTL_ADD, t->lfd, &ev);
                    delete t;
                }, arg);
                pool.addTask(t1);
            } else {
                epoll_ctl(epfd, EPOLL_CTL_DEL, fd, NULL);
                TaskArg* arg = new TaskArg{fd, 0, 0};
                Task t2([](void* a) {
                    TaskArg* t = (TaskArg*)a;
                    HttpServer::handle(t->fd);
                    close(t->fd);
                    delete t;
                }, arg);
                pool.addTask(t2);
            }
        }
    }
    return 0;
}
