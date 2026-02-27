<template>
  <view :class="['page', themeClass]" :key="`trade-detail-${appStore.language}`">
    <!-- 顶部标题栏 -->
    <view class="header-fixed" :style="headerFixedStyle">
      <view class="header-card">
        <view class="header-left" @click="goBack">
          <u-icon name="arrow-left" size="20" color="var(--t-primary)"></u-icon>
        </view>
        <view class="header-title">
          <text class="header-title-text">{{ t('tradeDetail.title') }}</text>
        </view>
        <view class="header-right"></view>
      </view>

      <!-- 搜索栏 -->
      <view class="search-bar" @click.stop>
        <view class="search-input-wrapper">
          <u-icon name="search" size="18" color="var(--c-main)"></u-icon>
          <input
            class="search-input"
            v-model="searchForm.marketName"
            :placeholder="t('tradeDetail.marketNamePlaceholder')"
            placeholder-class="search-input-placeholder"
          />
          <view v-if="searchForm.marketName" class="clear-btn" @click="searchForm.marketName = ''">
            <u-icon name="close" size="14" color="var(--t-light)"></u-icon>
          </view>
        </view>
        <view class="filter-btn" @click="showFilterPanel = !showFilterPanel">
          <u-icon name="list" size="20" :color="hasFilter ? 'var(--c-main)' : 'var(--t-regular)'"></u-icon>
          <text :class="['filter-btn-text', { 'filter-active': hasFilter }]">{{ t('tradeDetail.filter') }}</text>
        </view>
      </view>

      <!-- 筛选面板 -->
      <view v-if="showFilterPanel" class="filter-panel" @click.stop>
        <view class="filter-item">
          <view class="filter-label">
            <u-icon name="tag" size="16" color="var(--c-main)"></u-icon>
            <text>{{ t('tradeDetail.statusSelect') }}</text>
          </view>
          <view class="filter-select-wrapper" @click="showStatusPicker = true">
            <text class="filter-select-text" :class="{ 'filter-select-placeholder': !statusDisplayText }">
              {{ statusDisplayText || t('tradeDetail.statusSelect') }}
            </text>
            <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
          </view>
        </view>

        <view class="filter-actions">
          <view class="reset-btn" @click="handleReset">
            <text>{{ t('tradeDetail.reset') }}</text>
          </view>
          <view class="confirm-btn" @click="handleSearch">
            <u-icon name="search" size="16" color="#FFFFFF"></u-icon>
            <text>{{ t('tradeDetail.search') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 状态选择器 -->
    <u-picker
      :show="showStatusPicker"
      :columns="[statusOptions]"
      key-name="label"
      @confirm="onStatusConfirm"
      @cancel="showStatusPicker = false"
    ></u-picker>

    <!-- 内容区域 -->
    <scroll-view
      scroll-y
      class="scroll-content"
      :style="scrollContentStyle"
    >
      <view class="content">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-wrapper">
          <u-loading-icon mode="circle" size="60" color="var(--c-main)"></u-loading-icon>
          <text class="loading-text">{{ t('common.loading') }}</text>
        </view>

        <!-- 空状态 -->
        <u-empty
          v-else-if="items.length === 0"
          :text="t('tradeDetail.noData')"
          textColor="var(--t-regular)"
          iconColor="var(--t-light)"
          mode="data"
        ></u-empty>

        <!-- 列表 -->
        <view v-else class="list">
          <view
            v-for="item in items"
            :key="item.id"
            class="item-card"
          >
            <!-- 基本信息 -->
            <view class="item-section">
              <view class="item-section-title">{{ t('tradeDetail.basicInfo') }}</view>
              <view class="item-info-grid">
                <view class="item-info-item">
                  <text class="item-info-label">{{ t('tradeDetail.appName') }}</text>
                  <text class="item-info-value">{{ item.appName }}</text>
                </view>
                <view class="item-info-item">
                  <text class="item-info-label">{{ t('tradeDetail.marketName') }}</text>
                  <text class="item-info-value">{{ item.marketName }}</text>
                </view>
                <view class="item-info-item full">
                  <text class="item-info-label">{{ t('tradeDetail.marketHashName') }}</text>
                  <text class="item-info-value">{{ item.marketHashName }}</text>
                </view>
                <view class="item-info-item">
                  <text class="item-info-label">{{ t('tradeDetail.itemId') }}</text>
                  <text class="item-info-value item-info-value-id">{{ item.itemId }}</text>
                </view>
                <view class="item-info-item">
                  <text class="item-info-label">{{ t('tradeDetail.assetId') }}</text>
                  <text class="item-info-value item-info-value-id">{{ item.assetId }}</text>
                </view>
                <view v-if="item.paintSeed !== undefined" class="item-info-item">
                  <text class="item-info-label">{{ t('tradeDetail.paintSeed') }}</text>
                  <text class="item-info-value">{{ item.paintSeed }}</text>
                </view>
                <view v-if="item.paintWear !== undefined" class="item-info-item">
                  <text class="item-info-label">{{ t('tradeDetail.paintWear') }}</text>
                  <text class="item-info-value">{{ item.paintWear }}</text>
                </view>
              </view>
            </view>

            <!-- 价格信息 -->
            <view class="item-section">
              <view class="item-section-title">{{ t('tradeDetail.priceInfo') }}</view>
              <view class="item-price-card">
                <view class="item-price-item">
                  <text class="item-price-label">{{ t('trade.price') }}</text>
                  <text class="item-price-value">{{ item.price }}</text>
                </view>
                <view class="item-price-item">
                  <text class="item-price-label">{{ t('trade.realPrice') }}</text>
                  <text class="item-price-value">{{ item.realPrice }}</text>
                </view>
                <view class="item-price-item">
                  <text class="item-price-label">{{ t('trade.fee') }}</text>
                  <text class="item-price-value">{{ item.fee }}</text>
                </view>
                <view class="item-price-item">
                  <text class="item-price-label">{{ t('trade.score') }}</text>
                  <text class="item-price-value">{{ item.score }}</text>
                </view>
              </view>
            </view>

            <!-- 状态信息 -->
            <view v-if="item.status !== 0 || item.cancelDesc" class="item-section">
              <view class="item-section-title">{{ t('tradeDetail.statusInfo') }}</view>
              <view class="item-info-grid">
                <view class="item-info-item">
                  <text class="item-info-label">{{ t('tradeDetail.status') }}</text>
                  <text class="item-info-value">{{ getItemStatusText(item.status) }}</text>
                </view>
                <view v-if="item.cancelDesc" class="item-info-item full">
                  <text class="item-info-label">{{ t('trade.cancelReason') }}</text>
                  <text class="item-info-value cancel-text">{{ item.cancelDesc }}</text>
                </view>
              </view>
            </view>

            <!-- 错误信息 -->
            <view v-if="item.errors && item.errors.length > 0" class="item-section">
              <view class="item-section-title">{{ t('trade.detail.errorInfo') }}</view>
              <view class="item-error-list">
                <view v-for="(error, index) in item.errors" :key="index" class="item-error-item">
                  <text>{{ error }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="items.length > 0" class="load-more">
          <u-loading-icon v-if="loadMoreLoading" mode="circle" size="24" color="var(--c-main)"></u-loading-icon>
          <text v-else-if="!hasMore" class="no-more">{{ t('trade.noMore') }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onReachBottom, onLoad } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import TradeAPI from '@/api/modules/trade'
import type { TradeItemDetail, Pager } from '@/types/api'

const { t, locale } = useI18n()
const appStore = useAppStore()

// 监听语言变化
watch(() => appStore.language, (newLang: string) => {
  locale.value = newLang
})

const themeClass = computed(() => appStore.theme)
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
const headerFixedStyle = {
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

// 接收传递的参数
const recordId = ref('')
const appId = ref<number>(0)
const marketName = ref('')

const items = ref<TradeItemDetail[]>([])
const pager = ref<Pager>({
  total: 0,
  rp: 10,
  current: 1,
  pages: 0
})
const loading = ref(false)
const loadMoreLoading = ref(false)

// 搜索表单
const searchForm = ref({
  marketName: '',
  status: undefined as number | undefined
})

const showStatusPicker = ref(false)
const showFilterPanel = ref(false)

// 是否有筛选条件
const hasFilter = computed(() => {
  return searchForm.value.marketName !== '' || searchForm.value.status !== undefined
})

// 状态选项
const statusOptions = computed(() => [
  { label: t('tradeDetail.itemStatus.all'), value: undefined },
  { label: t('tradeDetail.itemStatus.normal'), value: 1 },
  { label: t('tradeDetail.itemStatus.cancelled'), value: 0 },
  { label: t('tradeDetail.itemStatus.missing'), value: -1 }
])

// 状态显示文本
const statusDisplayText = computed(() => {
  if (searchForm.value.status === undefined) return ''
  const option = statusOptions.value.find(opt => opt.value === searchForm.value.status)
  return option?.label || ''
})

// 是否有更多数据
const hasMore = computed(() => {
  if (!pager.value) return false
  return pager.value.current < pager.value.pages
})

// 获取物品状态文本
const getItemStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: t('tradeDetail.itemStatus.cancelled'),
    1: t('tradeDetail.itemStatus.normal'),
    '-1': t('tradeDetail.itemStatus.missing')
  }
  return statusMap[status] || status.toString()
}

onLoad((options: any) => {
  if (options.recordId) {
    recordId.value = options.recordId
  }
  if (options.appId) {
    appId.value = Number(options.appId)
  }
  if (options.marketName) {
    marketName.value = decodeURIComponent(options.marketName)
  }
  loadList()
})

const loadList = async (): Promise<void> => {
  const isLoadingMore = pager.value.current > 1

  if (!isLoadingMore) {
    loading.value = true
  }
  try {
    const params: Record<string, any> = {
      page: pager.value.current,
      pageSize: 10,
      recordId: recordId.value,
      appId: appId.value
    }

    // 饰品名称
    if (searchForm.value.marketName) {
      params.marketName = searchForm.value.marketName
    }
    // 状态
    if (searchForm.value.status !== undefined) {
      params.status = searchForm.value.status
    }

    const response = await TradeAPI.getItemList(params)

    // 确保 response 有数据
    if (response && response.list) {
      if (pager.value.current === 1) {
        items.value = response.list
      } else {
        items.value = [...items.value, ...response.list]
      }
      // 只有当 response.pager 存在时才更新 pager，否则使用默认值
      if (response.pager) {
        pager.value = response.pager
      } else if (pager.value.current === 1 && response.list.length === 0) {
        // 空列表且没有pager时，设置默认pager
        pager.value.pages = 0
      }
    }
  } catch (error) {
    console.error('[物品详情] 获取列表失败:', error)
  } finally {
    if (!isLoadingMore) {
      loading.value = false
    }
  }
}

const handleSearch = (): void => {
  if (!pager.value) return
  showFilterPanel.value = false
  pager.value.current = 1
  loadList()
}

const handleReset = (): void => {
  if (!pager.value) return
  showFilterPanel.value = false
  searchForm.value.marketName = ''
  searchForm.value.status = undefined
  pager.value.current = 1
  loadList()
}

const onStatusConfirm = (e: any): void => {
  const selected = e.value[0]
  searchForm.value.status = selected.value
  showStatusPicker.value = false
}

onReachBottom(() => {
  if (!hasMore.value || loadMoreLoading.value || loading.value) return
  loadMoreLoading.value = true
  pager.value.current++
  loadList().finally(() => {
    loadMoreLoading.value = false
  })
})

const goBack = (): void => {
  uni.navigateBack()
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

.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--c-card);
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  height: 88rpx;
}

.header-left,
.header-right {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
}

.header-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--t-primary);
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 0 24rpx 16rpx;
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

/* 筛选面板 */
.filter-panel {
  padding: 0 24rpx 20rpx;
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

.scroll-content {
  flex: 1;
  height: 0;
  margin-top: 240rpx;
}

.content {
  padding: 32rpx 24rpx;
  padding-bottom: 200rpx;
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
  gap: 32rpx;
}

.item-card {
  background-color: var(--c-card);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.item-section {
  margin-bottom: 32rpx;
}

.item-section:last-child {
  margin-bottom: 0;
}

.item-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-main);
  padding: 16rpx 24rpx;
  background-color: rgba(79, 70, 229, 0.06);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.item-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  padding: 0 8rpx;
}

.item-info-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-info-item.full {
  grid-column: 1 / -1;
}

.item-info-label {
  font-size: 24rpx;
  color: var(--t-light);
}

.item-info-value {
  font-size: 28rpx;
  color: var(--t-regular);
  word-break: break-all;
}

.item-info-value-id {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 24rpx;
}

.item-price-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 0 8rpx;
}

.item-price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: rgba(79, 70, 229, 0.06);
  border-radius: 12rpx;
}

.item-price-label {
  font-size: 28rpx;
  color: var(--t-regular);
}

.item-price-value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-main);
}

.cancel-text {
  color: #EF4444;
}

.item-error-list {
  padding: 0 8rpx;
}

.item-error-item {
  padding: 16rpx 20rpx;
  background-color: rgba(239, 68, 68, 0.08);
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.item-error-item text {
  font-size: 26rpx;
  color: #EF4444;
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
