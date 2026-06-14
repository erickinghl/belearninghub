-- ============================================================
-- 迁移脚本：学习时长统计（心跳上报）
-- 日期：2026-06-13
-- 作用：建 study_log 表，记录"谁、哪门课、哪天、学了多少秒"。
--       前端看课程时每60秒发一次心跳，后端往今天这门课的记录上累加。
-- 设计：(user_id, course_id, study_date) 唯一键——每人每天每门课只一行，
--       心跳来了就 seconds += 60。既按天聚合，又能按课程分布，数据量小。
-- ============================================================

CREATE TABLE IF NOT EXISTS `study_log` (
  `id`           INT  NOT NULL AUTO_INCREMENT,
  `user_id`      INT  NOT NULL DEFAULT 0,
  `course_id`    INT  NOT NULL DEFAULT 0 COMMENT '学习的课程id(0=未指定)',
  `study_date`   DATE NOT NULL COMMENT '学习日期(按天聚合)',
  `seconds`      INT  NOT NULL DEFAULT 0 COMMENT '当天该课程累计学习秒数',
  `created_time` DATETIME NULL,
  `updated_time` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_course_date` (`user_id`, `course_id`, `study_date`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习时长(按用户+课程+日期聚合)';
