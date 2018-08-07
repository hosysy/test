'use strict'

const userlib = require('@nurigo/cs_user')

module.exports = (value, callback) => {
  var accountIdRegex = /\d/;
  var msg = value + ' 는 유효한 accountId 가 아닙니다.';
  if(!(accountIdRegex.test(value))) return callback(false, msg)

  // 유효한 accountId 인지 확인
  userlib.getUserBySrl({ value: `${value}`, is_admin: 'N' })
  .then(user => {
    callback(true, msg);
  })
  .catch(err => {
    callback(false, msg);
  })
  // First argument is a boolean, whether validator succeeded
  // 2nd argument is an optional error message override
}
