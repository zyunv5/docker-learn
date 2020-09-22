const config = {
  dbname: 'test',
  uname: 'root',
  upwd: '123456',
  host:  process.env.DATABASE_HOST || '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  pool: {
      max: 5,
      min: 0,
      idle: 10000
  }
};

module.exports = config;