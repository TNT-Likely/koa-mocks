let pathRegexp = require('path-to-regexp')
function Router(routeFile) {
  this.routes = []
  this.routeFile = routeFile
  this.loadRoutes()
}

Router.prototype.loadRoutes = function() {
  let mapping = require(this.routeFile)

  Object.keys(mapping).forEach(function(key) {
  	let tmp = key.split('::')
  	if(tmp.length < 2){
  		tmp[1] = tmp[0]
  		tmp[0] = 'GET'
  	}

  	// tmp[0] 为请求方法
  	// tmp[1] 为请求地址

  	if(tmp[1].slice(0, 1) !== '/'){
  		tmp[1] = '/' + tmp[1]
  	}

  	this.routes.push({
  		method: tmp[0].toLowerCase(),
  		url: tmp[1],
  		file: mapping[key]
  	})
  }.bind(this))
}

Router.prototype.search = function(url, method) {
	let match = null
	method = method.toLowerCase()

	this.routes.some(function(r) {
		let re = pathRegexp(r.url)
    let result = re.exec(url)

    // url 和 method同时匹配
    if(result && (r.method === 'all' || r.method === method)){
    	match = r.file
    }
	})

	if (match) {
		let tmp = match.split('::')
		let type = tmp[0]
		let file = tmp[1]

		return {
			file: file,
			type: type.toLowerCase()
		}
	}

	return match
}

module.exports = Router