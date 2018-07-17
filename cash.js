let cash = require('@nurigo/cash-lib')
// deductCash ex)
let payload = {
  'member_srl': '214727', // 필수
  'cash': 0, // 충전/차감 캐쉬
  'point': 0, // 충전/차감 캐쉬
  'type': 'init' // 'recharge', 'deduct', 'init' 중 하나
}

cash.deductCash(payload).then((res) => {
  console.log("SUCCESS")
  console.log(res)
})
.catch((err) => {
  console.log("ERROR")
  console.log(err)
})

/*
// deductCashByType ex)
payload = {
  'member_srl': '214727', // 필수
  'messages': {
    'sms': 1,
    'lms': 0,
    'mms': 0,
    'ata': 0,
    'cta': 0,
    'push': 0
  },
  'app_id': 'app_id',
  'sync': 'true' // 'true'면 maindb와 sync 안함
}

cash.deductCashByType(payload).then((res) => {
  console.log(res)
})
.catch((err) => {
  console.log(err)
})
*/
