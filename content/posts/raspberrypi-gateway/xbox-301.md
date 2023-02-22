---
title: "树莓派旁路由「七」：Xbox 重定向"
date: 2023-02-22T16:29:23+08:00
slug: ca5ab9ae
#cover: "cover.png"
tags: [Raspberry Pi, Nginx, Debian, Network, Xbox, Epic, DNS]
categories: "树莓派网关"
---

将 Xbox 和 Store 的域名重定向到国内以提升下载速度

<!--more-->

## 安装 Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

## 添加重定向配置

编辑 `/etc/nginx/conf.d/games.conf`

```nginx
server {
    listen 80;
    server_name assets1.xboxlive.com xvcf1.xboxlive.com;
    return 301 http://assets1.xboxlive.cn$request_uri;
}

server {
    listen 80;
    server_name assets2.xboxlive.com xvcf2.xboxlive.com;
    return 301 http://assets2.xboxlive.cn$request_uri;
}

server {
    listen 80;
    server_name d1.xboxlive.com;
    return 301 http://d1.xboxlive.cn$request_uri;
}

server {
    listen 80;
    server_name d2.xboxlive.com;
    return 301 http://d2.xboxlive.cn$request_uri;
}

server {
    listen 80;
    server_name dlassets.xboxlive.com;
    return 301 http://dlassets.xboxlive.cn$request_uri;
}

server {
    listen 80;
    server_name dlassets2.xboxlive.com;
    return 301 http://dlassets2.xboxlive.cn$request_uri;
}

server {
    listen 80;
    server_name
        epicgames-download1.akamaized.net
        download.epicgames.com
        download2.epicgames.com
        download3.epicgames.com
        download4.epicgames.com
        fastly-download.epicgames.com;
    return 301 http://epicgames-download1-1251447533.file.myqcloud.com$request_uri;
}
```

检查并重载配置:

```bash
sudo nginx -t && sudo nginx -s reload
```

## 添加 DNS 记录

IP 可以用 <https://github.com/skydevil88/XboxDownload> 工具筛选

编辑 `/etc/unbound/unbound.conf`

```yaml
server:
  # 改为网关 IP
  local-data: "gateway. A 172.16.0.2"

  local-data: "epicgames-download1.akamaized.net CNAME gateway."
  local-data: "download.epicgames.com CNAME gateway."
  local-data: "download2.epicgames.com CNAME gateway."
  local-data: "download3.epicgames.com CNAME gateway."
  local-data: "download4.epicgames.com CNAME gateway."
  local-data: "fastly-download.epicgames.com CNAME gateway."

  local-data: "assets1.xboxlive.com CNAME gateway."
  local-data: "assets2.xboxlive.com CNAME gateway."
  local-data: "xvcf1.xboxlive.com CNAME gateway."
  local-data: "xvcf2.xboxlive.com CNAME gateway."
  local-data: "d1.xboxlive.com CNAME gateway."
  local-data: "d2.xboxlive.com CNAME gateway."
  local-data: "dlassets.xboxlive.com CNAME gateway."
  local-data: "dlassets2.xboxlive.com CNAME gateway."

  local-data: "assets1.xboxlive.cn A 61.147.216.3"
  local-data: "assets2.xboxlive.cn A 61.147.216.3"
  local-data: "d1.xboxlive.cn A 61.147.216.3"
  local-data: "d2.xboxlive.cn A 61.147.216.3"
  local-data: "dlassets.xboxlive.cn A 218.91.221.49"
  local-data: "dlassets2.xboxlive.cn A 218.91.221.49"
  local-data: "dl.delivery.mp.microsoft.com A 58.223.124.53"
  local-data: "tlu.dl.delivery.mp.microsoft.com A 58.223.124.53"
```

重载:

```bash
sudo systemctl restart unbound
```
