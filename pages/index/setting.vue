<!-- 设置 -->
<template>
	<template-view>
		<template slot="container">
			<uni-list>
				<uni-list-item class="item-height" title="反馈和建议" link to="/pages/setting/feedback"></uni-list-item>
				<uni-list-item class="item-height" title="关于" link to="/pages/setting/about"></uni-list-item>
			</uni-list>
		</template>
	</template-view>
</template>

<script>
export default {
	data() {
		return {};
	},
	onLoad() {},
	methods: {}
};
</script>

<style scoped>
@import '@/assets/css/style.css';
</style>
