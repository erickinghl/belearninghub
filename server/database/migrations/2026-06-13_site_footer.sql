-- ============================================================
-- 迁移脚本：站点信息 + 页脚配置（后台可改）
-- 日期：2026-06-13
-- 作用：往 sys_setting 表插入站点标题/Logo/介绍/页脚链接/联系方式/版权/备案 等配置键。
-- 说明：sys_setting 表已存在，这里只插入默认配置键；已存在则不覆盖。
-- ============================================================

INSERT INTO `sys_setting` (`skey`,`svalue`,`created_time`,`updated_time`) VALUES
('site_name','EduYi 易教',NOW(),NOW()),
('site_logo','',NOW(),NOW()),
('site_desc','专注在线教育，让学习更高效。课程 · 题库 · 电子书一站式学习平台。',NOW(),NOW()),
('footer_links','[{"name":"关于我们","url":""},{"name":"联系我们","url":""},{"name":"帮助中心","url":""},{"name":"用户协议","url":""}]',NOW(),NOW()),
('contact_phone','400-000-0000',NOW(),NOW()),
('contact_email','support@eduyi.com',NOW(),NOW()),
('contact_address','',NOW(),NOW()),
('copyright','© 2026 EduYi 易教 版权所有',NOW(),NOW()),
('icp','',NOW(),NOW())
ON DUPLICATE KEY UPDATE `skey`=`skey`;
