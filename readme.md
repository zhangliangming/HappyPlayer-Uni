# 简介 #
乐乐音乐网页版主要是基于uni-app框架开发的音乐播放器，目前只支持krc歌词（支持翻译和音译歌词）。
# 环境配置 #
    HBuilder 3.5.3.20220729
    Vue 2.0
# 功能截图 #
## 网络 ##

![](https://bilnn1.sharepoint.cn/sites/pan04/_layouts/15/download.aspx?UniqueId=c2d21f07-4c14-4450-87cc-caa6b44f2498&Translate=false&tempauth=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvYmlsbm4xLnNoYXJlcG9pbnQuY25AN2MwZWNhMjAtYTE1Yi00MTJjLTg1MTAtZTI3MzFlZmU1MzMxIiwiaXNzIjoiMDAwMDAwMDMtMDAwMC0wZmYxLWNlMDAtMDAwMDAwMDAwMDAwIiwibmJmIjoiMTY2MDU1NDIwNyIsImV4cCI6IjE2NjA1NTc4MDciLCJlbmRwb2ludHVybCI6IlZNZWcycDBvWk1rS2hFSW1IQkpMWEpvYU9Pak0rMEd2Z2s5YVFRWUJ2TTA9IiwiZW5kcG9pbnR1cmxMZW5ndGgiOiIxMjgiLCJpc2xvb3BiYWNrIjoiVHJ1ZSIsImNpZCI6IllUZGhNVFUxTXpRdFpEQTROQzAwWXpobUxUaGtNelF0T0dFeU0yUm1aVE5pTXpVeiIsInZlciI6Imhhc2hlZHByb29mdG9rZW4iLCJzaXRlaWQiOiJNemhoWldSa1pXVXRZMk5sWmkwME1qZ3hMVGs0TXpZdE5HRTNaV0k1T0RJeU1UTTIiLCJhcHBfZGlzcGxheW5hbWUiOiJzaXRlMDUiLCJhcHBpZCI6IjczMTA4NzI4LTM0YWEtNDI5NC04ZTE4LTlmZDBiNDE5ZDdhNSIsInRpZCI6IjdjMGVjYTIwLWExNWItNDEyYy04NTEwLWUyNzMxZWZlNTMzMSIsInVwbiI6InBhbjAzQGJpbG5uMS5wYXJ0bmVyLm9ubXNjaGluYS5jbiIsInB1aWQiOiIxMDAzMzIzMEM2MEVGNUJEIiwiY2FjaGVrZXkiOiIwaC5mfG1lbWJlcnNoaXB8MTAwMzMyMzBjNjBlZjViZEBsaXZlLmNvbSIsInNjcCI6ImFsbGZpbGVzLndyaXRlIiwidHQiOiIyIiwidXNlUGVyc2lzdGVudENvb2tpZSI6bnVsbCwiaXBhZGRyIjoiNDAuNzIuNzQuMTkzIn0.UXFocjdpQ1gxdDZKOUc1VHRETFN0TFpKcEtiMjY0NUNCSERFMUl5NGpkYz0&ApiVersion=2.0)

## 设置 ##

![](https://bilnn1.sharepoint.cn/sites/pan04/_layouts/15/download.aspx?UniqueId=83bf692c-67e7-4239-801c-4e6df6a1a2aa&Translate=false&tempauth=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvYmlsbm4xLnNoYXJlcG9pbnQuY25AN2MwZWNhMjAtYTE1Yi00MTJjLTg1MTAtZTI3MzFlZmU1MzMxIiwiaXNzIjoiMDAwMDAwMDMtMDAwMC0wZmYxLWNlMDAtMDAwMDAwMDAwMDAwIiwibmJmIjoiMTY2MDU1NDIyNSIsImV4cCI6IjE2NjA1NTc4MjUiLCJlbmRwb2ludHVybCI6IlBnZjZQeW5qT2pwZWlNS0NiUCtIQWlhNUg0cFJoMmxSQTY0MWpPdVhjajQ9IiwiZW5kcG9pbnR1cmxMZW5ndGgiOiIxMjgiLCJpc2xvb3BiYWNrIjoiVHJ1ZSIsImNpZCI6IllqTmpNV0ZqWmpBdE4yRmhNaTAwTVRFMUxXRTBNak10T0RSaFltTXhZVEUwWWpOaCIsInZlciI6Imhhc2hlZHByb29mdG9rZW4iLCJzaXRlaWQiOiJNemhoWldSa1pXVXRZMk5sWmkwME1qZ3hMVGs0TXpZdE5HRTNaV0k1T0RJeU1UTTIiLCJhcHBfZGlzcGxheW5hbWUiOiJzaXRlMDUiLCJhcHBpZCI6IjczMTA4NzI4LTM0YWEtNDI5NC04ZTE4LTlmZDBiNDE5ZDdhNSIsInRpZCI6IjdjMGVjYTIwLWExNWItNDEyYy04NTEwLWUyNzMxZWZlNTMzMSIsInVwbiI6InBhbjAzQGJpbG5uMS5wYXJ0bmVyLm9ubXNjaGluYS5jbiIsInB1aWQiOiIxMDAzMzIzMEM2MEVGNUJEIiwiY2FjaGVrZXkiOiIwaC5mfG1lbWJlcnNoaXB8MTAwMzMyMzBjNjBlZjViZEBsaXZlLmNvbSIsInNjcCI6ImFsbGZpbGVzLndyaXRlIiwidHQiOiIyIiwidXNlUGVyc2lzdGVudENvb2tpZSI6bnVsbCwiaXBhZGRyIjoiNDAuNzIuNzQuMTkzIn0.T0ZIOXJrZzFqYUEzLzZoKzljYmFRd3lTUWJHSFNqY0x4RkhXS3NtZVowMD0&ApiVersion=2.0)

# 安装包 #
# 其他 #
由于uni是一种多平台的框架，有兴趣的可将代码编译到其他的平台和拓展其他格式的歌词。