-- ============================================================
-- 迁移脚本：会员管理 + VIP等级 + 充值余额
-- 日期：2026-06-13
-- 作用：给会员系统增加 启用/禁用、会员等级、VIP到期、账户余额，
--       并新建"充值流水表"记录每一笔余额变动。
-- 用法：在 egg-edu 库执行本文件即可（已存在的列/表会被 IF NOT EXISTS 之类保护，
--       但 ADD COLUMN 没有 IF NOT EXISTS，重复执行前请确认列不存在）。
-- ============================================================

-- 1) user 表：增加"状态/等级/VIP到期/余额"四个字段
--    status     1=正常 0=禁用（禁用后该用户无法登录）
--    level      会员等级，文字：普通 / VIP / SVIP
--    vip_expire VIP 到期时间，NULL=不是VIP或永久
--    balance    账户余额（元），用于买课
ALTER TABLE `user` ADD COLUMN `status`     TINYINT       NOT NULL DEFAULT 1       COMMENT '1正常 0禁用';
ALTER TABLE `user` ADD COLUMN `level`      VARCHAR(20)   NOT NULL DEFAULT '普通'  COMMENT '会员等级';
ALTER TABLE `user` ADD COLUMN `vip_expire` DATETIME      NULL                     COMMENT 'VIP到期时间';
ALTER TABLE `user` ADD COLUMN `balance`    DECIMAL(10,2) NOT NULL DEFAULT 0.00    COMMENT '账户余额';

-- 2) 充值流水表：每给会员充值/扣减一次，就在这里记一行（钱的账本）
--    amount        本次变动金额，正=充值 负=扣减
--    balance_after 这次操作之后的余额（留底，便于对账）
--    type          来源：admin=后台手动 / pay=真实支付
--    remark        备注
CREATE TABLE IF NOT EXISTS `recharge_log` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `user_id`       INT           NOT NULL DEFAULT 0,
  `amount`        DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '充值金额(可负=扣减)',
  `balance_after` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '充值后余额',
  `type`          VARCHAR(20)   NOT NULL DEFAULT 'admin' COMMENT 'admin手动/pay支付',
  `remark`        VARCHAR(200)  NOT NULL DEFAULT '',
  `created_time`  DATETIME      NULL,
  `updated_time`  DATETIME      NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值/余额变动流水';

-- 3) 全局设置表（默认头像等键值配置；本次会员功能间接依赖，一并附上）
CREATE TABLE IF NOT EXISTS `sys_setting` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `skey`         VARCHAR(50)  NOT NULL COMMENT '配置键',
  `svalue`       VARCHAR(500) NOT NULL DEFAULT '' COMMENT '配置值',
  `created_time` DATETIME     NULL,
  `updated_time` DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_skey` (`skey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='全局键值配置';
INSERT INTO `sys_setting` (`skey`,`svalue`,`created_time`,`updated_time`)
VALUES ('default_avatar','',NOW(),NOW())
ON DUPLICATE KEY UPDATE `skey`=`skey`;
