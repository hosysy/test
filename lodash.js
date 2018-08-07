const _ = require('lodash')

const td = [
  { '4000': { sms: 1 } },
  { '3058': { lms: 1 } },
  { '4000': { ata: 1, cta: 1, lms: 3, mms: 2, sms: 3 } },
  { '2100': { lms: 1 },
    '2160': { lms: 1 },
    '2254': { lms: 1 },
    '3010': { ata: 2 },
    '3031': { cta: 3, lms: 2, mms: 1, sms: 1 },
    '3054': { sms: 1 },
    '3055': { sms: 1 },
    '4000': { ata: 1, cta: 1 } }
]

_.flatMapDeep(td, data => {
  console.log(data)
})


let a = 1
let b = '2'

if (!_.isNumber(a) || !_.isNumber(b)) console.log('no numeric')

let c = new Date()

console.log('check Date', _.isDate(c))
console.log('check Date', _.isDate('2018-01-01 00:00:00'))

let objTest = {
  'a': 1,
  'b': 2,
  'c': 3,
  'd': 4,
  'e': 5
}

console.log(_.omit(objTest, [ 'a', 'b' ]))
console.log(`---------- CHECK objTest ----------`, objTest)

