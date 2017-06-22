var constValue = require('./const');
var Queue = require('bull');
var messageQueue = new Queue('opera', {redis: constValue.redis});
var net = require('net');

messageQueue.process(function (job, done) {
  console.log('consume job');
  console.log(job.data);
  if (job.data.type === 'tcp') {
    var client = new net.Socket();
    client.connect(constValue.opera.port, constValue.opera.host, function() {
      let xml = "<Message type='PostSimple' direction='ToPMS'><PostSimple RoomNum='999994' PostType='C' SalesOutlet='03' PostNum='Z0256984' CheckNum='Z0256984' PaymentMethod='7080' ServingTime='3' TableNum='112' Covers='' TotalAmount='206600' Subtotal2='196000' Date='170605' Time='162556' UserID='tjw' ClearText='tjw' /></Message>";
      client.write(Buffer.concat([Buffer.from(xml),Buffer.from([0x00])]));
    });

    client.on('data', function(data) {
      console.log('Received: ' + data);
      client.destroy(); // kill client after server's response
    });

    client.on('error', function(err) {
      job.data.retry = job.data.retry?job.retry+1:1;
      console.log('err: ' + err.message);
      //messageQueue.add(job);
    });

    client.on('close', function() {
      done();
    });
  } else {
    done();
  }
});

module.exports = {
  add: function (job) {
    console.log('add job');
    console.log(job);
    messageQueue.add({type: 'tcp', job: job});
  }
};
