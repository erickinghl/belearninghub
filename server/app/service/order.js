'use strict';

const Service = require('egg').Service;

class OrderService extends Service {
    // 判断用户是否已购买某商品（存在已支付订单）
    async isBuy(user_id, goods_type, goods_id) {
        if (!user_id) return false;
        const count = await this.app.model.Order.count({
            where: { user_id, goods_type, goods_id, status: 1 }
        });
        return count > 0;
    }
}

module.exports = OrderService;
