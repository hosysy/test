class A {
  constructor() {
    console.log('create A class')
    if ('NODE_ENV' in process.env && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'loadtest')) {
      console.log(1)
    }

    let _cash = null
    Object.defineProperty(this, 'cash', {
      get: () => _cash,
      set: (v) => _cash = v
    })
  }

  set car(car) { this._car = car }
  get car() { return this._car }

  async _check() {
    await new Promise((resolve,reject) => resolve())
    this.test()
    console.log(this.exit)
  }

  test() {
    console.log('wpw123123123123')
  } 
}


const cls = new A()
cls.car = 'test-1'
console.log('check', cls.car)

const cls2 = new A()
console.log('check 2', cls2.car)
console.log('check 2 - 1', cls2.cash)
cls2.cash = 'test'
console.log('check 2 - 2', cls2.cash)


cls._check()
