const Koa = require("koa");
const Router = require("koa-router");
const Redis = require("ioredis");
const mongoose = require("mongoose");

const app = new Koa();
const router = new Router();
// const redis = new Redis({
//   host: "redis",
//   port: 6379,
// });

mongoose.connect(
  "mongodb://mongo/nodejs-blog",
  { useUnifiedTopology: true,useNewUrlParser: true },
  function (err) {
    if (err) {
      console.log("连接失败");
    } else {
      console.log("连接成功");
    }
  }
);

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
