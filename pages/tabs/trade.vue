<template>
  <view :class="['page', themeClass]" @click="handlePageClick" :key="`trade-page-${appStore.language}`">
    <!-- 查询区域 - 固定在顶部 -->
    <view class="search-fixed" @click.stop :style="searchFixedStyle">
      <view class="search-card">
        <!-- Tab栏 -->
        <view class="tab-bar">
          <view
            v-for="(tab, index) in tabs"
            :key="index"
            :class="['tab-item', { 'tab-active': currentTab === index }]"
            @click="handleTabChange(index)"
          >
            <text class="tab-text">{{ tab.label }}</text>
            <text v-if="currentTab === index" class="tab-indicator"></text>
          </view>
        </view>

        <!-- 搜索栏 - Tab1 -->
        <view v-if="currentTab === 0" class="search-bar">
          <view class="filter-btn" @click="showFilterPanel = !showFilterPanel">
            <u-icon name="list" size="20" :color="hasFilter ? 'var(--c-main)' : 'var(--t-regular)'"></u-icon>
            <text :class="['filter-btn-text', { 'filter-active': hasFilter }]">{{ t('trade.filter') }}</text>
          </view>
          <view class="refresh-btn" @click="handleRefresh">
            <u-icon name="reload" size="20" color="var(--t-regular)"></u-icon>
            <text class="refresh-btn-text">{{ t('trade.refresh') }}</text>
          </view>
        </view>

        <!-- 搜索栏 - Tab2 -->
        <view v-else class="search-bar">
          <view class="filter-btn" @click="showFilterPanel2 = !showFilterPanel2">
            <u-icon name="list" size="20" :color="hasFilter2 ? 'var(--c-main)' : 'var(--t-regular)'"></u-icon>
            <text :class="['filter-btn-text', { 'filter-active': hasFilter2 }]">{{ t('trade.filter') }}</text>
          </view>
          <view class="refresh-btn" @click="handleRefresh">
            <u-icon name="reload" size="20" color="var(--t-regular)"></u-icon>
            <text class="refresh-btn-text">{{ t('trade.refresh') }}</text>
          </view>
        </view>

        <!-- 筛选面板 - Tab1 -->
        <view v-if="currentTab === 0 && showFilterPanel" class="filter-panel" @click.stop>
          <!-- 订单号 -->
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="search" size="16" color="var(--t-regular)"></u-icon>
              <text>{{ t('trade.orderNoSelect') }}</text>
            </view>
            <view class="filter-input-wrapper">
              <input
                v-model="searchForm.orderNo"
                class="filter-input"
                :placeholder="t('trade.orderNoPlaceholder')"
                placeholder-class="filter-input-placeholder"
              />
              <view v-if="searchForm.orderNo" class="filter-clear-btn" @click="searchForm.orderNo = ''">
                <u-icon name="close" size="12" color="var(--t-regular)"></u-icon>
              </view>
            </view>
          </view>

          <!-- 状态 -->
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="bookmark" size="16" color="var(--t-regular)"></u-icon>
              <text>{{ t('trade.statusSelect') }}</text>
            </view>
            <view class="filter-select-wrapper" @click="showStatusPicker = true">
              <text :class="['filter-select-text', { 'filter-select-placeholder': !statusDisplayText }]">
                {{ statusDisplayText || t('tradeStatus.all') }}
              </text>
              <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>

          <!-- 游戏 -->
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="grid" size="16" color="var(--t-regular)"></u-icon>
              <text>{{ t('trade.appSelect') }}</text>
            </view>
            <view class="filter-select-wrapper" @click="showAppPicker = true">
              <text :class="['filter-select-text', { 'filter-select-placeholder': !appDisplayText }]">
                {{ appDisplayText || t('tradeApp.all') }}
              </text>
              <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>

          <!-- 类型 -->
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="tags" size="16" color="var(--t-regular)"></u-icon>
              <text>{{ t('trade.typeSelect') }}</text>
            </view>
            <view class="filter-select-wrapper" @click="showTypePicker = true">
              <text :class="['filter-select-text', { 'filter-select-placeholder': !typeDisplayText }]">
                {{ typeDisplayText || t('tradeType.all') }}
              </text>
              <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="filter-actions">
            <view class="reset-btn" @click="handleReset">
              <text>{{ t('trade.reset') }}</text>
            </view>
            <view class="confirm-btn" @click="handleSearch">
              <text>{{ t('trade.search') }}</text>
            </view>
          </view>
        </view>

        <!-- 筛选面板 - Tab2 -->
        <view v-if="currentTab === 1 && showFilterPanel2" class="filter-panel" @click.stop>
          <!-- 订单号 -->
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="search" size="16" color="var(--t-regular)"></u-icon>
              <text>{{ t('trade.orderNoSelect') }}</text>
            </view>
            <view class="filter-input-wrapper">
              <input
                v-model="searchForm2.orderNo"
                class="filter-input"
                :placeholder="t('trade.orderNoPlaceholder')"
                placeholder-class="filter-input-placeholder"
              />
              <view v-if="searchForm2.orderNo" class="filter-clear-btn" @click="searchForm2.orderNo = ''">
                <u-icon name="close" size="12" color="var(--t-regular)"></u-icon>
              </view>
            </view>
          </view>

          <!-- 状态 -->
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="bookmark" size="16" color="var(--t-regular)"></u-icon>
              <text>{{ t('trade.statusSelect') }}</text>
            </view>
            <view class="filter-select-wrapper" @click="showStatusPicker2 = true">
              <text :class="['filter-select-text', { 'filter-select-placeholder': !statusDisplayText2 }]">
                {{ statusDisplayText2 || t('tradeStatus.all') }}
              </text>
              <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>

          <!-- 游戏 -->
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="grid" size="16" color="var(--t-regular)"></u-icon>
              <text>{{ t('trade.appSelect') }}</text>
            </view>
            <view class="filter-select-wrapper" @click="showAppPicker2 = true">
              <text :class="['filter-select-text', { 'filter-select-placeholder': !appDisplayText2 }]">
                {{ appDisplayText2 || t('tradeApp.all') }}
              </text>
              <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="filter-actions">
            <view class="reset-btn" @click="handleReset2">
              <text>{{ t('trade.reset') }}</text>
            </view>
            <view class="confirm-btn" @click="handleSearch2">
              <text>{{ t('trade.search') }}</text>
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
        <!-- Tab1: 交易列表 -->
        <view v-if="currentTab === 0">
          <!-- 加载状态 -->
          <view v-if="loading" class="loading-wrapper">
            <u-loading-icon mode="circle" size="60" color="var(--c-main)"></u-loading-icon>
            <text class="loading-text">{{ t('common.loading') }}</text>
          </view>

          <!-- 空状态 -->
          <u-empty
            v-else-if="records.length === 0"
            :text="t('trade.noData')"
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
            @click="handleViewDetail(item)"
          >
            <view class="card-main">
              <view class="card-left">
                <image v-if="getGameIcon(item.appId)" class="game-icon" :src="getGameIcon(item.appId)" mode="aspectFit"></image>
                <view class="item-info">
                  <text class="market-name">{{ item.marketName }}</text>
                  <view class="meta-row">
                    <text class="app-name-text">{{ item.appName }}</text>
                    <text class="dot-divider">·</text>
                    <text class="create-time">{{ formatTime(item.createTime) }}</text>
                  </view>
                </view>
              </view>
              <view class="card-right">
                <view :class="['status-badge', getStatusClass(item.status)]">
                  {{ getStatusText(item.status) }}
                </view>
                <text
                  v-if="item.status === 5 && getCountdown(item.protectionTime, countdownTrigger)"
                  class="settlement-countdown"
                >
                  {{ getCountdown(item.protectionTime, countdownTrigger) }}
                </text>
              </view>
            </view>
            <view class="card-footer">
              <view class="order-id-wrapper">
                <text class="order-id">{{ item.id }}</text>
                <view class="copy-order-btn" @click.stop="copyOrderId(item.id)">
                  <u-icon name="file-text" size="12" color="var(--c-main)"></u-icon>
                </view>
              </view>
              <text v-if="item.type" class="trade-type">{{ getTypeText(item.type) }}</text>
            </view>
          </view>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="records.length > 0" class="load-more">
          <u-loading-icon v-if="loadMoreLoading" mode="circle" size="24" color="var(--c-main)"></u-loading-icon>
          <text v-else-if="!hasMore" class="no-more">{{ t('trade.noMore') }}</text>
        </view>
        </view>

        <!-- Tab2: 自营交易列表 -->
        <view v-else>
          <!-- 加载状态 -->
          <view v-if="loading2" class="loading-wrapper">
            <u-loading-icon mode="circle" size="60" color="var(--c-main)"></u-loading-icon>
            <text class="loading-text">{{ t('common.loading') }}</text>
          </view>

          <!-- 空状态 -->
          <u-empty
            v-else-if="selfRecords.length === 0"
            :text="t('trade.noData')"
            textColor="var(--t-regular)"
            iconColor="var(--t-light)"
            mode="data"
          ></u-empty>

          <!-- 列表 -->
          <view v-else class="list">
          <view
            v-for="item in selfRecords"
            :key="item.id"
            class="record-card"
            @click="handleViewDetail(item)"
          >
            <view class="card-main">
              <view class="card-left">
                <image v-if="getGameIcon(item.appId)" class="game-icon" :src="getGameIcon(item.appId)" mode="aspectFit"></image>
                <view class="item-info">
                  <text class="market-name">{{ item.marketName }}</text>
                  <view class="meta-row">
                    <text class="app-name-text">{{ item.appName }}</text>
                    <text class="dot-divider">·</text>
                    <text class="create-time">{{ formatTime(item.createTime) }}</text>
                  </view>
                </view>
              </view>
              <view class="card-right">
                <view :class="['status-badge', getStatusClass(item.status)]">
                  {{ getStatusText(item.status) }}
                </view>
                <text
                  v-if="item.status === 5 && getCountdown(item.protectionTime, countdownTrigger)"
                  class="settlement-countdown"
                >
                  {{ getCountdown(item.protectionTime, countdownTrigger) }}
                </text>
              </view>
            </view>
            <view class="card-footer">
              <view class="order-id-wrapper">
                <text class="order-id">{{ item.id }}</text>
                <view class="copy-order-btn" @click.stop="copyOrderId(item.id)">
                  <u-icon name="file-text" size="12" color="var(--c-main)"></u-icon>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="selfRecords.length > 0" class="load-more">
          <u-loading-icon v-if="loadMoreLoading2" mode="circle" size="24" color="var(--c-main)"></u-loading-icon>
          <text v-else-if="!hasMore2" class="no-more">{{ t('trade.noMore') }}</text>
        </view>
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

    <!-- 游戏选择器 -->
    <u-picker
      :show="showAppPicker"
      :columns="[appOptions]"
      key-name="label"
      @confirm="onAppConfirm"
      @cancel="showAppPicker = false"
    ></u-picker>

    <!-- 类型选择器 -->
    <u-picker
      :show="showTypePicker"
      :columns="[typeOptions]"
      key-name="label"
      @confirm="onTypeConfirm"
      @cancel="showTypePicker = false"
    ></u-picker>

    <!-- Tab2 状态选择器 -->
    <u-picker
      :show="showStatusPicker2"
      :columns="[statusOptions]"
      key-name="label"
      @confirm="onStatusConfirm2"
      @cancel="showStatusPicker2 = false"
    ></u-picker>

    <!-- Tab2 游戏选择器 -->
    <u-picker
      :show="showAppPicker2"
      :columns="[appOptions]"
      key-name="label"
      @confirm="onAppConfirm2"
      @cancel="showAppPicker2 = false"
    ></u-picker>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { redirectToLogin } from '@/utils/navigation'
import TradeAPI from '@/api/modules/trade'
import type { TradeRecord, Pager } from '@/types/api'

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
  marginTop: `calc(220rpx + ${statusBarHeight}px)`
}))

const records = ref<TradeRecord[]>([])
const pager = ref<Pager>({
  total: 0,
  rp: 10,
  current: 1,
  pages: 0
})
const loading = ref(false)

// Tab 相关
const currentTab = ref(0)
const tabs = computed(() => [
  { label: t('trade.tab1'), value: 'trade-list' },
  { label: t('trade.tab2'), value: 'trade-detail' }
])

// 查询状态
const searchForm = ref({
  orderNo: '',
  status: undefined as number | undefined,
  appId: undefined as number | undefined,
  type: undefined as number | undefined
})

const showStatusPicker = ref(false)
const showAppPicker = ref(false)
const showTypePicker = ref(false)
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
  return searchForm.value.orderNo !== '' ||
         searchForm.value.status !== undefined ||
         searchForm.value.appId !== undefined ||
         searchForm.value.type !== undefined
})

// Tab2 相关状态
const selfRecords = ref<TradeRecord[]>([])
const selfPager = ref<Pager>({
  total: 0,
  rp: 10,
  current: 1,
  pages: 0
})
const loading2 = ref(false)
const loadMoreLoading2 = ref(false)

// Tab2 查询状态
const searchForm2 = ref({
  orderNo: '',
  status: undefined as number | undefined,
  appId: undefined as number | undefined
})

const showStatusPicker2 = ref(false)
const showAppPicker2 = ref(false)
const showFilterPanel2 = ref(false)

// Tab2 是否有更多数据
const hasMore2 = computed(() => {
  return selfPager.value.current < selfPager.value.pages
})

// Tab2 是否有筛选条件
const hasFilter2 = computed(() => {
  return searchForm2.value.orderNo !== '' ||
         searchForm2.value.status !== undefined ||
         searchForm2.value.appId !== undefined
})

// Tab2 状态显示文本
const statusDisplayText2 = computed(() => {
  if (searchForm2.value.status === undefined) return ''
  const option = statusOptions.value.find(opt => opt.value === searchForm2.value.status)
  return option?.label || ''
})

// Tab2 游戏显示文本
const appDisplayText2 = computed(() => {
  if (searchForm2.value.appId === undefined) return ''
  const option = appOptions.value.find(opt => opt.value === searchForm2.value.appId)
  return option?.label || ''
})

// 状态选项
const statusOptions = computed(() => [
  { label: t('tradeStatus.all'), value: undefined },
  { label: t('tradeStatus.-2'), value: -2 },
  { label: t('tradeStatus.-1'), value: -1 },
  { label: t('tradeStatus.1'), value: 1 },
  { label: t('tradeStatus.2'), value: 2 },
  { label: t('tradeStatus.3'), value: 3 },
  { label: t('tradeStatus.4'), value: 4 },
  { label: t('tradeStatus.5'), value: 5 },
  { label: t('tradeStatus.6'), value: 6 },
  { label: t('tradeStatus.9'), value: 9 }
])

// 游戏选项
const appOptions = computed(() => [
  { label: t('tradeApp.all'), value: undefined },
  { label: 'CS2', value: 730 },
  { label: 'TF2', value: 440 },
  { label: 'DOTA 2', value: 570 }
])

// 状态显示文本
const statusDisplayText = computed(() => {
  if (searchForm.value.status === undefined) return ''
  const option = statusOptions.value.find(opt => opt.value === searchForm.value.status)
  return option?.label || ''
})

// 游戏显示文本
const appDisplayText = computed(() => {
  if (searchForm.value.appId === undefined) return ''
  const option = appOptions.value.find(opt => opt.value === searchForm.value.appId)
  return option?.label || ''
})

// 类型选项
const typeOptions = computed(() => [
  { label: t('tradeType.all'), value: undefined },
  { label: t('trade.type.sell'), value: 1 },
  { label: t('trade.type.supply'), value: 2 }
])

// 类型显示文本
const typeDisplayText = computed(() => {
  if (searchForm.value.type === undefined) return ''
  const option = typeOptions.value.find(opt => opt.value === searchForm.value.type)
  return option?.label || ''
})

// 倒计时更新触发器
const countdownTrigger = ref(0)
let countdownTimer: number | null = null

// 计算倒计时
const getCountdown = (protectionTime: string | undefined, _trigger?: number): string => {
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
  if (!userStore.isLoggedIn()) {
    redirectToLogin()
    return
  }
  loadList()
  startCountdownTimer()
})

onUnmounted(() => {
  clearCountdownTimer()
})

const loadList = async (): Promise<void> => {
  const shouldRestoreScroll = pager.value.current > 1
  const isLoadingMore = pager.value.current > 1

  if (!isLoadingMore) {
    loading.value = true
  }
  try {
    const params: Record<string, any> = {
      page: pager.value.current,
      pageSize: 10
    }

    // 订单号
    if (searchForm.value.orderNo) {
      params.orderNo = searchForm.value.orderNo
    }
    // 状态
    if (searchForm.value.status !== undefined) {
      params.status = searchForm.value.status
    }
    // 游戏
    if (searchForm.value.appId !== undefined) {
      params.appId = searchForm.value.appId
    }
    // 类型
    if (searchForm.value.type !== undefined) {
      params.type = searchForm.value.type
    }

    const response = await TradeAPI.getList(params)

    if (pager.value.current === 1) {
      records.value = response.list
    } else {
      records.value = [...records.value, ...response.list]
    }
    pager.value = response.pager

    if (shouldRestoreScroll) {
      await nextTick()
      scrollTop.value = lastScrollTop.value
    }
  } catch (error) {
    console.error('[交易] 获取列表失败:', error)
  } finally {
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

const onScrollLower = (): void => {
  if (currentTab.value === 0) {
    // Tab1: 加载更多交易列表
    if (!hasMore.value || loadMoreLoading.value || loading.value) return
    loadMoreLoading.value = true
    pager.value.current++
    loadList().finally(() => {
      loadMoreLoading.value = false
    })
  } else {
    // Tab2: 加载更多自营交易列表
    onScrollLower2()
  }
}

const handleSearch = (): void => {
  showFilterPanel.value = false
  pager.value.current = 1
  loadList()
}

const handleReset = (): void => {
  showFilterPanel.value = false
  searchForm.value.orderNo = ''
  searchForm.value.status = undefined
  searchForm.value.appId = undefined
  searchForm.value.type = undefined
  pager.value.current = 1
  loadList()
}

// Tab2 加载自营交易列表
const loadSelfList = async (): Promise<void> => {
  const shouldRestoreScroll = selfPager.value.current > 1
  const isLoadingMore = selfPager.value.current > 1

  if (!isLoadingMore) {
    loading2.value = true
  }
  try {
    const params: Record<string, any> = {
      page: selfPager.value.current,
      pageSize: 10
    }

    // 订单号
    if (searchForm2.value.orderNo) {
      params.orderNo = searchForm2.value.orderNo
    }
    // 状态
    if (searchForm2.value.status !== undefined) {
      params.status = searchForm2.value.status
    }
    // 游戏
    if (searchForm2.value.appId !== undefined) {
      params.appId = searchForm2.value.appId
    }

    const response = await TradeAPI.getSelfList(params)

    if (selfPager.value.current === 1) {
      selfRecords.value = response.list
    } else {
      selfRecords.value = [...selfRecords.value, ...response.list]
    }
    selfPager.value = response.pager

    if (shouldRestoreScroll) {
      await nextTick()
      scrollTop.value = lastScrollTop.value
    }
  } catch (error) {
    console.error('[自营交易] 获取列表失败:', error)
  } finally {
    if (!isLoadingMore) {
      loading2.value = false
    }
  }
}

// Tab2 加载更多
const onScrollLower2 = (): void => {
  if (!hasMore2.value || loadMoreLoading2.value || loading2.value) return
  loadMoreLoading2.value = true
  selfPager.value.current++
  loadSelfList().finally(() => {
    loadMoreLoading2.value = false
  })
}

// Tab2 查询
const handleSearch2 = (): void => {
  showFilterPanel2.value = false
  selfPager.value.current = 1
  loadSelfList()
}

// Tab2 重置
const handleReset2 = (): void => {
  showFilterPanel2.value = false
  searchForm2.value.orderNo = ''
  searchForm2.value.status = undefined
  searchForm2.value.appId = undefined
  selfPager.value.current = 1
  loadSelfList()
}

// 刷新当前列表
const handleRefresh = (): void => {
  if (currentTab.value === 0) {
    // Tab1: 刷新交易列表
    pager.value.current = 1
    loadList()
    uni.showToast({
      title: t('trade.refreshSuccess'),
      icon: 'success'
    })
  } else {
    // Tab2: 刷新自营交易列表
    selfPager.value.current = 1
    loadSelfList()
    uni.showToast({
      title: t('trade.refreshSuccess'),
      icon: 'success'
    })
  }
}

// Tab 切换
const handleTabChange = (index: number): void => {
  if (currentTab.value === index) return
  currentTab.value = index
  // 切换 tab 时关闭筛选面板
  showFilterPanel.value = false
  showFilterPanel2.value = false

  // 如果切换到 Tab2 且还没有加载过数据，则加载
  if (index === 1 && selfRecords.value.length === 0 && !loading2.value) {
    loadSelfList()
  }
}

const handlePageClick = (): void => {
  if (showStatusPicker.value || showAppPicker.value || showTypePicker.value) return
  if (showStatusPicker2.value || showAppPicker2.value) return
  if (showFilterPanel.value) {
    showFilterPanel.value = false
  }
  if (showFilterPanel2.value) {
    showFilterPanel2.value = false
  }
}

const onStatusConfirm = (e: any): void => {
  const selected = e.value[0]
  searchForm.value.status = selected.value
  showStatusPicker.value = false
}

const onAppConfirm = (e: any): void => {
  const selected = e.value[0]
  searchForm.value.appId = selected.value
  showAppPicker.value = false
}

const onTypeConfirm = (e: any): void => {
  const selected = e.value[0]
  searchForm.value.type = selected.value
  showTypePicker.value = false
}

// Tab2 选择器确认事件
const onStatusConfirm2 = (e: any): void => {
  const selected = e.value[0]
  searchForm2.value.status = selected.value
  showStatusPicker2.value = false
}

const onAppConfirm2 = (e: any): void => {
  const selected = e.value[0]
  searchForm2.value.appId = selected.value
  showAppPicker2.value = false
}

const handleViewDetail = (item: TradeRecord): void => {
  uni.navigateTo({
    url: `/pages/trade-record-detail?id=${item.id}`
  })
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

// 获取类型文字
const getTypeText = (type: number): string => {
  const typeMap: Record<number, string> = {
    1: t('trade.type.sell'),
    2: t('trade.type.supply')
  }
  return typeMap[type] || type.toString()
}

// 获取游戏图标
const getGameIcon = (appId: number): string => {
  const iconMap: Record<number, string> = {
    730: '/static/icons/CS2.png',
    440: '/static/icons/TF2.png',
    570: '/static/icons/DOTA2.png'
  }
  return iconMap[appId] || ''
}

// 复制订单号
const copyOrderId = (orderId: string): void => {
  uni.setClipboardData({
    data: orderId,
    success: () => {
      uni.showToast({
        title: t('trade.copySuccess'),
        icon: 'success'
      })
    }
  })
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
  padding: 24rpx;
  padding-bottom: 200rpx;
}

.search-card {
  background: var(--c-card);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(79, 70, 229, 0.12);
  overflow: hidden;
}

/* Tab栏 */
.tab-bar {
  display: flex;
  align-items: center;
  padding: 0 8rpx;
  background-color: var(--c-card);
  border-bottom: 1rpx solid var(--c-divider);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  position: relative;
  transition: all 0.3s;
}

.tab-text {
  font-size: 30rpx;
  color: var(--t-regular);
  font-weight: 500;
  transition: all 0.3s;
}

.tab-item.tab-active .tab-text {
  color: var(--c-main);
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background: linear-gradient(90deg, var(--c-main) 0%, rgba(99, 102, 241, 0.8) 100%);
  border-radius: 3rpx 3rpx 0 0;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 48rpx;
    opacity: 1;
  }
}

/* Tab2 内容区域 */
.tab2-content {
  min-height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  gap: 16rpx;
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

/* 筛选输入框 */
.filter-input-wrapper {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: var(--c-bg);
  border-radius: 12rpx;
  gap: 12rpx;
}

.filter-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--t-primary);
}

.filter-input-placeholder {
  color: var(--t-light);
}

.filter-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  background-color: var(--t-light);
  border-radius: 50%;
}

/* 搜索标题 */
.search-title {
  flex: 1;
}

.search-title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--t-primary);
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
  gap: 16rpx;
}

.record-card {
  background-color: var(--c-card);
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid var(--c-border);
  transition: all 0.2s;
}

.record-card:active {
  background-color: var(--c-border);
  box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.03);
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6rpx;
  flex-shrink: 0;
}

.game-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
  background-color: var(--c-bg);
  padding: 6rpx;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
  flex: 1;
}

.market-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--t-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.app-name-text {
  font-size: 24rpx;
  color: var(--t-light);
  font-weight: 500;
}

.dot-divider {
  font-size: 24rpx;
  color: var(--t-light);
}

.create-time {
  font-size: 24rpx;
  color: var(--t-light);
  font-weight: 400;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12rpx;
  border-top: 1rpx solid var(--c-divider);
}

.order-id-wrapper {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.order-id {
  font-size: 24rpx;
  color: var(--t-light);
  font-weight: 400;
  font-family: 'Monaco', 'Consolas', monospace;
}

.copy-order-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28rpx;
  height: 28rpx;
  padding: 4rpx;
  background-color: rgba(79, 70, 229, 0.08);
  border-radius: 6rpx;
  transition: all 0.2s;
}

.copy-order-btn:active {
  background-color: rgba(79, 70, 229, 0.15);
  transform: scale(0.95);
}

.trade-type {
  font-size: 22rpx;
  color: var(--c-main);
  font-weight: 500;
  padding: 4rpx 12rpx;
  background-color: rgba(79, 70, 229, 0.08);
  border-radius: 4rpx;
}

.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
}

.settlement-countdown {
  font-size: 20rpx;
  color: #F59E0B;
  font-weight: 500;
  text-align: right;
  line-height: 1.2;
}

/* 完成 - 绿色 */
.status-badge.completed {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

/* 结算中 - 橙色 */
.status-badge.settling {
  background-color: rgba(251, 191, 36, 0.1);
  color: #F59E0B;
}

/* 待付款 - 灰色 */
.status-badge.pending-payment {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9CA3AF;
}

/* 待发货/发货待确认/待接收 - 红色 */
.status-badge.pending-shipment,
.status-badge.shipment-pending,
.status-badge.pending-receipt {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

/* 取消中 - 灰色 */
.status-badge.cancelling {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9CA3AF;
}

/* 已取消/已撤销 - 灰色 */
.status-badge.cancelled,
.status-badge.revoked {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9CA3AF;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 28rpx;
  border-radius: 16rpx;
  background-color: rgba(79, 70, 229, 0.06);
}

.price-label {
  font-size: 28rpx;
  color: var(--t-regular);
}

.price-value {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--c-main);
}

.countdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 28rpx;
  border-radius: 16rpx;
  background-color: rgba(251, 191, 36, 0.08);
}

.countdown-label {
  font-size: 30rpx;
  color: var(--t-regular);
}

.countdown-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #F59E0B;
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
