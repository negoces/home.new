---
title: "树莓派旁路由「五」：开启 DNS 加密杜绝 DNS 劫持"
date: 2023-02-20T13:50:18+08:00
slug: e001cf16
#cover: "cover.png"
tags: [Raspberry Pi, DNS, Unbound, DoT, Nftables, Debian, Network]
categories: "树莓派网关"
---

只要我劫持了我自己，就没人能劫持到我。（*＾-＾*）

<!--more-->

## 安装及配置 Unbound

安装：

```bash
sudo apt install unbound -y
```

编辑 `/etc/unbound/unbound.conf`：

```yaml
#include-toplevel: "/etc/unbound/unbound.conf.d/*.conf"

server:
  log-queries: yes
  verbosity: 1

  #auto-trust-anchor-file: "/var/lib/unbound/root.key"

  interface: 0.0.0.0
  access-control: 0.0.0.0/0 allow
  port: 53

  tls-system-cert: yes
  qname-minimisation: yes

  local-data: "gw. A 172.16.0.2"

forward-zone:
  name: "."
  forward-addr: 175.24.154.66@853#rubyfish.cn
  forward-addr: 120.53.53.53@853#dot.pub
  forward-tls-upstream: yes
```

开机自启与重启:

```bash
sudo systemctl enable --now unbound
sudo systemctl restart unbound
```

日志查询:

```bash
sudo journalctl -f -u unbound
```

## 使用 Nftables 劫持内网 DNS (仍需改进)

编辑 `/etc/nftables.conf`

```caddy
table ip nat {
    chain prerouting {
        type nat hook prerouting priority dstnat; policy accept;
        ip saddr 172.16.0.0/16 udp dport 53 dnat to 172.16.0.2:53 comment dns_hijack
    }
}
```

立即生效:

```bash
sudo nft -f /etc/nftables.conf
```
