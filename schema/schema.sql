CREATE DATABASE IF NOT EXISTS `pchat`;
USE `pchat`;

DROP TABLE IF EXISTS `chat`;

CREATE TABLE `chat` (
  `conversation_id` char(32) NOT NULL,
  `timestamp` bigint(20) unsigned NOT NULL,
  `user_id` char(36) NOT NULL,
  `message` text,
  `media` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`conversation_id`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `session_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` char(36) NOT NULL,
  `username` varchar(64) NOT NULL,
  `email` varchar(128) NOT NULL,
  `salt` char(16) NOT NULL,
  `pw_hash` char(32) NOT NULL,
  `profile_image` varchar(128) DEFAULT NULL,
  `last_seen` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `IDX_USERNAME` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `open_chats`;

CREATE TABLE `open_chats` (
  `user_id` char(36) NOT NULL,
  `conversation_id` char(32) NOT NULL,
  `title` varchar(128) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `checkpoint` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
