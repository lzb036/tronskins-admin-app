<template>
  <view class="redirect-page">
    <u-loading-icon mode="circle" size="56" color="#4F46E5"></u-loading-icon>
    <text class="redirect-text">Loading...</text>
  </view>
</template>

<script setup lang="ts">
import { onReady } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { redirectToHomeTab, redirectToLogin } from '@/utils/navigation'

const userStore = useUserStore()

onReady(() => {
  if (userStore.isLoggedIn()) {
    redirectToHomeTab()
    return
  }

  redirectToLogin()
})
</script>

<style scoped>
.redirect-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  background: #F4F6F8;
}

.redirect-text {
  color: #6B7280;
  font-size: 28rpx;
}
</style>
