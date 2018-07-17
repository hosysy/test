async function A() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(Date.now() + ': test wow')
      resolve()
    }, 5000)
  })
}

A()
