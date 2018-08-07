var _ = require('lodash')

let a = { sms: { '82': 3, '34': 4 } }

let count = 0
const test = Object.keys(a.sms).map(res => count += Number(a.sms[res]))
console.log(`---------- CHECK test ----------`, count)


const test2 = Object.keys(a.sms).reduce((before, res) => before + a.sms[res], 0)
console.log(`---------- CHECK test2 ----------`, test2)
