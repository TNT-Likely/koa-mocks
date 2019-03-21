const forms = require('formidable')

const formy = (req, opts = {}) => {
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

module.exports = formy