const Koa = require('koa')
const Router = require('koa-router')
const Redis = require('ioredis')

const app = new Koa()
const router = new Router()
const redis = new Redis({
  host: 'redis',
  // host: '127.0.0.1',
  port: 6379,
})

router.get('/', (ctx, next) => {
  ctx.body = 'hello world nodejs.'
})

router.get('/api/json/get', async (ctx, next) => {
  const result = await redis.get('age')
  ctx.body = result
})

router.get('/api/json/set', async (ctx, next) => {
  const result = await redis.set('age', ctx.query.age)
  ctx.body = {
    status: result,
    age: ctx.query.age,
  }
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(
  {
    hostname: '0.0.0.0',
    port: process.env.WEB_PORT || 7001,
    // not write localhost/127.0.0.1
  },
  () => {
    console.log(`server start`)
  }
)
