<template>
	<view>
		<slot v-if="viewTag == 'successView'" name="container"></slot>

		<slot v-else-if="viewTag == 'loadingView'" name="loadingView">
			<div class="horizontal vertical">
				<div class="mt10" v-if="loadText != undefined && loadText != ''">{{ loadText }}</div>
			</div>
		</slot>

		<slot v-else-if="viewTag == 'nullView'" name="nullView">
			<div class="horizontal vertical">
				<div class="mt10" v-if="nullText != undefined && nullText != ''">{{ nullText }}</div>
			</div>
		</slot>

		<slot v-else-if="viewTag == 'errorView'" name="errorView">
			<div class="horizontal pt60">
				<div>
					<div class="mt10" v-if="errorText != undefined && errorText != ''">{{ errorText }}</div>
					<div class="horizontal"><button class="mt20" type="default" size="mini" plain="true" @click="retry">重试</button></div>
				</div>
			</div>
		</slot>
	</view>
</template>

<script>
export default {
	name: 'template-view',
	data() {
		return {};
	},
	props: {
		/**
		 * 重试
		 */
		retry: {
			type: Function
		},
		/**
		 * 视图标签
		 */
		viewTag: {
			type: String,
			default: 'successView' //successView：成功页面，loadingView：加载中页面，nullView：数据为空页面，errorView：错误页面
		},
		/**
		 * 加载中文案
		 */ loadText: {
			type: String,
			default: '加载中...'
		},

		/**
		 * 数据为空文案
		 */
		nullText: {
			type: String,
			default: '暂无记录'
		},

		/**
		 * 错误文案
		 */
		errorText: {
			type: String,
			default: '网络连接不通，请检查网络'
		}
	}
};
</script>

<style scoped>
@import '@/assets/css/style.css';
.pt60 {
	padding-top: 60%;
}
</style>
