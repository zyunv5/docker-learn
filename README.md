# 前端使用 jenkins 安装构建自动化流程

## 远程服务器安装 docker

1. docker pull jenkins
2. mkdir /opt/jenkins
3. chown -R 1000:1000 jenkins/ 给 uid 为 1000 的权限
4. docker run -itd -p 9090:8080 -p 50000:50000 --name jenkins --privileged=true -v /opt/jenkins:/var/jenkins_home jenkins:latest
5. 访问 http://207.148.110.93:9090
6. cat /home/jenkins/secrets/initialAdminPassword 获取密码

## 端口无法访问问题

如果你仅仅是开发环境的话，可以考虑选择直接把防火墙关掉：
systemctl disable firewalld
systemctl stop firewalld
运行上述两条命令后防火墙就关闭了，且不会开机自启动。
注意：在生产环境切记不要随意关闭防火墙

## docker 停止

停止容器 docker rm
删除镜像 docker rmi
停止 docker 服务 systemctl stop docker
重启容器 docker restart ID

## 停止 docker 启动，直接用安装包形式

安装 JDK
yum install java-1.8.0-openjdk\* -y

添加 Jenkins 库到 yum 库，Jenkins 将从这里下载安装。
wget -O /etc/yum.repos.d/jenkins.repo http://pkg.jenkins-ci.org/redhat/jenkins.repo
rpm --import https://jenkins-ci.org/redhat/jenkins-ci.org.key
yum install -y jenkins

安装失败的话
wget http://pkg.jenkins-ci.org/redhat-stable/jenkins-2.7.3-1.1.noarch.rpm
rpm -ivh jenkins-2.7.3-1.1.noarch.rpm

配置 jenkins 端口号
vi /etc/sysconfig/jenkins
JENKINS_PORT="8080" 此端口不冲突可以不修改

启动 jenkins
service jenkins start/stop/restart

http://207.148.110.93:9090/

初始密码位置
/var/lib/jenkins/secrets/initialAdminPassword

淦 安装插件还是不行 但是这个窗口右上角有关闭按钮！！

## 升级 jenkins

cd /usr/lib/jenkins
service jenkins stop
rm jenkins.war
wget http://mirrors.jenkins.io/war-stable/latest/jenkins.war
service jenkins start

## jenkins 设置中文

Available 中找到 Localization: Chinese (Simplified)  
安装并重启

## 开始构建 首先配置 SSH

系统管理 -> 插件管理 -> 可选插件 -> 搜索 Publish Over SSH -> 立即安装
系统管理 -> 系统配置 -> 找到 Publish Over SSH
SSH Servers 新增
Name 随意写写
Hostname 服务器地址
Username 服务器用户名
Remote Directoy 部署地址
勾选 Use password authentication, or use a different key
Passphrase / Password 输入服务器密码
Key 输入 id_rsa
Test
success 成功

## 新建任务

构建一个自由风格的软件项目
源码管理—>git->添加地址->添加 jenkins 凭证
用户名 就是你当前的用户名
密码 就是 cat 特别长的那个
->指定分支->构建环境->勾选 Provide Node & npm bin/ folder to PATH
->构建->增加构建步骤->执行 shell

```shell
docker-compose up -d --build

# 先删除之前的容器
echo "remobe old container"
docker ps -a | grep dockerspringboot | awk '{print $1}'| xargs docker rm -f
# 删除之前的镜像
echo "romove old image"
docker rmi dockerspringboot
# 构建镜像
mvn docker:build
# 打印当前镜像
echo "current docker images"
docker images | grep dockerspringboot
# 启动容器
echo "start container"
docker run -p 8001:8001 -d dockerspringboot
# 打印当前容器
echo "current container"
docker ps -a | grep dockerspringboot
echo "star service success!"

```

等下，我这里有个疑问，我这里不应该是 node 构建 应该是 docker 构建
这时我的脑海中出现了两条路

1. 走 git 提交更新 docker-compose down 之后 再 docker-compose up
2. 走 git 提交更新，进 docker hub 上传镜像，push 镜像，再 pull 镜像，再启动
   我认为选择第二种，万一在服务器上 down 了之后，没构建出来，怎么办~
   也不对，我本地都把代码弄过去了，直接先制作镜像，之后再删掉之前，用新的不就行了嘛

大师 我悟了 jenkins 作为一台中间的构建服务器
[jenkins+docker 实现自动编译、打包、构建镜像、容器部署](https://blog.csdn.net/xiaoxiangzi520/article/details/88842200)
[jenkins+docker 的简单项目部署](https://www.pianshen.com/article/3247382361/)

jenkins 构建服务器 Docker 私有化仓库 测试机 正式机
构建上传到私有化仓库，测试机与正式机拉取最新的镜像

开发 push 代码到 gitlab，触发 jenkins 自动 pull 代码，通过 maven 编译、打包，然后通过执行 shell 脚本使 docker 构建镜像并 push 到私服（或者阿里云）仓库，
此操作完成后 jenkins 服务器上再执行 SSH 命令登录到部署服务器，docker 从仓库（私服）拉取镜像，启动容器。整个操作流程完成。

更改了超时时间之后，代码跑了起来~ nice
代码在
/var/lib/jenkins/workspace/docker-learn

## 记录 bug

### docker0: iptables: No chain/target/match by that name.

停止 docker 服务 systemctl stop docker
iptables-save > /etc/sysconfig/iptables
再次启动 docker systemctl start docker

### 初始化卡住 Customize Jenkins.An error occurred(Unable to connect to Jenkins)

两个选项都是连接不上网络 Orz
vi hudson.model.UpdateCenter.xml

```xml
<?xml version='1.0' encoding='UTF-8'?>
<sites>
  <site>
    <id>default</id>
    <url>http://updates.jenkins-ci.org/update-center.json</url>
  </site>
</sites>

url改成 http://mirror.xmission.com/jenkins/updates/update-center.json
这个不行的话 再换
http://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json
还是不行
```

docker logs ID 报错：
Idle timeout expired: 5001/5000 ms
java -version
哈 没有安装 java
centos 安装：yum install java-1.8.0-openjdk\* -y
java -version：
openjdk version "1.8.0_262"

不行 认输了 不拿 docker 启动了
安装包搞起！！！

### 缺少 nodejs 环境

系统管理 ---> 全局工具配置 ---> NodeJS ---> 安装 ---> 自动安装 ---> 选择版本 ---> Save

### docker-compose not found

[Jenkins 服务使用 宿主机的 docker、docker-compose ](https://www.cnblogs.com/zhongyuanzhao000/p/11681474.html)
which docker-compose
sudo /usr/local/bin/docker-compose xxx

### sudo: no tty present and no askpass program specified

[Jenkins 服务使用 宿主机的 docker、docker-compose ](https://www.cnblogs.com/zhongyuanzhao000/p/11681474.html)
首先，将 Defaults requiretty 这一行用#注释掉；
ALL=(ALL) NOPASSWD: ALL
接着，通过 wq! 来强制保存并退出；
最后，需要重启 Jenkins，执行命令：/etc/init.d/jenkins restart

### for docker-react UnixHTTPConnectionPool(host='localhost', port=None): Read timed out.

第一种方法：重启服务器上的 docker
sudo systemctl restart docker.service
service docker restart

上面命令不行 试试下面这个

第二种方法：
vim /etc/profile

export DOCKER_CLIENT_TIMEOUT=500
export COMPOSE_HTTP_TIMEOUT=500

source /etc/profile
重启docker

### 上面 docker 构建失败之后,unable to unlink old 'mysql/data/auto.cnf' (Permission denied) 挂载的目录没有权限

挂载目录缺少权限
命令行启动的话 加入 --privileged=true
docker-compose 中加入 privileged: true

上面的不太行，我把本地 mysql/data 删除了之后
新建了一个空的 data 文件夹



### jenkins 系统时间不正确解决方案

打开 jenkins 的【系统管理】---> 【脚本命令行】，在命令框中输入一下命令【时间时区设为 亚洲上海】：
System.setProperty('org.apache.commons.jelly.tags.fmt.timeZone', 'Asia/Shanghai')

### jenkins 开启邮件通知

管理插件->Email Extension Plugin->系统设置
Jenkins Location 配置邮箱
Extended E-mail Notification
感谢：
[docker + Jenkins 前端自动化部署完整实践](https://blog.csdn.net/weixin_43983850/article/details/107055722)
