var amqp = require('amqp');
 
var connection = amqp.createConnection();
 
// add this for better debuging
connection.on('error', function(e) {
  console.log("Error from amqp: ", e);
});
 
// Wait for connection to become established.
connection.on('ready', function () {
  console.log('ready')
  connection.queue('BalanceDeduction', {
      autoDelete: false,
      durable: true
    }, function (q) {
    console.log('ready2')
    for (let i = 0; i < 100000; i++) {
      connection.publish('BalanceDeduction', {
        messageId: 'M4V20180307110044DTYYJBBYLPQZAA2',
        groupId: 'G4V20180307100746TDRFRUQ9HYCLGOM',
        accountId: '12925149',
        messages: {
        'SMS': 1
        }
      }, null, () =>{
        console.log('ready3')
      })
    }
  })
});
