---
title: "Linux 的环境变量设置"
date: 2022-11-04T11:42:00+08:00
slug: 3c7ba38a
#cover: "cover.png"
tags: [Arch Linux, Environment Variables]
categories: [Linux]
---

<!--more-->

现有方案的问题:

- `/etc/environment` 和 `~/.config/environment.d/` 仅接受 `NAME=VAL` 格式
- 全部放在 `/etc/profile` 不美观且不支持分用户

解决方案:

- 使用 `/etc/profile.d/usr_env.sh` 加载对应用户的的 `~/.local/profile.d/*.sh`

具体实施:

1. 创建并编辑 `/etc/profile.d/usr_env.sh`

    ```bash
    #!/bin/sh
    profileDir="/home/${USER}/.local/profile.d"
    if test -d ${profileDir}; then
        for profile in ${profileDir}/*.sh; do
            test -r "$profile" && . "$profile"
        done
        unset profile
    fi
    unset profileDir
    ```

2. 创建 `~/.local/profile.d` 文件夹并创建编辑 `*.sh`
3. 注销后重新登录生效
