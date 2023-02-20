---
title: "树莓派旁路由「三」：内核网络设置"
date: 2023-02-20T01:10:46+08:00
slug: 79593a69
#cover: "cover.png"
tags: [Raspberry Pi, Linux Kernel, Debian, Network]
categories: "树莓派网关"
---

开启 TCP-fastopen，BBR，设置最大连接数等功能

<!--more-->

## 开启 BBR

BBR 是 Google 提出的一种新型拥塞控制算法，可以使 Linux 服务器显著地提高吞吐量和减少 TCP 连接的延迟。

1. 设置自动加载模块

    ```bash
    echo "tcp_bbr" | sudo tee /etc/modules-load.d/tcp_bbr.conf
    ```

2. 设置自动配置参数

    ```bash
    echo "net.core.default_qdisc = cake
    net.ipv4.tcp_congestion_control = bbr" | \
    sudo tee /etc/sysctl.d/10-tcp_bbr.conf
    ```

## 开启 TCP-fastopen

设置自动配置参数

```bash
echo "net.ipv4.tcp_fastopen = 3" | \
sudo tee /etc/sysctl.d/10-tcp_fastopen.conf
```

*注: 实际网络复杂，基本等于无效。*

## 开启数据包转发

这也是作为网关的核心功能

```bash
echo "net.ipv4.ip_forward = 1
net.ipv6.conf.default.forwarding = 1
net.ipv6.conf.all.forwarding = 1" | \
sudo tee /etc/sysctl.d/10-forward.conf
```

## 设置最大连接数

过大会导致转发速率大幅下降，来自网络的计算公式：`nf_conntrack_max = ram_size_bytes/16KB/2`

树莓派内存为 8GB，得 `x = 8*((1024)^3)/(16*1024)/2` 得 `262144`

模块加载:

```bash
echo "nf_conntrack" | sudo tee /etc/modules-load.d/nf_conntrack.conf
```

持久化配置:

```bash
echo "net.netfilter.nf_conntrack_max = 262144" | \
sudo tee /etc/sysctl.d/10-nf_conntrack.conf
```
