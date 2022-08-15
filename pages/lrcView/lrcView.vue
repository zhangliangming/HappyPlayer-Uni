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
import pako from 'pako';
export default {
	data() {
		return {
			//歌词
			lyricsInfo: null,
			viewHeight: 0,
			viewWidth: 0,
			curProgress: 0,
			maxProgress: 100,
			title: '乐乐音乐-就是任性',
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
		this.initData(option);

		//监听操作
		const that = this;
		uni.$on('event', function(result) {
			switch (result.action) {
				case 'init':
					that.lyricsInfo = null;
					that.initData(result);
					break;

				case 'play':
					break;

				case 'progress':
					if (that.maxProgress == 100) {
						that.maxProgress = result.duration;
					}
					that.curProgress = result.progress;
					break;

				case 'pause':
					break;

				default:
					that.lyricsInfo = null;
					that.initData({});
					break;
			}
		});
	},
	mounted() {
		const { windowWidth, windowHeight } = uni.getSystemInfoSync();
		this.viewWidth = (windowWidth * 4) / 5;
		this.viewHeight = windowHeight - 120;
	},
	methods: {
		initData(option) {
			var hash = option.hash;
			if (hash != undefined) {
				var duration = option.duration;
				var fileName = decodeURIComponent(option.fileName);
				uni.setNavigationBarTitle({
					title: fileName
				});
				this.loadLrc(fileName, duration, hash);
			} else {
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

				// var testBase64 =
				// 	'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';
				// that.parseKrc(hash, testBase64);

				//获取base64歌词字符串
				var lrcInfo = that.parseKrc(hash, result.content);
			});
		},

		/**
		 * 解析krc歌词
		 * @param {Object} contentBase64
		 */
		parseKrc(hash, contentBase64) {
			const buffer = uni.base64ToArrayBuffer(contentBase64);
			// var defArrayData = new Uint8Array(buffer);
			// console.log(defArrayData);
			//skip跳过4位
			var slice = buffer.slice(4);
			var zip_byte = new Uint8Array(slice);

			//{'@', 'G', 'a', 'w', '^', '2', 't', 'G','Q', '6', '1', '-', 'Î', 'Ò', 'n', 'i'}
			var key = [64, 71, 97, 119, 94, 50, 116, 71, 81, 54, 49, 45, 206, 210, 110, 105];
			// console.log(zip_byte);
			var j = zip_byte.length;
			for (var k = 0; k < j; k++) {
				var l = k % 16;
				var tmp67_65 = k;
				var tmp67_64 = zip_byte;
				tmp67_64[tmp67_65] = tmp67_64[tmp67_65] ^ key[l];
			}
			//console.log(zip_byte);
			var lrcContent = pako.ungzip(zip_byte, { to: 'string' }); //解压成字符串
			// console.log(lrcContent);
			var lrcInfo = {
				hash: hash,
				defOffset: 0,
				lyricsType: 1, //0是lrc，1是动感
				offset: 0,
				lyricsFileExt: 'krc',
				lyricsInfos: [], //默认歌词
				translateLrcInfos: [], //翻译歌词
				transliterationLrcInfos: [] //音译歌词
			};

			var lyricsInfos = [];
			var translateLrcInfos = [];
			var transliterationLrcInfos = [];

			var lrcContents = lrcContent.split(/\n/);
			for (var i = 0; i < lrcContents.length; i++) {
				var lrcText = lrcContents[i];
				lrcText = lrcText.replace(/\s+$/g, ''); //js去掉两头空格
				if (lrcText == '') {
					continue;
				}
				if (lrcText.indexOf('[offset:') == 0) {
					//时间补偿值
					var offset = lrcText.substring('[offset:'.length, lrcText.lastIndexOf(']'));
					//console.log(offset);
					lrcInfo.defOffset = offset;
					lrcInfo.offset = offset;
				} else if (lrcText.indexOf('[language:') == 0) {
					//翻译歌词和音译歌词
					var language = lrcText.substring('[language:'.length, lrcText.lastIndexOf(']'));
					//console.log(language);
					const buffer = uni.base64ToArrayBuffer(language);
					var languageText = String.fromCharCode.apply(null, new Uint8Array(buffer));
					// console.log(languageText);
					var languageArray = JSON.parse(languageText).content;
					for (var j = 0; j < languageArray.length; j++) {
						var languageObj = languageArray[j];
						var type = languageObj.type;
						var lyricContent = languageObj.lyricContent;
						if (type == 1) {
							//翻译歌词
							this.parseTranslateLrcText(lyricContent, translateLrcInfos);
							//console.log(translateLrcInfos);
						} else if (type == 0) {
							//音译歌词
							this.parseTransliterationLrcText(lyricContent, transliterationLrcInfos);
							// console.log(transliterationLrcInfos);
						}
					}
				} else {
					var lineInfo = this.parseLrcText(lrcText);
					//console.log(lineInfo);
					if (lineInfo != null) {
						lyricsInfos.push(lineInfo);
					}
				}
			}

			lrcInfo.lyricsInfos = lyricsInfos;
			lrcInfo.translateLrcInfos = translateLrcInfos;
			lrcInfo.transliterationLrcInfos = transliterationLrcInfos;
			return lrcInfo;
		},

		/**
		 * 解析音译歌词
		 * @param {Object} lyricContent
		 * @param {Object} transliterationLrcInfos
		 */
		parseTransliterationLrcText(lyricContent, transliterationLrcInfos) {
			for (var i = 0; i < lyricContent.length; i++) {
				var lrcObj = lyricContent[i];
				// console.log(lrcObj);
				var lineInfo = {
					startTime: 0,
					endTime: 0,
					lyricsContent: '', //行歌词
					lyricsWords: [], //字歌词
					wordsDisInterval: [] //字时间
				};

				var lyricsWords = [];
				var lyricsContent = '';
				for (var j = 0; j < lrcObj.length; j++) {
					var temp = lrcObj[j];
					temp = temp.replace(/\s+$/g, ''); //js去掉两头空格
					if (j == lrcObj.length - 1) {
						lyricsWords.push(temp);
						lyricsContent += temp;
					} else {
						lyricsWords.push(temp + ' ');
						lyricsContent += temp + ' ';
					}
				}
				lineInfo.lyricsContent = lyricsContent;
				lineInfo.lyricsWords = lyricsWords;
				transliterationLrcInfos.push(lineInfo);
			}
		},

		/**
		 * 解析翻译歌词
		 * @param {Object} lyricContent
		 */
		parseTranslateLrcText(lyricContent, translateLrcInfos) {
			for (var i = 0; i < lyricContent.length; i++) {
				var lrcObj = lyricContent[i];
				//console.log(lrcObj);
				var lineInfo = {
					startTime: 0,
					endTime: 0,
					lyricsContent: '', //行歌词
					lyricsWords: [], //字歌词
					wordsDisInterval: [] //字时间
				};
				var lrcText = lrcObj[0];
				lrcText = lrcText.replace(/\s+$/g, ''); //js去掉两头空格
				lineInfo.lyricsContent = lrcText;
				var lyricsWords = this.getLyricsWords(lrcText);
				// console.log(lyricsWords);
				lineInfo.lyricsWords = lyricsWords;
				translateLrcInfos.push(lineInfo);
			}
		},

		/**
		 * 通过歌词分割字
		 * @param {Object} lyricsText
		 */
		getLyricsWords(lyricsText) {
			var lyricsWords = [];
			if (lyricsText == '') {
				lyricsWords.push('');
				return lyricsWords;
			}
			var stack = [];
			var whitespaceFlag = false;
			for (var i = 0; i < lyricsText.length; i++) {
				var c = lyricsText[i];
				//1.如果是【文字】或者【空格】则直接当一个【字】
				//2.英文或者数字，则需要把后面紧连着的英文或者数字串合起来，当成一个【字】
				//3.除上述1和2的情况，都当一个【字】处理
				if (this.isWord(c) || this.isWhitespace(c)) {
					var isWhitespace = this.isWhitespace(c);
					//文字
					if (!isWhitespace) {
						stack.push(c);
					} else {
						//空白字符，需要结合上一个字封装
						whitespaceFlag = true;
						var temp = stack.pop();
						stack.push(temp + c);
					}
				} else {
					if (stack.length == 0 || whitespaceFlag) {
						//当前为空，或者上一个字为空白字符
						whitespaceFlag = false;
						stack.push(c);
					} else {
						var preValue = stack[stack.length - 1];
						if (preValue.length == 1 && this.isWord(preValue[0])) {
							//上一个字符是字
							stack.push(c);
						} else {
							//其它字符，则需要结合上一个字封装
							var temp = stack.pop();
							stack.push(temp + c);
						}
					}
				}
			}
			return stack;
		},

		/**判断是不是空格
		 * @param {Object} text
		 */
		isWhitespace(text) {
			var temp = text.replace(/\s+/g, ''); //js去掉所有空格
			return temp == '';
		},

		/**
		 * 是否是单词
		 * @param {Object} temp
		 */
		isWord(temp) {
			var cnReg = /[^\u4e00-\u9fa5]/; //中文
			var jpReg = /[^\u0800-\u4e00]/; //日文

			var isChinese = !cnReg.test(temp);
			var isJapanese = !jpReg.test(temp);
			var isKoera = (temp > 0x3130 && temp < 0x318f) || (temp >= 0xac00 && temp <= 0xd7a3);
			return isChinese || isJapanese || isKoera;
		},

		/**
		 * 解析歌词
		 */
		parseLrcText(lrcText) {
			//其他
			var regTime = /\[\d+,\d+\]/;
			if (lrcText.search(regTime) != -1) {
				var lineInfo = {
					startTime: 0,
					endTime: 0,
					lyricsContent: '', //行歌词
					lyricsWords: [], //字歌词
					wordsDisInterval: [] //字时间
				};

				// console.log(lrcText);
				var timeTexts = lrcText.match(regTime);
				// console.log(timeTexts);
				if (timeTexts.length > 0) {
					//获取开始和结束时间标签
					var timeText = timeTexts[0];
					// console.log(timeText);
					var temp = timeText.substring(timeText.indexOf('[') + 1, timeText.lastIndexOf(']'));
					var timeArray = temp.split(',');
					// console.log(timeArray);
					//添加开始时间，结束时间
					lineInfo.startTime = parseInt(timeArray[0]);
					lineInfo.endTime = parseInt(timeArray[1]);

					//解析其他标签
					lrcText = lrcText.substring(timeText.length);
					// console.log(lrcText);
					var regLrc = '\\<\\d+,\\d+,\\d+\\>';
					if (lrcText.search(new RegExp(regLrc)) != -1) {
						var lyricsContent = lrcText.replace(new RegExp(regLrc, 'g'), '');
						//console.log(lyricsContent);
						lineInfo.lyricsContent = lyricsContent;

						//获取字歌词，先去掉第一个，免得分隔时，产生空串
						temp = lrcText.replace(new RegExp(regLrc), '').split(new RegExp(regLrc));
						//console.log(temp);
						lineInfo.lyricsWords = temp;

						temp = lrcText.match(new RegExp(regLrc, 'g'));
						// console.log(temp);
						if (temp.length != lineInfo.lyricsWords.length) {
							//字歌词与字时间对不上
							return null;
						}

						//获取字时间
						var wordsDisInterval = [];
						for (var j = 0; j < temp.length; j++) {
							var timeTemp = temp[j];
							timeTemp = timeTemp.substring(timeTemp.indexOf('<') + 1, timeTemp.lastIndexOf('>'));
							timeTemp = timeTemp.split(',');
							wordsDisInterval[j] = parseInt(timeTemp[1]);
						}
						//console.log(wordsDisInterval);
						lineInfo.wordsDisInterval = wordsDisInterval;
						return lineInfo;
					}
				}
			}
			return null;
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
