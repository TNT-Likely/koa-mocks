# koa-mocks

koa2/express mock middleware

## 安装

```bash
yarn add koa-mocks
```

## 初始化

```bash
node_modules/.bin/mock init
```

## 使用

```javascipt
const koaMocks = require('koa-mocks')
app.use(koaMocks(config))
```

## 参数说明

- config.basePath `[string]` mock根目录
	- default process.cwd()
- config.routeFile `[string]` mock路由文件
	- default config.basePath + 'route.js'
- config.staticFolder `[string]` mock静态文件地址
	- default config.basePath + 'static'
- config.express `[boolean]` 是否为express
	- default false

## route.js 说明

示例

`[method]::<url> : <type>::<file>`

```
module.exports = {
  'post::/test': 'mock::test.js',
  'get::/test2': 'mock::test.json',
  '/lock':'file::lock.png',
  '/baidu':'url::https://www.baidu.com'
}
```

参数说明

- method default get support any method and all
- url mock的地址
- type mock对应类型
	- mock 数据
	- file 文件
	- url 网页

## test.js 说明

```
module.exports = function(req, utils) {
  return {
    "data": utils.random([111,222,333])
  }
}
```
- req 请求request对象
- utils 工具类
  - utils.random(<array>) 数组中随机取一个数据 


## test.json 说明

```
{
	"$$statusCode":400,
	"$$delay":3000,
	"data":"111"
}
```

- $$statusCode 返回状态码 默认 200
- $$delay 延时时间 默认 0

# TO DO LIST

