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
[jenkins+docker 实现自动编译、打包、构建镜像、容器部署](https://blog.csdn.net/xiaoxiangzi520/article/details/88842200)    
[jenkins+docker 的简单项目部署](https://www.pianshen.com/article/3247382361/)    
[用gogs搭建属于自己的git网站](https://www.jianshu.com/p/86c385682ac8)    
[docker + webhook 从零实现前端自动化部署](https://juejin.im/post/6845166890420011021)    
[Jenkins 服务使用 宿主机的 docker、docker-compose ](https://www.cnblogs.com/zhongyuanzhao000/p/11681474.html)    
[docker + Jenkins 前端自动化部署完整实践](https://blog.csdn.net/weixin_43983850/article/details/107055722)    
[使用 GitHub+Travis-CI+Docker 打造自动化流水线](https://blog.csdn.net/qq_24464827/article/details/104471319)    
[持续部署——Travis+Docker+阿里云容器镜像](https://blog.csdn.net/fly7632785/article/details/107409126)    
[同一个ssh key用在多台电脑上](https://blog.csdn.net/qq_36528804/article/details/96693330)    
[多台Mac电脑共用SSH Public/Private Key](https://blog.csdn.net/qq_33632048/article/details/80181210?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.add_param_isCf&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.add_param_isCf)     
[SSH多个机器使用同一套公私钥及同一机器多套公私钥和端口转发](https://news.tianyancha.com/ll_csfneebgvw.html)     
