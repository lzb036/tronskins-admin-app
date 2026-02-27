<template>
  <view :class="['page', themeClass]">
    <!-- 内容区域 -->
    <view class="page-content">
      <view v-if="currentTab === 0" class="tab-content">
        <TradePage />
      </view>
      <view v-else-if="currentTab === 1" class="tab-content">
        <WithdrawPage />
      </view>
      <view v-else-if="currentTab === 2" class="tab-content">
        <TicketPage />
      </view>
      <view v-else-if="currentTab === 3" class="tab-content">
        <ProfilePage />
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: currentTab === index }]"
        @click="switchTab(index)"
      >
        <view class="tab-icon">
          <text class="icon-text">{{ tab.icon }}</text>
        </view>
        <text class="tab-label">{{ t(tab.labelKey) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import WithdrawPage from '@/pages/tabs/withdraw.vue'
import TradePage from '@/pages/tabs/trade.vue'
import TicketPage from '@/pages/tabs/ticket.vue'
import ProfilePage from '@/pages/tabs/profile.vue'

interface TabItem {
  icon: string
  labelKey: string
  url: string
}

const { t } = useI18n()
const appStore = useAppStore()

const currentTab = ref(0)

const tabs: TabItem[] = [
  { icon: '📊', labelKey: 'tabs.trade', url: '/pages/tabs/trade' },
  { icon: '💰', labelKey: 'tabs.withdraw', url: '/pages/tabs/withdraw' },
  { icon: '🎫', labelKey: 'tabs.ticket', url: '/pages/tabs/ticket' },
  { icon: '👤', labelKey: 'tabs.profile', url: '/pages/tabs/profile' }
]

const themeClass = computed(() => appStore.theme)

const switchTab = (index: number): void => {
  currentTab.value = index
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--c-bg);
  display: flex;
  flex-direction: column;
}

.page.light {
  --c-bg: #F4F6F8;
  --c-tab-bar: #FFFFFF;
  --c-tab-active: rgba(79, 70, 229, 0.1);
  --t-tab: #9CA3AF;
  --t-tab-active: #4F46E5;
  --c-border: #F3F4F6;
}

.page.dark {
  --c-bg: #0B0F19;
  --c-tab-bar: #111827;
  --c-tab-active: rgba(99, 102, 241, 0.15);
  --t-tab: #6B7280;
  --t-tab-active: #6366F1;
  --c-border: #1F2937;
}

.page-content {
  flex: 1;
  overflow: hidden;
}

.tab-content {
  height: 100%;
  overflow-y: auto;
}

/* 底部导航栏 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: var(--c-tab-bar);
  border-top: 1rpx solid var(--c-border);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0 24rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tab-item.active {
  background-color: var(--c-tab-active);
}

.tab-icon {
  margin-bottom: 8rpx;
}

.icon-text {
  font-size: 44rpx;
  line-height: 1;
}

.tab-label {
  font-size: 22rpx;
  color: var(--t-tab);
  transition: color 0.3s ease;
}

.tab-item.active .tab-label {
  color: var(--t-tab-active);
  font-weight: 600;
}
</style>
