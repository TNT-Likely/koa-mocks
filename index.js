const path = require('path')
const fs = require('fs')
const middleware = require('./lib/middleware')
const { merge, requireNoCache, streamToBuffer } = require('./lib/util')

let mock = function (opts) {
  opts = merge({
    basePath: path.resolve(process.cwd(), './mocks'),
    routeFile: './route.js',
    staticFolder: './static',
    express: false
  }, opts)

  opts.routeFile = path.resolve(opts.basePath, opts.routeFile)
  opts.staticFolder = path.resolve(opts.basePath, opts.staticFolder)
  const isExpress = opts.express

  if (isExpress) {
    return async (request, response, next) => {
      // koa 'response.body =' to express 'response.send'
      Object.defineProperty(response, 'body', {
        set(value) {
          response.send(value)
        }
      })

      const type = response.type.bind(response)
      const status = response.type.bind(status)
      // koa 'response.type' = to exporess 'response.type()'
      Object.defineProperty(response, 'type', {
        set(value) {
          type(value)
        },
        get() {
          return type
        }
      })

      // koa 'response.status' = to exporess 'response.status()'
      Object.defineProperty(response, 'status', {
        set(value) {
          response.statusCode = value
        },
        get() {
          return status
        }
      })

      const obj = {
        opts,
        ctx: {
          request,
          response,
          req: request,
          res: response
        },
        next
      }
      return middleware.call(obj)
    }
  } else {
    return async (ctx, next) => {
      const obj = { ctx, next, opts }
      return middleware.call(obj)
    }
  }
}

module.exports = mock