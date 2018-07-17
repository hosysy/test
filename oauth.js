const mongo = require('@nurigo/mongo')
const { Approval, AuthorizationCode, Client, RefreshToken, Scope } = require('./models')

const funA = async () => {
  try {
    await mongo.init({'host':'localhost', "database": "test"})
  } catch (err) {
    console.error('ERROR!!!!!!!!!: ', err)
  }

  try {
    const res1 = await Approval.find()
    for (const data of res1) {
      const res2 = await Approval.findOne({ clientId: res1.clientId })
      console.log(res2)
    }
  } catch (err) {
    console.error('ERROR!!!!!!!!!: ', err)
  }

  mongo.mongoose.connection.close()
}

funA()
