<template>
  <view :class="['page', themeClass]" @click="handlePageClick" :key="`withdraw-page-${appStore.language}`">
    <!-- 查询区域 - 固定在顶部 -->
    <view class="search-fixed" @click.stop :style="searchFixedStyle">
      <view class="search-card">
        <view class="search-bar">
          <view class="search-input-wrapper">
            <u-icon name="search" size="18" color="var(--c-main)"></u-icon>
            <input
              class="search-input"
              v-model="searchForm.walletAddress"
              :placeholder="t('withdraw.walletAddressPlaceholder')"
              placeholder-class="search-input-placeholder"
            />
            <view v-if="searchForm.walletAddress" class="clear-btn" @click="searchForm.walletAddress = ''">
              <u-icon name="close" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>
          <view class="filter-btn" @click="showFilterPanel = !showFilterPanel">
            <u-icon name="list" size="20" :color="hasFilter ? 'var(--c-main)' : 'var(--t-regular)'"></u-icon>
            <text :class="['filter-btn-text', { 'filter-active': hasFilter }]">{{ t('withdraw.search') }}</text>
          </view>
          <view class="refresh-btn" @click="handleRefresh">
            <u-icon name="reload" size="20" color="var(--t-regular)"></u-icon>
            <text class="refresh-btn-text">{{ t('withdraw.refresh') }}</text>
          </view>
        </view>

        <!-- 筛选面板 -->
        <view v-if="showFilterPanel" class="filter-panel" @click.stop>
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="list" size="16" color="var(--c-main)"></u-icon>
              <text>{{ t('withdraw.statusSelect') }}</text>
            </view>
            <view class="filter-select-wrapper" @click="showStatusPicker = true">
              <text class="filter-select-text" :class="{ 'filter-select-placeholder': !statusDisplayText }">
                {{ statusDisplayText || t('withdraw.statusSelect') }}
              </text>
              <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>

          <view class="filter-actions">
            <view class="reset-btn" @click="handleReset">
              <text>{{ t('withdraw.reset') }}</text>
            </view>
            <view class="confirm-btn" @click="handleSearch">
              <u-icon name="search" size="16" color="#FFFFFF"></u-icon>
              <text>{{ t('withdraw.search') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 可滚动内容区域 -->
    <scroll-view
      scroll-y
      class="scroll-content"
      :style="scrollContentStyle"
      :scroll-top="scrollTop"
      @scroll="onScroll"
    >
      <view class="content">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-wrapper">
          <u-loading-icon mode="circle" size="60" color="var(--c-main)"></u-loading-icon>
          <text class="loading-text">{{ t('common.loading') }}</text>
        </view>

        <!-- 空状态 -->
        <u-empty
          v-else-if="records.length === 0"
          :text="t('withdraw.noData')"
          textColor="var(--t-regular)"
          iconColor="var(--t-light)"
          mode="data"
        ></u-empty>

        <!-- 列表 -->
        <view v-else class="list">
          <view
            v-for="item in records"
            :key="item.id"
            class="record-card"
            @click="handleCardClick(item)"
          >
              <view class="card-header">
                <view class="user-info">
                  <text class="create-time">{{ formatTime(item.createTime) }}</text>
                  <view class="user-row">
                    <text class="username">{{ item.userName }}</text>
                    <view class="amount-row">
                      <text class="amount-label">{{ t('withdraw.receiveAmount') }}</text>
                      <text class="amount-value">{{ item.receiveAmount }}</text>
                    </view>
                  </view>
                </view>
                <view :class="['status-badge', getStatusClass(item.status)]">
                  {{ getStatusLabel(item.status) }}
                </view>
              </view>
            </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="records.length > 0" class="load-more">
        <u-loading-icon v-if="loadMoreLoading" mode="circle" size="24" color="var(--c-main)"></u-loading-icon>
        <text v-else-if="!hasMore" class="no-more">{{ t('withdraw.noMore') }}</text>
      </view>
      </view>
    </scroll-view>

    <!-- 状态选择器 -->
    <u-picker
      :show="showStatusPicker"
      :columns="[statusOptions]"
      key-name="label"
      @confirm="onStatusConfirm"
      @cancel="showStatusPicker = false"
    ></u-picker>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { redirectToLogin } from '@/utils/navigation'
import WithdrawAPI from '@/api/modules/withdraw'
import type { WithdrawRecord, Pager } from '@/types/api'

const { t, locale } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()

// 监听语言变化
watch(() => appStore.language, (newLang: string) => {
  locale.value = newLang
})

const themeClass = computed(() => appStore.theme)
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
const searchFixedStyle = {
  paddingTop: `calc(16rpx + ${statusBarHeight}px)`
}

// 计算滚动区域高度
const scrollHeight = computed(() => {
  const systemInfo = uni.getSystemInfoSync()
  return `${systemInfo.windowHeight}px`
})
const scrollContentStyle = computed(() => ({
  height: `${uni.getSystemInfoSync().windowHeight}px`,
  marginTop: `calc(120rpx + ${statusBarHeight}px)`
}))

// 搜索面板高度（动态计算）
const searchPanelHeight = ref(0)

const records = ref<WithdrawRecord[]>([])
const pager = ref<Pager>({
  total: 0,
  rp: 10,
  current: 1,
  pages: 0
})
const loading = ref(false)

// 查询状态
const searchForm = ref({
  walletAddress: '',
  status: undefined as number | undefined
})

const showStatusPicker = ref(false)
const showFilterPanel = ref(false)
const loadMoreLoading = ref(false)
const scrollTop = ref(0)
const lastScrollTop = ref(0)

// 是否有更多数据
const hasMore = computed(() => {
  return pager.value.current < pager.value.pages
})

// 是否有筛选条件
const hasFilter = computed(() => {
  return searchForm.value.walletAddress !== '' || searchForm.value.status !== undefined
})

// 状态选项
const statusOptions = computed(() => [
  { label: t('withdrawStatus.all'), value: undefined },
  { label: t('withdrawStatus.-3'), value: -3 },
  { label: t('withdrawStatus.-2'), value: -2 },
  { label: t('withdrawStatus.-1'), value: -1 },
  { label: t('withdrawStatus.0'), value: 0 },
  { label: t('withdrawStatus.1'), value: 1 },
  { label: t('withdrawStatus.2'), value: 2 },
  { label: t('withdrawStatus.3'), value: 3 }
])

// 状态显示文本
const statusDisplayText = computed(() => {
  if (searchForm.value.status === undefined) return ''
  const option = statusOptions.value.find(opt => opt.value === searchForm.value.status)
  return option?.label || ''
})

// 查询面板样式
const searchInputStyle = computed(() => ({
  backgroundColor: 'var(--c-bg)',
  borderRadius: '12rpx',
  padding: '16rpx 20rpx',
  fontSize: '28rpx'
}))

const primaryButtonStyle = computed(() => ({
  flex: 1,
  height: '80rpx',
  borderRadius: '12rpx',
  fontSize: '28rpx',
  fontWeight: '500',
  background: 'linear-gradient(135deg, var(--c-main) 0%, rgba(99, 102, 241, 0.8) 100%)',
  borderWidth: '0'
}))

const secondaryButtonStyle = computed(() => ({
  flex: 1,
  height: '80rpx',
  borderRadius: '12rpx',
  fontSize: '28rpx',
  fontWeight: '500',
  borderWidth: '0',
  backgroundColor: 'var(--c-bg)',
  color: 'var(--t-regular)'
}))

onMounted(() => {
  if (!userStore.isLoggedIn()) {
    redirectToLogin()
    return
  }
  loadList()
})

const loadList = async (): Promise<void> => {
  const shouldRestoreScroll = pager.value.current > 1
  const isLoadingMore = pager.value.current > 1

  // 只有首次加载或搜索重置时才显示全屏loading
  if (!isLoadingMore) {
    loading.value = true
  }
  try {
    // 构建查询参数，只传有值的字段
    const params: Record<string, any> = {
      page: pager.value.current,
      pageSize: 10
    }
    // 只查询status的话只传status
    if (searchForm.value.status !== undefined) {
      params.status = searchForm.value.status
    }
    // 只查询account的话只传account
    if (searchForm.value.walletAddress) {
      params.account = searchForm.value.walletAddress
    }

    const response = await WithdrawAPI.getList(params)

    if (pager.value.current === 1) {
      // 首次加载或搜索重置，替换数据
      records.value = response.list
    } else {
      // 加载更多，追加数据
      records.value = [...records.value, ...response.list]
    }
    pager.value = response.pager

    if (shouldRestoreScroll) {
      await nextTick()
      scrollTop.value = lastScrollTop.value
    }
  } catch (error) {
    console.error('[提现] 获取列表失败:', error)
  } finally {
    // 只有首次加载或搜索重置时才关闭全屏loading
    if (!isLoadingMore) {
      loading.value = false
    }
  }
}

const onScroll = (e: any): void => {
  lastScrollTop.value = e.detail.scrollTop
}

onReachBottom(() => {
  onScrollLower()
})

// 上拉加载更多
const onScrollLower = (): void => {
  if (!hasMore.value || loadMoreLoading.value || loading.value) return
  loadMoreLoading.value = true
  pager.value.current++
  loadList().finally(() => {
    loadMoreLoading.value = false
  })
}

const handleSearch = (): void => {
  showFilterPanel.value = false
  pager.value.current = 1
  loadList()
}

const handleReset = (): void => {
  showFilterPanel.value = false
  searchForm.value.walletAddress = ''
  searchForm.value.status = undefined
  pager.value.current = 1
  loadList()
}

const handleRefresh = (): void => {
  pager.value.current = 1
  loadList()
}

// 点击页面其他区域收起筛选面板
const handlePageClick = (): void => {
  // 状态选择弹窗打开时，不收起筛选面板
  if (showStatusPicker.value) return
  if (showFilterPanel.value) {
    showFilterPanel.value = false
  }
}

const onStatusConfirm = (e: any): void => {
  const selected = e.value[0]
  searchForm.value.status = selected.value
  showStatusPicker.value = false
}

const handleCardClick = (item: WithdrawRecord): void => {
  uni.navigateTo({
    url: `/pages/withdraw-detail?id=${item.id}`
  })
}

const getStatusClass = (status: number): string => {
  const statusMap: Record<number, string> = {
    '-3': 'rejected',
    '-2': 'failed',
    '-1': 'cancelled',
    '0': 'initiated',
    '1': 'pending',
    '2': 'confirming',
    '3': 'completed'
  }
  return statusMap[status] || 'default'
}

const getStatusLabel = (status: number): string => {
  return t(`withdrawStatus.${status}`)
}

const formatTime = (timestamp: string): string => {
  if (!timestamp) return '-'
  const date = new Date(Number(timestamp) * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const openLink = (url: string): void => {
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifndef H5
  plus.runtime.openURL(url)
  // #endif
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
  --c-card: #FFFFFF;
  --c-main: #4F46E5;
  --t-primary: #111827;
  --t-regular: #4B5563;
  --t-light: #9CA3AF;
  --c-border: #F3F4F6;
  --c-divider: rgba(0, 0, 0, 0.06);
}

.page.dark {
  --c-bg: #0B0F19;
  --c-card: #111827;
  --c-main: #6366F1;
  --t-primary: #F9FAFB;
  --t-regular: #9CA3AF;
  --t-light: #6B7280;
  --c-border: #1F2937;
  --c-divider: rgba(255, 255, 255, 0.06);
}

.search-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, var(--c-bg) 0%, var(--c-bg) 80%, transparent 100%);
  padding: 16rpx 24rpx 24rpx;
  z-index: 100;
}

.scroll-content {
  flex: 1;
  height: 0;
}

.content {
  padding: 40rpx 24rpx 200rpx 24rpx;
}

/* 搜索卡片 */
.search-card {
  background: var(--c-card);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(79, 70, 229, 0.12);
  overflow: hidden;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  gap: 16rpx;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background-color: var(--c-bg);
  border-radius: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--t-primary);
}

.search-input-placeholder {
  color: var(--t-light);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  background-color: var(--t-light);
  border-radius: 50%;
}

/* 筛选按钮 */
.filter-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  background-color: var(--c-bg);
  border-radius: 16rpx;
  transition: all 0.2s;
}

.filter-btn:active {
  transform: scale(0.95);
}

.filter-btn-text {
  font-size: 28rpx;
  color: var(--t-regular);
  font-weight: 500;
}

.filter-active {
  color: var(--c-main);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  background-color: var(--c-bg);
  border-radius: 16rpx;
  transition: all 0.2s;
}

.refresh-btn:active {
  transform: scale(0.95);
}

.refresh-btn-text {
  font-size: 28rpx;
  color: var(--t-regular);
  font-weight: 500;
}

/* 筛选面板 */
.filter-panel {
  padding: 0 20rpx 20rpx;
  border-top: 1rpx solid var(--c-divider);
  margin-top: 4rpx;
}

.filter-item {
  padding: 20rpx 0;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: var(--t-regular);
  font-weight: 500;
}

.filter-select-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background-color: var(--c-bg);
  border-radius: 12rpx;
  transition: all 0.2s;
}

.filter-select-wrapper:active {
  background-color: rgba(79, 70, 229, 0.08);
}

.filter-select-text {
  font-size: 28rpx;
  color: var(--t-primary);
}

.filter-select-placeholder {
  color: var(--t-light);
}

.filter-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.reset-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 72rpx;
  background-color: var(--c-bg);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--t-regular);
  font-weight: 500;
  transition: all 0.2s;
}

.reset-btn:active {
  transform: scale(0.98);
  background-color: var(--c-border);
}

.confirm-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 72rpx;
  background: linear-gradient(135deg, var(--c-main) 0%, rgba(99, 102, 241, 0.9) 100%);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
  transition: all 0.2s;
}

.confirm-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400rpx;
  gap: 24rpx;
}

.loading-text {
  font-size: 28rpx;
  color: var(--t-regular);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.record-card {
  background-color: var(--c-card);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-card:active {
  transform: scale(0.99);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid var(--c-divider);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex: 1;
}

.user-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16rpx;
  min-width: 0;
}

.create-time {
  font-size: 24rpx;
  color: var(--t-light);
  font-weight: 400;
}

.username {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--t-primary);
  line-height: 1.3;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-badge.completed {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-badge.confirming {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.status-badge.pending {
  background-color: rgba(251, 191, 36, 0.1);
  color: #FBBF24;
}

.status-badge.initiated {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9CA3AF;
}

.status-badge.cancelled,
.status-badge.failed,
.status-badge.rejected {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.amount-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-left: auto;
  margin-right: 60rpx;
  white-space: nowrap;
}

.amount-label {
  font-size: 24rpx;
  color: var(--t-light);
}

.amount-value {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--t-regular);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 26rpx;
  color: var(--t-light);
}

.detail-value {
  font-size: 26rpx;
  color: var(--t-regular);
  text-align: right;
  max-width: 420rpx;
  word-break: break-all;
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
  gap: 12rpx;
}

.no-more {
  font-size: 26rpx;
  color: var(--t-light);
}
</style>
