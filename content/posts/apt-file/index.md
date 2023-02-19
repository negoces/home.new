---
title: "apt 查看文件与包之间的关系"
date: 2023-02-20T01:47:54+08:00
slug: 4420bf65
#cover: "cover.png"
tags: [Debian, Ubuntu, apt, Linux]
categories: 运维
---

Arch Linux 下 pacman -F 用惯了，突然用 Debian 还有点不适应

<!--more-->

## 查找文件属于哪个本地包

```bash
dpkg -S ${filename}
# 或
dpkg-query -S ${filename}
```

## 查看本地包文件

等同于 `pacman -Ql ${package}`

```bash
dpkg -L ${package}
```

## 查找文件属于哪个远程包

也可以理解为，查找指令属于哪个包，相当于 `pacman -F ${name}`，须安装 `apt-file`；查找指令:

```bash
sudo apt-file update
apt-file search ${filename}
```

## 查看远程包文件

等同于 `pacman -Fl ${package}`

```bash
sudo apt-file update
apt-file show ${filename}
```
