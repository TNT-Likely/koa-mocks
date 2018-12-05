const path = require('path')
const express = require('express')
const app = new express()

app.use(require('../index')({
  basePath: path.resolve(__dirname, './mocks')
}))

app.listen(3200)