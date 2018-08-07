const moment = require('moment')

console.log(moment().format('YYYYMMDDHHmmss'))

const momentTz = require('moment-timezone')

console.log(momentTz().format('YYYYMMDDHHmmss'))


console.log(momentTz(1521698162000))


const date = new Date()
console.log('check date', date)
date.setDate(-3)
date.setHours(0)
date.setMinutes(0)
date.setSeconds(0)
date.setMilliseconds(0)
console.log('check date', date)

console.log(momentTz(date).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'))
