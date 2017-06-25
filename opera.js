var constValue = require('./const');
var Queue = require('bull');
var messageQueue = new Queue('opera', {redis: constValue.redis});
var net = require('net');

messageQueue.process(function (j, done) {
  console.log('consume job');
  console.log(j.data);
  let job = j.data;
  if (job.type === 'tcp') {
    job = job.job;
    var client = new net.Socket();
    client.connect(constValue.opera.port, constValue.opera.host, function() {

      let Subtotal = '';
      Object.keys(job.products.Subtotal).forEach((SubtotalIndex) => {
        try {
          let amount = job.products.Subtotal[SubtotalIndex];
          SubtotalIndex = parseInt(SubtotalIndex);
          Subtotal += "Subtotal"+SubtotalIndex+"='"+amount+"' ";
        } catch (e) {

        }
      });
      let xml = "<Message type='PostSimple' direction='ToPMS'><PostSimple RoomNum='"+job.RoomNum+"' PostType='C' SalesOutlet='"+job.products.SalesOutlet+"' PostNum='"+job.PostNum+"' CheckNum='"+job.CheckNum+"' PaymentMethod='"+job.PaymentMethod+"' ServingTime='"+job.products.ServingTime+"' TableNum='' Covers='' TotalAmount='"+job.products.TotalAmount+"' "+Subtotal+"  Date='"+job.Date+"' Time='"+job.Time+"' UserID='"+job.UserID+"' ClearText='"+job.UserID+"' /></Message>";
      //let xml = "<Message type='PostSimple' direction='ToPMS'><PostSimple RoomNum='9533' PostType='C' SalesOutlet='03' PostNum='Q0016562' CheckNum='Q0016562' PaymentMethod='7080' ServingTime='3' TableNum='' Covers='' TotalAmount='164800' Subtotal3='1800' Subtotal2='98000' Subtotal1='65000'  Date='170622' Time='165029' UserID='chai' ClearText='chai' /> </Message>";
      client.write(Buffer.concat([Buffer.from(xml),Buffer.from([0x00])]));
    });

    client.on('data', function(data) {
      console.log('Received: ' + data);
      client.destroy(); // kill client after server's response
    });

    client.on('error', function(err) {
      job.products.ServingTime += 1;
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

    let jobs = {};
    job.products.forEach((product) => {
      let category = product.Subtotal2;
      if (category && category.length == 4) {
        let SalesOutlet = category.substr(0,2);
        let Subtotal = category.substr(2,2);
        if (!jobs[SalesOutlet]) {
          jobs[SalesOutlet] = {SalesOutlet, TotalAmount: 0, ServingTime: 1, Subtotal:{}};
        }
        jobs[SalesOutlet].TotalAmount += product.TotalAmount;
        if (!jobs[SalesOutlet].Subtotal[Subtotal]) {
          jobs[SalesOutlet].Subtotal[Subtotal] = 0;
        }
        jobs[SalesOutlet].Subtotal[Subtotal] += product.TotalAmount;
      }
    });
    console.log('add job');
    Object.keys(jobs).forEach((key) => {
      console.log(jobs[key]);
      let jobItem = Object.assign({}, job);
      jobItem.products = jobs[key];
      messageQueue.add({type: 'tcp', job: jobItem});
    });
  }
};
