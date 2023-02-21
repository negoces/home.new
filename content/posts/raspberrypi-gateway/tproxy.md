---
title: "树莓派旁路由「六」：透明代理"
date: 2023-02-21T15:43:08+08:00
slug: dc5a09e5
#cover: "cover.png"
tags: [Raspberry Pi, Nftables, Debian, Network, TProxy, Clash]
categories: "树莓派网关"
---

做旁路由的大部分目的都是为了透明代理

<!--more-->

虽然文章中用到了 Clash，但是只用到了它的自动切换节点功能，分流功能依旧由 Nftables 提供 *(理论上来说性能应该更好，但是没有测试过，目前已知 Clash 的规则命中需要 3~5ms，数据来自 Clash Premium 和 Clash Tracing)*，如果你的节点足够稳定，你也可以使用 XRay 或者 V2Ray 来替代 Clash

## 下载 Clash

```bash
export CLASH_VER="v1.13.0" # 如有需要，请改为最新版本
sudo apt install git -y
curl -fLO "https://ghproxy.com/https://github.com/Dreamacro/clash/releases/download/${CLASH_VER}/clash-linux-arm64-${CLASH_VER}.gz"
gunzip clash-linux-arm64-${CLASH_VER}.gz
sudo mkdir -p /opt/clash
sudo mv clash-linux-arm64-${CLASH_VER} /opt/clash
sudo ln -s -T /opt/clash/clash-linux-arm64-${CLASH_VER} /opt/clash/clash
sudo chmod 755 /opt/clash/clash*
sudo git clone -b gh-pages --depth 1 https://github.com/haishanh/yacd /opt/clash/yacd
```

## 配置 Clash

编辑 `/opt/clash/config.yaml`: **请将 line 43 的地址改为你自己的订阅地址**

下列配置文件将:

- 在 `8080` 端口运行 HTTP Proxy
- 在 `1080` 端口运行 Socks5 Proxy
- 在 `5092` 端口运行 TProxy
- 在 `5090` 端口运行外部控制接口

```yaml
port: 8080
socks-port: 1080
tproxy-port: 5092

allow-lan: true
bind-address: "*"
mode: rule
log-level: warning
ipv6: false
external-controller: 0.0.0.0:5090
external-ui: ./yacd

proxy-groups:
  - name: "Global"
    type: select
    proxies:
      - Auto
      - Fallback
      - Select
      - DIRECT
  - name: "Auto"
    type: url-test
    use:
      - proxies
    tolerance: 50
    url: 'http://www.gstatic.com/generate_204'
    interval: 600
  - name: "Fallback"
    type: fallback
    use:
      - proxies
    url: 'http://www.gstatic.com/generate_204'
    interval: 300
  - name: "Select"
    type: select
    use:
      - proxies

proxy-providers:
  proxies:
    type: http
    path: ./subconf/proxies.yaml
    url:  https://url/config.yaml
    interval: 3600
    health-check:
      enable: true
      url: http://www.gstatic.com/generate_204
      interval: 1800

rules:
  - MATCH, Global
```

下载 MMDB 并创建订阅文件夹

```bash
sudo curl -fL "https://ghproxy.com/https://github.com/xOS/Country.mmdb/releases/latest/download/Country.mmdb" -o /opt/clash/Country.mmdb
sudo mkdir -p /opt/clash/subconf
sudo chmod 777 /opt/clash/subconf
sudo chmod 777 /opt/clash
```

## 试运行

```bash
sudo /opt/clash/clash -d /opt/clash
```

## 设置 Nftables

配置 IP 合集，下列脚本将:

- 创建 `/etc/nftables.conf.d` 文件夹
- 从 `ipv4.fetus.jp` 获取 CN 地址块
- 将 CN 地址块写入 `/etc/nftables.conf.d/ip_china.nftsets`
- 将局域网私有地址写入 `/etc/nftables.conf.d/ip_private.nftsets`

```bash
#!/bin/bash
sudo mkdir -p /etc/nftables.conf.d/

export CHINA_IP_SET=$(
    curl -sfL "https://ipv4.fetus.jp/cn.txt" | 
    sed '/^$/d' | sed '/^#/d' | sed ':a;N;$!ba;s/\n/, /g'
)

echo "define CHINA_IP = {
    ${CHINA_IP_SET}
}" | sudo tee /etc/nftables.conf.d/ip_china.nftsets

echo "define PRIVATE_IP = {
    0.0.0.0/8,
    127.0.0.0/8,
    169.254.0.0/16,
    10.0.0.0/8,
    172.16.0.0/12,
    192.168.0.0/16,
    224.0.0.0/4,
    240.0.0.0/4
}" | sudo tee /etc/nftables.conf.d/ip_private.nftsets
```

设置 `/etc/nftables.conf`，下列配置仅对 `非CN IP`、`80/tcp` 和 `443/tcp` 生效

```groovy
...

table ip mangle {
    include "/etc/nftables.conf.d/*.nftsets"

    chain prerouting {
        type filter hook prerouting priority mangle; policy accept;
        iifname "eth0" ip saddr $PRIVATE_IP ip daddr != $PRIVATE_IP jump proxy
    }

    chain proxy {
        ip protocol != { tcp } return
        tcp dport != { 80, 443 } return
        ip daddr $CHINA_IP return
        ct mark & 0xf000 == 0x0000 jump tproxy_mark
        ct mark & 0xf000 != 0x0000 meta mark set ct mark
    }

    chain tproxy_mark {}
}

...
```

生效: `sudo nft -f /etc/nftables.conf`

## 配置 systemd

创建配置文件夹:

```bash
sudo mkdir -p /etc/systemd/system/clash.service.d
```

主配置文件: `/etc/systemd/system/clash.service`

```ini
[Unit]
Description=clash
Documentation=man:clash
After=network.target network-online.target nss-lookup.target

[Service]
Type=simple
AmbientCapabilities=CAP_NET_RAW
AmbientCapabilities=CAP_NET_BIND_SERVICE
ExecStart=/opt/clash/clash -d /opt/clash
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=7s

[Install]
WantedBy=multi-user.target
```

透明代理配置文件: `/etc/systemd/system/clash.service.d/tproxy.conf`

```ini
[Service]
ExecStartPost=ip rule add fwmark 0xe105 table 105
ExecStartPost=ip route add local default dev lo table 105
ExecStartPost=nft add rule ip mangle tproxy_mark "ip protocol tcp tproxy to :5092 ct mark set 0xe105"
ExecStopPost=nft flush chain ip mangle tproxy_mark
ExecStopPost=ip route del local default dev lo table 105
ExecStopPost=ip rule del fwmark 0xe105 table 105
```

启动与开机自启:

```bash
sudo systemctl start clash
sudo systemctl enable clash
```

「选」DNS 劫持: (须额外配置 `nftables.conf`，且一般不需要配置)

```ini
ExecStartPost=nft add rule ip nat dns_hijack "ip protocol udp dnat to 172.24.0.1:5053"
ExecStopPost=nft flush chain ip nat dns_hijack
```
