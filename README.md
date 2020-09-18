## master 只有README.md

## react分支 
1. 打算只用docker构建一个前端页面应用
2. 目前来看，必须是nginx+静态页面
3. 第一次成功启动docker 解决了两个bug
  3.1 一个是npm run build时失败，修改了COPY react-app /app 以前是COPY . /app 应该是没有找到文件夹
  3.2 nginx: [emerg] open() "/run/nginx/nginx.pid" failed (2: No such file or directory) nginx启动报错 添加了这么一行 RUN mkdir -p /run/nginx
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
   4.1 新建Dockerfile.multi


  

## react-node-redis
1. 添加node与redis
2. 用networking进行容器间的通信
3. 编写docker-compose