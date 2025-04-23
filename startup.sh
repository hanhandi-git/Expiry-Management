#!/bin/bash

# 等待 Docker 服务启动
while ! docker info > /dev/null 2>&1; do
    echo "等待 Docker 服务启动..."
    sleep 5
done

# 切换到项目目录
cd /Users/diyuyi/code/Expiry-Management

# 启动容器
docker-compose up -d 