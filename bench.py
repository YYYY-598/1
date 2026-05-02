#!/usr/bin/env python3
"""HTTP 并发压测脚本 — 测试 /api/auth/logout（无 DB 开销）"""
import socket
import time
import threading
import sys

HOST = "127.0.0.1"
PORT = 9999
REQ = (
    b"POST /api/auth/logout HTTP/1.1\r\n"
    b"Host: localhost\r\n"
    b"Content-Length: 0\r\n"
    b"\r\n"
)

def worker(requests_per_thread, result_list, idx):
    """每个线程发送 requests_per_thread 个请求"""
    latencies = []
    for _ in range(requests_per_thread):
        t0 = time.time()
        s = socket.socket()
        try:
            s.connect((HOST, PORT))
            s.sendall(REQ)
            s.recv(4096)
        except Exception as e:
            latencies.append(-1)  # 失败标记
        finally:
            s.close()
        latencies.append(time.time() - t0)
    result_list[idx] = latencies

def run(c, n):
    """c 并发数, n 总请求数"""
    per = n // c
    threads = []
    results = [None] * c

    t0 = time.time()
    for i in range(c):
        t = threading.Thread(target=worker, args=(per, results, i))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()
    elapsed = time.time() - t0

    # 汇总
    all_lat = []
    fails = 0
    for r in results:
        for lat in r:
            if lat < 0:
                fails += 1
            else:
                all_lat.append(lat)

    if not all_lat:
        print(f"  c={c:3d}  全部失败")
        return

    all_lat.sort()
    total = len(all_lat)
    avg = sum(all_lat) / total
    p50 = all_lat[total // 2]
    p99 = all_lat[int(total * 0.99)]
    qps = int(total / elapsed)

    print(f"  c={c:3d}  qps={qps:6d}  avg={avg*1000:5.1f}ms  p50={p50*1000:5.1f}ms  p99={p99*1000:5.1f}ms  fail={fails}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        levels = [int(x) for x in sys.argv[1:]]
    else:
        levels = [1, 10, 50, 100, 200, 500]

    print("压测 /api/auth/logout")
    print("=" * 55)
    for c in levels:
        run(c, max(c * 10, 100))
