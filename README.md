1. master 空的
2. react分支首次在本地启动 docker+react
3. react-node-redis 启动react+node+redis
4. react-node-mongo 启动了mongo
5. react-node-mysql 启动了mysql
6. react-node-mysql-nodemon 没有安装nodemon 安装的pm2
7. project-deploy 使用的travis 一塌糊涂，没成功，请跳转查看详情
8. project-deploy-jenkins 很成功，自动化构建。可以自己选择立即构建，也可以通过git的push命令自动化部署
9. project-deploy-gitlab 失败了，gitlab需要内存至少2G以上，太强了，小水管顶不住
10. project-deploy-gogs 算是gitlab的替代品，界面和gitlab差不多，小巧方便，使用docker构建后，直接注册登录就可以

感谢以下文章：

[用gogs搭建属于自己的git网站](https://www.jianshu.com/p/86c385682ac8)
[docker + webhook 从零实现前端自动化部署](https://juejin.im/post/6845166890420011021)
