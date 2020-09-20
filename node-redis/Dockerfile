FROM node:9.2.1-alpine
COPY package*.json /app/
WORKDIR /app
RUN npm install
COPY . /app
CMD ["node","index.js"]
