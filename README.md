# koa-mocks

koa的mock中间件

## 使用

```javascipt
const koaMocks = require('koa-mocks')
app.use(koaMocks(config))
```

## 参数说明

- config.basePath `[string]` mock根目录
	- 默认值 process.cwd()
- config.routeFile `[string]` mock路由文件
	- 默认值 config.basePath + 'route.js'
- config.staticFolder `[string]` mock静态文件地址
	- 默认值 config.basePath + 'static'

## route.js 说明

示例

`[method]::[url] : [type]::[file]`

```
module.exports = {
  'post::/test': 'mock::test.js',
  'get::/test2': 'mock::test.json',
  '/lock':'file::lock.png',
  '/baidu':'url::https://www.baidu.com'
}
```

参数说明

- method 默认 get 支持任何方法和all
- url mock的地址
- type mock对应类型
	- mock 数据
	- file 文件
	- url 网页

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

- 支持代理