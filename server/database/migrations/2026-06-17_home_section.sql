-- 首页内容板块（后台可配，按类型自动拉数据）
-- 用法：mysql -uroot -proot egg-edu < 2026-06-17_home_section.sql

CREATE TABLE IF NOT EXISTS `home_section` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL DEFAULT '' COMMENT '板块标题(如 最新课程)',
  `source_type` varchar(20) NOT NULL DEFAULT 'course' COMMENT 'course课程/book图书/testpaper题库/column专栏',
  `limit_num` int NOT NULL DEFAULT '6' COMMENT '显示条数',
  `show_more` tinyint NOT NULL DEFAULT '1' COMMENT '是否显示"查看更多"',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序越大越靠前',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1显示 0隐藏',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='首页内容板块';

-- 默认插入一个"最新课程"板块（仅当表为空时），保证升级后首页不空白
INSERT INTO `home_section` (`title`, `source_type`, `limit_num`, `show_more`, `sort`, `status`, `created_time`, `updated_time`)
SELECT '最新课程', 'course', 6, 1, 100, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `home_section` LIMIT 1);
