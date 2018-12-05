const path = require('path')
const Koa = require('koa')
const app = new Koa()

app.use(require('../index')({
  basePath: path.resolve(__dirname, './mocks')
}))

app.listen(3200)