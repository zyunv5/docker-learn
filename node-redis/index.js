const Koa = require("koa");
const Router = require("koa-router");
const Redis = require("ioredis");

const app = new Koa();
const router = new Router();
const redis = new Redis({
  port: 6379,
  host: "db",
});

router.get("/", (ctx, next) => {
  ctx.body = "hello world.";
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

app.listen(3000, () => {
  console.log("server start at localhost:3000");
});
