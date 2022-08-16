<!-- 歌词界面 -->
<template>
	<template-view>
		<template slot="container">
			<div class="horizontal">
				<view class="manyLyricsView">
					<canvas v-bind:style="{ height: viewHeight + 'px !important', width: viewWidth + 'px !important' }" canvas-id="manyLyricsView" id="manyLyricsView"></canvas>
				</view>
			</div>
			<view class="footer">
				<div class="progress"><slider block-size="12" :value="curProgress" :max="maxProgress" activeColor="#0288d1" disabled /></div>
				<uni-goods-nav :fill="true" :options="options" :buttonGroup="buttonGroup" @click="onItemClick" @buttonClick="buttonClick" />
			</view>
		</template>
	</template-view>
</template>

<script>
import { reqLyricsList, reqLyricsInfo } from '@/http/api.js';
import { krcParser } from '@/assets/js/parserUtil.js';
import { splitLyrics, getLineNumber, getDynamicLrcLineNum, getDynamicLrcWordHLWidth, getTextWidth } from '@/assets/js/lrcUtil.js';
import { animate, linear } from 'popmotion';

const ctx = uni.createCanvasContext('manyLyricsView');
var animateObj = null;

export default {
	data() {
		return {
			lyricsInfo: null, //歌词
			windowWidth: 0,
			windowHeight: 0,
			viewHeight: 0, //歌词视图高度
			viewWidth: 0, //歌词视图宽度

			lyricsType: 1, //0是lrc，1是动感
			lyricsLineNum: 0, //行索引
			splitLyricsLineNum: 0, //分割行索引
			splitLyricsWordHLWidth: 0, //分割歌词当前字的高亮宽度
			extraSplitLyricsLineNum: 0, //当前额外分割歌词的所在行数
			extraSplitLyricsWordHLWidth: 0, //当前额外歌词当前字的高亮宽度
			spaceLineHeight: 20, //间隔高度
			extraLrcSpaceLineHeight: 10, //额外歌词间隔高度
			offsetY: 0, //歌词在Y轴上的偏移量，只要用于动画
			duration: 250, //Y轴移动的时间
			showLrcType: -1, //歌词显示方式：-1是没歌词，0是默认歌词，1是音译歌词，2是翻译歌词
			hasLrcType: -1, //集合含有歌词类型，-1是没歌词，0是默认歌词，1是音译歌词，2是翻译歌词，3是全部歌词都有

			minFontSize: 12, //最小字体
			maxFontSize: 20, //最大字体
			fontSize: 12, //字体大小
			colorIndex: 0, //颜色索引
			defColor: '#666666', //默认颜色
			colorHLs: ['#FFD700', '#fe8db6', '#feb88e', '#adfe8e', '#8dc7ff', '#e69bff'], //高亮颜色集合

			curHash: '', //当前hash
			curProgress: 0, //当前进度
			maxProgress: 100,
			title: '乐乐音乐-就是任性',
			defText: '暂无歌词',
			options: [
				{
					icon: 'arrow-left',
					text: '上一首'
				},
				{
					icon: 'arrow-right',
					text: '下一首'
				},
				{
					icon: 'color-filled',
					text: '颜色'
				},
				{
					icon: 'font',
					text: '大小'
				},
				{
					icon: 'tune',
					text: '进度'
				},
				{
					icon: 'paperclip',
					text: '音/翻'
				}
			],
			buttonGroup: [
				{
					text: '播放/暂停',
					backgroundColor: '#555',
					color: '#fff'
				}
			]
		};
	},
	onLoad(option) {
		const { windowWidth, windowHeight } = uni.getSystemInfoSync();
		this.windowWidth = windowWidth;
		this.windowHeight = windowHeight;
		this.viewWidth = parseInt((windowWidth * 4) / 5);
		this.viewHeight = windowHeight - 120;

		this.initData(option);

		//监听操作
		const that = this;
		uni.$on('event', function(result) {
			switch (result.action) {
				case 'init':
					that.resetLrcData();
					that.initData(result);
					break;

				case 'play':
					break;

				case 'progress':
					if (that.maxProgress == 100) {
						that.maxProgress = result.duration;
					}
					that.curProgress = result.progress;

					//更新歌词视图
					//console.log(that.lyricsInfo)
					if (that.lyricsInfo != null) {
						that.updateView(that.curProgress);
					}
					break;

				case 'pause':
					break;

				default:
					that.resetLrcData();
					that.initData({});
					break;
			}
		});
	},
	onReady() {
		//统一处理画布相关
		this.invalidateView();
	},
	methods: {
		/**
		 * 绘画
		 */
		invalidateView() {
			//console.log('invalidateView->');
			ctx.setFontSize(this.fontSize);
			if (this.lyricsInfo == null) {
				//没有歌词，画默认提示语
				var textWidth = getTextWidth(ctx, this.defText);
				var x = parseInt((this.viewWidth - textWidth) / 2);
				var y = parseInt((this.viewHeight + this.getTextHeight()) / 2);
				ctx.setFillStyle(this.colorHLs[this.colorIndex]);
				ctx.fillText(this.defText, x, y);
			} else {
				//有歌词
			}
			ctx.draw();
		},
		/**
		 * 重置lrc数据
		 */
		resetLrcData() {
			this.lyricsType = 1;
			this.lyricsLineNum = 0;
			this.splitLyricsLineNum = 0;
			this.splitLyricsWordHLWidth = 0;
			this.extraSplitLyricsLineNum = 0;
			this.extraSplitLyricsWordHLWidth = 0;
			this.offsetY = 0;
			this.showLrcType = -1;
			this.hasLrcType = -1;
		},
		/**
		 * 分割歌词
		 * @param {Object} lyricsInfo
		 */
		splitLrc(lyricsInfo) {
			//分割歌词
			splitLyrics(lyricsInfo, ctx, this.viewWidth);
			this.lyricsType = lyricsInfo.lyricsType;
			var lyricsInfos = lyricsInfo.lyricsInfos; //默认歌词
			var translateLrcInfos = lyricsInfo.translateLrcInfos; //翻译歌词
			var transliterationLrcInfos = lyricsInfo.transliterationLrcInfos; //音译歌词
			var hasLrc = lyricsInfos != undefined && lyricsInfos != null && lyricsInfos.length > 0;
			var hasTransliteration = transliterationLrcInfos != undefined && transliterationLrcInfos != null && transliterationLrcInfos.length > 0;
			var hasTranslate = translateLrcInfos != undefined && translateLrcInfos != null && translateLrcInfos.length > 0;
			if (hasLrc && hasTransliteration && hasTranslate) {
				//含有3种歌词
				this.hasLrcType = 3;
			} else if (hasLrc && hasTransliteration) {
				//音译歌词
				this.hasLrcType = 1;
			} else if (hasLrc && hasTranslate) {
				//翻译歌词
				this.hasLrcType = 2;
			} else if (hasLrc) {
				//默认歌词
				this.hasLrcType = 0;
			} else {
				//没有歌词
				this.hasLrcType = -1;
			}
			this.lyricsInfo = lyricsInfo;
			console.log('loadLrcFinish->');
		},
		/**
		 * 更新视图
		 * @param {Object} playProgress
		 */
		updateView(playProgress) {
			//console.log(playProgress)
			if (this.lyricsInfo == null) return;
			try {
				var lyricsInfos = this.lyricsInfo.lyricsInfos;
				var lyricsType = this.lyricsInfo.lyricsType;
				var offset = this.lyricsInfo.offset;
				var oldLyricsLineNum = this.lyricsLineNum;
				var translateLrcInfos = this.lyricsInfo.translateLrcInfos; //翻译歌词
				var hasTranslate = translateLrcInfos != undefined && translateLrcInfos != null && translateLrcInfos.length > 0;
				var transliterationLrcInfos = this.lyricsInfo.transliterationLrcInfos; //音译歌词
				var hasTransliteration = transliterationLrcInfos != undefined && transliterationLrcInfos != null && transliterationLrcInfos.length > 0;

				//获取默认歌词当前行
				this.lyricsLineNum = getLineNumber(lyricsType, lyricsInfos, playProgress, offset);
				if (lyricsType == 1 && this.lyricsLineNum >= 0 && this.lyricsLineNum < lyricsInfos.length) {
					//动感歌词，则需要获取分割歌词当前所在的行
					var splitLyricsInfos = lyricsInfos[this.lyricsLineNum].splitLyricsInfos;
					this.splitLyricsLineNum = getDynamicLrcLineNum(splitLyricsInfos, playProgress, offset);
					if (this.splitLyricsLineNum >= 0 && this.splitLyricsLineNum < splitLyricsInfos.length) {
						this.splitLyricsWordHLWidth = getDynamicLrcWordHLWidth(ctx, splitLyricsInfos, this.splitLyricsLineNum, playProgress, offset);
					}
				}
				if (this.showLrcType <= 0) {
					//显示默认歌词
					return;
				}

				//翻译歌词
				if (hasTranslate && this.showLrcType == 2 && lyricsType == 1) {
					//显示翻译歌词和动感歌词格式的翻译歌词
					if (this.lyricsLineNum >= 0 && this.lyricsLineNum < translateLrcInfos.length) {
						//获取分割歌词当前行
						var splitTranslateLrcInfos = translateLrcInfos[this.lyricsLineNum].splitLyricsInfos;
						this.extraSplitLyricsLineNum = getDynamicLrcLineNum(splitTranslateLrcInfos, playProgress, offset);
						if (this.extraSplitLyricsLineNum >= 0 && this.extraSplitLyricsLineNum < splitTranslateLrcInfos.length) {
							this.extraSplitLyricsWordHLWidth = getDynamicLrcWordHLWidth(ctx, splitTranslateLrcInfos, this.extraSplitLyricsLineNum, playProgress, offset);
						}
					}
					return;
				}

				//音译歌词
				if (this.lyricsLineNum >= 0 && this.lyricsLineNum < transliterationLrcInfos.length) {
					//获取分割歌词当前行
					var splitTransliterationLrcInfos = transliterationLrcInfos[this.lyricsLineNum].splitLyricsInfos;
					this.extraSplitLyricsLineNum = getDynamicLrcLineNum(splitTransliterationLrcInfos, playProgress, offset);
					if (this.extraSplitLyricsLineNum >= 0 && this.extraSplitLyricsLineNum < splitTransliterationLrcInfos.size()) {
						this.extraSplitLyricsWordHLWidth = getDynamicLrcWordHLWidth(ctx, splitTransliterationLrcInfos, this.extraSplitLyricsLineNum, playProgress, offset);
					}
				}
			} catch (err) {
			} finally {
				// console.log(oldLyricsLineNum != this.lyricsLineNum);
				if (oldLyricsLineNum != this.lyricsLineNum) {
					//与上一行索引不同，需要使用动画移动歌词
					this.scrollViewY(this.offsetY, this.getLineNumHeight(this.lyricsLineNum));
				}
				this.invalidateView();
			}
		},

		/**
		 * 获取该行的高度
		 *
		 * @param lineNum 行号
		 * @return
		 */
		getLineNumHeight(lineNum) {
			if (lineNum < 0) {
				return 0;
			}
			var lyricsInfos = this.lyricsInfo.lyricsInfos;
			var translateLrcInfos = this.lyricsInfo.translateLrcInfos; //翻译歌词
			var hasTranslate = translateLrcInfos != undefined && translateLrcInfos != null && translateLrcInfos.length > 0;
			var transliterationLrcInfos = this.lyricsInfo.transliterationLrcInfos; //音译歌词
			var hasTransliteration = transliterationLrcInfos != undefined && transliterationLrcInfos != null && transliterationLrcInfos.length > 0;

			var lineNumHeight = 0;
			//需要处理有额外歌词的情况
			for (var i = 0; i < lineNum; i++) {
				var lyricsLineInfo = lyricsInfos[i];
				//获取分割后的歌词列表
				var splitLyricsInfos = lyricsLineInfo.splitLyricsInfos;
				lineNumHeight += (this.getTextHeight() + this.spaceLineHeight) * splitLyricsInfos.length;
				//判断是否有翻译歌词或者音译歌词

				//只显示默认歌词
				if (this.showLrcType <= 0) {
					continue;
				}

				if (hasTranslate && this.showLrcType == 2) {
					//显示翻译歌词
					var translateLrcInfo = translateLrcInfos[i];
					var splitTranslateLyricsInfos = translateLrcInfo.splitLyricsInfos;
					lineNumHeight += (this.getExtraTextHeight() + this.extraLrcSpaceLineHeight) * splitTranslateLyricsInfos.length;
				} else if (hasTransliteration && this.showLrcType == 1) {
					//显示音译歌词
					var transliterationLrcInfo = transliterationLrcInfos[i];
					var splitTransliterationLyricsInfos = transliterationLrcInfo.splitLyricsInfos;
					lineNumHeight += (this.getExtraTextHeight() + this.extraLrcSpaceLineHeight) * splitTransliterationLyricsInfos.length;
				}
			}
			return lineNumHeight;
		},

		/**
		 * 获取额外文本高度
		 */
		getExtraTextHeight() {
			return this.fontSize;
		},
		/**
		 * 获取文本高度
		 */
		getTextHeight() {
			return this.fontSize;
		},

		/**
		 * @param {Object} from
		 * @param {Object} to
		 */
		scrollViewY(from, to) {
			if (animateObj != null) {
				animateObj.stop();
			}
			animateObj = animate({ from: from, to: to, duration: this.duration, ease: linear, onUpdate: latest => (this.offsetY = latest) });
		},

		/**
		 * 初始化数据
		 * @param {Object} option
		 */
		initData(option) {
			var hash = option.hash;
			if (hash != undefined) {
				this.curHash = hash;
				var duration = option.duration;
				var fileName = decodeURIComponent(option.fileName);
				uni.setNavigationBarTitle({
					title: fileName
				});
				this.loadLrc(fileName, duration, hash);
			} else {
				this.curHash = '';
				uni.setNavigationBarTitle({
					title: this.title
				});
			}
			this.curProgress = 0;
			this.maxProgress = 100;
		},
		/**
		 * 发送操作事件
		 */
		sendAction(msg) {
			// console.log('sendAction>' + JSON.stringify(msg));
			uni.$emit('action', msg);
		},
		/**
		 * item
		 * @param {Object} e
		 */
		onItemClick(e) {
			// console.log(e.index);
			switch (e.index) {
				case 0:
					//上一首
					this.sendAction({
						action: 'pre'
					});

					break;

				case 1:
					//下一首

					this.sendAction({
						action: 'next'
					});

					break;

				case 2:
					//颜色
					break;

				case 3:
					//大小
					break;

				case 4:
					//歌词进度
					break;

				default:
					break;
			}
		},

		/**
		 * 播放/暂停
		 */
		buttonClick() {
			// console.log('buttonClick');
			this.sendAction({
				action: 'playOrPause'
			});
		},
		/**
		 * 加载歌词
		 */
		loadLrc(fileName, duration, hash) {
			console.log('loadLrc->');
			const that = this;
			reqLyricsList(fileName, duration, hash, function(result) {
				//console.log(result)
				if (result.status != 200) {
					return;
				}

				var candidates = result.candidates;
				if (candidates != undefined && candidates.length > 0) {
					var candidate = candidates[0];
					//console.log(candidate);
					var id = candidate.id;
					var accesskey = candidate.accesskey;

					//处理歌词搜索
					that.handleLrc(hash, id, accesskey);
				}
			});
		},

		/**
		 * 加载歌词文件
		 * @param {Object} id
		 * @param {Object} accesskey
		 */
		handleLrc(hash, id, accesskey) {
			const that = this;
			reqLyricsInfo(id, accesskey, function(result) {
				//console.log(result)
				if (result.status != 200) {
					return;
				}

				//测试歌词
				// var testBase64 =
				// 	'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';
				// var lyricsInfo = krcParser(testBase64);

				//获取base64歌词字符串
				var lyricsInfo = krcParser(result.content);

				if (that.curHash == hash) {
					//当前歌词
					that.splitLrc(lyricsInfo);
					that.updateView(that.curProgress);
				}
			});
		}
	}
};
</script>

<style scoped>
@import '@/assets/css/style.css';
.manyLyricsView {
	margin-top: 20rpx;
}

.progress {
	padding: 10rpx;
}

.footer {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: column;
	position: fixed;
	left: 0;
	right: 0;
	/* #ifdef H5 */
	left: var(--window-left);
	right: var(--window-right);
	/* #endif */
	bottom: 0;
}
</style>
