'use strict'

const mongoose = require('mongoose')
const mongooseCache = require('@nurigo/mongoose-cache')

const Approval = require('./approval')
const AuthorizationCode = require('./authorizationCode')
const Client = require('./client')
const RefreshToken = require('./refreshToken')
const Scope = require('./scope')
const Group = require('./group')
const Message = require('./message')
const Pricing = require('./pricing')
const BalanceHistory = require('./balanceHistory')
const Statistics = require('./statistics')

/*mongooseCache(mongoose, [
  {
    name: 'Approval',
    key: [
      'client',
      'accountId'
    ],
    allowFields: [
      'scope'
    ]
  },
  {
    name: 'Client',
    key: [
      'clientId'
    ]
  },
  {
    name: 'RefreshToken',
    key: [
      'refreshToken'
    ]
  },
  {
    name: 'Scope',
    key: [
      'name'
    ]
  }
], __dirname, { ttl: 60 * 60 * 24 }) // 캐시 만료시간 24시간
*/

module.exports = {
  Approval,
  AuthorizationCode,
  Client,
  RefreshToken,
  Scope,
  Group,
  Message,
  Pricing,
  BalanceHistory,
  Statistics
}
