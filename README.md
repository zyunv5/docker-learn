[toc]

## master 只有 README.md

## react 分支

1. 打算只用 docker 构建一个前端页面应用
2. 目前来看，必须是 nginx+静态页面
3. 第一次成功启动 docker 解决了两个 bug
   3.1 一个是 npm run build 时失败，修改了 COPY react-app /app 以前是 COPY . /app 应该是没有找到文件夹
   3.2 nginx: [emerg] open() "/run/nginx/nginx.pid" failed (2: No such file or directory) nginx 启动报错 添加了这么一行 RUN mkdir -p /run/nginx
4. 修改成多层构建
   4.1 新建 Dockerfile.multi

/Dockerfile

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

/Dockerfile.multi

```yml
# node镜像仅仅是用来打包文件
FROM node:alpine as builder

ENV PROJECT_ENV production
ENV NODE_ENV production

COPY ./react-app/package*.json /app/

WORKDIR /app

RUN npm install --registry=https://registry.npm.taobao.org

COPY react-app /app

RUN npm run build

# 选择更小体积的基础镜像
FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /app/build

# 打包镜像
# -f 指定使用Dockerfile.multi进行构建
# docker build -t zyun/react-app-multi .  -f Dockerfile.multi
# 启动容器
# docker run -d --name my-react-app-multi -p 8889:80 zyun/react-app-multi
# http://localhost:8889/ 查看页面
```

## react-node-redis

1. 添加 node 与 redis
2. 用 networking 进行容器间的通信
3. 编写 docker-compose

这里注意 redis 的 host，就是 docker-compose 配置文件的命名

/docker-compose.yml

```yml
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

networks:
  frontend:
  backend:
    driver: bridge
# docker-compose --compatibility up
# docker-compose up -d --build

# const redis = new Redis({
#   host: "redis",
#   port: 6379,
# });
```

## 连接 mongoDb 的问题

一开始不知道怎么配置的，容器启动了，想看看数据库，但是用 Navicat Premium 连接，一直要求我认证
后来鼓捣了很久 最后研究出来一版

```yml
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

networks:
  frontend:
  backend:
    driver: bridge
# docker-compose --compatibility up
# docker-compose up -d --build

#mongoose
#  .connect("mongodb://mongoDB:27017/admin-react", {
#    //注意url地址最后面的地址是数据库的名称
#     useNewUrlParser: true,
#     useUnifiedTopology: true,
#   })
#   .then(() => {
#     console.log("MongoDb");
#   })
#   .catch((err) => {
#     console.log(err);
#   });
```

## mysql

连接 mysql 也是一波三折 频繁遇到 账号与密码不对的问题

```yml
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
      - mysqlDB

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
      - mysqlDB
    links:
      - mysqlDB
    environment:
      ME_CONFIG_MONGODB_SERVER: mongo
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: 123456
      ME_CONFIG_BASICAUTH_USERNAME: root
      ME_CONFIG_BASICAUTH_PASSWORD: 123456
      DATABASE_HOST: mysqlDB

  mysqlDB:
    image: mysql:5.7.31
    container_name: docker-mysql
    deploy:
      restart_policy:
        condition: on-failure
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: "test"
      MYSQL_USER: root #创建test用户
      MYSQL_PASSWORD: 123456 #设置test用户的密码
      TZ: Asia/Shanghai # 设置时区
    ports:
      - "3307:3306"
    networks:
      - backend
    command:
      [
        "--character-set-server=utf8mb4",
        "--collation-server=utf8mb4_unicode_ci",
      ]
    volumes:
      # - ./mysql/mysqld.cnf:/etc/mysql/mysql.conf.d/mysqld.cnf
      - "./mysql/data:/var/lib/mysql"
      - ./mysql/init:/docker-entrypoint-initdb.d/

networks:
  frontend:
  backend:
    driver: bridge
# docker-compose down
# docker-compose up -d --build
# docker-compose --compatibility up -d

node/index.js
# const { Sequelize } = require("sequelize");
# const mysqlConfig = require("./configs/mysql-config");

# const app = new Koa();
# const router = new Router();

# const sequelize = new Sequelize(
#   mysqlConfig.dbname,
#   mysqlConfig.uname,
#   mysqlConfig.upwd,
#   {
#     host: mysqlConfig.host,
#     dialect: mysqlConfig.dialect,
#     pool: mysqlConfig.pool,
#   }
# );

# async function fn() {
#   try {
#     await sequelize.authenticate();
#     console.log("Connection has been established successfully.");
#   } catch (error) {
#     console.error("Unable to connect to the database:", error);
#   }
# }
# fn();

node/config
# const config = {
#   dbname: 'test',
#   uname: 'root',
#   upwd: '123456',
#   host:  process.env.DATABASE_HOST || '127.0.0.1',
#   port: 3306,
#   dialect: 'mysql',
#   pool: {
#       max: 5,
#       min: 0,
#       idle: 10000
#   }
# };

# module.exports = config;
```

## nodemon 分支

一开始打算用 nodemon，但是 nodemon 本地调试就够了
远程的话可以直接上 pm2

## deploy

### 这个分支试一下 Travis docker-compose 自动部署
前置条件 需要ruby条件
先试试方法1
[centos7/rhel7安装较高版本ruby2.2/2.3/2.4+](https://www.cnblogs.com/ding2016/p/7903147.html)
rvm use 2.6.5 --default


[一点都不高大上，手把手教你使用 Travis CI 实现持续部署](https://zhuanlan.zhihu.com/p/25066056) 跳过
[利用 travis-ci 持续部署 nodejs 应用](https://cnodejs.org/topic/5885f19c171f3bc843f6017e) 跳过

[使用 GitHub+Travis-CI+Docker 打造自动化流水线](https://blog.csdn.net/qq_24464827/article/details/104471319) 80%

[持续部署——Travis+Docker+阿里云容器镜像](https://blog.csdn.net/fly7632785/article/details/107409126) 

bug:
iv undefined
The command "openssl aes-256-cbc -K $encrypted_1dc0466c3d69_key -iv $encrypted_1dc0466c3d69_iv -in nopwd.enc -out ~/.ssh/nopwd -d" failed and exited with 1 during .



## 小插曲

- 关于代码放在哪个服务器的哪个文件夹下：
  [在服务器上你们自己服务的代码一般放在什么目录下?](https://www.v2ex.com/t/644152)

```
团队里都是 root 下的 根目录 /data ...
理论上编译好的应该是在 /usr/local/bin 或软连接 /var/opt/xxx/bin
代码是在 /var/opt/xxx
配置是在 /etc/xxx/xxx.config
Log 放 /var/opt/xxx/log
如果特定挂载盘放 /mnt/volume 挂载???
基本上是扒 Gitlab 的路径.
```

- centOS6 的一些环境变量我真是受够了，直接换了 centOS7
