'use strict'

module.exports = (value, callback) => {
  var clientIdRegex = /^CID[a-zA-Z0-9]{13}$/
  var msg = value + '는 유효한 clientID 가 아닙니다.'
  // First argument is a boolean, whether validator succeeded
  // 2nd argument is an optional error message override
  callback(clientIdRegex.test(value), msg)
}
