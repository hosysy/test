'use strict'

module.exports = (value, callback) => {
  var clientSecretRegex = /^[a-zA-Z0-9]{32}$/
  var msg = value + ' 는 유효한 clientSecret 이 아닙니다.'

  // First argument is a boolean, whether validator succeeded
  // 2nd argument is an optional error message override
  callback(clientSecretRegex.test(value), msg)
}
