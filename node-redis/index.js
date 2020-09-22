const Koa = require("koa");
const Router = require("koa-router");
const Redis = require("ioredis");
const mongoose = require("mongoose");
const { Sequelize } = require("sequelize");
const mysqlConfig = require("./configs/mysql-config");

const app = new Koa();
const router = new Router();

const sequelize = new Sequelize(
  mysqlConfig.dbname,
  mysqlConfig.uname,
  mysqlConfig.upwd,
  {
    host: mysqlConfig.host,
    dialect: mysqlConfig.dialect,
    pool: mysqlConfig.pool,
  }
);

async function fn() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
fn();

router.get("/", (ctx, next) => {
  ctx.body = "hello world nodejs.";
});

router.get("/api/json/get", async (ctx, next) => {
  const result = await redis.get("age");
  ctx.body = result;
});

router.get("/api/json/set", async (ctx, next) => {
  const result = await redis.set("age", ctx.query.age);
  ctx.body = {
    status: result,
    age: ctx.query.age,
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(
  {
    hostname: "0.0.0.0",
    // port: 3014 || 7001,
    port: 3014 || 7001,
    // not write localhost/127.0.0.1
  },
  () => {
    console.log(`server start`);
  }
);
