CREATE DATABASE IF NOT EXISTS `bamazon`;
USE `bamazon`;
CREATE TABLE IF NOT EXISTS `products` (

  `item_id` int(11) NOT NULL auto_increment,   
  `product_name` varchar(100) NOT NULL,       
  `department_name` varchar(100)  NOT NULL,     
  `price`  int(11) NOT NULL,     
  `stock_quantity` int(11)  NOT NULL,    
   PRIMARY KEY  (`item_id`)
);