---
title: "[草稿]Godns Ddns"
date: 2023-02-20T17:55:04+08:00
slug: 1091459b
#cover: "cover.png"
tags: []
categories: undefined
---

Summary

<!--more-->

- <https://github.com/TimothyYe/godns>
- <https://github.com/TimothyYe/godns/releases/download/v2.9.2-1/godns_2.9.2-1_Linux_x86_64.tar.gz>

```bash
curl -fLO https://ghproxy.com/https://github.com/TimothyYe/godns/releases/download/v2.9.2-1/godns_2.9.2-1_Linux_x86_64.tar.gz
```

```bash
tar -xzvf godns_2.9.2-1_Linux_x86_64.tar.gz godns
```

```bash
sudo mkdir -p /opt/godns
sudo mv godns /opt/godns
```

```yaml
debug_info: true
provider: AliDNS
email: "access_id"
password: "access_key"
domains:
  - domain_name: example.top
    sub_domains:
      - ddns
resolver: "2402:4e00::"
ip_urls: []
ip_interface: "ppp-telecom"
ip_type: IPv6
interval: 300
notify:
  slack:
    enabled: true
    bot_api_token: xoxb-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    channel: "ddns"
    message_template: "IP changed:\n{{ .Domain }}\t{{ .CurrentIP }}"
```

```ini
# /etc/systemd/system/godns.service

[Unit]
Description=GoDNS Service
After=network.target

[Service]
ExecStart=/opt/godns/godns -c /opt/godns/config.yaml
Restart=always
KillMode=process
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now godns
```
