/**
 * 获取歌曲列表
 */
export const reqLastSongList = function(success, error) {
	uni.request({
		url: 'http://m.kugou.com',
		method: 'GET',
		data: {
			json: true
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
