<template>
  <view :class="['page', themeClass]" :key="`trade-record-detail-${appStore.language}`">
    <!-- 顶部标题栏 -->
    <view class="header-fixed" :style="headerFixedStyle">
      <view class="header-card">
        <view class="header-left" @click="goBack">
          <u-icon name="arrow-left" size="20" color="var(--t-primary)"></u-icon>
        </view>
        <view class="header-title">
          <text class="header-title-text">{{ t('tradeRecordDetail.title') }}</text>
        </view>
        <view class="header-right"></view>
      </view>
    </view>

    <!-- Tab栏 - 固定定位 -->
    <view v-if="record" class="tab-bar-fixed" :style="tabBarFixedStyle">
      <view class="tab-bar">
        <view
          :class="['tab-item', { active: currentTab === 0 }]"
          @click="currentTab = 0"
        >
          <text>{{ t('tradeRecordDetail.tabTrade') }}</text>
        </view>
        <view
          :class="['tab-item', { active: currentTab === 1 }]"
          @click="currentTab = 1"
        >
          <text>{{ t('tradeRecordDetail.tabItem') }}</text>
        </view>
        <view
          :class="['tab-item', { active: currentTab === 2 }]"
          @click="currentTab = 2"
        >
          <text>{{ t('tradeRecordDetail.tabAction') }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 - 固定定位，仅Tab 2显示 -->
    <view v-if="record && currentTab === 1" class="search-bar-fixed" :style="searchBarFixedStyle">
      <view class="search-bar" @click.stop>
        <view class="search-input-wrapper">
          <u-icon name="search" size="18" color="var(--c-main)"></u-icon>
          <input
            class="search-input"
            v-model="itemSearchForm.marketName"
            :placeholder="t('tradeDetail.marketNamePlaceholder')"
            placeholder-class="search-input-placeholder"
          />
          <view v-if="itemSearchForm.marketName" class="clear-btn" @click="itemSearchForm.marketName = ''">
            <u-icon name="close" size="14" color="var(--t-light)"></u-icon>
          </view>
        </view>
        <view class="filter-btn" @click="showItemFilterPanel = !showItemFilterPanel">
          <u-icon name="list" size="20" :color="hasItemFilter ? 'var(--c-main)' : 'var(--t-regular)'"></u-icon>
          <text :class="['filter-btn-text', { 'filter-active': hasItemFilter }]">{{ t('tradeDetail.filter') }}</text>
        </view>
      </view>

      <!-- 筛选面板 -->
      <view v-if="showItemFilterPanel" class="filter-panel-fixed" @click.stop>
        <view class="filter-item">
          <view class="filter-label">
            <u-icon name="tag" size="16" color="var(--c-main)"></u-icon>
            <text>{{ t('tradeDetail.statusSelect') }}</text>
          </view>
          <view class="filter-select-wrapper" @click="showItemStatusPicker = true">
            <text class="filter-select-text" :class="{ 'filter-select-placeholder': !itemStatusDisplayText }">
              {{ itemStatusDisplayText || t('tradeDetail.statusSelect') }}
            </text>
            <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
          </view>
        </view>

        <view class="filter-actions">
          <view class="reset-btn" @click="handleItemReset">
            <text>{{ t('tradeDetail.reset') }}</text>
          </view>
          <view class="confirm-btn" @click="handleItemSearch">
            <u-icon name="search" size="16" color="#FFFFFF"></u-icon>
            <text>{{ t('tradeDetail.search') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view
      scroll-y
      :class="['scroll-content', { 'with-search': currentTab === 1 }]"
      :style="scrollContentStyle"
    >
      <view class="content">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-wrapper">
          <u-loading-icon mode="circle" size="60" color="var(--c-main)"></u-loading-icon>
          <text class="loading-text">{{ t('common.loading') }}</text>
        </view>

        <template v-else-if="record">
          <!-- Tab 1: 交易详情 -->
          <view v-if="currentTab === 0" class="detail-card">
            <!-- 价格信息 -->
            <view class="detail-section">
              <view class="detail-section-title">{{ t('trade.detail.priceInfo') }}</view>
              <view class="detail-price-card">
                <view class="detail-price-item">
                  <text class="detail-price-label">{{ t('trade.price') }}</text>
                  <text class="detail-price-value">{{ record.price }}</text>
                </view>
                <view class="detail-price-item">
                  <text class="detail-price-label">{{ t('trade.realPrice') }}</text>
                  <text class="detail-price-value">{{ record.realPrice }}</text>
                </view>
                <view class="detail-price-item">
                  <text class="detail-price-label">{{ t('trade.fee') }}</text>
                  <text class="detail-price-value">{{ record.fee }}</text>
                </view>
              </view>
            </view>

            <!-- 交易信息 -->
            <view class="detail-section">
              <view class="detail-section-title">{{ t('trade.detail.tradeInfo') }}</view>
              <view class="detail-info-grid">
                <view class="detail-info-item">
                  <text class="detail-info-label">{{ t('trade.detail.status') }}</text>
                  <view :class="['detail-info-status', getStatusClass(record.status)]">
                    {{ getStatusText(record.status) }}
                  </view>
                </view>
                <view class="detail-info-item">
                  <text class="detail-info-label">{{ t('trade.detail.nums') }}</text>
                  <text class="detail-info-value">x{{ record.nums }}</text>
                </view>
                <view class="detail-info-item">
                  <text class="detail-info-label">{{ t('trade.detail.score') }}</text>
                  <text class="detail-info-value">{{ record.score }}</text>
                </view>
                <view class="detail-info-item">
                  <text class="detail-info-label">{{ t('trade.detail.flag') }}</text>
                  <text class="detail-info-value">{{ record.flag ? 'true' : 'false' }}</text>
                </view>
              </view>
            </view>

            <!-- 用户信息 -->
            <view class="detail-section">
              <view class="detail-section-title">{{ t('trade.detail.userInfo') }}</view>
              <view class="detail-info-grid">
                <view class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.buyer') }}</text>
                  <text class="detail-info-value">{{ record.buyerName }}</text>
                </view>
                <view class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.detail.buyerId') }}</text>
                  <text class="detail-info-value detail-info-value-id">{{ record.buyer }}</text>
                </view>
                <view class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.seller') }}</text>
                  <text class="detail-info-value">{{ record.sellerName }}</text>
                </view>
                <view class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.detail.sellerId') }}</text>
                  <text class="detail-info-value detail-info-value-id">{{ record.seller }}</text>
                </view>
                <view class="detail-info-item">
                  <text class="detail-info-label">{{ t('trade.detail.sellerSelfOwned') }}</text>
                  <text class="detail-info-value">{{ record.sellerSelfOwned ? 'true' : 'false' }}</text>
                </view>
              </view>
            </view>

            <!-- 时间信息 -->
            <view class="detail-section">
              <view class="detail-section-title">{{ t('trade.detail.timeInfo') }}</view>
              <view class="detail-info-grid">
                <view class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.createTime') }}</text>
                  <text class="detail-info-value">{{ formatTime(record.createTime) }}</text>
                </view>
                <view v-if="record.sendTime" class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.sendTime') }}</text>
                  <text class="detail-info-value">{{ formatTime(record.sendTime) }}</text>
                </view>
                <view v-if="record.receiveTime" class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.receiveTime') }}</text>
                  <text class="detail-info-value">{{ formatTime(record.receiveTime) }}</text>
                </view>
                <view v-if="record.endTime" class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.endTime') }}</text>
                  <text class="detail-info-value">{{ formatTime(record.endTime) }}</text>
                </view>
                <view v-if="record.protectionTime && getCountdown(record.protectionTime)" class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.settlementCountdown') }}</text>
                  <text class="detail-info-value countdown-text">{{ getCountdown(record.protectionTime) }}</text>
                </view>
              </view>
            </view>

            <!-- 取消信息 -->
            <view v-if="record.status === -1 || record.status === -2" class="detail-section">
              <view class="detail-section-title">{{ t('trade.detail.cancelInfo') }}</view>
              <view class="detail-info-grid">
                <view v-if="record.cancelReason" class="detail-info-item">
                  <text class="detail-info-label">{{ t('trade.detail.cancelReason') }}</text>
                  <text class="detail-info-value">{{ record.cancelReason }}</text>
                </view>
                <view v-if="record.cancelDesc" class="detail-info-item full">
                  <text class="detail-info-label">{{ t('trade.cancelReason') }}</text>
                  <text class="detail-info-value cancel-text">{{ record.cancelDesc }}</text>
                </view>
              </view>
            </view>

            <!-- 错误信息 -->
            <view v-if="record.errors && record.errors.length > 0" class="detail-section">
              <view class="detail-section-title">{{ t('trade.detail.errorInfo') }}</view>
              <view class="detail-error-list">
                <view v-for="(error, index) in record.errors" :key="index" class="detail-error-item">
                  <text>{{ error }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- Tab 2: 饰品详情 -->
          <view v-if="currentTab === 1" class="item-tab-content">
            <!-- 加载状态 -->
            <view v-if="itemsLoading" class="loading-wrapper">
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

            <!-- 物品列表 -->
            <view v-else class="item-list">
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

          <!-- Tab 3: 操作 -->
          <view v-if="currentTab === 2" class="action-tab-content">
            <view v-if="getActions(record.status).length === 0" class="no-actions">
              <text class="no-actions-text">{{ t('trade.noData') }}</text>
            </view>
            <view v-else class="action-list">
              <view
                v-for="action in getActions(record.status)"
                :key="action.key"
                :class="['action-list-item', action.type]"
                @click="handleAction(action.key)"
              >
                <view class="action-icon">
                  <u-icon :name="getActionIcon(action.key)" size="20" color="#FFFFFF"></u-icon>
                </view>
                <text class="action-label">{{ action.label }}</text>
              </view>
            </view>
          </view>
        </template>
      </view>
    </scroll-view>

    <!-- 结算恢复弹窗 -->
    <u-modal
      :show="restoreModal.show"
      :title="t('trade.settlementRestoreTitle')"
      :content="restoreModal.content"
      :show-cancel-button="true"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      confirm-color="#F59E0B"
      @confirm="onRestoreConfirm"
      @cancel="restoreModal.show = false"
    ></u-modal>

    <!-- 结算同步弹窗 -->
    <u-modal
      :show="syncModal.show"
      :title="t('trade.settlementSyncTitle')"
      :content="syncModal.content"
      :show-cancel-button="true"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      confirm-color="#6366F1"
      @confirm="onSyncConfirm"
      @cancel="syncModal.show = false"
    ></u-modal>

    <!-- 物品状态选择器 -->
    <u-picker
      :show="showItemStatusPicker"
      :columns="[itemStatusOptions]"
      key-name="label"
      @confirm="onItemStatusConfirm"
      @cancel="showItemStatusPicker = false"
    ></u-picker>

    <!-- 取消交易弹窗 -->
    <u-modal
      :show="cancelModal.show"
      :title="t('trade.cancelTradeTitle')"
      :content="cancelModal.content"
      :show-cancel-button="true"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      confirm-color="#EF4444"
      @confirm="onCancelConfirm"
      @cancel="cancelModal.show = false"
    ></u-modal>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import TradeAPI from '@/api/modules/trade'
import type { TradeRecord, TradeItemDetail, Pager } from '@/types/api'

const { t, locale } = useI18n()
const appStore = useAppStore()

// 监听语言变化
watch(() => appStore.language, (newLang: string) => {
  locale.value = newLang
})

// 倒计时更新触发器
const countdownTrigger = ref(0)
let countdownTimer: number | null = null

// 启动倒计时定时器
const startCountdownTimer = (): void => {
  countdownTimer = setInterval(() => {
    countdownTrigger.value++
  }, 1000) as unknown as number
}

// 清除定时器
const clearCountdownTimer = (): void => {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

onMounted(() => {
  startCountdownTimer()
})

onUnmounted(() => {
  clearCountdownTimer()
})

// 计算倒计时
const getCountdown = (protectionTime: string | undefined): string => {
  if (!protectionTime) return ''

  const now = Math.floor(Date.now() / 1000)
  const target = Number(protectionTime)
  const diff = target - now

  if (diff <= 0) return ''

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  if (days > 0) {
    return `${days}天 ${hours}时 ${minutes}分`
  } else if (hours > 0) {
    return `${hours}时 ${minutes}分 ${seconds}秒`
  } else if (minutes > 0) {
    return `${minutes}分 ${seconds}秒`
  } else {
    return `${seconds}秒`
  }
}

const themeClass = computed(() => appStore.theme)
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
const headerFixedStyle = {
  paddingTop: `calc(16rpx + ${statusBarHeight}px)`
}

const headerHeightRpx = 152
const tabBarHeightRpx = 128
const searchBarHeightRpx = 100

// 当前Tab
const currentTab = ref(0)

// Tab栏固定样式
const tabBarFixedStyle = computed(() => ({
  top: `calc(${headerHeightRpx}rpx + ${statusBarHeight}px)`
}))

// 搜索栏固定样式
const searchBarFixedStyle = computed(() => ({
  top: `calc(${headerHeightRpx + tabBarHeightRpx}rpx + ${statusBarHeight}px)`
}))

// 计算滚动区域高度
const scrollHeight = computed(() => {
  const systemInfo = uni.getSystemInfoSync()
  return `${systemInfo.windowHeight}px`
})
const scrollContentStyle = computed(() => {
  const baseOffset = headerHeightRpx + tabBarHeightRpx
  const extraOffset = currentTab.value === 1 ? searchBarHeightRpx : 0
  return {
    height: `${uni.getSystemInfoSync().windowHeight}px`,
    marginTop: `calc(${baseOffset + extraOffset}rpx + ${statusBarHeight}px)`
  }
})

// 监听Tab切换，加载物品列表
watch(currentTab, async (newTab) => {
  if (newTab === 1 && items.value.length === 0) {
    await loadItems()
  }
})

const recordId = ref('')
const record = ref<TradeRecord | null>(null)
const loading = ref(false)

// 物品列表相关
const items = ref<TradeItemDetail[]>([])
const itemsPager = ref<Pager>({
  total: 0,
  rp: 10,
  current: 1,
  pages: 0
})
const itemsLoading = ref(false)
const loadMoreLoading = ref(false)

// 物品搜索表单
const itemSearchForm = ref({
  marketName: '',
  status: undefined as number | undefined
})

const showItemStatusPicker = ref(false)
const showItemFilterPanel = ref(false)

// 是否有筛选条件
const hasItemFilter = computed(() => {
  return itemSearchForm.value.marketName !== '' || itemSearchForm.value.status !== undefined
})

// 物品状态选项
const itemStatusOptions = computed(() => [
  { label: t('tradeDetail.itemStatus.all'), value: undefined },
  { label: t('tradeDetail.itemStatus.normal'), value: 1 },
  { label: t('tradeDetail.itemStatus.cancelled'), value: 0 },
  { label: t('tradeDetail.itemStatus.missing'), value: -1 }
])

// 物品状态显示文本
const itemStatusDisplayText = computed(() => {
  if (itemSearchForm.value.status === undefined) return ''
  const option = itemStatusOptions.value.find(opt => opt.value === itemSearchForm.value.status)
  return option?.label || ''
})

// 结算恢复弹窗状态
const restoreModal = ref({
  show: false,
  content: ''
})

// 结算同步弹窗状态
const syncModal = ref({
  show: false,
  content: ''
})

// 取消交易弹窗状态
const cancelModal = ref({
  show: false,
  content: ''
})

// 操作加载状态
const actionLoading = ref(false)

onLoad((options: any) => {
  if (options.id) {
    recordId.value = options.id
    loadDetail()
  }
})

const loadDetail = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await TradeAPI.getList({
      page: 1,
      pageSize: 100
    })

    const found = response.list.find(item => item.id === recordId.value)
    if (found) {
      record.value = found
    } else {
      uni.showToast({
        title: t('tradeRecordDetail.recordNotFound'),
        icon: 'error'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('[交易记录详情] 获取详情失败:', error)
    uni.showToast({
      title: t('tradeRecordDetail.loadFailed'),
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 加载物品列表
const loadItems = async (): Promise<void> => {
  const isLoadingMore = itemsPager.value.current > 1

  if (!isLoadingMore) {
    itemsLoading.value = true
  }
  try {
    const params: Record<string, any> = {
      page: itemsPager.value.current,
      pageSize: 10,
      recordId: recordId.value,
      appId: record.value?.appId || 0
    }

    // 物品名称
    if (itemSearchForm.value.marketName) {
      params.marketName = itemSearchForm.value.marketName
    }
    // 状态
    if (itemSearchForm.value.status !== undefined) {
      params.status = itemSearchForm.value.status
    }

    const response = await TradeAPI.getItemList(params)

    if (response && response.list) {
      if (itemsPager.value.current === 1) {
        items.value = response.list
      } else {
        items.value = [...items.value, ...response.list]
      }
      if (response.pager) {
        itemsPager.value = response.pager
      } else if (itemsPager.value.current === 1 && response.list.length === 0) {
        itemsPager.value.pages = 0
      }
    }
  } catch (error) {
    console.error('[物品详情] 获取列表失败:', error)
  } finally {
    if (!isLoadingMore) {
      itemsLoading.value = false
    }
  }
}

// 是否有更多数据
const hasMore = computed(() => {
  if (!itemsPager.value) return false
  return itemsPager.value.current < itemsPager.value.pages
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

// 物品搜索
const handleItemSearch = (): void => {
  showItemFilterPanel.value = false
  itemsPager.value.current = 1
  loadItems()
}

// 物品重置
const handleItemReset = (): void => {
  showItemFilterPanel.value = false
  itemSearchForm.value.marketName = ''
  itemSearchForm.value.status = undefined
  itemsPager.value.current = 1
  loadItems()
}

// 物品状态确认
const onItemStatusConfirm = (e: any): void => {
  const selected = e.value[0]
  itemSearchForm.value.status = selected.value
  showItemStatusPicker.value = false
}

// 上拉加载更多
onReachBottom(() => {
  if (currentTab.value !== 1 || !hasMore.value || loadMoreLoading.value || itemsLoading.value) return
  loadMoreLoading.value = true
  itemsPager.value.current++
  loadItems().finally(() => {
    loadMoreLoading.value = false
  })
})

// 获取操作按钮图标
const getActionIcon = (key: string): string => {
  const iconMap: Record<string, string> = {
    'cancel': 'close-circle',
    'restore': 'reload',
    'sync': 'refresh',
    'offer': 'edit-pen'
  }
  return iconMap[key] || 'circle'
}

// 操作按钮配置
interface ActionButton {
  key: string
  label: string
  type: 'cancel' | 'restore' | 'sync' | 'offer'
}

// 根据状态获取操作按钮（移除了物品详情按钮）
const getActions = (status: number): ActionButton[] => {
  const actions: ActionButton[] = []

  // 已撤销 (-2)、已取消 (-1)、待发货 (2)、发货待确认 (3)、结算中 (5)、取消中 (9): 添加更改Offer按钮
  if ([-2, -1, 2, 3, 5, 9].includes(status)) {
    actions.push({ key: 'offer', label: t('trade.changeOffer'), type: 'offer' })
  }

  // 待发货 (2): 添加取消交易按钮
  if (status === 2) {
    actions.push({ key: 'cancel', label: t('trade.cancelTrade'), type: 'cancel' })
  }

  // 结算中 (5): 添加结算同步按钮
  if (status === 5) {
    actions.push({ key: 'sync', label: t('trade.settlementSync'), type: 'sync' })
  }

  // 完成 (6): 添加结算恢复按钮
  if (status === 6) {
    actions.push({ key: 'restore', label: t('trade.settlementRestore'), type: 'restore' })
  }

  return actions
}

// 处理操作按钮点击
const handleAction = (actionKey: string): void => {
  if (!record.value) return

  switch (actionKey) {
    case 'cancel':
      // 取消交易
      cancelModal.value = {
        show: true,
        content: t('trade.cancelTradeConfirm')
      }
      break
    case 'restore':
      // 结算恢复
      restoreModal.value = {
        show: true,
        content: t('trade.settlementRestoreConfirm')
      }
      break
    case 'sync':
      // 结算同步
      syncModal.value = {
        show: true,
        content: t('trade.settlementSyncConfirm')
      }
      break
    case 'offer':
      // 更改Offer
      uni.showToast({
        title: `更改Offer: ${record.value.offerId || record.value.id}`,
        icon: 'none'
      })
      break
  }
}

// 结算恢复确认
const onRestoreConfirm = async (): Promise<void> => {
  restoreModal.value.show = false
  actionLoading.value = true
  try {
    await TradeAPI.settlementResume(recordId.value)
    uni.showToast({
      title: t('trade.settlementRestoreSuccess'),
      icon: 'success'
    })
    // 刷新详情
    await loadDetail()
  } catch (error) {
    console.error('[交易记录详情] 结算恢复失败:', error)
    uni.showToast({
      title: t('trade.settlementRestoreFailed'),
      icon: 'error'
    })
  } finally {
    actionLoading.value = false
  }
}

// 结算同步确认
const onSyncConfirm = async (): Promise<void> => {
  syncModal.value.show = false
  actionLoading.value = true
  try {
    await TradeAPI.settlementSync(recordId.value)
    uni.showToast({
      title: t('trade.settlementSyncSuccess'),
      icon: 'success'
    })
    // 刷新详情
    await loadDetail()
  } catch (error) {
    console.error('[交易记录详情] 结算同步失败:', error)
    uni.showToast({
      title: t('trade.settlementSyncFailed'),
      icon: 'error'
    })
  } finally {
    actionLoading.value = false
  }
}

// 取消交易确认
const onCancelConfirm = async (): Promise<void> => {
  cancelModal.value.show = false
  actionLoading.value = true
  try {
    // 使用取消原因代码 -1 (买家取消交易)
    await TradeAPI.cancelTrade(recordId.value, -1)
    uni.showToast({
      title: t('trade.cancelTradeSuccess'),
      icon: 'success'
    })
    // 刷新详情
    await loadDetail()
  } catch (error) {
    console.error('[交易记录详情] 取消交易失败:', error)
    uni.showToast({
      title: t('trade.cancelTradeFailed'),
      icon: 'error'
    })
  } finally {
    actionLoading.value = false
  }
}

const getStatusClass = (status: number): string => {
  const statusMap: Record<number, string> = {
    '-2': 'revoked',
    '-1': 'cancelled',
    '1': 'pending-payment',
    '2': 'pending-shipment',
    '3': 'shipment-pending',
    '4': 'pending-receipt',
    '5': 'settling',
    '6': 'completed',
    '9': 'cancelling'
  }
  return statusMap[status] || 'default'
}

const getStatusText = (status: number): string => {
  return t(`tradeStatus.${status}`)
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

.scroll-content {
  flex: 1;
  height: 0;
  margin-top: 240rpx;
}

.scroll-content.with-search {
  margin-top: 340rpx;
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

/* Tab栏固定容器 */
.tab-bar-fixed {
  position: fixed;
  left: 0;
  right: 0;
  background: var(--c-bg);
  z-index: 99;
  padding: 16rpx 24rpx 0;
}

/* Tab栏 */
.tab-bar {
  display: flex;
  background-color: var(--c-card);
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--t-regular);
  transition: all 0.2s;
}

.tab-item.active {
  background: linear-gradient(135deg, var(--c-main) 0%, rgba(99, 102, 241, 0.9) 100%);
  color: #FFFFFF;
  font-weight: 600;
}

.tab-item:active {
  transform: scale(0.98);
}

/* 详情卡片 */
.detail-card {
  background-color: var(--c-card);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.detail-section {
  margin-bottom: 32rpx;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--c-main);
  padding: 16rpx 24rpx;
  background-color: rgba(79, 70, 229, 0.06);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  padding: 0 8rpx;
}

.detail-info-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-info-item.full {
  grid-column: 1 / -1;
}

.detail-info-label {
  font-size: 24rpx;
  color: var(--t-light);
}

.detail-info-value {
  font-size: 28rpx;
  color: var(--t-regular);
  word-break: break-all;
}

.detail-info-value-id {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 24rpx;
}

.detail-info-status {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.detail-info-status.completed {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.detail-info-status.settling {
  background-color: rgba(251, 191, 36, 0.1);
  color: #F59E0B;
}

.detail-info-status.pending-payment {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9CA3AF;
}

.detail-info-status.pending-shipment,
.detail-info-status.shipment-pending,
.detail-info-status.pending-receipt {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.detail-info-status.cancelling {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9CA3AF;
}

.detail-info-status.cancelled,
.detail-info-status.revoked {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9CA3AF;
}

.detail-price-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 0 8rpx;
}

.detail-price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: rgba(79, 70, 229, 0.06);
  border-radius: 12rpx;
}

.detail-price-label {
  font-size: 28rpx;
  color: var(--t-regular);
}

.detail-price-value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-main);
}

.countdown-text {
  color: #F59E0B;
  font-weight: 600;
}

.cancel-text {
  color: #EF4444;
}

.detail-error-list {
  padding: 0 8rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.detail-error-item {
  padding: 16rpx 20rpx;
  background-color: rgba(239, 68, 68, 0.08);
  border-radius: 8rpx;
}

.detail-error-item text {
  font-size: 26rpx;
  color: #EF4444;
}

/* 物品Tab内容 */
.item-tab-content {
  min-height: 400rpx;
}

.item-list {
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

/* 固定搜索栏容器 */
.search-bar-fixed {
  position: fixed;
  left: 0;
  right: 0;
  background: var(--c-bg);
  z-index: 98;
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
.filter-panel-fixed {
  background: var(--c-bg);
  border-bottom: 1rpx solid var(--c-divider);
}

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

/* 操作Tab内容 */
.action-tab-content {
  min-height: 400rpx;
}

.no-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300rpx;
}

.no-actions-text {
  font-size: 28rpx;
  color: var(--t-light);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-list-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.action-list-item:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.action-icon {
  position: absolute;
  left: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}

.action-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

/* 取消交易 - 红色 */
.action-list-item.cancel {
  background: linear-gradient(135deg, #EF4444 0%, rgba(239, 68, 68, 0.85) 100%);
}

/* 结算恢复 - 橙色 */
.action-list-item.restore {
  background: linear-gradient(135deg, #F59E0B 0%, rgba(245, 158, 11, 0.85) 100%);
}

/* 结算同步 - 靛蓝色 */
.action-list-item.sync {
  background: linear-gradient(135deg, #6366F1 0%, rgba(99, 102, 241, 0.85) 100%);
}

/* 更改Offer - 紫色 */
.action-list-item.offer {
  background: linear-gradient(135deg, #8B5CF6 0%, rgba(139, 92, 246, 0.85) 100%);
}
</style>
