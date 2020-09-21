const Koa = require('koa')
const Router = require('koa-router')
const Redis = require('ioredis')
const mongoose = require('mongoose')
const { Sequelize } = require('sequelize')

const app = new Koa()
const router = new Router()
// const redis = new Redis({
//   host: "redis",
//   port: 6379,
// });

mongoose
  .connect('mongodb://mongoDB:27017/admin-react', {
    //注意url地址最后面的地址是数据库的名称
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDb')
  })
  .catch((err) => {
    console.log(err)
  })

const sequelize = new Sequelize('test', 'zyun', 'zyun', {
  host: 'mysqlDB',
  dialect: 'mysql',
})

try {
  await sequelize.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.error('Unable to connect to the database:', error)
}

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
    // port: 3014 || 7001,
    port: 3014 || 7001,
    // not write localhost/127.0.0.1
  },
  () => {
    console.log(`server start`)
  }
)
