CREATE DATABASE  `gogs` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
grant all PRIVILEGES on gogs.* to gogs@'%' identified by '123456';
flush privileges;
use gogs;