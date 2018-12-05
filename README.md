# koa-mocks

koa2/express mock middleware

## install 

```bash
yarn add koa-mocks
```

## init

```bash
node_modules/.bin/mock init
```

## use

```javascipt
const koaMocks = require('koa-mocks')
app.use(koaMocks(config))
```

## Parameter Description

- config.basePath `[string]` The root directory of mock
	- default process.cwd()
- config.routeFile `[string]` Mock routing file
	- default config.basePath + 'route.js'
- config.staticFolder `[string]` Mock static file address
	- default config.basePath + 'static'
- config.express `[boolean]` is whether use express
	- default false

## route.js Explain

Example

`[method]::<url> : <type>::<file>`

```
module.exports = {
  'post::/test': 'mock::test.js',
  'get::/test2': 'mock::test.json',
  '/lock':'file::lock.png',
  '/baidu':'url::https://www.baidu.com'
}
```


Parameter description

- method default get support any method and all
- url Address of mock
- type Type of mock
	- mock
	- file
	- url

## test.js Explain

```
module.exports = function(req, utils) {
  return {
    "data": utils.random([111,222,333])
  }
}
```
- req request Object
- utils tool
  - utils.random(<array>) Random fetch of a data in an array


## test.json Explain

```
{
	"$$statusCode":400,
	"$$delay":3000,
	"data":"111"
}
```

- $$statusCode  default 200
- $$delay delay time default 0

# TO DO LIST

