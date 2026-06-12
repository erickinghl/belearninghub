module.exports = {
    // 成功提示
    apiSuccess(data = '', msg = 'ok', code = 200) {
        this.body = { msg, data };
        this.status = code;
    },
    // 失败提示
    apiFail(data = '', msg = 'fail', code = 400) {
        this.body = { msg, data };
        this.status = code;
    },
    // 生成token
    getToken(value) {
        return this.app.jwt.sign(value, this.app.config.jwt.secret);
    },
    // 分页
    async page(model, where = {}, options = {}) {
        let page = this.params.page ? parseInt(this.params.page) : 1;
        let limit = this.query.limit ? parseInt(this.query.limit) : 10;
        let offset = (page - 1) * limit;

        if (!options.order) {
            options.order = [
                ['id', 'DESC']
            ];
        }

        return await model.findAll({
            where,
            offset,
            limit,
            ...options
        });
    }
};