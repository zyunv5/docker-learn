# 前端使用jenkins安装构建自动化流程
## 远程服务器安装docker
1. docker pull jenkins
2. mkdir /opt/jenkins
3. chown -R 1000:1000 jenkins/    给uid为1000的权限
4. docker run -itd -p 9090:8080 -p 50000:50000 --name jenkins --privileged=true  -v /opt/jenkins:/var/jenkins_home jenkins:latest
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
停止docker服务 systemctl stop docker
重启容器 docker restart ID
## 停止docker启动，直接用安装包形式
安装JDK
yum install java-1.8.0-openjdk* -y 

添加Jenkins库到yum库，Jenkins将从这里下载安装。
wget -O /etc/yum.repos.d/jenkins.repo http://pkg.jenkins-ci.org/redhat/jenkins.repo
rpm --import https://jenkins-ci.org/redhat/jenkins-ci.org.key
yum install -y jenkins

安装失败的话
wget http://pkg.jenkins-ci.org/redhat-stable/jenkins-2.7.3-1.1.noarch.rpm
rpm -ivh jenkins-2.7.3-1.1.noarch.rpm

配置jenkins端口号
vi /etc/sysconfig/jenkins
JENKINS_PORT="8080"  此端口不冲突可以不修改 

启动jenkins
service jenkins start/stop/restart

http://207.148.110.93:9090/

初始密码位置
/var/lib/jenkins/secrets/initialAdminPassword 

淦 安装插件还是不行 但是这个窗口右上角有关闭按钮！！
## 升级jenkins
cd /usr/lib/jenkins
service jenkins stop
rm jenkins.war
wget http://mirrors.jenkins.io/war-stable/latest/jenkins.war
service jenkins start

## jenkins设置中文
Available 中找到 Localization: Chinese (Simplified)  
安装并重启

## 开始构建 首先配置SSH
系统管理 -> 插件管理 -> 可选插件 -> 搜索 Publish Over SSH -> 立即安装
系统管理 -> 系统配置 -> 找到Publish Over SSH
SSH Servers 新增
Name 随意写写
Hostname 服务器地址
Username 服务器用户名
Remote Directoy 部署地址
勾选 Use password authentication, or use a different key
Passphrase / Password	 输入服务器密码
Key 输入 id_rsa
Test
success 成功

## 新建任务
构建一个自由风格的软件项目
源码管理—>git->添加地址->添加jenkins凭证
用户名 就是你当前的用户名
密码 就是cat 特别长的那个
->指定分支->构建环境->勾选 Provide Node & npm bin/ folder to PATH
->构建->增加构建步骤->执行shell
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
等下，我这里有个疑问，我这里不应该是node构建 应该是docker构建
这时我的脑海中出现了两条路
1. 走git 提交更新 docker-compose down之后 再docker-compose up
2. 走git 提交更新，进docker hub 上传镜像，push镜像，再pull镜像，再启动
我认为选择第二种，万一在服务器上down了之后，没构建出来，怎么办~
也不对，我本地都把代码弄过去了，直接先制作镜像，之后再删掉之前，用新的不就行了嘛

大师 我悟了 jenkins 作为一台中间的构建服务器
[jenkins+docker实现自动编译、打包、构建镜像、容器部署](https://blog.csdn.net/xiaoxiangzi520/article/details/88842200)
[jenkins+docker的简单项目部署](https://www.pianshen.com/article/3247382361/)

jenkins构建服务器 Docker私有化仓库 测试机 正式机
构建上传到私有化仓库，测试机与正式机拉取最新的镜像

开发push代码到gitlab，触发jenkins自动pull代码，通过maven编译、打包，然后通过执行shell脚本使docker构建镜像并push到私服（或者阿里云）仓库，
此操作完成后jenkins服务器上再执行SSH命令登录到部署服务器，docker从仓库（私服）拉取镜像，启动容器。整个操作流程完成。

## 记录bug
###  docker0: iptables: No chain/target/match by that name.
停止docker服务 systemctl stop docker
iptables-save >  /etc/sysconfig/iptables
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
哈 没有安装java
centos安装：yum install java-1.8.0-openjdk* -y 
java -version：
openjdk version "1.8.0_262"

不行 认输了 不拿docker启动了
安装包搞起！！！
### 缺少nodejs环境
系统管理 ---> 全局工具配置 ---> NodeJS ---> 安装 ---> 自动安装 ---> 选择版本 ---> Save

感谢：
[docker + Jenkins前端自动化部署完整实践](https://blog.csdn.net/weixin_43983850/article/details/107055722)
