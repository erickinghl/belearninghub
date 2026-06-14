'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const dayjs = require('dayjs');
const sharp = require('sharp');

// 图片压缩参数
const IMG_MAX_WIDTH = 1280;   // 超过这个宽度的图等比缩小
const IMG_QUALITY = 80;       // jpeg/webp 压缩质量
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
const DEFAULT_VIDEO_MAX_MB = 50;   // 后台没设时的默认视频上限

class FileController extends Controller {
    async upload() {
        const { ctx, app } = this;
        const stream = await ctx.getFileStream();

        const uploadBasePath = 'app/public/uploads';
        const ext = path.extname(stream.filename).toLocaleLowerCase();
        const dirname = dayjs(Date.now()).format('YYYY/MM/DD');
        const rand = Number.parseInt(Math.random() * 1000);

        // 确保目录存在
        const dirAbs = path.join(uploadBasePath, dirname);
        fs.mkdirSync(dirAbs, { recursive: true });

        const isImage = IMG_EXTS.includes(ext);
        // gif 不压缩（保留动图）；其它图片走 sharp 压缩
        const doCompress = isImage && ext !== '.gif';

        // 把上传流读成 buffer
        let buffer;
        try {
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            buffer = Buffer.concat(chunks);
        } catch (err) {
            await sendToWormhole(stream);
            return ctx.throw(500, '文件读取失败');
        }

        // 视频：检查大小是否超过后台设置的上限（sys_setting.video_max_mb）
        if (VIDEO_EXTS.includes(ext)) {
            let maxMb = DEFAULT_VIDEO_MAX_MB;
            try {
                const row = await app.model.SysSetting.findOne({ where: { skey: 'video_max_mb' } });
                if (row && row.svalue && !isNaN(parseFloat(row.svalue))) maxMb = parseFloat(row.svalue);
            } catch (e) { /* 取不到就用默认值 */ }
            const sizeMb = buffer.length / 1024 / 1024;
            if (sizeMb > maxMb) {
                return ctx.throw(400, `视频大小 ${sizeMb.toFixed(1)}MB 超过上限 ${maxMb}MB，请压缩后再上传`);
            }
        }

        let filename, target;
        try {
            if (doCompress) {
                // 统一压缩：超大图缩到 1280px 宽，质量 80。png 保持 png，其余转 jpeg。
                const outExt = ext === '.png' ? '.png' : '.jpg';
                filename = `${Date.now()}${rand}${outExt}`;
                target = path.join(dirAbs, filename);
                let img = sharp(buffer, { failOn: 'none' }).rotate(); // rotate() 按 EXIF 自动摆正
                const meta = await img.metadata();
                if (meta.width && meta.width > IMG_MAX_WIDTH) {
                    img = img.resize({ width: IMG_MAX_WIDTH });
                }
                if (outExt === '.png') {
                    img = img.png({ compressionLevel: 9, quality: IMG_QUALITY });
                } else {
                    img = img.jpeg({ quality: IMG_QUALITY, mozjpeg: true });
                }
                await img.toFile(target);
            } else {
                // 非图片（pdf/视频/office）或 gif：原样写盘
                filename = `${Date.now()}${rand}${ext}`;
                target = path.join(dirAbs, filename);
                fs.writeFileSync(target, buffer);
            }
        } catch (err) {
            // 压缩失败兜底：原样写盘，不让上传失败
            filename = `${Date.now()}${rand}${ext}`;
            target = path.join(dirAbs, filename);
            try { fs.writeFileSync(target, buffer); } catch (e) { return ctx.throw(500, '文件保存失败'); }
        }

        const { protocol } = ctx.request;
        let url = path.join('/public/uploads', dirname, filename).replace(/\\|\//g, '/');
        url = protocol + '://' + app.config.webUrl + url;

        ctx.apiSuccess({ url });
    }
}

module.exports = FileController;
