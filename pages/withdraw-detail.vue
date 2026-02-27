<template>
  <view :class="['page', themeClass]" :key="`withdraw-detail-${appStore.language}`">
    <!-- 顶部标题栏 -->
    <view class="header-fixed" :style="headerFixedStyle">
      <view class="header-card">
        <view class="header-left" @click="goBack">
          <u-icon name="arrow-left" size="20" color="var(--t-primary)"></u-icon>
        </view>
        <view class="header-title">
          <text class="header-title-text">{{ t('withdrawDetail.title') }}</text>
        </view>
        <view class="header-right"></view>
      </view>
    </view>

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

        <!-- 详情卡片 -->
        <view v-else-if="record" class="detail-card">
          <!-- 基本信息 -->
          <view class="detail-section">
            <view class="detail-section-title">{{ t('withdrawDetail.basicInfo') }}</view>
            <view class="detail-info-grid">
              <view class="detail-info-item">
                <text class="detail-info-label">{{ t('withdrawDetail.applicant') }}</text>
                <text class="detail-info-value">{{ record.userName }}</text>
              </view>
              <view class="detail-info-item">
                <text class="detail-info-label">{{ t('withdrawDetail.email') }}</text>
                <text class="detail-info-value">{{ record.showEmail }}</text>
              </view>
              <view class="detail-info-item">
                <text class="detail-info-label">{{ t('withdrawDetail.status') }}</text>
                <view :class="['detail-info-status', getStatusClass(record.status)]">
                  {{ getStatusLabel(record.status) }}
                </view>
              </view>
              <view class="detail-info-item full">
                <text class="detail-info-label">{{ t('withdrawDetail.userId') }}</text>
                <view class="copy-wrapper">
                  <text class="detail-info-value">{{ record.userId }}</text>
                  <view class="copy-btn" @click="copyUserId">
                    <u-icon name="file-text" size="16" color="var(--c-main)"></u-icon>
                    <text class="copy-text">{{ t('withdrawDetail.copy') }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 金额信息 -->
          <view class="detail-section">
            <view class="detail-section-title">{{ t('withdrawDetail.amountInfo') }}</view>
            <view class="detail-amount-card">
              <view class="detail-amount-item">
                <text class="detail-amount-label">{{ t('withdraw.amount') }}</text>
                <text class="detail-amount-value">{{ record.amount }}</text>
              </view>
              <view class="detail-amount-item">
                <text class="detail-amount-label">{{ t('withdraw.receiveAmount') }}</text>
                <text class="detail-amount-value">{{ record.receiveAmount }}</text>
              </view>
              <view v-if="record.trxTotalFee !== undefined" class="detail-amount-item">
                <text class="detail-amount-label">{{ t('withdrawDetail.trxFee') }}</text>
                <text class="detail-amount-value">{{ record.trxTotalFee }}</text>
              </view>
            </view>
          </view>

          <!-- 地址信息 -->
          <view class="detail-section">
            <view class="detail-section-title">{{ t('withdrawDetail.addressInfo') }}</view>
            <view class="detail-info-grid">
              <view class="detail-info-item full">
                <text class="detail-info-label">{{ t('withdraw.address') }}</text>
                <text class="detail-info-value detail-value-address">{{ record.account }}</text>
              </view>
              <view class="detail-info-item full">
                <view class="detail-info-label">{{ t('withdrawDetail.viewAddress') }}</view>
                <view class="link-btn" @click="openLink(record.addressLink)">
                  <text class="link-text">{{ t('withdrawDetail.clickToView') }}</text>
                  <u-icon name="arrow-right" size="16" color="var(--c-main)"></u-icon>
                </view>
              </view>
            </view>
          </view>

          <!-- 资源消耗 -->
          <view v-if="record.energyUsageTotal || record.netConsume" class="detail-section">
            <view class="detail-section-title">{{ t('withdrawDetail.resourceInfo') }}</view>
            <view class="detail-info-grid">
              <view v-if="record.energyUsageTotal" class="detail-info-item">
                <text class="detail-info-label">{{ t('withdraw.energyUsage') }}</text>
                <text class="detail-info-value">{{ record.energyUsageTotal }}</text>
              </view>
              <view v-if="record.netConsume" class="detail-info-item">
                <text class="detail-info-label">{{ t('withdraw.bandwidthUsage') }}</text>
                <text class="detail-info-value">{{ record.netConsume }}</text>
              </view>
            </view>
          </view>

          <!-- 时间信息 -->
          <view class="detail-section">
            <view class="detail-section-title">{{ t('withdrawDetail.timeInfo') }}</view>
            <view class="detail-info-grid">
              <view class="detail-info-item">
                <text class="detail-info-label">{{ t('withdraw.time') }}</text>
                <text class="detail-info-value">{{ formatTime(record.createTime) }}</text>
              </view>
              <view v-if="record.confirmTime" class="detail-info-item">
                <text class="detail-info-label">{{ t('withdraw.confirmTime') }}</text>
                <text class="detail-info-value">{{ formatTime(record.confirmTime) }}</text>
              </view>
            </view>
          </view>

          <!-- 交易链接 -->
          <view v-if="record.tronLink" class="detail-section">
            <view class="detail-section-title">{{ t('withdrawDetail.transactionInfo') }}</view>
            <view class="detail-info-grid">
              <view class="detail-info-item full">
                <view class="detail-info-label">{{ t('withdraw.viewTransaction') }}</view>
                <view class="link-btn" @click="openLink(record.tronLink)">
                  <text class="link-text">{{ t('withdrawDetail.clickToView') }}</text>
                  <u-icon name="arrow-right" size="16" color="var(--c-main)"></u-icon>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view v-if="record && record.status === 0" class="action-buttons">
          <u-button
            type="success"
            :loading="actionLoading"
            :disabled="actionLoading"
            :custom-style="approveButtonStyle"
            @click="handleApprove"
          >
            {{ t('withdraw.approve') }}
          </u-button>
          <u-button
            type="error"
            :loading="actionLoading"
            :disabled="actionLoading"
            :custom-style="rejectButtonStyle"
            @click="handleReject"
          >
            {{ t('withdraw.reject') }}
          </u-button>
        </view>
      </view>
    </scroll-view>

    <!-- 确认提现弹窗 -->
    <u-modal
      :show="approveModal.show"
      :title="t('withdraw.approveConfirmTitle')"
      :content="approveModal.content"
      :show-cancel-button="true"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      confirm-color="#10B981"
      @confirm="onApproveConfirm"
      @cancel="approveModal.show = false"
    ></u-modal>

    <!-- 驳回提现弹窗 -->
    <u-modal
      :show="rejectModal.show"
      :title="t('withdraw.rejectConfirmTitle')"
      :content="rejectModal.content"
      :show-cancel-button="true"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      confirm-color="#EF4444"
      @confirm="onRejectConfirm"
      @cancel="rejectModal.show = false"
    ></u-modal>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import WithdrawAPI from '@/api/modules/withdraw'
import type { WithdrawRecord } from '@/types/api'

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

const recordId = ref('')
const record = ref<WithdrawRecord | null>(null)
const loading = ref(false)
const actionLoading = ref(false)

// 弹窗状态
const approveModal = ref({
  show: false,
  content: ''
})

const rejectModal = ref({
  show: false,
  content: ''
})

// 按钮样式
const approveButtonStyle = computed(() => ({
  flex: 1,
  height: '88rpx',
  borderRadius: '16rpx',
  fontSize: '32rpx',
  fontWeight: '600',
  borderWidth: '0'
}))

const rejectButtonStyle = computed(() => ({
  flex: 1,
  height: '88rpx',
  borderRadius: '16rpx',
  fontSize: '32rpx',
  fontWeight: '600',
  borderWidth: '0'
}))

onLoad((options: any) => {
  if (options.id) {
    recordId.value = options.id
    loadDetail()
  }
})

const loadDetail = async (): Promise<void> => {
  loading.value = true
  try {
    const pageSize = 100
    let currentPage = 1
    let totalPages = 1
    let found: WithdrawRecord | undefined

    while (currentPage <= totalPages && !found) {
      const response = await WithdrawAPI.getList({
        page: currentPage,
        pageSize
      })

      const list = response.list || []
      found = list.find(item => item.id === recordId.value)

      if (response.pager && typeof response.pager.pages === 'number') {
        totalPages = response.pager.pages
      } else if (list.length < pageSize) {
        totalPages = currentPage
      }

      currentPage += 1
    }

    if (found) {
      record.value = found
    } else {
      uni.showToast({
        title: t('withdrawDetail.recordNotFound'),
        icon: 'error'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('[提现详情] 获取详情失败:', error)
    uni.showToast({
      title: t('withdrawDetail.loadFailed'),
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
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

const handleApprove = (): void => {
  if (actionLoading.value) return
  approveModal.value = {
    show: true,
    content: t('withdraw.approveConfirmContent')
  }
}

const handleReject = (): void => {
  if (actionLoading.value) return
  rejectModal.value = {
    show: true,
    content: t('withdraw.rejectConfirmContent')
  }
}

const onApproveConfirm = async (): Promise<void> => {
  approveModal.value.show = false
  actionLoading.value = true
  try {
    await WithdrawAPI.approve(recordId.value)
    uni.showToast({
      title: t('withdraw.approveSuccess'),
      icon: 'success'
    })
    // 刷新详情
    await loadDetail()
  } catch (error) {
    console.error('[提现详情] 确认失败:', error)
    uni.showToast({
      title: t('withdraw.approveFailed'),
      icon: 'error'
    })
  } finally {
    actionLoading.value = false
  }
}

const onRejectConfirm = async (): Promise<void> => {
  rejectModal.value.show = false
  actionLoading.value = true
  try {
    await WithdrawAPI.reject(recordId.value)
    uni.showToast({
      title: t('withdraw.rejectSuccess'),
      icon: 'success'
    })
    // 刷新详情
    await loadDetail()
  } catch (error) {
    console.error('[提现详情] 驳回失败:', error)
    uni.showToast({
      title: t('withdraw.rejectFailed'),
      icon: 'error'
    })
  } finally {
    actionLoading.value = false
  }
}

const goBack = (): void => {
  uni.navigateBack()
}

const copyUserId = (): void => {
  if (!record.value?.userId) return
  uni.setClipboardData({
    data: record.value.userId,
    success: () => {
      uni.showToast({
        title: t('withdrawDetail.copySuccess'),
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
  margin-top: 88rpx;
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

.detail-value-address {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 24rpx;
}

.copy-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background-color: rgba(79, 70, 229, 0.08);
  border: 1rpx solid rgba(79, 70, 229, 0.2);
  border-radius: 10rpx;
  transition: all 0.2s;
}

.copy-btn:active {
  background-color: rgba(79, 70, 229, 0.15);
  transform: scale(0.98);
}

.copy-text {
  font-size: 24rpx;
  color: var(--c-main);
  font-weight: 500;
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

.detail-info-status.confirming {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.detail-info-status.pending {
  background-color: rgba(251, 191, 36, 0.1);
  color: #FBBF24;
}

.detail-info-status.initiated {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9CA3AF;
}

.detail-info-status.cancelled,
.detail-info-status.failed,
.detail-info-status.rejected {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.detail-amount-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 0 8rpx;
}

.detail-amount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: rgba(79, 70, 229, 0.06);
  border-radius: 12rpx;
}

.detail-amount-label {
  font-size: 28rpx;
  color: var(--t-regular);
}

.detail-amount-value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--c-main);
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background-color: rgba(79, 70, 229, 0.08);
  border: 1rpx solid rgba(79, 70, 229, 0.2);
  border-radius: 12rpx;
  transition: all 0.2s;
  align-self: flex-start;
}

.link-btn:active {
  background-color: rgba(79, 70, 229, 0.15);
  transform: scale(0.98);
}

.link-text {
  font-size: 26rpx;
  color: var(--c-main);
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
  padding: 0 8rpx;
}
</style>
