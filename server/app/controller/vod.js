'use strict';

const Controller = require('egg').Controller;
var querystring = require("querystring");
var crypto = require('crypto');
class VodController extends Controller {
    // 签名
    async sign() {
        var { secret_id, secret_key,vodSubAppId } = this.app.config.tencentVod;

        // 确定签名的当前时间和失效时间
        var current = parseInt((new Date()).getTime() / 1000)
        var expired = current + 86400;  // 签名有效期：1天

        // 向参数列表填入参数
        var arg_list = {
            secretId: secret_id,
            currentTimeStamp: current,
            expireTime: expired,
            random: Math.round(Math.random() * Math.pow(2, 32)),
            oneTimeValid: 1,
            vodSubAppId: vodSubAppId,
        }

        // 计算签名
        var orignal = querystring.stringify(arg_list);
        var orignal_buffer = new Buffer(orignal, "utf8");

        var hmac = crypto.createHmac("sha1", secret_key);
        var hmac_buffer = hmac.update(orignal_buffer).digest();

        var signature = Buffer.concat([hmac_buffer, orignal_buffer]).toString("base64");

        this.ctx.apiSuccess(signature);
    }
}

module.exports = VodController;
