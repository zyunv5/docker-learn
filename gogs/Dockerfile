#基础镜像，这里选择的这个node 是因为build之后占用空间没有那么大 原本的FROM node:11 镜像过大
FROM gogs/gogs
RUN mkdir -p /var/gogs
RUN docker run --name=gogs -p 10022:22 -p 10080:3000 -v /var/gogs:/data gogs/gogs