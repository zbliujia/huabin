var express = require('express');
var soap = require('soap');
var moment = require('moment-timezone');
var app = express();
var utils = require('./utils');
var constValue = require('./const');

//app.use(require('express-xml-bodyparser')());

//app.get('/sap', function (req, res) {
//  res.send('Hello World!');
//});
//
//app.post('/sap', function (req, res) {
//  console.log(req.body);
//  res.send('Hello World!');
//});

var Test = function(args, callback) {
  //utils.getRequest(function (err, request) {
  //  if (err) {
  //    callback({
  //      TestResult: err.message
  //    });
  //    return;
  //  }
  //
  //  //{"":"","requesttime":"2017-06-19 16:43:26","date":"2017-06-19","start_date":"2017-06-19 00:00:00","end_date":"2017-06-25 23:59:59"}
  //
  //
  //  request({
  //    method: 'POST',
  //    uri: constValue.tkBaseUrl + '/Api/Front/Checkout/PracticePayMentSalesData',
  //    json: true,
  //    body: {
  //      requestcommand: 'Checkout/PracticePayMentSalesData',
  //      leagueId: constValue.tkLeagueId,
  //      clubId: constValue.tkClubId,
  //      person: '0',
  //      checkout: '0',
  //      start_date: '',
  //      end_date: '',
  //    }
  //  }, function (error, response, body) {
  //    if (!error && body && body.code) {
  //      callback(null, request, body.message);
  //    } else {
  //      callback(new Error('登录接口获取config失败'));
  //    }
  //  });
  //});
};

var GetAmountPayment = function(args, callback) {
  console.log('GetAmountPayment coming');
  utils.getRequest(function (err, request) {

    if (err) {
      console.log(err);
      callback({
        GetAmountPaymentResult: 1
      });
      return;
    }

    request({
      method: 'POST',
      uri: constValue.tkBaseUrl + '/Api/Front/Checkout/PracticePayMentSalesData',
      json: true,
      body: {
        leagueId: constValue.tkLeagueId,
        clubId: constValue.tkClubId,
        person: '0',
        checkout: '0',
        start_date: moment(args.starDate).format('YYYY-MM-DD HH:mm:ss'),
        end_date: moment(args.endDate).format('YYYY-MM-DD HH:mm:ss'),
      }
    }, function (error, response, body) {
      if (!error && body && body.code) {
        let infos = [];
        body.message.payment.forEach(function (item) {
          infos.push({AmountList:{
            Code: 0,
            Name: item.name,
            Amount: item.money?item.money:0,
          }})
        });
        callback({
          GetAmountPaymentResult: 0,
          infos
        });
      } else {
        console.log(err);
        console.log(body);
        callback({
          GetAmountPaymentResult: 1
        });
      }
    });
  });
};

app.listen(3000, function () {

  var service = {
    ThirdCensusService: {
      ThirdCensusServiceSoap: {
        Test,
        GetAmountPayment
      },
      ThirdCensusServiceSoap12: {
        Test,
        GetAmountPayment,
      }
    }
  };


  soap.listen(app, '/sap', service, require('fs').readFileSync('./static/wsdl/huabin.wsdl', 'utf8'));
  console.log('Example app listening on port 3000!');
});
