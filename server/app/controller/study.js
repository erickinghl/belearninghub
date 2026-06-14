'use strict';

const Controller = require('egg').Controller;

const HEARTBEAT_SECONDS = 60;   // 每次心跳代表的秒数
const MAX_SECONDS_PER_BEAT = 120; // 单次最多累加 120 秒（防作弊/异常）

class StudyController extends Controller {
    // 学习心跳：前端每 60 秒发一次，后端给"今天+这门课"累加时长
    // body: { course_id?, seconds? }
    async heartbeat() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const course_id = parseInt(body.course_id) || 0;
        let seconds = parseInt(body.seconds) || HEARTBEAT_SECONDS;
        if (seconds < 0) seconds = 0;
        if (seconds > MAX_SECONDS_PER_BEAT) seconds = MAX_SECONDS_PER_BEAT;

        // 今天日期 yyyy-mm-dd
        const d = new Date();
        const study_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        // 找今天该课程的记录，有就累加，没有就建
        const exist = await app.model.StudyLog.findOne({ where: { user_id, course_id, study_date } });
        if (exist) {
            await app.model.StudyLog.update(
                { seconds: exist.seconds + seconds },
                { where: { id: exist.id } }
            );
        } else {
            await app.model.StudyLog.create({ user_id, course_id, study_date, seconds });
        }
        ctx.apiSuccess('ok');
    }
}

module.exports = StudyController;
