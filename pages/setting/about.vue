<template>
	<template-view>
		<template slot="container">
			<div class="horizontal pt45">
				<div><image class="logo" src="../../static/images/logo.svg"></image></div>
			</div>
			<div class="center-text pt10">{{ versionName }}</div>
			<div class="center-text copyright">{{ copyrightText }}</div>
		</template>
	</template-view>
</template>

<script>
import { ConfigInfo } from '@/config/config.js';
export default {
	data() {
		return {
			versionName: ConfigInfo['versionName'],
			copyrightText: ''
		};
	},
	methods: {},
	onLoad() {
		var date = new Date();
		var year = date.getFullYear(); //获取完整的年份(4位)
		var copyrightText = ConfigInfo.copyrightText;
		copyrightText = copyrightText.replace('%s', year);
		this.copyrightText = copyrightText;
	}
};
</script>

<style scoped>
@import '@/assets/css/style.css';

.pt45 {
	padding-top: 45%;
}

.logo {
	width: 250rpx;
	height: 250rpx;
}

.center-text {
	width: 100%;
	text-align: center;
}

.copyright {
	position: fixed;
	font-size: 25rpx;
	bottom: 20rpx;
}
</style>
