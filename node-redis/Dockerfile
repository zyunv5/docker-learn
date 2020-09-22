FROM node:alpine
COPY package*.json /app/
WORKDIR /app
RUN npm install
RUN npm install pm2 -g
COPY . /app
# CMD ["node","index.js"]
# pm2-runtime是为Docker容器设计的，它将应用程序置于前台，从而使容器保持运行状态，
CMD ["pm2-runtime","index.js","-i","max", "--watch", "--name", "myapp"]
