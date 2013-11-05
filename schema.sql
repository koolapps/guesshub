CREATE SCHEMA IF NOT EXISTS `commit_game`;
USE `commit_game`;

CREATE TABLE `commit`(
  `sha` VARCHAR(255) NOT NULL,
  `patch_number` INT NOT NULL,
  `message` TEXT NOT NULL,
  `author_login` VARCHAR(255),
  `author_name` VARCHAR(255),
  `author_avatar_url` VARCHAR(255),
  `repository` VARCHAR(255) NOT NULL,
  `file_contents_url` VARCHAR(255) NOT NULL,
  `file_contents` TEXT,
  `filename` VARCHAR(255) NOT NULL,
  `additions` INT UNSIGNED NOT NULL,
  `deletions` INT UNSIGNED NOT NULL,
  `old_start_line` INT UNSIGNED NOT NULL,
  `new_start_line` INT UNSIGNED NOT NULL,
  `block_name` VARCHAR(255),
  `diff_lines` LONGTEXT NOT NULL,
  PRIMARY KEY(`sha`, `patch_number`)
) ENGINE = MyISAM;


CREATE TABLE `repository`(
  `id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `author_avatar_url` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `is_private` BIT(1) NOT NULL,
  `is_fork` BIT(1) NOT NULL,
  `watcher_count` INT NOT NULL,
  `star_count` INT NOT NULL,
  UNIQUE INDEX `name_UNIQUE`(`name` ASC),
  PRIMARY KEY(`name`)
) ENGINE = MyISAM;
