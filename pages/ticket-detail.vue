<template>
  <view :class="['page', themeClass]" :key="`ticket-detail-${appStore.language}`">
    <!-- 顶部标题栏 -->
    <view class="header-fixed" :style="headerFixedStyle">
      <view class="header-card">
        <view class="header-left" @click="goBack">
          <u-icon name="arrow-left" size="20" color="var(--t-primary)"></u-icon>
        </view>
        <view class="header-title">
          <text class="header-title-text">{{ t('ticketDetail.title') }}</text>
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
            <view class="detail-section-title">{{ t('ticketDetail.basicInfo') }}</view>
            <view class="detail-info-grid">
              <view class="detail-info-item">
                <text class="detail-info-label">{{ t('ticketDetail.ticketId') }}</text>
                <text class="detail-info-value">#{{ record.id }}</text>
              </view>
              <view class="detail-info-item">
                <text class="detail-info-label">{{ t('ticketDetail.status') }}</text>
                <view :class="['detail-info-status', getStatusClass(record.status)]">
                  {{ getStatusLabel(record.status) }}
                </view>
              </view>
              <view class="detail-info-item">
                <text class="detail-info-label">{{ t('ticket.creator') }}</text>
                <text class="detail-info-value">{{ record.createName || record.creator }}</text>
              </view>
              <view v-if="record.steamId" class="detail-info-item">
                <text class="detail-info-label">{{ t('ticket.steamId') }}</text>
                <text class="detail-info-value">{{ record.steamId }}</text>
              </view>
              <view class="detail-info-item full">
                <text class="detail-info-label">{{ t('ticketDetail.ticketTitle') }}</text>
                <text class="detail-info-value">{{ record.title }}</text>
              </view>
            </view>
          </view>

          <!-- 反馈内容 -->
          <view class="detail-section">
            <view class="detail-section-title">{{ t('ticketDetail.contentInfo') }}</view>
            <view class="detail-content-card">
              <text class="detail-content-text">{{ record.context }}</text>
            </view>
          </view>

          <!-- 错误信息 -->
          <view v-if="record.errors && record.errors.length" class="detail-section">
            <view class="detail-section-title">{{ t('ticket.errors') }}</view>
            <view class="detail-error-list">
              <view v-for="(error, index) in record.errors" :key="index" class="detail-error-item">
                <text>{{ error }}</text>
              </view>
            </view>
          </view>

          <!-- 标签信息 -->
          <view v-if="record.isTech || record.isIgnore" class="detail-section">
            <view class="detail-section-title">{{ t('ticketDetail.tags') }}</view>
            <view class="detail-tags">
              <view v-if="record.isTech" class="tag tech">{{ t('ticket.techSupport') }}</view>
              <view v-if="record.isIgnore" class="tag ignored">{{ t('ticket.ignored') }}</view>
            </view>
          </view>

          <!-- 时间信息 -->
          <view class="detail-section">
            <view class="detail-section-title">{{ t('ticketDetail.timeInfo') }}</view>
            <view class="detail-info-grid">
              <view class="detail-info-item full">
                <text class="detail-info-label">{{ t('ticket.createTime') }}</text>
                <text class="detail-info-value">{{ formatTime(record.createTime) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view v-if="record" class="action-buttons">
          <!-- 查看聊天按钮 -->
          <view class="action-btn chat-btn" @click="handleChat">
            <u-icon name="chat-fill" size="18" color="#FFFFFF"></u-icon>
            <text>{{ t('ticketDetail.viewChat') }}</text>
          </view>

          <!-- 其他操作按钮 -->
          <view v-if="record.status === 0" class="action-buttons-row">
            <view
              :class="['action-btn', 'tech-btn', { 'active': record.isTech }]"
              @click="handleTechSupport"
            >
              <text>{{ record.isTech ? t('ticket.cancelTechSupport') : t('ticket.techSupport') }}</text>
            </view>
            <view
              v-if="!record.isIgnore"
              class="action-btn ignore-btn"
              @click="handleIgnore"
            >
              <text>{{ t('ticket.ignore') }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 技术支持确认弹窗 -->
    <u-modal
      :show="techModal.show"
      :title="techModal.isTech ? t('ticket.cancelTechSupportTitle') : t('ticket.techSupportTitle')"
      :content="techModal.isTech ? t('ticket.cancelTechSupportConfirm') : t('ticket.techSupportConfirm')"
      :show-cancel-button="true"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      :confirm-color="techModal.isTech ? '#EF4444' : '#3B82F6'"
      @confirm="onTechModalConfirm"
      @cancel="techModal.show = false"
    ></u-modal>

    <!-- 忽略确认弹窗 -->
    <u-modal
      :show="ignoreModal.show"
      :title="t('ticket.ignoreTitle')"
      :content="t('ticket.ignoreConfirm')"
      :show-cancel-button="true"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      confirm-color="#6B7280"
      @confirm="onIgnoreModalConfirm"
      @cancel="ignoreModal.show = false"
    ></u-modal>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import TicketAPI from '@/api/modules/ticket'
import type { TicketRecord } from '@/types/api'

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

const ticketId = ref('')
const record = ref<TicketRecord | null>(null)
const loading = ref(false)

// 技术支持弹窗状态
const techModal = ref({
  show: false,
  isTech: false
})

// 忽略弹窗状态
const ignoreModal = ref({
  show: false
})

onLoad((options: any) => {
  if (options.id) {
    ticketId.value = options.id
    loadDetail()
  }
})

const loadDetail = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await TicketAPI.getList({
      page: 1,
      pageSize: 100
    })

    const found = response.list.find(item => item.id === ticketId.value)
    if (found) {
      record.value = found
    } else {
      uni.showToast({
        title: t('ticketDetail.recordNotFound'),
        icon: 'error'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('[工单详情] 获取详情失败:', error)
    uni.showToast({
      title: t('ticketDetail.loadFailed'),
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
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

const handleTechSupport = (): void => {
  if (!record.value) return
  techModal.value = {
    show: true,
    isTech: record.value.isTech
  }
}

const onTechModalConfirm = async (): Promise<void> => {
  const isTech = techModal.value.isTech
  techModal.value.show = false

  try {
    if (isTech) {
      await TicketAPI.cancelTechSupport(ticketId.value)
      uni.showToast({
        title: t('ticket.cancelTechSupportSuccess'),
        icon: 'success'
      })
    } else {
      await TicketAPI.enableTechSupport(ticketId.value)
      uni.showToast({
        title: t('ticket.techSupportSuccess'),
        icon: 'success'
      })
    }
    // 刷新详情
    await loadDetail()
  } catch (error) {
    console.error('[工单详情] 技术支持操作失败:', error)
    uni.showToast({
      title: t('common.error'),
      icon: 'error'
    })
  }
}

const handleIgnore = (): void => {
  ignoreModal.value = {
    show: true
  }
}

const onIgnoreModalConfirm = async (): Promise<void> => {
  ignoreModal.value.show = false

  try {
    await TicketAPI.ignoreTicket(ticketId.value)
    uni.showToast({
      title: t('ticket.ignoreSuccess'),
      icon: 'success'
    })
    // 刷新详情
    await loadDetail()
  } catch (error) {
    console.error('[工单详情] 忽略失败:', error)
    uni.showToast({
      title: t('common.error'),
      icon: 'error'
    })
  }
}

const goBack = (): void => {
  uni.navigateBack()
}

const handleChat = (): void => {
  uni.navigateTo({
    url: `/pages/ticket-chat?id=${ticketId.value}`
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

.detail-info-status {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.detail-info-status.pending {
  background-color: rgba(251, 191, 36, 0.12);
  color: #F59E0B;
}

.detail-info-status.replied {
  background-color: rgba(16, 185, 129, 0.12);
  color: #10B981;
}

.detail-info-status.resolved {
  background-color: rgba(14, 165, 233, 0.12);
  color: #0EA5E9;
}

.detail-info-status.closed {
  background-color: rgba(148, 163, 184, 0.2);
  color: #64748B;
}

.detail-info-status.default {
  background-color: rgba(156, 163, 175, 0.12);
  color: #9CA3AF;
}

.detail-content-card {
  padding: 24rpx;
  background-color: rgba(79, 70, 229, 0.06);
  border-radius: 16rpx;
}

.detail-content-text {
  font-size: 28rpx;
  color: var(--t-primary);
  line-height: 1.6;
  word-break: break-word;
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

.detail-tags {
  padding: 0 8rpx;
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.tag {
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.tag.tech {
  background-color: rgba(59, 130, 246, 0.12);
  color: #3B82F6;
}

.tag.ignored {
  background-color: rgba(239, 68, 68, 0.12);
  color: #EF4444;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 32rpx;
  padding: 0 8rpx;
}

.action-buttons-row {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.2s;
}

.action-buttons-row .action-btn {
  flex: 1;
}

.action-btn text {
  white-space: nowrap;
}

.action-btn:active {
  transform: scale(0.97);
}

.chat-btn {
  width: 100%;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: #FFFFFF;
}

.chat-btn:active {
  opacity: 0.9;
}

.tech-btn {
  background: linear-gradient(135deg, #3B82F6 0%, rgba(59, 130, 246, 0.85) 100%);
  color: #FFFFFF;
}

.tech-btn.active {
  background: linear-gradient(135deg, #EF4444 0%, rgba(239, 68, 68, 0.85) 100%);
  color: #FFFFFF;
}

.tech-btn:active {
  opacity: 0.9;
}

.ignore-btn {
  background: linear-gradient(135deg, #6B7280 0%, rgba(107, 114, 128, 0.85) 100%);
  color: #FFFFFF;
}

.ignore-btn:active {
  opacity: 0.9;
}
</style>
