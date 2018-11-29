module.exports = function(req, utils) {
  return {
    "data": utils.random([111,222,333])
  }
}