<!-- 网络 -->
<template>
	<template-view :viewTag="viewTag" :errorText="errorText" :retry="retry">
		<template slot="container">
			<uni-fab :content="content" horizontal="right" :popMenu="false" @fabClick="fabClick"></uni-fab>
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
export default {
	data() {
		return {
			viewTag: 'loadingView', //successView：成功页面，loadingView：加载中页面，nullView：数据为空页面，errorView：错误页面
			errorText: '网络连接不通，请检查网络',
			callbackNum: 0,
			curCBNum: 0,
			songDatas: [],
			curHash: '',
			curIndex: -1,
			content: [{ iconPath: '/static/images/lrc.png', text: '查看歌词', active: false }]
		};
	},
	onLoad() {
		//执行重试
		this.retry();
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
			var length = result.data.length;
			this.callbackNum = length;
			this.curCBNum = 0;
			for (var i = 0; i < length; i++) {
				var data = result.data[i];
				var hash = data.hash;
				this.handleSongInfo(hash);
			}
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
					that.curCBNum++;
					if (result.status == 0) {
						return;
					}
					var data = {};
					var urls = result.url;
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

					if (that.curCBNum == that.callbackNum) {
						that.handleComplete();
					}
				},
				function(error) {
					that.curCBNum++;
					if (that.curCBNum == that.callbackNum) {
						that.handleComplete();
					}
				}
			);
		},
		/**
		 * 点击悬浮菜单
		 */
		fabClick() {
			if (this.curIndex < 0) {
				uni.showToast({
					title: '请先选择歌曲!',
					duration: 2000
				});
				return;
			}
			var songInfo = this.songDatas[this.curIndex];
			var url = '/pages/lrcView/lrcView?fileName=' + encodeURIComponent(songInfo.fileName) + '&hash=' + songInfo.hash + '&duration=' + songInfo.duration;
			uni.navigateTo({
				url: url
			});
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
			mPlayer.play();
			mPlayer.onPlay(() => {
				//播放
			});

			mPlayer.onPause(() => {
				//暂停
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
			});
		},
		/**
		 * 下一首
		 */
		next() {
			if (mPlayer != null) {
				mPlayer.stop();
			}
			var curIndex = this.curIndex;
			curIndex++;
			if (curIndex >= this.songDatas.length) {
				this.curHash = '';
				uni.showToast({
					title: '已是最后一首!',
					duration: 2000
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
			}
			var curIndex = this.curIndex;
			curIndex--;
			if (curIndex < 0) {
				this.curHash = '';
				uni.showToast({
					title: '已是第一首!',
					duration: 2000
				});
				return;
			}
			var songInfo = this.songDatas[curIndex];
			this.playSong(curIndex, songInfo);
		},
		/**
		 * 处理完成
		 */
		handleComplete() {
			if (this.songDatas.length > 0) {
				this.viewTag = 'successView';
			} else {
				this.viewTag = 'nullView';
			}
		}
	}
};
</script>

<style scoped>
@import '@/assets/css/style.css';
</style>
