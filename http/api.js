/**
 * 获取歌曲列表
 */
export const reqLastSongList = function(success, error) {
	uni.request({
		url: 'http://mobilecdnbj.kugou.com/api/v3/rank/newsong',
		method: 'GET',
		data: {
			json: true,
			version: 9108,
			plat: 0,
			with_cover: 1,
			pagesize: 100,
			type: 3,
			page: 1
		},
		header: {
			'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
		},
		success: (res) => {
			success && success(res.data);
		},
		fail: (res) => {
			error && error(res);
		},
	});
}
/**
 * 获取歌曲详情
 * @param {Object} key 
 * @param {Object} hash
 * @param {Object} success
 * @param {Object} error
 */
export const reqSongInfo = function(key, hash, success, error) {
	uni.request({
		url: 'http://trackercdn.kugou.com/i/v2/',
		method: 'GET',
		data: {
			appid: '1005',
			pid: '2',
			cmd: '25',
			version: '7472',
			behavior: 'play',
			key: key,
			hash: hash
		},
		header: {},
		success: (res) => {
			success && success(res.data);
		},
		fail: (res) => {
			error && error(res);
		},
	});
}

/**
 * 获取歌词文件
 * @param {Object} keyword
 * @param {Object} duration
 * @param {Object} hash
 * @param {Object} success
 * @param {Object} error
 */
export const reqLyricsList = function(keyword, duration, hash, success, error) {
	uni.request({
		url: 'http://lyrics.kugou.com/search',
		method: 'GET',
		data: {
			ver: '1',
			man: 'yes',
			client: 'pc',
			keyword: keyword,
			duration: duration,
			hash: hash
		},
		header: {},
		success: (res) => {
			success && success(res.data);
		},
		fail: (res) => {
			error && error(res);
		},
	});
}

/**
 * 获取歌词文件
 * @param {Object} id
 * @param {Object} accesskey
 * @param {Object} success
 * @param {Object} error
 */
export const reqLyricsInfo = function(id, accesskey, success, error) {
	uni.request({
		url: 'http://lyrics.kugou.com/download',
		method: 'GET',
		data: {
			ver: '1',
			client: 'pc',
			id: id,
			accesskey: accesskey,
			charset: 'utf8',
			fmt: 'krc'
		},
		header: {},
		success: (res) => {
			success && success(res.data);
		},
		fail: (res) => {
			error && error(res);
		},
	});
}
