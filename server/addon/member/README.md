# ADDON：会员管理 + VIP等级 + 充值（member）

> 这是一个**功能包**：把"后台会员管理 + VIP等级 + 余额充值"这一整块独立收纳，
> 方便以后在别的项目里复用，也方便追踪这块代码的来龙去脉。

## 这个功能做了什么（大白话）

后台管理员可以：
- 看所有注册会员的列表（搜索用户名/昵称/手机）
- 看每个会员做了多少题、对错率、考试记录、订单、笔记、收藏
- 给会员改密码、启用/禁用账号
- 设会员等级（普通 / VIP / SVIP）和 VIP 到期时间
- 给会员充值/扣减余额，并留下一条"充值流水"

## 包含的文件

| 文件 | 作用 |
|------|------|
| `install.sql` | 安装用的数据库脚本：给 user 表加 4 个字段、建 recharge_log 充值流水表、建 sys_setting 全局配置表 |
| `member.controller.js` | 后端逻辑：会员列表/详情/改密/禁用/设等级/充值/总览统计 |
| `recharge_log.model.js` | 充值流水表的数据模型 |

## 怎么装到别的项目（3 步）

1. **执行 SQL**：在数据库里跑 `install.sql`（建表+加字段）。
2. **放代码**：
   - `member.controller.js` → 改名 `member.js` 放进 `app/controller/`
   - `recharge_log.model.js` → 改名 `recharge_log.js` 放进 `app/model/`
   - user 模型里补上 `status / level / vip_expire / balance` 四个字段（见 install.sql 注释）
3. **加路由**（在 `app/router.js` 里）：
   ```js
   router.get('/admin/member/list',            controller.member.list);
   router.get('/admin/member/detail',          controller.member.detail);
   router.post('/admin/member/reset_password', controller.member.resetPassword);
   router.post('/admin/member/toggle_status',  controller.member.toggleStatus);
   router.post('/admin/member/set_level',      controller.member.setLevel);
   router.post('/admin/member/recharge',       controller.member.recharge);
   router.get('/admin/member/overview',        controller.member.overview);
   ```
   （这些都在 `/admin/` 前缀下，会自动走登录鉴权中间件。）

前端后台界面在 `app/public/admin.html` 的"会员管理"标签页里（属于主工程，不在本包内）。

## 接口一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /admin/member/list | 会员列表（?kw= 搜索, ?page=&limit=） |
| GET  | /admin/member/detail?id= | 某会员的完整资料 + 统计 |
| POST | /admin/member/reset_password | 改密码 {id, password} |
| POST | /admin/member/toggle_status | 启用/禁用 {id, status} |
| POST | /admin/member/set_level | 设等级 {id, level, vip_expire} |
| POST | /admin/member/recharge | 充值/扣减 {id, amount, remark} |
| GET  | /admin/member/overview | 后台总览数字 |
