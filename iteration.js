const _ = require('lodash')

const a = {
  a: 1,
  b: 1,
  c: 1,
  d: 1,
  e: 1,
  f: 1,
  g: 1
}

function init() {
  return new Promise((resolve, reject) => {
    for (let i = 1; i < 100000; i++) {
      a[i] = i
      if (i === 99999) {
        console.log('init')
        return resolve()
      }
    }
  })
}

async function test() {
  console.log('tes-1')
  for (const key of Object.keys(a)) {
    if (key === 'a') continue
    await time()
    console.log(key)
  }
  console.log('tes-2')
}

function time() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 3000)
  })
}

function test2() {
  console.log('test-1')
  _.forEach(a, async (val, key) => {
    if (key === 'a') return
    await time()
    console.log(key)
  })
  console.log('test-2')
}

async function test3() {
  await init()
  console.log(Object.keys(a).length)
  console.time('tes--1')
  for (const key in a) {
    a[key] = 'a'
  }
  console.timeEnd('tes--1')

  console.time('tes--2')
  for (const key of Object.keys(a)) {
    a[key] = 'a'
  }
  console.timeEnd('tes--2')
}

test3()
