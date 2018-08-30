const Koa = require('koa')
const app = new Koa()

app.use(require('../index')({

}))

app.listen(3200)