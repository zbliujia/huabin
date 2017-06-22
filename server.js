var express = require('express');
var soap = require('soap');
var app = express();
var bodyParser = require('body-parser');
var soapService = require('./soapService');
var opera = require('./opera');

app.use(bodyParser.json());

app.post('/opera', function (req, res) {
  console.log(req.body);
  opera.add(req.body);
  res.json({
    code: 1,
  });
});

app.listen(3000, function () {
  soap.listen(app, '/sap', soapService.service, soapService.wsdl);
  console.log('huabin server listening on port 3000!');
});
