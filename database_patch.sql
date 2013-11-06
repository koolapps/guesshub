
ALTER TABLE `commit_game`.`commit` 
ADD COLUMN `order_id` INT(11) NOT NULL AUTO_INCREMENT FIRST,
ADD UNIQUE INDEX `order_id_UNIQUE` (`order_id` ASC);

ALTER TABLE `commit_game`.`repository` 
ADD COLUMN `order_id` INT(11) NOT NULL AUTO_INCREMENT FIRST,
ADD UNIQUE INDEX `order_id_UNIQUE` (`order_id` ASC);