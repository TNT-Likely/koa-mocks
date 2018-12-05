const path = require('path')
const fs = require('fs')
const httpProxy = require('http-proxy')
const buddy = require('co-body')
const forms = require('formidable')
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
    let { request, response, req, res } = ctx
    let { method } = request
    let match = router.search(request.path, method)

    // 没匹配上直接返回
    if (!match) {
      return next()
    }

    let body = null
    if (request.is('json')) {
      body = await buddy.json(req)
    } else if(request.is('urlencoded')) {
      body = await buddy.form(req)
    } else if(request.is('text')) {
      body = await buddy.text(req)
    } else if(request.is('multipart')) {
      body = await formy(req)
    }


    let { type, file } = match
    let filePath = path.resolve(opts.staticFolder, file)
    let extname = path.extname(filePath)
    let data = null
    if (type === 'mock') {
      response.set('Access-Control-Allow-Origin', '*')
      response.set('Access-Control-Allow-Methods', '*')

      if (!fs.existsSync(filePath)) {
        response.body = `找不到mock文件${filePath}`
      }

      if (extname === '.js') {
        request.body = body
        data = requireNoCache(filePath)(request, require('./lib/util'))
      } else if (extname === '.json') {
        data = requireNoCache(filePath)
      } else {
        response.body = `mock文件格式错误`
      }

      // 自定义状态码功能
      let statusCode = 200
      if (!!data.$$statusCode) {
        statusCode = data.$$statusCode
        delete data['$$statusCode']
      }
      response.status = statusCode

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

      response.body = data
    } else if (type === 'file') {
      response.type = extname
      response.body = fs.createReadStream(filePath)
    } else if (type === 'url') {
      proxy = httpProxy.createProxyServer()
      return new Promise(function(resolve, reject) {
        proxy.web(req, res, { 
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
      response.body = `当前类型${type}暂不支持`
    }

    await next()
  }
}

let formy = (req, opts) => {
  return new Promise(function (resolve, reject) {
    var fields = {}
    var files = {}
    var form = new forms.IncomingForm(opts)
    form.on('end', function () {
      return resolve({
        fields: fields,
        files: files
      })
    }).on('error', function (err) {
      return reject(err)
    }).on('field', function (field, value) {
      if (fields[field]) {
        if (Array.isArray(fields[field])) {
          fields[field].push(value)
        } else {
          fields[field] = [fields[field], value]
        }
      } else {
        fields[field] = value
      }
    }).on('file', function (field, file) {
      if (files[field]) {
        if (Array.isArray(files[field])) {
          files[field].push(file)
        } else {
          files[field] = [files[field], file]
        }
      } else {
        files[field] = file
      }
    })
    if (opts.onFileBegin) {
      form.on('fileBegin', opts.onFileBegin)
    }
    form.parse(req)
  })
}

module.exports = mock