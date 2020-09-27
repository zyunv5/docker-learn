# gitlab 我来了！ 
## 安装 从3开始吧
1. 配置yum源
vim /etc/yum.repos.d/gitlab-ce.repo
复制一下内容
[gitlab-ce]
name=Gitlab CE Repository
baseurl=https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el$releasever/
gpgcheck=0
enabled=1
2. 更新本地yum缓存
   yum makecache
   这一步有一丢丢漫长

   可以考虑更换yum源
   2.1 备份原来的源文件
   mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
   2.2 CentOS 7
    wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
  2.3 之后运行yum makecache生成缓存
3. 1和2过慢的话 请直接开始走3
   把安装包下载到本地
   https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el7/gitlab-ce-10.0.0-ce.0.el7.x86_64.rpm
  上传文件
  执行 rpm -i gitlab-ce-10.0.0-ce.0.el7.x86_64.rpm
  出现 Thank you for installing GitLab! 安阿虎在那个成功
4. 配置gitlab的ip和端口
   vi /etc/gitlab/gitlab.rb 
   external_url http://207.148.110.93:6060 定义ip与端口
   配置：gitlab-ctl reconfigure
   启动GitLab：gitlab-ctl restart

## bug
### 502 Whoops, GitLab is taking too much time to respond.
貌似小水管 启动不了 至少需要2G内存 RIP

vim /etc/gitlab/gitlab.rb
unicorn['worker_processes'] = 8
（建议worker=CPU核数+1）

查看内存情况 free -m

gitlab-ctl stop 停下来吧