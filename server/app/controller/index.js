'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
    // 首页聚合数据：返回 templates 数组，前端按 type 渲染
    async index() {
        const { ctx, app } = this;

        // 1. 轮播图（从 banner 表取，没有则用占位）
        let banners = await app.model.Banner.findAll({ order: [['id', 'DESC']], limit: 5 });
        banners = JSON.parse(JSON.stringify(banners));
        const swiperData = banners.length ? banners.map(b => ({
            src: b.cover || b.url || '',
            type: b.course_id ? 'course' : 'webview',
            course_id: b.course_id || 0,
            url: b.link || ''
        })) : [];


        // 3. 固定图标导航（教育方向：刷题/电子书/课程/专栏 + 我的）
        // 图标用内联 SVG data-uri，不依赖外部 CDN（原 aliyun 图床已失效）
        const icon = (emoji, color) => {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">`
                + `<circle cx="40" cy="40" r="40" fill="${color}"/>`
                + `<text x="40" y="52" font-size="40" text-anchor="middle">${emoji}</text></svg>`;
            return 'data:image/svg+xml,' + encodeURIComponent(svg);
        };
        // 优先从 nav_icon 表读（后台可配置）；表为空则用下面的默认 8 个
        let icons = [];
        const navRows = await app.model.NavIcon.findAll({
            where: { status: 1 },
            order: [['sort', 'DESC'], ['id', 'ASC']]
        });
        if (navRows.length) {
            icons = navRows.map(n => {
                // 优先用自定义上传图片，没有则用 emoji 生成的圆形 SVG
                const src = n.image_url ? n.image_url : icon(n.emoji || '⭐', n.bg_color || '#e8f3ff');
                const it = { src, name: n.name };
                if (n.jump_type === 'url') it.url = n.jump_value;
                else it.module = n.jump_value;
                return it;
            });
        } else {
            icons = [
                { src: icon('📝', '#e8f3ff'), name: '题库', module: 'test' },
                { src: icon('📚', '#fff3e0'), name: '电子书', module: 'book' },
                { src: icon('🎓', '#e6f7ec'), name: '课程', module: 'course' },
                { src: icon('📰', '#f3e8ff'), name: '专栏', module: 'column' },
                { src: icon('✏️', '#fff8e1'), name: '笔记', url: '/pages/note-list/note-list' },
                { src: icon('🏆', '#fff0f0'), name: '我的考试', module: 'my-test' },
                { src: icon('🔖', '#e0f7f4'), name: '我的书架', module: 'my-book' },
                { src: icon('⭐', '#fdeef4'), name: '我的收藏', url: '/pages/fava-list/fava-list' }
            ];
        }

        // 组装 templates
        const templates = [
            { type: 'search', placeholder: '请输入搜索关键词' }
        ];
        if (swiperData.length) {
            templates.push({ type: 'swiper', data: swiperData });
        }
        templates.push({ type: 'icons', data: icons });

        // 内容板块：从 home_section 表读（后台可配，按类型自动拉数据）
        const sections = await app.model.HomeSection.findAll({
            where: { status: 1 },
            order: [['sort', 'DESC'], ['id', 'ASC']]
        });
        for (const sec of sections) {
            const lim = sec.limit_num > 0 ? sec.limit_num : 6;
            let data = [];
            const stype = sec.source_type;
            if (stype === 'book') {
                const books = await app.model.Book.findAll({ where: { status: 1 }, order: [['sort', 'DESC'], ['id', 'DESC']], limit: lim });
                data = JSON.parse(JSON.stringify(books));
            } else if (stype === 'testpaper') {
                const papers = await app.model.Testpaper.findAll({ where: { status: 1 }, order: [['sort', 'DESC'], ['id', 'DESC']], limit: lim });
                data = JSON.parse(JSON.stringify(papers));
            } else {
                // course / column 都走 Course 表，按 type 过滤
                const where = { status: 1 };
                where.type = stype === 'column' ? 'column' : { [app.Sequelize.Op.ne]: 'column' };
                const courses = await app.model.Course.findAll({ where, order: [['sort', 'DESC'], ['id', 'DESC']], limit: lim });
                data = JSON.parse(JSON.stringify(courses));
            }
            templates.push({
                type: 'list',
                dataType: stype,          // 前端按这个决定用哪个卡片组件
                title: sec.title,
                listType: 'one',
                showMore: !!sec.show_more,
                data
            });
        }

        ctx.apiSuccess(templates);
    }
}

module.exports = IndexController;
