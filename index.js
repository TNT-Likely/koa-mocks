const path = require('path')
const fs = require('fs')
const httpProxy = require('http-proxy')
const Router = require('./lib/router')
const { merge, requireNoCache } = require('./lib/util')

let mock = function(opts) {
  opts = merge({
    basePath: path.resolve(process.cwd(), './mocks'),
    routeFile: './route.js',
    staticFolder: './static'
  }, opts)

  opts.routeFile = path.resolve(opts.basePath, opts.routeFile)
  opts.staticFolder = path.resolve(opts.basePath, opts.staticFolder)
  let router = new Router(opts.routeFile)

  return async function(ctx, next) {
    let { request } = ctx
    let { method } = request
    let match = router.search(request.path, method)

    // 没匹配上直接返回
    if (!match) {
      return next()
    }

    let { type, file } = match
    let filePath = path.resolve(opts.staticFolder, file)
    let extname = path.extname(filePath)
    let data = null
    if (type === 'mock') {
      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.set('Access-Control-Allow-Methods', '*')

      if (!fs.existsSync(filePath)) {
        ctx.body = `找不到mock文件${filePath}`
      }

      if (extname === '.js') {
        data = requireNoCache(filePath)(ctx.request)
      } else if (extname === '.json') {
        data = requireNoCache(filePath)
      } else {
        ctx.body = `mock文件格式错误`
      }

      // 自定义状态码功能
      let statusCode = 200
      if (!!data.$$statusCode) {
        statusCode = data.$$statusCode
        delete data['$$statusCode']
      }
      ctx.status = statusCode

      // 自定义延时功能
      let delay = 0
      if (Number(data.$$delay) >= 0) {
        delay = Number(data.$$delay)
        delete data['$$delay']
      }

      await new Promise(resolve => {
        setTimeout(() => {
          resolve(1)
        }, delay)
      })

      ctx.body = data
    } else if (type === 'file') {
      ctx.type = extname
      ctx.body = fs.createReadStream(filePath)
    } else if (type === 'url') {
      proxy = httpProxy.createProxyServer()
      return new Promise(function(resolve, reject) {
        proxy.web(ctx.req, ctx.res, { 
	      	target: file,
	      	changeOrigin: true,
	      	secure: false,
	      	headers: {
	      		'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
	      	}
	      }, function() {
	      	resolve()
	      })
      })
    } else {
      ctx.body = `当前类型${type}暂不支持`
    }

    await next()
  }
}

module.exports = mock