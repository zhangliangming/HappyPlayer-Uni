# 简介 #
乐乐音乐H5网页版主要是基于uni-app框架开发的音乐播放器，目前只支持krc歌词（支持歌词颜色、字体大小、歌词进度调整和翻译和音译歌词），不支持歌词快进功能。
# 环境配置 #
    HBuilder 3.5.3.20220729
    Vue 2.0
# 功能截图 #

可到项目的assets/preview路径下查看预览图。

## 网络 ##

![](https://github.com/zhangliangming/HappyPlayer-Uni/blob/master/assets/preview/net.png)

## 默认歌词 ##

**点击网络界面的"+"按钮进入**

![](https://github.com/zhangliangming/HappyPlayer-Uni/blob/master/assets/preview/def_lrc.png)

## 翻译歌词 ##

![](https://github.com/zhangliangming/HappyPlayer-Uni/blob/master/assets/preview/translate.png)

## 音译歌词 ##

![](https://github.com/zhangliangming/HappyPlayer-Uni/blob/master/assets/preview/transliteration.png)

## 设置 ##

![](https://github.com/zhangliangming/HappyPlayer-Uni/blob/master/assets/preview/setting.png)

## 关于 ##

![](https://github.com/zhangliangming/HappyPlayer-Uni/blob/master/assets/preview/about.png)

## 反馈 ##

![](https://github.com/zhangliangming/HappyPlayer-Uni/blob/master/assets/preview/feedback.png)

# 性能 #

注：该版本主要是针对H5来开发，如果在手机上运行卡顿严重，建议下载Android版本；如果放到电脑网页上运行，性能较好。

# 参考 #

## uni-app官网

[https://uniapp.dcloud.net.cn/](https://uniapp.dcloud.net.cn/)


## uni Canvas

[https://uniapp.dcloud.net.cn/api/canvas/CanvasContext.html](https://uniapp.dcloud.net.cn/api/canvas/CanvasContext.html)

## popmotion JS动画库

[https://github.com/Popmotion/popmotion.git](https://github.com/Popmotion/popmotion.git)

## 乐乐音乐Android版本

[https://github.com/zhangliangming/HappyPlayer5.git](https://github.com/zhangliangming/HappyPlayer5.git)

# 其他 #

- 使用hb编译时，因为会存在跨域问题，建议使用内置浏览器运行。
- 由于uni是一种多平台的框架，有兴趣的可将代码编译到其他的平台和拓展其他格式的歌词。
- 目前是将Java代码语言翻译成对应的Js语言，在手机端上运行性能比较差，如果在PC上运行性能相对较好。
