module.exports = function (req, res, utils) {
  return {
    "data": utils.random([111, 222, 333]),
    body: req.body
  }
}