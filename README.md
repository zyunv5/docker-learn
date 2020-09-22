## master 只有 README.md

## react 分支

1. 打算只用 docker 构建一个前端页面应用
2. 目前来看，必须是 nginx+静态页面
3. 第一次成功启动 docker 解决了两个 bug
   3.1 一个是 npm run build 时失败，修改了 COPY react-app /app 以前是 COPY . /app 应该是没有找到文件夹
   3.2 nginx: [emerg] open() "/run/nginx/nginx.pid" failed (2: No such file or directory) nginx 启动报错 添加了这么一行 RUN mkdir -p /run/nginx

```yml
#基础镜像，这里选择的这个node 是因为build之后占用空间没有那么大 原本的FROM node:11 镜像过大
FROM node:9.2.1-alpine
# 设置环境变量
ENV PROJECT_ENV production
ENV NODE_ENV production
# 安装nginx
RUN apk update && \
    apk add --no-cache nginx
# 把 package.json package-lock.json 复制到/app目录下
# 为了npm install可以缓存
COPY ./react-app/package*.json /app/
# 切换到app目录
WORKDIR /app
# 安装依赖
RUN npm install --registry=https://registry.npm.taobao.org
# 把所有源代码拷贝到/app
COPY react-app /app
# 打包构建
RUN npm run build
# 拷贝配置文件到nginx
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# nginx: [emerg] open() "/run/nginx/nginx.pid" failed (2: No such file or directory)
RUN mkdir -p /run/nginx
# 启动nginx，关闭守护式运行，否则容器启动后会立刻关闭
CMD ["nginx", "-g", "daemon off;"]

# 指定构建镜像时不使用缓存 打包镜像 docker build --no-cache -t zyun/react-app .
# 启动容器 docker run -d --name my-react-app -p 8888:80 zyun/react-app
# 访问 http://localhost:8888 即可看到页面
# 访问 http://localhost:8888/deepred5, 也可以看见页面，说明nginx防刷新配置生效了！
```

4. 修改成多层构建
   4.1 新建 Dockerfile.multi

## react-node-redis

1. 添加 node 与 redis
2. 用 networking 进行容器间的通信
3. 编写 docker-compose

## 连接 mongoDb 的问题

创建不了用户，需要验证，先修改一波配置文件，取消认证
创建管理员与普通用户，保存，删除容器
退出，在打开认证
————————————————————————
上面都是纸老虎

```js
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://mongoDB:27017/admin-react", {
    //注意url地址最后面的地址是数据库的名称
    //mongoDB 这里就是指代的host 使用的是docker-compose的mongoDB
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDb");
  })
  .catch((err) => {
    console.log(err);
  });
```

```yml
# 完整记录一次react-node-redis-mongodb 可优化

version: "3"
services:
  web:
    build:
      context: ./
      dockerfile: ./Dockerfile.multi
    container_name: docker-react
    ports:
      - 9999:80
    networks:
      - frontend
      - backend
    deploy:
      restart_policy:
        condition: on-failure
    depends_on:
      - nodejs
      - redis

  nodejs:
    build:
      context: ./node-redis
      dockerfile: ./Dockerfile
    container_name: docker-nodejs
    ports:
      - 3014:3014
    networks:
      - backend
    deploy:
      restart_policy:
        condition: on-failure
    depends_on:
      - redis
      - mongoDB
      - mysqlDB
    links:
      - redis
      - mongoDB
      - mysqlDB
    environment:
      ME_CONFIG_MONGODB_SERVER: mongo
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: 123456
      ME_CONFIG_BASICAUTH_USERNAME: root
      ME_CONFIG_BASICAUTH_PASSWORD: 123456

  redis:
    image: redis:alpine
    container_name: docker-redis
    restart: always
    ports:
      - 6379:6379
    networks:
      - backend
    deploy:
      restart_policy:
        condition: on-failure
    privileged: true
    # volumes:
    # - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    # command: redis-server /usr/local/etc/redis/redis.conf

  mongoDB:
    image: mongo:4.2
    container_name: "docker-mongodb"
    restart: always
    networks:
      - backend
    # environment:
    # 在这里输入 MongoDB 的 root 用户与密码，如果使用了此项，则不需要 --auth 参数
    # - MONGO_DATA_DIR=/data/db
    # - MONGO_LOG_DIR=/data/logs
    # - MONGO_INITDB_ROOT_USERNAME=admin
    # - MONGO_INITDB_ROOT_PASSWORD=admin
    ##
    # - MONGO_INITDB_DATABASE=test
    # - MONGO_INITDB_ROOT_USERNAME=root
    # - MONGO_INITDB_ROOT_PASSWORD=123456
    # volumes:
    # - ./mongodb/mongod.conf:/etc/mongod.conf
    # - ./mongodb/log:/data/log
    ##
    # - ./mongodb/data:/data/db
    # - ./mongodb/mongo_users:/docker-entrypoint-initdb.d/
    ports:
      - 27017:27017
    command:
      mongod
      ##
      #- /bin/bash
      #- -c
      #- mongod --auth
      ##
      # - mongod -f /etc/mongod.conf

  mysqlDB:
    image: mysql:5.7
    container_name: "docker-mysql"
    restart: always
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_USER: zyun #创建test用户
      MYSQL_PASSWORD: zyun #设置test用户的密码
      TZ: Asia/Shanghai # 设置时区
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    networks:
      - backend

networks:
  frontend:
  backend:
    driver: bridge
# docker-compose --compatibility up
# docker-compose up -d --build
```

## mysql

## nodemon 分支

我并没有使用 nodemon
最后用的 pm2

## deploy

### 这个分支试一下 Travis 自动部署
1. 新建 .travis.yml