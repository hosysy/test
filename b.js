const moment = require('moment-timezone')
const uniqid = require('uniqid')
const randomstring = require("randomstring")
console.log(randomstring.generate({ length: 8, capitalization: 'lowercase' }))
console.log(moment().tz('Asia/Seoul').format('YYYYMMDDHHmmss'))
console.log(uniqid.time(moment().tz('Asia/Seoul').format('YYYYMMDDHHmmss') + '-'))
console.log(uniqid(moment().tz('Asia/Seoul').format('YYYYMMDD') + '-'))
console.log(uniqid(moment().tz('Asia/Seoul').format('YYYYMMDD') + '-'))
console.log(uniqid(moment().tz('Asia/Seoul').format('YYYYMMDD') + '-').length)

let obj = { a: 1, b: 2}


const funA = async (obj) => {
  obj.c = 3
}


funA(obj)



console.log(obj)

