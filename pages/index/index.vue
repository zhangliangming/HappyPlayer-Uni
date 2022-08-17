<!-- 网络 -->
<template>
	<template-view :viewTag="viewTag" :errorText="errorText" :retry="retry">
		<template slot="container">
			<uni-fab horizontal="right" :popMenu="false" @fabClick="fabClick"></uni-fab>
			<uni-list>
				<uni-list-item
					v-for="(item, index) in songDatas"
					v-bind:key="index"
					class="item-height"
					:title="(curHash == item.hash ? '' : index + 1 + '.') + item.fileName"
					link
					:show-extra-icon="curHash == item.hash"
					:extra-icon="{ color: '#0288d1', size: '20', type: 'headphones' }"
					@click="playSong(index, item)"
				></uni-list-item>
			</uni-list>
		</template>
	</template-view>
</template>

<script>
import { reqLastSongList, reqSongInfo } from '@/http/api.js';
import md5 from 'js-md5';
/**
 * 播放器
 */
var mPlayer = null;
var mTimer = null;

export default {
	data() {
		return {
			viewTag: 'loadingView', //successView：成功页面，loadingView：加载中页面，nullView：数据为空页面，errorView：错误页面
			errorText: '网络连接不通，请检查网络',
			songDatas: [],
			curHash: '',
			curIndex: -1
		};
	},
	onLoad() {
		//执行重试
		this.retry();

		//监听操作
		const that = this;
		uni.$on('action', function(result) {
			switch (result.action) {
				case 'pre':
					that.pre();
					break;

				case 'next':
					that.next();
					break;

				case 'playOrPause':
					that.playOrPause();
					break;
			}
		});
	},
	methods: {
		/**
		 * 重试
		 */
		retry() {
			const that = this;
			this.songDatas = [];
			this.viewTag = 'loadingView';
			//获取歌曲列表
			reqLastSongList(
				function(result) {
					that.handleLastSongList(result);
				},
				function(error) {
					that.viewTag = 'errorView';
					that.errorText = error.errMsg;
				}
			);
		},
		/**
		 * 处理歌曲列表
		 * @param {Object} result
		 */
		handleLastSongList(result) {
			var length = result.data.info.length;
			for (var i = 0; i < length; i++) {
				var data = result.data.info[i];
				var hash = data.hash;
				this.handleSongInfo(hash);
			}
			this.viewTag = 'successView';
		},

		/**
		 * 获取歌曲详情
		 * @param {Object} hash
		 */
		handleSongInfo(hash) {
			const that = this;
			var key = md5(hash + 'kgcloudv2');
			reqSongInfo(
				key,
				hash,
				function(result) {
					if (result.status == 0) {
						return;
					}
					var data = {};
					var urls = result.url;
					if (urls == undefined) {
						return;
					}
					var flag = false;
					for (var i = 0; i < urls.length; i++) {
						var url = urls[i];
						if (url.indexOf('android') != -1) {
							data.url = url;
							flag = true;
							break;
						}
					}
					if (flag) {
						data.hash = hash;
						data.fileName = result.fileName;
						data.duration = parseInt(result.timeLength) * 1000;
						that.songDatas.push(data);
					}
				},
				function(error) {}
			);
		},
		/**
		 * 点击悬浮菜单
		 */
		fabClick() {
			var url = '/pages/lrcView/lrcView';
			if (this.curIndex > -1) {
				var songInfo = this.songDatas[this.curIndex];
				url += '?fileName=' + encodeURIComponent(songInfo.fileName) + '&hash=' + songInfo.hash + '&duration=' + songInfo.duration;
			}

			uni.navigateTo({
				url: url
			});
		},

		/**
		 * 播放或者暂停歌曲
		 */
		playOrPause() {
			if (mPlayer != null) {
				if (mPlayer.paused) {
					//暂停
					mPlayer.play();
				} else {
					mPlayer.pause();
				}
			}
		},
		/**
		 * 播放歌曲
		 * @param {Object} songInfo
		 */
		playSong(index, songInfo) {
			const that = this;
			var hash = songInfo.hash;
			//同一首歌曲，则暂停或者继续播放
			if (this.curHash == hash && mPlayer != null) {
				if (mPlayer.paused) {
					//暂停
					mPlayer.play();
				} else {
					mPlayer.pause();
				}
				return;
			}

			//不是同一首，先停止上一首，再开始播放下一首
			var url = songInfo.url;
			if (mPlayer != null) {
				mPlayer.stop();
			}

			//播放歌曲
			this.curHash = hash;
			this.curIndex = index;

			mPlayer = uni.createInnerAudioContext();
			mPlayer.src = url;
			mPlayer.onPlay(() => {
				//播放
				//发送
				this.sendEvent({
					action: 'play'
				});

				if (mTimer != null) {
					clearTimeout(mTimer);
				}
				mTimer = setTimeout(this.updateProgress, 0);
			});

			mPlayer.onPause(() => {
				//暂停
				//发送
				this.sendEvent({
					action: 'pause'
				});
			});

			mPlayer.onEnded(() => {
				//播放结束
				that.next();
			});

			mPlayer.onError(res => {
				//异常
				uni.showModal({
					content: '播放异常',
					success: function(res) {}
				});

				//发送初始化
				this.sendEvent({
					action: 'error'
				});
			});

			mPlayer.onCanplay(() => {
				//console.log('onCanplay');
				mPlayer.play();
			});

			//发送初始化
			this.sendEvent({
				action: 'init',
				hash: hash,
				duration: songInfo.duration,
				fileName: songInfo.fileName
			});
		},

		/**
		 * 更新进度
		 */
		updateProgress() {
			if (mPlayer != null && !mPlayer.paused) {
				//发送
				this.sendEvent({
					action: 'progress',
					progress: parseInt(mPlayer.currentTime * 1000 + ''),
					duration: parseInt(mPlayer.duration * 1000 + '')
				});

				mTimer = setTimeout(this.updateProgress, 100);
			}
		},
		/**
		 * 发送播放事件
		 */
		sendEvent(msg) {
			// console.log('sendEvent->' + JSON.stringify(msg));
			uni.$emit('event', msg);
		},
		/**
		 * 下一首
		 */
		next() {
			if (mPlayer != null) {
				mPlayer.stop();
				mPlayer = null;
			}
			var curIndex = this.curIndex;
			curIndex++;
			if (curIndex >= this.songDatas.length) {
				this.curHash = '';
				uni.showToast({
					title: '已是最后一首!',
					duration: 2000
				});

				//发送
				this.sendEvent({
					action: 'null'
				});

				return;
			}
			var songInfo = this.songDatas[curIndex];
			this.playSong(curIndex, songInfo);
		},

		/**
		 * 上一首
		 */
		pre() {
			if (mPlayer != null) {
				mPlayer.stop();
				mPlayer = null;
			}
			var curIndex = this.curIndex;
			curIndex--;
			if (curIndex < 0) {
				this.curHash = '';
				uni.showToast({
					title: '已是第一首!',
					duration: 2000
				});

				//发送
				this.sendEvent({
					action: 'null'
				});
				return;
			}
			var songInfo = this.songDatas[curIndex];
			this.playSong(curIndex, songInfo);
		}
	}
};
</script>

<style scoped>
@import '@/assets/css/style.css';
</style>
