-- MySQL dump 10.13  Distrib 9.5.0, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: egg-edu
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '54f02889-6228-11f1-8cd5-743af4016792:1-420';

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20200521193427-user.js'),('20200526124455-category.js'),('20200526140126-video.js'),('20200526140133-video_detail.js'),('20200526140138-video_play.js'),('20200529135103-fava.js'),('20200529150904-comment.js'),('20200529211000-follow.js'),('20200711152328-banner.js'),('20260607000001-course.js'),('20260607100001-testpaper.js'),('20260607100002-question.js'),('20260607100003-user_test.js'),('20260607110001-user_test-status.js'),('20260608100001-book.js'),('20260608100002-book_detail.js'),('20260608110001-note.js'),('20260608120001-book-filetype.js'),('20260608130001-order.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banner`
--

DROP TABLE IF EXISTS `banner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '广告图名称',
  `cover` varchar(255) DEFAULT '' COMMENT '广告图链接',
  `video_id` int NOT NULL DEFAULT '0' COMMENT '视频id',
  `course_id` int NOT NULL DEFAULT '0' COMMENT '关联课程id',
  `link` varchar(255) NOT NULL DEFAULT '' COMMENT '外链',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `video_id` (`video_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banner`
--

LOCK TABLES `banner` WRITE;
/*!40000 ALTER TABLE `banner` DISABLE KEYS */;
INSERT INTO `banner` VALUES (3,'','http://127.0.0.1:7001/public/banners/b1.svg',0,0,'','2026-06-07 01:37:30','2026-06-09 23:18:36'),(4,'','http://127.0.0.1:7001/public/banners/b2.svg',0,0,'','2026-06-07 01:37:30','2026-06-09 23:18:36'),(6,'','http://172.16.0.2:7001/public/uploads/2026/06/13/1781352573318114.jpg',0,0,'','2026-06-08 16:45:25','2026-06-13 20:09:34');
/*!40000 ALTER TABLE `banner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '书名',
  `cover` varchar(255) DEFAULT '' COMMENT '封面',
  `author` varchar(50) DEFAULT '' COMMENT '作者',
  `category_id` int NOT NULL DEFAULT '0' COMMENT '分类id',
  `type` varchar(20) NOT NULL DEFAULT 'media' COMMENT '类型标签',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '现价',
  `t_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '原价',
  `try` longtext COMMENT '简介(富文本)',
  `desc` varchar(255) DEFAULT '' COMMENT '简短描述',
  `sub_count` int NOT NULL DEFAULT '0' COMMENT '订阅/阅读人数',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `status` int NOT NULL DEFAULT '1' COMMENT '1上架 0下架',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  `book_type` varchar(20) NOT NULL DEFAULT 'chapter' COMMENT 'chapter章节/pdf/txt',
  `file_url` varchar(255) DEFAULT '' COMMENT 'PDF/TXT 文件地址',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book`
--

LOCK TABLES `book` WRITE;
/*!40000 ALTER TABLE `book` DISABLE KEYS */;
INSERT INTO `book` VALUES (1,'JavaScript 入门读本','http://172.16.0.2:7001/public/uploads/2026/06/13/1781353032428415.jpg','',0,'media',0.00,0.00,'','',0,0,1,'2026-06-08 17:14:33','2026-06-13 20:17:13','chapter',''),(3,'TraceMonkey 论文(PDF)','http://172.16.0.2:7001/public/uploads/2026/06/13/1781353021532250.jpg','Mozilla',0,'media',0.00,0.00,'','PDF 阅读测试',0,0,1,'2026-06-08 20:37:38','2026-06-13 20:17:03','pdf','http://127.0.0.1:7001/public/uploads/2026/06/08/sample.pdf');
/*!40000 ALTER TABLE `book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `book_detail`
--

DROP TABLE IF EXISTS `book_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL DEFAULT '0' COMMENT '所属书id',
  `title` varchar(150) NOT NULL DEFAULT '' COMMENT '章节标题',
  `content` longtext COMMENT '章节内容(富文本/TXT)',
  `isfree` int NOT NULL DEFAULT '0' COMMENT '1免费试读 0需购买',
  `sort` int NOT NULL DEFAULT '0' COMMENT '章节顺序',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_detail`
--

LOCK TABLES `book_detail` WRITE;
/*!40000 ALTER TABLE `book_detail` DISABLE KEYS */;
INSERT INTO `book_detail` VALUES (1,1,'第一章 变量与数据类型','<h3>第一章 变量与数据类型</h3><p>JavaScript 用 let/const 声明变量。基本类型有 string、number、boolean 等。</p>',1,1,'2026-06-08 17:14:49','2026-06-08 17:14:49'),(2,1,'第二章 函数','<h3>第二章 函数</h3><p>函数是一等公民，可作为参数传递。箭头函数 () => {} 是 ES6 语法。</p>',1,2,'2026-06-08 17:14:49','2026-06-08 17:14:49'),(3,1,'第三章 异步编程','<h3>第三章 异步编程</h3><p>Promise、async/await 让异步代码像同步一样书写。</p>',0,3,'2026-06-08 17:14:49','2026-06-08 17:14:49');
/*!40000 ALTER TABLE `book_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '分类名称',
  `type` varchar(20) NOT NULL DEFAULT 'course' COMMENT '分类用途 course/testpaper',
  `sort` int NOT NULL DEFAULT '0',
  `cover` varchar(255) DEFAULT '' COMMENT '分类图标',
  `desc` text NOT NULL COMMENT '分类描述',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'前端基础','testpaper',100,'','HTML/CSS/JS 基础题','2026-06-11 03:34:51','2026-06-11 03:34:51'),(2,'Vue 框架','testpaper',90,'','Vue2/Vue3 相关题','2026-06-11 03:34:51','2026-06-11 03:34:51'),(3,'后端 Node','testpaper',80,'','Node/egg.js 后端题','2026-06-11 03:34:51','2026-06-11 03:34:51');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL COMMENT '评论内容',
  `video_id` int NOT NULL DEFAULT '0' COMMENT '视频id',
  `user_id` int NOT NULL DEFAULT '0' COMMENT '用户id',
  `reply_id` int NOT NULL DEFAULT '0' COMMENT '回复id',
  `reply_user_id` int NOT NULL DEFAULT '0' COMMENT '回复用户id',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `video_id` (`video_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `video` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '课程标题',
  `cover` varchar(255) DEFAULT '' COMMENT '封面',
  `category_id` int NOT NULL DEFAULT '0' COMMENT '分类id',
  `type` varchar(20) NOT NULL DEFAULT 'media' COMMENT '类型 media/audio/video/column',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '现价',
  `t_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '原价',
  `content` longtext COMMENT '课程内容',
  `try` longtext COMMENT '试看简介',
  `desc` varchar(255) DEFAULT '' COMMENT '简短描述',
  `study_count` int NOT NULL DEFAULT '0' COMMENT '学习人数',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `status` int NOT NULL DEFAULT '1' COMMENT '1上架 0下架',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'Vue3 实战在线教育','http://172.16.0.2:7001/public/uploads/2026/06/13/1781352981730887.jpg',0,'media',0.00,0.00,'<h3>第一章 项目搭建</h3><p>使用 Vue3 + Vite 初始化项目，配置路由与状态管理。</p><h3>第二章 组件开发</h3><p>从零实现课程列表、详情、购买等核心组件。</p><h3>第三章 接口对接</h3><p>对接 egg.js 后端，完成登录、课程、订单全流程。</p><p>本课程配套源码与答疑，学完即可独立开发一套在线教育系统。</p>','','',0,0,1,'2026-06-07 16:08:34','2026-06-13 20:16:22'),(2,'uni-app 实战短视频 App','http://172.16.0.2:7001/public/uploads/2026/06/13/1781352966649334.jpg',0,'video',0.00,10.00,'','代码演示','',120,90,1,'2026-06-07 16:08:34','2026-06-13 20:16:08'),(3,'egg.js 后端开发实战','http://172.16.0.2:7001/public/uploads/2026/06/13/1781352974322594.jpg',0,'column',19.90,50.00,'<h3>第一章 egg.js 基础</h3><p>目录约定、路由、控制器、服务、中间件。</p><h3>第二章 数据层</h3><p>Sequelize 模型、迁移、关联查询。</p><h3>第三章 业务实战</h3><p>JWT 鉴权、文件上传、Redis 缓存、订单与支付。</p>','<p>本专栏带你从零用 egg.js 构建一套完整的教育后端：用户鉴权、课程、订单、刷题、电子书全模块实战。</p><p>适合有 Node.js 基础、想掌握企业级后端架构的同学。</p>','',0,0,1,'2026-06-07 16:08:34','2026-06-13 20:16:15');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fava`
--

DROP TABLE IF EXISTS `fava`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fava` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0' COMMENT '用户id',
  `video_id` int NOT NULL DEFAULT '0' COMMENT '视频id',
  `goods_type` varchar(20) NOT NULL DEFAULT 'course' COMMENT '商品类型 course/column/book',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `video_id` (`video_id`),
  CONSTRAINT `fava_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fava`
--

LOCK TABLES `fava` WRITE;
/*!40000 ALTER TABLE `fava` DISABLE KEYS */;
INSERT INTO `fava` VALUES (6,1,3,'course','2026-06-11 15:58:13','2026-06-11 15:58:13'),(7,1,1,'book','2026-06-11 15:58:13','2026-06-11 15:58:13'),(8,2,2,'course','2026-06-13 16:09:27','2026-06-13 16:09:27');
/*!40000 ALTER TABLE `fava` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follow`
--

DROP TABLE IF EXISTS `follow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT '用户id',
  `follow_id` int DEFAULT NULL COMMENT '关注id',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `follow_id` (`follow_id`),
  CONSTRAINT `follow_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `follow_ibfk_2` FOREIGN KEY (`follow_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follow`
--

LOCK TABLES `follow` WRITE;
/*!40000 ALTER TABLE `follow` DISABLE KEYS */;
/*!40000 ALTER TABLE `follow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nav_icon`
--

DROP TABLE IF EXISTS `nav_icon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nav_icon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '',
  `emoji` varchar(16) NOT NULL DEFAULT '',
  `image_url` varchar(300) NOT NULL DEFAULT '' COMMENT '自定义图标图片url(优先于emoji)',
  `bg_color` varchar(16) NOT NULL DEFAULT '#e8f3ff',
  `jump_type` varchar(10) NOT NULL DEFAULT 'module' COMMENT 'module内置 / url自定义页面',
  `jump_value` varchar(200) NOT NULL DEFAULT '' COMMENT 'module名 或 页面路径',
  `sort` int NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1显示 0隐藏',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nav_icon`
--

LOCK TABLES `nav_icon` WRITE;
/*!40000 ALTER TABLE `nav_icon` DISABLE KEYS */;
INSERT INTO `nav_icon` VALUES (1,'题库','📝','http://172.16.0.2:7001/public/uploads/2026/06/13/178135260163843.jpg','#e8f3ff','module','test',100,1,'2026-06-12 04:03:11','2026-06-13 20:10:03'),(2,'书籍','📚','','#fff3e0','module','book',90,1,'2026-06-12 04:03:11','2026-06-12 19:40:54'),(3,'课程','🎓','','#e6f7ec','module','course',80,1,'2026-06-12 04:03:11','2026-06-12 04:03:11'),(4,'专栏','📰','','#f3e8ff','module','column',70,1,'2026-06-12 04:03:11','2026-06-12 19:15:12'),(5,'笔记','✏️','','#fff8e1','url','/pages/note-list/note-list',60,1,'2026-06-12 04:03:11','2026-06-12 04:03:11'),(6,'考试','🏆','','#fff0f0','module','my-test',50,1,'2026-06-12 04:03:11','2026-06-12 19:29:37'),(7,'书架','🔖','','#e0f7f4','module','my-book',40,1,'2026-06-12 04:03:11','2026-06-12 19:29:42'),(8,'收藏','⭐','','#fdeef4','url','/pages/fava-list/fava-list',30,1,'2026-06-12 04:03:11','2026-06-12 19:29:46');
/*!40000 ALTER TABLE `nav_icon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `note`
--

DROP TABLE IF EXISTS `note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `note` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0' COMMENT '用户id',
  `title` varchar(150) NOT NULL DEFAULT '' COMMENT '笔记标题',
  `content` longtext COMMENT '笔记内容',
  `attachments` text COMMENT '附件(JSON数组[{type,url,name}])',
  `course_id` int NOT NULL DEFAULT '0' COMMENT '关联课程id(可选,0=不关联)',
  `question_id` int NOT NULL DEFAULT '0' COMMENT '关联题目id',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note`
--

LOCK TABLES `note` WRITE;
/*!40000 ALTER TABLE `note` DISABLE KEYS */;
INSERT INTO `note` VALUES (1,1,'Vue 学习笔记(已改)','补充：v-bind 简写 :，v-on 简写 @',NULL,0,0,'2026-06-08 18:20:56','2026-06-08 18:20:57'),(2,1,'测试新笔记标题','这是通过 H5 写入的测试笔记内容',NULL,0,0,'2026-06-08 18:21:48','2026-06-08 18:21:48'),(4,2,'记录1','继续欧',NULL,0,0,'2026-06-11 13:07:50','2026-06-11 13:07:50'),(7,2,'测试图片和留言','加和','[{\"type\":\"image\",\"url\":\"http://127.0.0.1:7001/public/uploads/2026/06/12/1781260819321852.jpg\",\"name\":\"1781260819321852.jpg\"}]',0,3,'2026-06-12 18:40:23','2026-06-12 18:40:35');
/*!40000 ALTER TABLE `note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `no` varchar(64) NOT NULL DEFAULT '' COMMENT '订单号',
  `user_id` int NOT NULL DEFAULT '0' COMMENT '用户id',
  `goods_type` varchar(20) NOT NULL DEFAULT 'course' COMMENT '商品类型',
  `goods_id` int NOT NULL DEFAULT '0' COMMENT '商品id',
  `goods_title` varchar(150) DEFAULT '' COMMENT '商品标题(快照)',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单金额',
  `status` int NOT NULL DEFAULT '0' COMMENT '0待支付 1已支付 2已取消',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `pay_method` varchar(20) DEFAULT '' COMMENT '支付方式(mock/wxpay)',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,'178092589150010010',1,'course',1,'Vue3 实战在线教育',9.98,2,'2026-06-08 21:38:11','mock','2026-06-08 21:38:11','2026-06-08 21:59:26'),(2,'178092590895110056',1,'course',2,'uni-app 实战短视频 App',0.00,1,'2026-06-08 21:38:28','free','2026-06-08 21:38:28','2026-06-08 21:38:28'),(3,'178092722266213745',1,'course',1,'Vue3 实战在线教育',9.98,2,'2026-06-08 22:00:25','mock','2026-06-08 22:00:22','2026-06-09 21:03:44'),(4,'178101027609210967',1,'course',1,'Vue3 实战在线教育',9.98,1,'2026-06-09 21:04:38','mock','2026-06-09 21:04:36','2026-06-09 21:04:38'),(5,'178101048490425653',2,'course',1,'Vue3 实战在线教育',9.98,1,'2026-06-09 21:08:08','mock','2026-06-09 21:08:04','2026-06-09 21:08:08'),(6,'178116619506926895',2,'column',3,'egg.js 后端开发实战',19.90,1,'2026-06-11 16:23:17','mock','2026-06-11 16:23:15','2026-06-11 16:23:17');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testpaper_id` int NOT NULL DEFAULT '0' COMMENT '所属试卷id',
  `type` varchar(20) NOT NULL DEFAULT 'radio' COMMENT '题型',
  `title` longtext COMMENT '题干(富文本)',
  `options` longtext COMMENT '选项(JSON数组)',
  `answer` longtext COMMENT '正确答案(JSON)',
  `analysis` longtext COMMENT '习题解析',
  `analysis_images` text COMMENT '解析图片(JSON数组)',
  `analysis_video` varchar(500) DEFAULT NULL COMMENT '解析视频url',
  `score` int NOT NULL DEFAULT '0' COMMENT '该题分值',
  `sort` int NOT NULL DEFAULT '0' COMMENT '题目顺序',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (1,1,'radio','下列哪个不是 JavaScript 的基本数据类型？','[\"string\",\"number\",\"array\",\"boolean\"]','2','array（数组）属于引用类型 object，不是基本数据类型。基本类型有：string、number、boolean、undefined、null、symbol、bigint。','[]','',10,0,'2026-06-08 08:36:34','2026-06-12 12:06:09'),(2,1,'checkbox','以下哪些是 Vue 的生命周期钩子？（多选）','[\"created\",\"mounted\",\"rendered\",\"destroyed\"]','[0,1,3]','Vue2 生命周期含 created、mounted、destroyed 等；rendered 不是 Vue 的生命周期钩子。',NULL,NULL,20,2,'2026-06-08 08:36:34','2026-06-08 08:36:34'),(3,1,'trueOrfalse','判断：HTTP 是无状态协议。',NULL,'1','正确。HTTP 本身是无状态的，每次请求相互独立；状态保持靠 Cookie/Session/Token 等机制实现。',NULL,NULL,20,3,'2026-06-08 08:36:34','2026-06-08 08:36:34'),(4,1,'completion','CSS 盒模型从内到外依次是：content、______、border、______。',NULL,'[\"padding\",\"margin\"]','标准盒模型由内到外为：content（内容）→ padding（内边距）→ border（边框）→ margin（外边距）。',NULL,NULL,20,4,'2026-06-08 08:36:34','2026-06-08 08:36:34'),(5,1,'answer','简述什么是事件冒泡（Event Bubbling）。',NULL,'\"事件从触发的最内层元素开始，逐级向外层父元素传播的过程。\"','事件冒泡：事件从目标元素触发后，会沿 DOM 树向上依次传递到祖先元素，直到 document。可用 event.stopPropagation() 阻止。问答题不自动判分，仅记录作答。',NULL,NULL,20,5,'2026-06-08 08:36:34','2026-06-08 08:36:34'),(6,2,'radio','肿瘤中恶性肿瘤和良性肿瘤的区别','[\"转移\",\"非典型增生\",\"大小\",\"浸润深度\",\"代谢旺盛\"]','0','肿瘤的良恶性的区分 异性性和转移',NULL,NULL,1,0,'2026-06-11 16:57:41','2026-06-11 16:57:41'),(13,2,'radio','关于创伤口的局部表现，错误的是','[\"局部充血\",\"功能障碍\",\"创面肿胀\",\"全身发热\",\"伤口疼痛\"]','3','创伤的局部表现包括：A.局部充血（炎症反应）、B.功能障碍（组织损伤导致）、C.创面肿胀（组织液渗出）、E.伤口疼痛（神经刺激）。D.全身发热是全身反应，不属于局部表现。','[]','',3,0,'2026-06-13 15:52:05','2026-06-13 15:52:05'),(14,2,'radio','火器伤的处理原则中，错误的是','[\"伤后8小时内是最佳清创时机\",\"感染伤口应彻底清创后立即缝合\",\"清创时需要适当扩大伤道\",\"初期处理以开放引流为主\",\"需联合使用抗生素\"]','1','A.正确，火器伤应争取6-8小时内清创；B.错误，感染伤口不宜立即缝合；C.正确，需扩大伤道充分清创；D.正确，需开放引流3-5天；E.正确，抗生素不能替代清创但需联合使用。','[]','',3,0,'2026-06-13 15:52:05','2026-06-13 15:52:05'),(16,2,'radio','关于火器伤的处理原则，正确的是','[\"争取12小时内实施清创术\",\"因不能及时清创而感染的伤口，应该进行彻底清创\",\"清创时仅清理伤道内的异物及渗出物，不宜扩大伤道\",\"严禁初期缝合，开放引流3～5天后延期缝合\",\"及早应用抗生素代替清创\"]','3','A. 争取12小时内实施清创术：火器伤清创应尽可能在伤后6-8小时内进行（越早越好），12小时可能已错过最佳时机。若感染已形成，则不宜彻底清创。B. 因不能及时清创而感染的伤口，应该进行彻底清创：已感染的伤口不宜彻底清创，以免扩散感染，通常需引流、换药，控制感染后再处理。C. 清创时仅清理伤道内的异物及渗出物，不宜扩大伤道：火器伤清创需扩大伤道，充分暴露并清除坏死组织、异物及失活组织，避免遗漏深部损伤。D. 严禁初期缝合，开放引流3～5天后延期缝合：火器伤因污染重、组织损伤范围大，需开放伤口引流，观察3～5天无感染后再延期缝合。这是核心原则。E. 及早应用抗生素代替清创:抗生素不能替代清创，需清创+抗生素联合应用。','[]','',3,0,'2026-06-14 00:10:15','2026-06-14 00:10:15'),(17,2,'radio','以下哪项不是创伤口的局部表现','[\"疼痛\",\"功能障碍\",\"肿胀\",\"体温升高\",\"充血\"]','3','创伤的局部表现主要包括：A. 疼痛（神经末梢受刺激）B. 功能障碍（组织损伤影响活动）C. 肿胀（出血、炎症反应导致）E. 充血（局部血管扩张，血流增加）D. 体温升高是全身反应（如感染、炎症介质释放所致），而非创伤局部的直接表现。','[]','',3,0,'2026-06-14 00:10:15','2026-06-14 00:10:15'),(18,2,'radio','创伤急救“五项技术”是指','[\"通气、止血、包扎、固定、搬运\",\"通气、止血、包扎、固定、清创\",\"复苏、输液、止血、包扎、固定\",\"输液、通气、止血、包扎、后送\",\"复苏、通气、止血、包扎、固定\"]','0','创伤急救的“五项基本技术”是：通气（保持呼吸道通畅，如清除异物、开放气道）止血（控制出血，如压迫止血、止血带等）包扎（保护伤口，减少污染和进一步损伤）固定（骨折或关节损伤的临时固定，避免二次伤害）搬运（安全转运伤员，防止加重损伤）其他选项错误点：B（清创不是急救技术，而是后续处理）C（复苏、输液不属于基础五项）D（输液、后送不属于传统五项）E（复苏属于高级生命支持，非基础五项）','[]','',3,0,'2026-06-14 00:10:15','2026-06-14 00:10:15');
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_comment`
--

DROP TABLE IF EXISTS `question_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0',
  `question_id` int NOT NULL DEFAULT '0',
  `content` varchar(1000) NOT NULL DEFAULT '',
  `like_count` int NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1正常 0隐藏',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_q` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_comment`
--

LOCK TABLES `question_comment` WRITE;
/*!40000 ALTER TABLE `question_comment` DISABLE KEYS */;
INSERT INTO `question_comment` VALUES (3,3,13,'好题',0,1,'2026-06-13 20:20:01','2026-06-13 20:20:01'),(4,2,13,'不错',0,1,'2026-06-13 20:20:33','2026-06-13 20:20:33');
/*!40000 ALTER TABLE `question_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_correction`
--

DROP TABLE IF EXISTS `question_correction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_correction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0',
  `question_id` int NOT NULL DEFAULT '0',
  `testpaper_id` int NOT NULL DEFAULT '0',
  `content` varchar(500) NOT NULL DEFAULT '' COMMENT '纠错说明',
  `images` text COMMENT '纠错图片(JSON数组)',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '0待处理 1已采纳 2已驳回',
  `reply` varchar(500) DEFAULT '' COMMENT '后台回复',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_q` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_correction`
--

LOCK TABLES `question_correction` WRITE;
/*!40000 ALTER TABLE `question_correction` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_correction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_like`
--

DROP TABLE IF EXISTS `question_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_like` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0',
  `question_id` int NOT NULL DEFAULT '0',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_q` (`user_id`,`question_id`),
  KEY `idx_q` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_like`
--

LOCK TABLES `question_like` WRITE;
/*!40000 ALTER TABLE `question_like` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recharge_log`
--

DROP TABLE IF EXISTS `recharge_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recharge_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0',
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '充值金额(可负=扣减)',
  `balance_after` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '充值后余额',
  `type` varchar(20) NOT NULL DEFAULT 'admin' COMMENT '来源:admin手动/pay支付',
  `remark` varchar(200) NOT NULL DEFAULT '',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recharge_log`
--

LOCK TABLES `recharge_log` WRITE;
/*!40000 ALTER TABLE `recharge_log` DISABLE KEYS */;
INSERT INTO `recharge_log` VALUES (3,3,30.00,30.00,'admin','后台充值','2026-06-14 09:47:06','2026-06-14 09:47:06');
/*!40000 ALTER TABLE `recharge_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_setting`
--

DROP TABLE IF EXISTS `sys_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_setting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `skey` varchar(50) NOT NULL,
  `svalue` varchar(500) NOT NULL DEFAULT '',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `skey` (`skey`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_setting`
--

LOCK TABLES `sys_setting` WRITE;
/*!40000 ALTER TABLE `sys_setting` DISABLE KEYS */;
INSERT INTO `sys_setting` VALUES (1,'default_avatar','','2026-06-13 05:03:46','2026-06-14 11:24:10'),(2,'video_max_mb','50','2026-06-13 19:52:22','2026-06-14 10:57:18');
/*!40000 ALTER TABLE `sys_setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testpaper`
--

DROP TABLE IF EXISTS `testpaper`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testpaper` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '试卷标题',
  `cover` varchar(255) DEFAULT '' COMMENT '封面',
  `category_id` int NOT NULL DEFAULT '0' COMMENT '分类id',
  `desc` varchar(255) DEFAULT '' COMMENT '简介',
  `question_count` int NOT NULL DEFAULT '0' COMMENT '题目数(自动统计)',
  `total_score` int NOT NULL DEFAULT '0' COMMENT '总分',
  `pass_score` int NOT NULL DEFAULT '0' COMMENT '及格分',
  `expire` int NOT NULL DEFAULT '0' COMMENT '限时(分钟,0=不限时)',
  `is_test` int NOT NULL DEFAULT '0' COMMENT '1考试模式 0练习模式',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `status` int NOT NULL DEFAULT '1' COMMENT '1上架 0下架',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testpaper`
--

LOCK TABLES `testpaper` WRITE;
/*!40000 ALTER TABLE `testpaper` DISABLE KEYS */;
INSERT INTO `testpaper` VALUES (1,'前端基础知识自测（含解析）','',2,'',5,90,60,0,0,0,1,'2026-06-08 08:36:13','2026-06-13 17:05:41'),(2,'外科人卫题库外科学二类','',0,'人卫题库二类',6,16,60,0,0,0,1,'2026-06-11 16:55:11','2026-06-14 00:10:15');
/*!40000 ALTER TABLE `testpaper` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL DEFAULT '' COMMENT '用户名',
  `nickname` varchar(30) NOT NULL DEFAULT '' COMMENT '昵称',
  `email` varchar(160) NOT NULL DEFAULT '' COMMENT '邮箱',
  `password` varchar(255) NOT NULL DEFAULT '' COMMENT '密码',
  `avatar` varchar(255) DEFAULT '' COMMENT '头像',
  `phone` varchar(11) NOT NULL DEFAULT '' COMMENT '手机',
  `sex` enum('男','女','保密') NOT NULL DEFAULT '男' COMMENT '性别',
  `desc` text NOT NULL COMMENT '个性签名',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1正常 0禁用',
  `level` varchar(20) NOT NULL DEFAULT '普通' COMMENT '会员等级',
  `vip_expire` datetime DEFAULT NULL COMMENT 'VIP到期时间',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '账户余额',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'adminuser','','','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','','','男','','2026-06-07 16:07:13','2026-06-12 15:25:21',1,'普通',NULL,0.00),(2,'fang456','be','','b3a8e0e1f9ab1bfe3a36f231f676f78bb30a519d2b21e6c530c0eee8ebb4a5d0','http://127.0.0.1:7001/public/uploads/2026/06/11/1781242414282292.jpg','13685693283','保密','','2026-06-09 20:52:10','2026-06-14 09:20:54',1,'普通',NULL,0.00),(3,'Fang123','','','8bf729f5f3e2ba07cb421f6046e008ef4958665133b14fded2c7271c4664525f','','','男','','2026-06-13 20:19:13','2026-06-14 09:59:24',1,'普通',NULL,30.00);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_question`
--

DROP TABLE IF EXISTS `user_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_question` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0',
  `testpaper_id` int NOT NULL DEFAULT '0',
  `question_id` int NOT NULL DEFAULT '0',
  `answer` longtext,
  `is_right` tinyint NOT NULL DEFAULT '0' COMMENT '1对0错',
  `fava` tinyint NOT NULL DEFAULT '0' COMMENT '是否收藏该题',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_uq` (`user_id`,`question_id`),
  KEY `idx_user_paper` (`user_id`,`testpaper_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_question`
--

LOCK TABLES `user_question` WRITE;
/*!40000 ALTER TABLE `user_question` DISABLE KEYS */;
INSERT INTO `user_question` VALUES (3,2,2,6,'4',0,0,'2026-06-11 22:23:17','2026-06-11 23:10:21'),(5,2,1,2,'[0,1,3]',1,1,'2026-06-11 22:43:33','2026-06-12 09:12:36'),(7,2,1,3,'1',1,0,'2026-06-12 15:04:51','2026-06-12 15:04:51'),(9,2,2,13,'0',0,0,'2026-06-13 15:52:41','2026-06-13 15:52:41'),(10,2,2,14,'2',0,0,'2026-06-13 15:53:01','2026-06-13 15:53:01'),(15,2,2,16,'3',1,0,'2026-06-14 00:11:19','2026-06-14 00:11:19'),(16,3,2,6,'0',1,0,'2026-06-14 00:12:21','2026-06-14 00:12:21');
/*!40000 ALTER TABLE `user_question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_test`
--

DROP TABLE IF EXISTS `user_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_test` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '0' COMMENT '用户id',
  `testpaper_id` int NOT NULL DEFAULT '0' COMMENT '试卷id',
  `value` longtext COMMENT '用户答案(JSON)',
  `result` longtext COMMENT '判分明细(JSON:每题对错+正确答案+解析)',
  `score` int NOT NULL DEFAULT '0' COMMENT '得分',
  `total_score` int NOT NULL DEFAULT '0' COMMENT '满分(快照)',
  `is_pass` int NOT NULL DEFAULT '0' COMMENT '1及格 0不及格',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  `answer_status` int NOT NULL DEFAULT '0' COMMENT '0考试中 1已交卷',
  `read_status` int NOT NULL DEFAULT '0' COMMENT '0待阅卷 1已阅卷(无问答题自动置1)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_test`
--

LOCK TABLES `user_test` WRITE;
/*!40000 ALTER TABLE `user_test` DISABLE KEYS */;
INSERT INTO `user_test` VALUES (1,1,1,'[3,[0,1,3],1,[\"padding\",\"margin\"],[\"事件向上传播\"]]','[{\"id\":1,\"type\":\"radio\",\"title\":\"下列哪个不是 JavaScript 的基本数据类型？\",\"options\":[\"string\",\"number\",\"boolean\",\"array\"],\"userValue\":3,\"answer\":3,\"analysis\":\"array（数组）属于引用类型 object，不是基本数据类型。基本类型有：string、number、boolean、undefined、null、symbol、bigint。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":2,\"type\":\"checkbox\",\"title\":\"以下哪些是 Vue 的生命周期钩子？（多选）\",\"options\":[\"created\",\"mounted\",\"rendered\",\"destroyed\"],\"userValue\":[0,1,3],\"answer\":[0,1,3],\"analysis\":\"Vue2 生命周期含 created、mounted、destroyed 等；rendered 不是 Vue 的生命周期钩子。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":3,\"type\":\"trueOrfalse\",\"title\":\"判断：HTTP 是无状态协议。\",\"options\":[],\"userValue\":1,\"answer\":1,\"analysis\":\"正确。HTTP 本身是无状态的，每次请求相互独立；状态保持靠 Cookie/Session/Token 等机制实现。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":4,\"type\":\"completion\",\"title\":\"CSS 盒模型从内到外依次是：content、______、border、______。\",\"options\":[],\"userValue\":[\"padding\",\"margin\"],\"answer\":[\"padding\",\"margin\"],\"analysis\":\"标准盒模型由内到外为：content（内容）→ padding（内边距）→ border（边框）→ margin（外边距）。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":5,\"type\":\"answer\",\"title\":\"简述什么是事件冒泡（Event Bubbling）。\",\"options\":[],\"userValue\":[\"事件向上传播\"],\"answer\":\"事件从触发的最内层元素开始，逐级向外层父元素传播的过程。\",\"analysis\":\"事件冒泡：事件从目标元素触发后，会沿 DOM 树向上依次传递到祖先元素，直到 document。可用 event.stopPropagation() 阻止。问答题不自动判分，仅记录作答。\",\"score\":20,\"correct\":null,\"gain\":0,\"manual\":true}]',80,100,1,'2026-06-08 08:38:12','2026-06-08 08:55:59',1,0),(2,1,1,'[3,[0,1,3],1,[\"padding\",\"margin\"],[\"事件向上传播到父级\"]]','[{\"id\":1,\"type\":\"radio\",\"title\":\"下列哪个不是 JavaScript 的基本数据类型？\",\"options\":[\"string\",\"number\",\"boolean\",\"array\"],\"userValue\":3,\"answer\":3,\"analysis\":\"array（数组）属于引用类型 object，不是基本数据类型。基本类型有：string、number、boolean、undefined、null、symbol、bigint。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":2,\"type\":\"checkbox\",\"title\":\"以下哪些是 Vue 的生命周期钩子？（多选）\",\"options\":[\"created\",\"mounted\",\"rendered\",\"destroyed\"],\"userValue\":[0,1,3],\"answer\":[0,1,3],\"analysis\":\"Vue2 生命周期含 created、mounted、destroyed 等；rendered 不是 Vue 的生命周期钩子。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":3,\"type\":\"trueOrfalse\",\"title\":\"判断：HTTP 是无状态协议。\",\"options\":[],\"userValue\":1,\"answer\":1,\"analysis\":\"正确。HTTP 本身是无状态的，每次请求相互独立；状态保持靠 Cookie/Session/Token 等机制实现。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":4,\"type\":\"completion\",\"title\":\"CSS 盒模型从内到外依次是：content、______、border、______。\",\"options\":[],\"userValue\":[\"padding\",\"margin\"],\"answer\":[\"padding\",\"margin\"],\"analysis\":\"标准盒模型由内到外为：content（内容）→ padding（内边距）→ border（边框）→ margin（外边距）。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":5,\"type\":\"answer\",\"title\":\"简述什么是事件冒泡（Event Bubbling）。\",\"options\":[],\"userValue\":[\"事件向上传播到父级\"],\"answer\":\"事件从触发的最内层元素开始，逐级向外层父元素传播的过程。\",\"analysis\":\"事件冒泡：事件从目标元素触发后，会沿 DOM 树向上依次传递到祖先元素，直到 document。可用 event.stopPropagation() 阻止。问答题不自动判分，仅记录作答。\",\"score\":20,\"correct\":null,\"gain\":0,\"manual\":true}]',80,100,1,'2026-06-08 09:01:37','2026-06-08 09:03:16',1,0),(3,1,1,'[3,[0,1,3],1,[\"padding\",\"margin\"],[\"事件冒泡是事件从内层元素逐级向外传播的过程\"]]','[{\"id\":1,\"type\":\"radio\",\"title\":\"下列哪个不是 JavaScript 的基本数据类型？\",\"options\":[\"string\",\"number\",\"boolean\",\"array\"],\"userValue\":3,\"answer\":3,\"analysis\":\"array（数组）属于引用类型 object，不是基本数据类型。基本类型有：string、number、boolean、undefined、null、symbol、bigint。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":2,\"type\":\"checkbox\",\"title\":\"以下哪些是 Vue 的生命周期钩子？（多选）\",\"options\":[\"created\",\"mounted\",\"rendered\",\"destroyed\"],\"userValue\":[0,1,3],\"answer\":[0,1,3],\"analysis\":\"Vue2 生命周期含 created、mounted、destroyed 等；rendered 不是 Vue 的生命周期钩子。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":3,\"type\":\"trueOrfalse\",\"title\":\"判断：HTTP 是无状态协议。\",\"options\":[],\"userValue\":1,\"answer\":1,\"analysis\":\"正确。HTTP 本身是无状态的，每次请求相互独立；状态保持靠 Cookie/Session/Token 等机制实现。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":4,\"type\":\"completion\",\"title\":\"CSS 盒模型从内到外依次是：content、______、border、______。\",\"options\":[],\"userValue\":[\"padding\",\"margin\"],\"answer\":[\"padding\",\"margin\"],\"analysis\":\"标准盒模型由内到外为：content（内容）→ padding（内边距）→ border（边框）→ margin（外边距）。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":5,\"type\":\"answer\",\"title\":\"简述什么是事件冒泡（Event Bubbling）。\",\"options\":[],\"userValue\":[\"事件冒泡是事件从内层元素逐级向外传播的过程\"],\"answer\":\"事件从触发的最内层元素开始，逐级向外层父元素传播的过程。\",\"analysis\":\"事件冒泡：事件从目标元素触发后，会沿 DOM 树向上依次传递到祖先元素，直到 document。可用 event.stopPropagation() 阻止。问答题不自动判分，仅记录作答。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":true}]',100,100,1,'2026-06-08 21:03:43','2026-06-08 21:04:31',1,1),(4,1,1,NULL,NULL,0,0,0,'2026-06-08 22:20:26','2026-06-08 22:20:26',0,0),(5,2,1,'[1,[0,1],1,[\"你好\",\"你怀\",\"\"],[\"你好吗\"]]','[{\"id\":1,\"type\":\"radio\",\"title\":\"下列哪个不是 JavaScript 的基本数据类型？\",\"options\":[\"string\",\"number\",\"boolean\",\"array\"],\"userValue\":1,\"answer\":3,\"analysis\":\"array（数组）属于引用类型 object，不是基本数据类型。基本类型有：string、number、boolean、undefined、null、symbol、bigint。\",\"score\":20,\"correct\":false,\"gain\":0,\"manual\":false},{\"id\":2,\"type\":\"checkbox\",\"title\":\"以下哪些是 Vue 的生命周期钩子？（多选）\",\"options\":[\"created\",\"mounted\",\"rendered\",\"destroyed\"],\"userValue\":[0,1],\"answer\":[0,1,3],\"analysis\":\"Vue2 生命周期含 created、mounted、destroyed 等；rendered 不是 Vue 的生命周期钩子。\",\"score\":20,\"correct\":false,\"gain\":0,\"manual\":false},{\"id\":3,\"type\":\"trueOrfalse\",\"title\":\"判断：HTTP 是无状态协议。\",\"options\":[],\"userValue\":1,\"answer\":1,\"analysis\":\"正确。HTTP 本身是无状态的，每次请求相互独立；状态保持靠 Cookie/Session/Token 等机制实现。\",\"score\":20,\"correct\":true,\"gain\":20,\"manual\":false},{\"id\":4,\"type\":\"completion\",\"title\":\"CSS 盒模型从内到外依次是：content、______、border、______。\",\"options\":[],\"userValue\":[\"你好\",\"你怀\",\"\"],\"answer\":[\"padding\",\"margin\"],\"analysis\":\"标准盒模型由内到外为：content（内容）→ padding（内边距）→ border（边框）→ margin（外边距）。\",\"score\":20,\"correct\":false,\"gain\":0,\"manual\":false},{\"id\":5,\"type\":\"answer\",\"title\":\"简述什么是事件冒泡（Event Bubbling）。\",\"options\":[],\"userValue\":[\"你好吗\"],\"answer\":\"事件从触发的最内层元素开始，逐级向外层父元素传播的过程。\",\"analysis\":\"事件冒泡：事件从目标元素触发后，会沿 DOM 树向上依次传递到祖先元素，直到 document。可用 event.stopPropagation() 阻止。问答题不自动判分，仅记录作答。\",\"score\":20,\"correct\":null,\"gain\":3,\"manual\":true}]',23,100,0,'2026-06-09 22:15:58','2026-06-10 22:18:13',1,1),(6,2,1,NULL,NULL,0,0,0,'2026-06-10 12:44:29','2026-06-10 12:44:29',0,0),(7,2,2,'[1]','[{\"id\":6,\"type\":\"radio\",\"title\":\"肿瘤中恶性肿瘤和良性肿瘤的区别\",\"options\":[\"转移\",\"非典型增生\",\"大小\",\"浸润深度\",\"代谢旺盛\"],\"userValue\":1,\"answer\":0,\"analysis\":\"肿瘤的良恶性的区分 异性性和转移\",\"score\":1,\"correct\":false,\"gain\":0,\"manual\":false}]',0,1,0,'2026-06-11 16:57:52','2026-06-11 16:57:56',1,1),(8,2,2,'[1]','[{\"id\":6,\"type\":\"radio\",\"title\":\"肿瘤中恶性肿瘤和良性肿瘤的区别\",\"options\":[\"转移\",\"非典型增生\",\"大小\",\"浸润深度\",\"代谢旺盛\"],\"userValue\":1,\"answer\":0,\"analysis\":\"肿瘤的良恶性的区分 异性性和转移\",\"score\":1,\"correct\":false,\"gain\":0,\"manual\":false}]',0,1,0,'2026-06-11 16:57:59','2026-06-11 16:58:35',1,1),(9,2,2,'[0]','[{\"id\":6,\"type\":\"radio\",\"title\":\"肿瘤中恶性肿瘤和良性肿瘤的区别\",\"options\":[\"转移\",\"非典型增生\",\"大小\",\"浸润深度\",\"代谢旺盛\"],\"userValue\":0,\"answer\":0,\"analysis\":\"肿瘤的良恶性的区分 异性性和转移\",\"score\":1,\"correct\":true,\"gain\":1,\"manual\":false}]',1,1,0,'2026-06-11 16:59:05','2026-06-11 16:59:22',1,1),(10,2,2,'[2]','[{\"id\":6,\"type\":\"radio\",\"title\":\"肿瘤中恶性肿瘤和良性肿瘤的区别\",\"options\":[\"转移\",\"非典型增生\",\"大小\",\"浸润深度\",\"代谢旺盛\"],\"userValue\":2,\"answer\":0,\"analysis\":\"肿瘤的良恶性的区分 异性性和转移\",\"score\":1,\"correct\":false,\"gain\":0,\"manual\":false}]',0,1,0,'2026-06-11 22:24:11','2026-06-11 22:24:16',1,1);
/*!40000 ALTER TABLE `user_test` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '视频标题',
  `cover` varchar(255) DEFAULT '' COMMENT '视频封面',
  `category_id` int NOT NULL DEFAULT '0' COMMENT '分类id',
  `user_id` int NOT NULL DEFAULT '0' COMMENT '用户id',
  `duration` int NOT NULL DEFAULT '0' COMMENT '总时长',
  `desc` text NOT NULL COMMENT '视频描述',
  `play_count` int NOT NULL DEFAULT '0' COMMENT '播放量',
  `danmu_count` int NOT NULL DEFAULT '0' COMMENT '弹幕量',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `video_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `video_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video`
--

LOCK TABLES `video` WRITE;
/*!40000 ALTER TABLE `video` DISABLE KEYS */;
/*!40000 ALTER TABLE `video` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_detail`
--

DROP TABLE IF EXISTS `video_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '子标题',
  `video_id` int NOT NULL DEFAULT '0' COMMENT '视频id',
  `url` varchar(255) DEFAULT '' COMMENT '视频链接',
  `desc` text NOT NULL COMMENT '子描述',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `video_id` (`video_id`),
  CONSTRAINT `video_detail_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `video` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_detail`
--

LOCK TABLES `video_detail` WRITE;
/*!40000 ALTER TABLE `video_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_play`
--

DROP TABLE IF EXISTS `video_play`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_play` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) NOT NULL DEFAULT '0' COMMENT 'ip地址',
  `video_id` int NOT NULL DEFAULT '0' COMMENT '视频id',
  `created_time` datetime DEFAULT NULL,
  `updated_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `video_id` (`video_id`),
  CONSTRAINT `video_play_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `video` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_play`
--

LOCK TABLES `video_play` WRITE;
/*!40000 ALTER TABLE `video_play` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_play` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'egg-edu'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-13 20:34:32
