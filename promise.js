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
