-- ============================================================
-- 迁移脚本：视频上传大小限制（后台可配）
-- 日期：2026-06-13
-- 作用：往全局配置表 sys_setting 里加一个键 video_max_mb，
--       存"单个视频允许上传的最大 MB 数"。上传视频时后端读它做拦截。
-- 说明：sys_setting 表在上一个迁移(2026-06-13_member_vip.sql)已建好，
--       这里只插入一个新配置键，默认 50MB。
-- ============================================================

INSERT INTO `sys_setting` (`skey`, `svalue`, `created_time`, `updated_time`)
VALUES ('video_max_mb', '50', NOW(), NOW())
ON DUPLICATE KEY UPDATE `skey` = `skey`;   -- 已存在则不覆盖，避免改掉管理员已设的值
