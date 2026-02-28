<template>
  <view :class="['page', themeClass]" @click="handlePageClick" :key="`ticket-page-${appStore.language}`">
    <!-- 待回复工单按钮 -->
    <view :class="['pending-btn', { 'active': isFilteringPending }]" :style="pendingBtnStyle" @click.stop="handleFilterPending">
      <view class="pending-btn-content">
        <u-icon name="bell" size="14" color="#FFFFFF"></u-icon>
        <text class="pending-text">{{ isFilteringPending ? t('ticket.close') : t('ticket.clickView') }}</text>
        <view class="pending-count">{{ pendingCount }}</view>
      </view>
    </view>

    <view class="search-fixed" @click.stop :style="searchFixedStyle">
      <view class="search-card">
        <view class="search-bar">
          <view class="search-input-wrapper">
            <u-icon name="search" size="18" color="var(--c-main)"></u-icon>
            <input
              class="search-input"
              v-model="searchForm.steamId"
              :placeholder="t('ticket.steamIdPlaceholder')"
              placeholder-class="search-input-placeholder"
            />
            <view v-if="searchForm.steamId" class="clear-btn" @click="searchForm.steamId = ''">
              <u-icon name="close" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>
          <view class="filter-btn" @click="showFilterPanel = !showFilterPanel">
            <u-icon name="list" size="20" :color="hasFilter ? 'var(--c-main)' : 'var(--t-regular)'"></u-icon>
            <text :class="['filter-btn-text', { 'filter-active': hasFilter }]">{{ t('ticket.search') }}</text>
          </view>
          <view class="refresh-btn" @click="handleRefresh">
            <u-icon name="reload" size="20" color="var(--t-regular)"></u-icon>
            <text class="refresh-btn-text">{{ t('ticket.refresh') }}</text>
          </view>
        </view>

        <view v-if="showFilterPanel" class="filter-panel" @click.stop>
          <view class="filter-item">
            <view class="filter-label">
              <u-icon name="list" size="16" color="var(--c-main)"></u-icon>
              <text>{{ t('ticket.statusSelect') }}</text>
            </view>
            <view class="filter-select-wrapper" @click="showStatusPicker = true">
              <text class="filter-select-text" :class="{ 'filter-select-placeholder': !statusDisplayText }">
                {{ statusDisplayText || t('ticket.statusSelect') }}
              </text>
              <u-icon name="arrow-right" size="14" color="var(--t-light)"></u-icon>
            </view>
          </view>

          <view class="filter-actions">
            <view class="reset-btn" @click="handleReset">
              <text>{{ t('ticket.reset') }}</text>
            </view>
            <view class="confirm-btn" @click="handleSearch">
              <u-icon name="search" size="16" color="#FFFFFF"></u-icon>
              <text>{{ t('ticket.search') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll-content"
      :style="scrollContentStyle"
      :scroll-top="scrollTop"
      @scroll="onScroll"
    >
      <view class="content">
        <view v-if="loading" class="loading-wrapper">
          <u-loading-icon mode="circle" size="60" color="var(--c-main)"></u-loading-icon>
          <text class="loading-text">{{ t('common.loading') }}</text>
        </view>

        <u-empty
          v-else-if="records.length === 0"
          :text="t('ticket.noData')"
          textColor="var(--t-regular)"
          iconColor="var(--t-light)"
          mode="data"
        ></u-empty>

        <view v-else class="list">
          <view v-for="item in records" :key="item.id" class="record-card" @click="handleViewDetail(item)">
            <view class="card-header">
              <view class="user-info">
                <text class="create-time">{{ formatTime(item.createTime) }}</text>
                <text class="creator-name">{{ item.createName || item.creator }}</text>
              </view>
              <view :class="['status-badge', getStatusClass(item.status)]">
                {{ getStatusLabel(item.status) }}
              </view>
            </view>

            <view class="card-body">
              <view class="content-row">
                <text class="content-text">{{ item.context }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="records.length > 0" class="load-more">
          <u-loading-icon v-if="loadMoreLoading" mode="circle" size="24" color="var(--c-main)"></u-loading-icon>
          <text v-else-if="!hasMore" class="no-more">{{ t('ticket.noMore') }}</text>
        </view>
      </view>
    </scroll-view>

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
import TicketAPI from '@/api/modules/ticket'
import type { Pager, TicketRecord } from '@/types/api'

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

const scrollHeight = computed(() => {
  const systemInfo = uni.getSystemInfoSync()
  return `${systemInfo.windowHeight}px`
})
const scrollContentStyle = computed(() => ({
  height: `${uni.getSystemInfoSync().windowHeight}px`,
  marginTop: `calc(120rpx + ${statusBarHeight}px)`
}))

function createDefaultPager(): Pager {
  return {
    total: 0,
    rp: 10,
    current: 1,
    pages: 0
  }
}

const records = ref<TicketRecord[]>([])
const pager = ref<Pager>(createDefaultPager())
const loading = ref(false)
const loadMoreLoading = ref(false)
const scrollTop = ref(0)
const lastScrollTop = ref(0)

const searchForm = ref({
  steamId: '',
  status: undefined as string | undefined
})

const actualFilterStatus = ref<string | undefined>(undefined) // 实际应用的筛选状态
const pendingCount = ref(0)

const showStatusPicker = ref(false)
const showFilterPanel = ref(false)

const hasMore = computed(() => {
  if (!pager.value) return false
  return pager.value.current < pager.value.pages
})

const hasFilter = computed(() => {
  return searchForm.value.steamId !== '' ||
         (searchForm.value.status !== undefined && searchForm.value.status !== '0')
})

const statusOptions = computed(() => [
  { label: t('ticketStatus.all'), value: undefined },
  { label: t('ticketStatus.0'), value: '0' },
  { label: t('ticketStatus.1'), value: '1' },
  { label: t('ticketStatus.2'), value: '2' },
  { label: t('ticketStatus.3'), value: '3' }
])

const statusDisplayText = computed(() => {
  if (searchForm.value.status === undefined) return ''
  const option = statusOptions.value.find(opt => opt.value === searchForm.value.status)
  return option?.label || ''
})

const pendingBtnStyle = computed(() => ({
  top: `calc(113rpx + ${statusBarHeight}px)`
}))

const isFilteringPending = computed(() => {
  return actualFilterStatus.value === '0'
})

onMounted(() => {
  if (!userStore.isLoggedIn()) {
    redirectToLogin()
    return
  }
  loadPendingCount()
  loadList()
})

const loadPendingCount = async (): Promise<void> => {
  try {
    const response = await TicketAPI.getList({
      page: 1,
      pageSize: 1,
      status: '0'
    })
    if (response.pager?.total !== undefined) {
      pendingCount.value = response.pager.total
    }
  } catch (error) {
    console.error('[Ticket] Failed to load pending count:', error)
  }
}

onReachBottom(() => {
  onScrollLower()
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

    if (searchForm.value.status !== undefined) {
      params.status = searchForm.value.status
    }
    if (searchForm.value.steamId) {
      params.steamId = searchForm.value.steamId
    }

    const response = await TicketAPI.getList(params)

    if (pager.value.current === 1) {
      records.value = response.list
      // 更新实际应用的筛选状态
      actualFilterStatus.value = searchForm.value.status
    } else {
      records.value = [...records.value, ...response.list]
    }
    pager.value = response.pager

    if (shouldRestoreScroll) {
      await nextTick()
      scrollTop.value = lastScrollTop.value
    }
  } catch (error) {
    console.error('[Ticket] Failed to load list:', error)
  } finally {
    if (!isLoadingMore) {
      loading.value = false
    }
  }
}

const onScroll = (e: any): void => {
  lastScrollTop.value = e.detail.scrollTop
}

const onScrollLower = (): void => {
  if (!hasMore.value || loadMoreLoading.value || loading.value || !pager.value) return
  loadMoreLoading.value = true
  pager.value.current++
  loadList().finally(() => {
    loadMoreLoading.value = false
  })
}

const handleSearch = (): void => {
  showFilterPanel.value = false
  if (!pager.value) {
    pager.value = {
      total: 0,
      rp: 10,
      current: 1,
      pages: 0
    }
  } else {
    pager.value.current = 1
  }
  loadList()
}

const handleReset = (): void => {
  showFilterPanel.value = false
  searchForm.value.steamId = ''
  searchForm.value.status = undefined
  if (!pager.value) {
    pager.value = {
      total: 0,
      rp: 10,
      current: 1,
      pages: 0
    }
  } else {
    pager.value.current = 1
  }
  loadList()
}

const handleFilterPending = (): void => {
  if (isFilteringPending.value) {
    // 如果正在筛选待回复，则取消筛选显示全部
    searchForm.value.status = undefined
    actualFilterStatus.value = undefined
  } else {
    // 筛选待回复工单
    searchForm.value.status = '0'
    actualFilterStatus.value = '0'
  }
  if (!pager.value) {
    pager.value = {
      total: 0,
      rp: 10,
      current: 1,
      pages: 0
    }
  } else {
    pager.value.current = 1
  }
  loadList()
}

const handleRefresh = (): void => {
  if (!pager.value) {
    pager.value = {
      total: 0,
      rp: 10,
      current: 1,
      pages: 0
    }
  } else {
    pager.value.current = 1
  }
  loadPendingCount()
  loadList()
}

const handlePageClick = (): void => {
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

const handleViewDetail = (item: TicketRecord): void => {
  uni.navigateTo({
    url: `/pages/ticket-detail?id=${item.id}`
  })
}

const getStatusClass = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'pending',
    1: 'replied',
    2: 'resolved',
    3: 'closed'
  }
  return statusMap[status] || 'default'
}

const getStatusLabel = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: t('ticketStatus.0'),
    1: t('ticketStatus.1'),
    2: t('ticketStatus.2'),
    3: t('ticketStatus.3')
  }
  return statusMap[status] || String(status)
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

.search-card {
  background: var(--c-card);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(79, 70, 229, 0.12);
  overflow: hidden;
}

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
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid var(--c-divider);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex: 1;
}

.create-time {
  font-size: 24rpx;
  color: var(--t-light);
  font-weight: 400;
}

.creator-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--t-primary);
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.pending {
  background-color: rgba(251, 191, 36, 0.12);
  color: #F59E0B;
}

.status-badge.replied {
  background-color: rgba(16, 185, 129, 0.12);
  color: #10B981;
}

.status-badge.resolved {
  background-color: rgba(14, 165, 233, 0.12);
  color: #0EA5E9;
}

.status-badge.closed {
  background-color: rgba(148, 163, 184, 0.2);
  color: #64748B;
}

.status-badge.default {
  background-color: rgba(156, 163, 175, 0.12);
  color: #9CA3AF;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.content-row {
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  background-color: rgba(79, 70, 229, 0.06);
}

.content-text {
  font-size: 26rpx;
  color: var(--t-primary);
  line-height: 1.5;
  word-break: break-word;
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

.pending-btn {
  position: fixed;
  right: 24rpx;
  z-index: 101;
  padding: 10rpx 14rpx;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border-radius: 50rpx;
  box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.3);
  transition: all 0.3s;
}

.pending-btn-content {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.pending-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(245, 158, 11, 0.3);
}

.pending-btn.active {
  background: linear-gradient(135deg, var(--c-main) 0%, rgba(99, 102, 241, 0.9) 100%);
  box-shadow: 0 4rpx 16rpx rgba(79, 70, 229, 0.3);
}

.pending-text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.pending-count {
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  color: #F59E0B;
}

.pending-btn.active .pending-count {
  color: var(--c-main);
}
</style>
