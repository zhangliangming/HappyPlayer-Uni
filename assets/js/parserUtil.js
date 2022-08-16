import pako from 'pako';
/**
 * krc解析器
 */
export const krcParser = function(contentBase64) {
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
	var lrcContent = pako.ungzip(zip_byte, {
		to: 'string'
	}); //解压成字符串
	// console.log(lrcContent);
	var lrcInfo = {
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
		lrcText = lrcText.replace(/\s+$/g, ''); //js去掉空格
		if (lrcText == '') {
			continue;
		}
		if (lrcText.indexOf('[offset:') == 0) {
			//时间补偿值
			var offset = lrcText.substring('[offset:'.length, lrcText.lastIndexOf(']'));
			//console.log(offset);
			lrcInfo.defOffset = parseInt(offset);
			lrcInfo.offset = parseInt(offset);
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
					parseTranslateLrcText(lyricContent, translateLrcInfos);
					//console.log(translateLrcInfos);
				} else if (type == 0) {
					//音译歌词
					parseTransliterationLrcText(lyricContent, transliterationLrcInfos);
					// console.log(transliterationLrcInfos);
				}
			}
		} else {
			var lineInfo = parseLrcText(lrcText);
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
}

/**
 * 解析音译歌词
 * @param {Object} lyricContent
 * @param {Object} transliterationLrcInfos
 */
function parseTransliterationLrcText(lyricContent, transliterationLrcInfos) {
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
}

/**
 * 解析翻译歌词
 * @param {Object} lyricContent
 */
function parseTranslateLrcText(lyricContent, translateLrcInfos) {
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
		translateLrcInfos.push(lineInfo);
	}
}

/**
 * 解析歌词
 */
function parseLrcText(lrcText) {
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
			var startTime = parseInt(timeArray[0]);
			lineInfo.startTime = startTime;
			lineInfo.endTime = startTime + parseInt(timeArray[1]);

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
