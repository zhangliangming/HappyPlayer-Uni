/**
 * 获取所唱歌词行数(不可用于分割行)
 *
 * @param lyricsType     歌词类型
 * @param lyricsInfos    歌词
 * @param curPlayingTime 当前播放时间
 * @param playOffset     时间补偿值
 * @return
 */
export const getLineNumber = function(lyricsType, lyricsInfos, curPlayingTime, playOffset) {
	var index = -1;
	//添加歌词增量
	var playingTime = curPlayingTime + playOffset;
	if (lyricsType == 0) {
		//lrc歌词只有开始时间
		for (var i = 0; i < lyricsInfos.length; i++) {
			var temp = lyricsInfos[i];
			var startTime = temp.startTime;
			if (playingTime <= startTime) {
				break;
			}
			index = i;
		}
	} else if (lyricsType == 1) {
		//动感歌词，有开始时间和结束时间
		index = getDynamicLrcLineNum(lyricsInfos, curPlayingTime, playOffset);
	}
	return index;
}

/**
 * 获取动感歌词所唱歌行数(可用于分割行)
 *
 * @param lyricsInfos    歌词
 * @param curPlayingTime 当前播放时间
 * @param playOffset     时间补偿值
 * @return
 */

export const getDynamicLrcLineNum = function(lyricsInfos, curPlayingTime, playOffset) {
	var index = -1;
	//添加歌词增量
	var playingTime = curPlayingTime + playOffset;
	for (var i = 0; i < lyricsInfos.length; i++) {
		var temp = lyricsInfos[i];
		var startTime = temp.startTime;
		var endTime = temp.endTime;
		index = i;
		if ((playingTime < startTime) || (startTime <= playingTime && playingTime <= endTime)) {
			break;
		}
	}
	return index;
}

/**
 * 获取动感歌词行的字宽度
 *
 * @param ctx          画笔
 * @param lyricsInfos    歌词
 * @param lyricsLineNum  歌词行
 * @param curPlayingTime 当前播放时间
 * @param playOffset     时间补偿值
 */
export const getDynamicLrcWordHLWidth = function(ctx, lyricsInfos, lyricsLineNum, curPlayingTime, playOffset) {
	var result = 0;
	if (lyricsLineNum >= 0 && lyricsLineNum < lyricsInfos.size()) {
		var temp = lyricsInfos[lyricsLineNum];
		var lyricsContent = (temp.lyricsContent).replace(/\s+$/g, ''); //js去掉空格
		//空行歌词
		if (lyricsContent == '') {
			return result;
		}
		//添加歌词增量
		var playingTime = curPlayingTime + playOffset;
		//获取字和字时间
		var startTime = temp.startTime;
		var endTime = temp.endTime;
		//字开始
		if (startTime <= playingTime && playingTime <= endTime) {
			var elapseTime = startTime;
			var tempWords = '';
			var wordsDisInterval = temp.wordsDisInterval;
			var lyricsWords = temp.lyricsWords;

			//非空判断及长度不一致判断
			if (wordsDisInterval == undefined || wordsDisInterval == null || lyricsWords == undefined ||
				lyricsWords == null || wordsDisInterval.length != lyricsWords.length) {
				return result;
			}

			for (var i = 0; i < wordsDisInterval.length; i++) {
				var interval = wordsDisInterval[i];
				elapseTime += interval;
				if (playingTime <= elapseTime) {
					//计算之前所有字的长度
					var beforeWordWidth = parseInt(ctx.measureText(tempWords).width);

					// 当前歌词字
					var curWord = lyricsWords[i].replace(/\s+$/g, ''); //js去掉空格
					var wordWidth = parseInt(ctx.measureText(curWord).width);

					//计算平均速度
					var avg = wordWidth / interval;
					var lenTime = interval - (elapseTime - playingTime);
					var hlWordWidth = avg * lenTime;

					return parseInt((beforeWordWidth + hlWordWidth));
				}
				tempWords += lyricsWords[i];
			}

			if (elapseTime < playingTime) {
				//防止有些歌词的结束时间大于每个字时间间隔和
				result = parseInt(ctx.measureText(lyricsContent).width);
			}
		} else if (endTime < playingTime) {
			//防止有些歌词的结束时间大于每个字时间间隔和
			result = parseInt(ctx.measureText(lyricsContent).width);
		}
	}
	return result;
}

/**
 * 分割歌词
 * @param {Object} lrcInfo 歌词
 * @param {Object} ctx 画布
 * @param {Object} fontSize 字体大小
 * @param {Object} textMaxWidth 最大宽度
 */
export const splitLyrics = function(lrcInfo, ctx, fontSize, textMaxWidth) {
	ctx.font = 'normal normal ' + fontSize + 'px cursive'
	var lyricsType = lrcInfo.lyricsType; //0是lrc，1是动感
	var lyricsInfos = lrcInfo.lyricsInfos; //默认歌词
	var translateLrcInfos = lrcInfo.translateLrcInfos; //翻译歌词
	var transliterationLrcInfos = lrcInfo.transliterationLrcInfos; //音译歌词
	for (var i = 0; i < lyricsInfos.length; i++) {
		var lyricsLineInfo = lyricsInfos[i];
		if (lyricsType == 1) {

			//音译歌词，默认使用动感歌词分割
			if (transliterationLrcInfos != undefined && transliterationLrcInfos != null && transliterationLrcInfos
				.length > 0) {
				var transliterationLrcInfo = transliterationLrcInfos[i];
				splitTransliterationLrc(lyricsLineInfo, transliterationLrcInfo, ctx, textMaxWidth);
			}

			//翻译歌词，默认分割成动感歌词
			if (translateLrcInfos != undefined && translateLrcInfos != null && translateLrcInfos.length > 0) {
				var translateLrcInfo = translateLrcInfos[i];
				splitTranslateDynamicLrc(lyricsLineInfo, translateLrcInfo, ctx, textMaxWidth);
			}

			//动感歌词
			var splitLyricsInfos = splitLineDynamicLyrics(lyricsLineInfo, ctx, textMaxWidth);
			lyricsLineInfo.splitLyricsInfos = splitLyricsInfos;

		} else {
			//普通歌词

			//翻译歌词，默认分割成动感歌词
			if (translateLrcInfos != undefined && translateLrcInfos != null && translateLrcInfos.length > 0) {
				var translateLrcInfo = translateLrcInfos[i];
				splitLineLyrics(translateLrcInfo, ctx, textMaxWidth);
			}

			//使用lrc歌词分割
			splitLineLyrics(lyricsLineInfo, ctx, textMaxWidth);
		}
	}
	// console.log(lrcInfo);
}

/**
 * 分割行歌词
 *
 * @param lyricsLineInfo 歌词
 * @param ctx          画笔
 * @param textMaxWidth   最大长度
 */
function splitLineLyrics(lyricsLineInfo, ctx, textMaxWidth) {
	var splitLyricsInfos = [];
	var lyricsContent = lyricsLineInfo.lyricsContent;
	var lineWidth = parseInt(ctx.measureText(lyricsContent).width);
	if (lineWidth > textMaxWidth) {
		//分词器分词
		var lyricsWords = getLyricsWords(lyricsContent);
		var wordWidth = 0;
		var temp = '';
		for (var i = 0; i < lyricsWords.length; i++) {
			var curWord = lyricsWords[i];
			var curWordWidth = parseInt(ctx.measureText(curWord).width);
			if (wordWidth + curWordWidth > textMaxWidth) {

				//添加分割后的歌词
				splitLyricsInfos.push({
					startTime: 0,
					endTime: 0,
					lyricsContent: temp, //行歌词
					lyricsWords: [], //字歌词
					wordsDisInterval: [] //字时间
				});

				wordWidth = 0;
				temp = '';
			}
			wordWidth += curWordWidth;
			temp += curWord;
		}
		//最后一行歌词
		//添加分割后的歌词
		if (temp.length > 0) {

			splitLyricsInfos.push({
				startTime: 0,
				endTime: 0,
				lyricsContent: temp, //行歌词
				lyricsWords: [], //字歌词
				wordsDisInterval: [] //字时间
			});
		}
	} else {

		splitLyricsInfos.push({
			startTime: 0,
			endTime: 0,
			lyricsContent: lyricsContent, //行歌词
			lyricsWords: [], //字歌词
			wordsDisInterval: [] //字时间
		});
	}
	lyricsLineInfo.splitLyricsInfos = splitLyricsInfos;

	// console.log(lyricsLineInfo);
}

/**
 * 分割翻译歌词为动感歌词
 *
 * @param lyricsLineInfo   动感歌词
 * @param translateLrcInfo 翻译歌词
 * @param ctx            画笔
 * @param textMaxWidth     最大长度
 */
function splitTranslateDynamicLrc(lyricsLineInfo, translateLrcInfo, ctx, textMaxWidth) {
	var splitTranslateLrcInfos = [];

	//补充翻译歌词数据
	fixTranslateLrc(lyricsLineInfo, translateLrcInfo);

	var lyricsContent = translateLrcInfo.lyricsContent;
	var lineWidth = parseInt(ctx.measureText(lyricsContent).width);
	var lyricsWords = translateLrcInfo.lyricsWords;
	var wordsDisInterval = translateLrcInfo.wordsDisInterval;

	if (lineWidth > textMaxWidth) {
		//处理超出行歌词
		splitTranslateLrcInfos = splitLineDynamicLyrics(translateLrcInfo, ctx, textMaxWidth);
	} else {

		splitTranslateLrcInfos.push({
			startTime: lyricsLineInfo.startTime,
			endTime: lyricsLineInfo.endTime,
			lyricsContent: lyricsContent, //行歌词
			lyricsWords: lyricsWords, //字歌词
			wordsDisInterval: wordsDisInterval //字时间
		});
	}
	translateLrcInfo.splitLyricsInfos = splitTranslateLrcInfos;

	// console.log(translateLrcInfo);
}
/**
 * 翻译歌词补充数据
 * @param {Object} lyricsLineInfo
 * @param {Object} translateLrcInfo
 */
function fixTranslateLrc(lyricsLineInfo, translateLrcInfo) {
	var lyricsContent = translateLrcInfo.lyricsContent;
	//分词器分词
	var lyricsWords = getLyricsWords(lyricsContent);

	//获取歌词行的时间，防止行开始时间和结束时间的时间间隔和字不上，这里使用每个字的间隔时间来计算
	var tempWordsDisInterval = lyricsLineInfo.wordsDisInterval;
	var elapseTime = 0;

	if (tempWordsDisInterval != null && tempWordsDisInterval.length > 0) {
		for (var i = 0; i < tempWordsDisInterval.length; i++) {
			elapseTime += tempWordsDisInterval[i];
		}
	}

	//翻译歌词，歌词字时间平均分
	var wordsDisInterval = [];
	if (lyricsWords != null && lyricsWords.length > 0) {
		var length = lyricsWords.length;
		var ave = elapseTime / length;
		for (var j = 0; j < length; j++) {
			wordsDisInterval.push(parseInt(ave));
		}
	}

	//设置开始时间，结束时间和字时间
	translateLrcInfo.startTime = lyricsLineInfo.startTime;
	translateLrcInfo.endTime = lyricsLineInfo.endTime;
	translateLrcInfo.lyricsWords = lyricsWords;
	translateLrcInfo.wordsDisInterval = wordsDisInterval;
}


/**
 * 通过歌词分割字
 * @param {Object} lyricsText
 */
function getLyricsWords(lyricsText) {
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
		if (isWord(c) || isWhitespace(c)) {
			var isSpace = isWhitespace(c);
			//文字
			if (!isSpace) {
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
				if (preValue.length == 1 && isWord(preValue[0])) {
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
}


/**判断是不是空格
 * @param {Object} text
 */
function isWhitespace(text) {
	var temp = text.replace(/\s+/g, ''); //js去掉所有空格
	return temp == '';
}

/**
 * 是否是单词
 * @param {Object} temp
 */
function isWord(temp) {
	var cnReg = /[^\u4e00-\u9fa5]/; //中文
	var jpReg = /[^\u0800-\u4e00]/; //日文

	var isChinese = !cnReg.test(temp);
	var isJapanese = !jpReg.test(temp);
	var isKoera = (temp > 0x3130 && temp < 0x318f) || (temp >= 0xac00 && temp <= 0xd7a3);
	return isChinese || isJapanese || isKoera;
}

/**
 * 分割音译歌词
 * @param {Object} lyricsLineInfo
 * @param {Object} transliterationLrcInfo
 * @param {Object} ctx
 * @param {Object} textMaxWidth
 */
function splitTransliterationLrc(lyricsLineInfo, transliterationLrcInfo, ctx, textMaxWidth) {
	var splitTransliterationLrcInfos = [];
	//补充数据
	fixTransliterationLrc(lyricsLineInfo, transliterationLrcInfo);
	var lyricsContent = transliterationLrcInfo.lyricsContent;
	var lineWidth = parseInt(ctx.measureText(lyricsContent).width);
	//分词器分词
	var lyricsWords = transliterationLrcInfo.lyricsWords;
	//用默认歌词的字时间
	var wordsDisInterval = lyricsLineInfo.wordsDisInterval;

	if (lineWidth > textMaxWidth) {
		//处理超出行歌词
		splitTransliterationLrcInfos = splitLineDynamicLyrics(transliterationLrcInfo, ctx, textMaxWidth);
	} else {

		splitTransliterationLrcInfos.push({
			startTime: lyricsLineInfo.startTime,
			endTime: lyricsLineInfo.endTime,
			lyricsContent: lyricsContent, //行歌词
			lyricsWords: lyricsWords, //字歌词
			wordsDisInterval: wordsDisInterval //字时间
		});
	}
	transliterationLrcInfo.splitLyricsInfos = splitTransliterationLrcInfos;
	//console.log(transliterationLrcInfo);
}

/**
 * 音译歌词补充数据
 * @param {Object} lyricsLineInfo
 * @param {Object} transliterationLrcInfo
 */
function fixTransliterationLrc(lyricsLineInfo, transliterationLrcInfo) {
	//用默认歌词的字时间
	var wordsDisInterval = lyricsLineInfo.wordsDisInterval;
	//设置开始时间，结束时间和字时间
	transliterationLrcInfo.startTime = lyricsLineInfo.startTime;
	transliterationLrcInfo.endTime = lyricsLineInfo.endTime;
	transliterationLrcInfo.wordsDisInterval = wordsDisInterval;
}

/**
 * 分割动感歌词
 * @param {Object} lyricsLineInfo
 * @param {Object} ctx
 * @param {Object} textMaxWidth
 */
function splitLineDynamicLyrics(lyricsLineInfo, ctx, textMaxWidth) {
	var splitLyricsInfos = [];
	var lyricsContent = lyricsLineInfo.lyricsContent;
	var width = parseInt(ctx.measureText(lyricsContent).width);
	if (width > textMaxWidth) {
		var lyricsWordsList = [];
		var wordsDisIntervalList = [];
		var wordWidth = 0;
		var startTime = lyricsLineInfo.startTime;
		var endTime = startTime; //结束时间重新开始计算

		var lyricsWords = lyricsLineInfo.lyricsWords;
		var wordsDisInterval = lyricsLineInfo.wordsDisInterval;
		var curWord = lyricsWords[i];
		var curWordDisInterval = wordsDisInterval[i];
		var curWordWidth = parseInt(ctx.measureText(curWord).width);
		var temp = '';
		for (var i = 0; i < lyricsWords.length; i++) {
			var curWord = lyricsWords[i];

			var curWordDisInterval = wordsDisInterval[i];
			var curWordWidth = parseInt(ctx.measureText(curWord).width);
			if ((wordWidth + curWordWidth) > textMaxWidth) {

				splitLyricsInfos.push({
					startTime: startTime,
					endTime: endTime,
					lyricsContent: temp, //行歌词
					lyricsWords: lyricsWordsList, //字歌词
					wordsDisInterval: wordsDisIntervalList //字时间
				});

				//清空数据
				lyricsWordsList = new Array();
				wordsDisIntervalList = new Array();
				startTime = endTime;
				wordWidth = 0;
				temp = '';
			}

			wordWidth += curWordWidth;
			temp += curWord;
			lyricsWordsList.push(curWord);
			endTime += curWordDisInterval;
			wordsDisIntervalList.push(curWordDisInterval);
		}

		//最后一行歌词
		//添加分割后的歌词
		if (temp.length > 0) {

			splitLyricsInfos.push({
				startTime: startTime,
				endTime: endTime,
				lyricsContent: temp, //行歌词
				lyricsWords: lyricsWordsList, //字歌词
				wordsDisInterval: wordsDisIntervalList //字时间
			});

		}
	} else {
		splitLyricsInfos.push({
			startTime: lyricsLineInfo.startTime,
			endTime: lyricsLineInfo.endTime,
			lyricsContent: lyricsLineInfo.lyricsContent, //行歌词
			lyricsWords: lyricsLineInfo.lyricsWords, //字歌词
			wordsDisInterval: lyricsLineInfo.wordsDisInterval //字时间
		});
	}
	return splitLyricsInfos;
}
