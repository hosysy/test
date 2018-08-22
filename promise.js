function a() {
  return new Promise((resolve, reject) => {
    resolve('a')
  })
}

function b() {
  return new Promise((resolve, reject) => {
    resolve('b')
  })
}
/*


async function c() {
  const queues = []
  for (let i = 0; i < 10; i++) {
    queues.push(a())
  }
  const c = await Promise.all(queues)
  return c
}

async function d() {
  const queues = []
  for (let i = 0; i < 10; i++) {
    queues.push(c())
  }
  const a = await Promise.all(queues)
  return a
}


async function e() {
  try {
    const res = await d()
    console.log('chekc res', res)
  } catch (err) {
    console.error(`---------- CHECK err ----------`, err)
  }
}

e()
*/

async function TPA() { 
  let queues = []
  queues.push(a())
  queues.push(a())
  queues.push(a())
  queues.push(b())
  queues.push(a())
  queues.push(a())

  try {
    // Promise.all(queues).then((obj) => console.log(obj)).catch(err => console.error('에러 ', err))
    const res = await Promise.all(queues)
    console.log(`---------- CHECK res 2 ----------`, res)
  } catch (err) {
    console.log(`---------- CHECK err ----------`, err)
  }
}

TPA()

