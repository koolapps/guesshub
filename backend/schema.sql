CREATE SCHEMA IF NOT EXISTS `commit_game`;
USE `commit_game`;

CREATE TABLE `commit`(
  `order_id` INT(11) NOT NULL AUTO_INCREMENT,
  `sha` CHAR(40) NOT NULL,
  `patch_number` INT NOT NULL,
  `message` TEXT NOT NULL,
  `author_login` VARCHAR(255),
  `author_name` VARCHAR(255),
  `author_avatar_url` TEXT,
  `repository` VARCHAR(127) NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `additions` INT UNSIGNED NOT NULL,
  `deletions` INT UNSIGNED NOT NULL,
  `old_start_line` INT UNSIGNED NOT NULL,
  `new_start_line` INT UNSIGNED NOT NULL,
  `block_name` VARCHAR(255),
  `diff_lines` LONGTEXT NOT NULL,
  `grade` INT NOT NULL DEFAULT -100,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `sha_patch_number_index` (`sha`,`patch_number`),
  KEY `grade_index` (`grade`)
) ENGINE = MyISAM;

CREATE TABLE `repository`(
  `order_id` INT(11) NOT NULL AUTO_INCREMENT,
  `id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `author_avatar_url` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `is_private` BIT(1) NOT NULL,
  `is_fork` BIT(1) NOT NULL,
  `watcher_count` INT NOT NULL,
  `star_count` INT NOT NULL,
  PRIMARY KEY(`name`),
  UNIQUE INDEX `name_UNIQUE`(`name` ASC),
  UNIQUE INDEX `order_id_UNIQUE` (`order_id` ASC)
) ENGINE = MyISAM;
