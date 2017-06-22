var utils = require('./utils');
var constValue = require('./const');
var moment = require('moment-timezone');

var Test = function(args, callback) {
  callback({
    TestResult: 1
  })
};

var GetAmountStatistical = function (args, callback) {
  callback({
    GetAmountStatisticalResult: 1
  });
};

var GetPaymentSingle = function (args, callback) {
  callback({
    GetPaymentSingleResult: 1
  });
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

var service = {
  ThirdCensusService: {
    ThirdCensusServiceSoap: {
      Test,
      GetAmountPayment,
      GetPaymentSingle,
      GetAmountStatistical,
    },
    ThirdCensusServiceSoap12: {
      Test,
      GetAmountPayment,
      GetPaymentSingle,
      GetAmountStatistical,
    }
  }
};

var wsdl = require('fs').readFileSync('./static/wsdl/huabin.wsdl', 'utf8');

module.exports = {
  service,
  wsdl,
};
