---
title: "树莓派旁路由「一」：无头初始化"
date: 2023-02-19T11:12:54+08:00
slug: 6f8416c8
#cover: "cover.png"
tags: [RaspberryPi, Headless, Mirror]
categories: "树莓派网关"
---

在没有显示器的情况下安装并配置树莓派的系统(Raspberry Pi 4B)

<!--more-->

网络上大部分有关于树莓牌安装的教程都是基于有显示器的，有少部分教程不需要显示器，但是也过时了(期间树莓派官方系统修改了初始化策略，将不使用 `pi` 用户)，本文将在无显示器的情况下安装并配置树莓派系统

> 此文章的性质更偏向于笔记，所以代码和脚本偏多，文字介绍较少，甚至缺失

## 下载系统 IMG 文件

由于地理环境限制，树莓派官网下载 ISO 文件的速度异常缓慢，因此我们可以前往镜像源下载

镜像源列表:

- <https://mirrors.bfsu.edu.cn>
- <https://mirror.nju.edu.cn>
- <https://mirrors.ustc.edu.cn>

下载地址组成:

- `${MIRROR_URL}`/raspberry-pi-os-images/raspios_lite_arm64/images/`${VERSION}`/`${DATE}`-raspios-bullseye-arm64-lite.img.xz

例如:

- <https://mirrors.bfsu.edu.cn/raspberry-pi-os-images/raspios_lite_arm64/images/raspios_lite_arm64-2022-09-26/2022-09-22-raspios-bullseye-arm64-lite.img.xz>

*Tips: 可以使用 aria2c 进行多线程下载来加快下载速度:*

```bash
aria2c -x 16 "https://mirrors.bfsu.edu.cn/raspberry-pi-os-images/raspios_lite_arm64/images/raspios_lite_arm64-2022-09-26/2022-09-22-raspios-bullseye-arm64-lite.img.xz"
```

## 将 IMG 写入 SD 卡并进行配置

1. 解压 IMG.XZ 系统映像文件:

    ```bash
    unxz -kvv 2022-09-22-raspios-bullseye-arm64-lite.img.xz
    ```

2. 使用 dd 指令写入: (`/dev/sdb` 为 SD 卡块设备路径)

    ```bash
    sudo dd if=2022-09-22-raspios-bullseye-arm64-lite.img of=/dev/sdb bs=32K status=progress
    ```

    > **Tips:**
    >
    > 须注意磁盘是否全部卸载，使用 `lsblk` 查看，以下指令卸载:
    >
    > ```bash
    > sudo umount -A /dev/sdb{1,2}
    > ```

3. 挂载 `/dev/sdb1` 并进入

    ```bash
    mkdir -p mnt
    sudo mount /dev/sdb1 ./mnt
    cd mnt
    ```

4. 添加用户: (原理: 创建 `userconf.txt` 并写入账户密码)

    ```bash
    export NEW_USER="username"
    export NEW_PASSWD="password"
    echo "${NEW_USER}:$(openssl passwd -6 ${NEW_PASSWD})" | sudo tee userconf.txt
    ```

5. 启用 SSH

    ```bash
    sudo touch ssh
    ```

6. 卸载分区

    ```bash
    cd ..
    sudo umount ./mnt
    rm -r ./mnt
    ```

## 对启动后的树莓派进行配置

1. 使用 `ssh user@ip` 连接树莓派，例如:

    ```bash
    ssh user@172.16.0.2
    ```

2. 更换镜像源: 修改 `/etc/apt/sources.list` 和 `/etc/apt/sources.list.d/raspi.list` 文件，添加镜像地址，可以将 `MIRROR_URL` 环境变量设置为自己喜欢的镜像源地址，一键脚本:

    ```bash
    sudo apt install ca-certificates
    export MIRROR_URL="https://mirrors.ustc.edu.cn"
    echo "deb ${MIRROR_URL}/debian/ stable main contrib non-free
    deb ${MIRROR_URL}/debian/ stable-updates main contrib non-free
    deb ${MIRROR_URL}/debian-security/ stable-security main contrib non-free" | \
    sudo tee /etc/apt/sources.list
    echo "deb ${MIRROR_URL}/raspberrypi/debian/ bullseye main" | \
    sudo tee /etc/apt/sources.list.d/raspi.list
    sudo apt update
    ```

3. 完整更新系统并清除无用包

    ```bash
    sudo apt full-upgrade -y
    sudo apt autopurge -y
    ```

4. 设置语言及时区并重启

    ```bash
    sudo sed -i 's|# zh_CN.UTF-8 UTF-8|zh_CN.UTF-8 UTF-8|g' /etc/locale.gen
    sudo sed -i 's|# en_US.UTF-8 UTF-8|en_US.UTF-8 UTF-8|g' /etc/locale.gen
    sudo locale-gen
    sudo localectl set-locale "zh_CN.UTF-8"
    sudo timedatectl set-timezone "Asia/Shanghai"
    sudo timedatectl set-ntp yes
    sudo reboot
    ```
