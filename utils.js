var request = require('request').defaults({jar: true});
var constValue = require('./const');

var utils = {

    getRequest(callback) {
        request({
            method: 'POST',
            uri: constValue.tkBaseUrl + '/Api/Front/Login',
            json: true,
            body: {
                userName: constValue.tkUser,
                password: constValue.tkPassword,
                leagueId: constValue.tkLeagueId,
                clubId: constValue.tkClubId,
            }
        }, function (error, response, body) {
            if (!error && body && body.code) {
                callback(null, request);
            } else {
                callback(new Error('登录失败'));
            }
        });
    },
    getRequestAndConfig(callback) {
        utils.getRequest(function (err, request) {
            if (err) {
                callback(err);
                return;
            }
            request({
                method: 'POST',
                uri: constValue.tkBaseUrl + '//Api/Front/Config',
                json: true,
                body: {
                    leagueId: constValue.tkLeagueId,
                    clubId: constValue.tkClubId,
                }
            }, function (error, response, body) {
                if (!error && body && body.code) {
                    callback(null, request, body.message);
                } else {
                    callback(new Error('登录接口获取config失败'));
                }
            });
        });
    },

};

module.exports = utils;
