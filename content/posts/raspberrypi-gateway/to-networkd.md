---
title: "树莓派旁路由「二」：拥抱 networkd"
date: 2023-02-19T23:41:20+08:00
slug: 822143d4
#cover: "cover.png"
tags: [Raspberry Pi, systemd-networkd, Debian, Network]
categories: "树莓派网关"
---

放弃树莓派自带的 ifupdown 和 dhcpcd5，使用 systemd-networkd 管理网络

<!--more-->

~~对，你说的没错，SystemD 什么都管 XD~~

为什么使用 systemd-networkd:

- 统一管理，配置文件均在同一目录，杜绝配置过于分散
- 接口管理更加方便，包括虚拟接口创建，接口改名，网桥，QoS
- 内置 DHCP 客户端与服务端，支持 DHCPv6-PD 和 RA
- `networkctl` 指令可快速查看接口状态

## 配置并启用 systemd-networkd

1. 配置 `eth0`: 编辑 `/etc/systemd/network/01-eth0.network`

    ```ini
    [Match]
    Name = eth0

    [Network]
    DHCP = yes
    ```

    一键脚本:

    ```bash
    echo "[Match]
    Name = eth0

    [Network]
    DHCP = yes" | sudo tee /etc/systemd/network/01-eth0.network
    ```

2. 设置开机自启

    ```bash
    sudo systemctl enable systemd-networkd
    ```

## 卸载原有的网络管理

```bash
sudo apt autopurge ifupdown dhcpcd5 dnsmasq-base isc-dhcp-client isc-dhcp-common -y
```

## 配置DNS

```bash
echo "nameserver 119.29.29.29" | sudo tee /etc/resolv.conf
```
