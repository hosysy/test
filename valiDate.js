var valiDate = require("vali-date")

console.log(valiDate('2018-01-01 00:00:00'))
console.log(valiDate('2018-01-01T00:00:00Z'))
console.log(valiDate('2018-01-01T00:00:00+09:00'))
console.log(valiDate('2018-01-01T00:00:00.000'))

