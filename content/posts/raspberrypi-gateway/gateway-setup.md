---
title: "树莓派旁路由「四」：设置为网关"
date: 2023-02-20T10:17:31+08:00
slug: 47657fb1
#cover: "cover.png"
tags: [Raspberry Pi, Gateway, Nftables, Debian, Network]
categories: "树莓派网关"
---

将树莓派设置为网关，接管出口流量

<!--more-->

> 文章内的IP请试情况修改，否则会导致网络不用，文章假定子网地址为 172.16.0.0/16

## 为树莓派指定网关

后续我们将修改 DHCP Server 的网关设置，为了防止流量回环，需要手动指定树莓派的网关

编辑 `/etc/systemd/network/01-eth0.network`

```ini
[Match]
Name = eth0

[Network]
DHCP = yes
Gateway = 172.16.0.1
```

老规矩，一键脚本:

```bash
echo "[Match]
Name = eth0

[Network]
DHCP = yes
Gateway = 172.16.0.1" | sudo tee /etc/systemd/network/01-eth0.network
```

## 修改路由器 DHCP 配置

1. 在路由器管理页面，打开DHCP配置(**非上网设置**)
2. 添加静态 IP 绑定，将树莓派的 IP 绑定为 172.16.0.2
3. 将默认网关设置为树莓派IP，让所有局域网设备的出口流量都发送到树莓派
4. 将DNS服务器设置为树莓派IP

## 使用 Nftables 验证

安装:

```bash
sudo apt install nftables -y
```

编辑 `/etc/nftables.conf`

```caddy
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0;
    }

    chain forward {
        type filter hook forward priority 0;
        counter
    }

    chain output {
        type filter hook output priority 0;
    }
}
```

立即生效:

```bash
sudo nft -f /etc/nftables.conf
```

开机生效:

```bash
sudo systemctl enable nftables
```

查看统计:

```bash
$ sudo nft list ruleset
...
    chain forward {
        type filter hook forward priority filter; policy accept;
        counter packets 1185249 bytes 1461301729 # 不为0即为正常
    }
...
```
