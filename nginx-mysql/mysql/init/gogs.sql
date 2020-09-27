/*CREATE DATABASE  `gogs` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
grant all PRIVILEGES on gogs.* to gogs@'%' identified by '123456';
flush privileges;
use gogs;*/

SET @s = IF(version() < 8 OR version() LIKE '%MariaDB%', 
            'SET GLOBAL innodb_file_per_table = ON, 
                        innodb_file_format = Barracuda, 
                        innodb_large_prefix = ON;', 
            'SET GLOBAL innodb_file_per_table = ON;');
PREPARE stmt1 FROM @s;
EXECUTE stmt1; 

DROP DATABASE IF EXISTS gogs;
CREATE DATABASE IF NOT EXISTS gogs CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;