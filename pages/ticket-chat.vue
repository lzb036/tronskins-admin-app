<template>
  <view :class="['page', themeClass]" :key="`ticket-chat-${appStore.language}`">
    <!-- 顶部标题栏 -->
    <view class="header-fixed" :style="headerFixedStyle">
      <view class="header-content">
        <view class="header-left" @click="goBack">
          <view class="back-btn">
            <u-icon name="arrow-left" size="20" color="var(--t-primary)"></u-icon>
          </view>
        </view>
        <view class="header-center">
          <text class="header-title">{{ chatTitle }}</text>
          <view class="header-subtitle">
            <text class="ticket-id">#{{ ticketId }}</text>
            <view class="status-badge" :class="getStatusClass(record?.status ?? 0)">
              <text class="status-text">{{ getStatusLabel(record?.status ?? 0) }}</text>
            </view>
          </view>
        </view>
        <view class="header-right">
           <!-- 占位保持平衡 -->
           <view v-if="record?.isTech" class="tech-tag">
             <u-icon name="setting-fill" size="12" color="#3B82F6"></u-icon>
           </view>
        </view>
      </view>
    </view>

    <!-- 聊天内容区域 -->
    <scroll-view
      scroll-y
      class="chat-content"
      :style="chatContentStyle"
      :scroll-into-view="scrollIntoView"
      :scroll-with-animation="true"
      @scrolltoupper="onScrollToUpper"
    >
      <view class="chat-container">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-wrapper">
          <u-loading-icon mode="circle" size="40" color="var(--t-light)"></u-loading-icon>
        </view>

        <!-- 聊天消息列表 -->
        <view v-else class="message-list">
          <!-- 原始工单消息 (用户) -->
          <view v-if="record" id="msg-original" class="message-group user">
            <view class="message-row">
              <view class="avatar user-avatar">
                <text class="avatar-text">{{ (record.createName || record.creator || 'U').substring(0, 1).toUpperCase() }}</text>
              </view>
              <view class="message-body">
                <view class="sender-info">
                  <text class="message-time">{{ formatTime(record.createTime) }}</text>
                  <text class="sender-name">{{ record.createName || record.creator }}</text>
                </view>
                <view class="message-bubble">
                  <view class="bubble-title" v-if="record.title">{{ record.title }}</view>
                  <text class="message-text">{{ record.context }}</text>
                  
                  <!-- 错误信息 -->
                  <view v-if="record.errors && record.errors.length" class="error-container">
                    <view v-for="(error, idx) in record.errors" :key="idx" class="error-tag">
                      <u-icon name="info-circle-fill" size="14" color="#EF4444"></u-icon>
                      <text>{{ error }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 回复消息列表 -->
          <view
            v-for="(reply, index) in replies"
            :key="reply.id"
            :id="`msg-${index}`"
            :class="['message-group', reply.isAdmin ? 'admin' : 'user']"
          >
            <view class="message-row">
              <view class="avatar" :class="reply.isAdmin ? 'admin-avatar' : 'user-avatar'">
                <u-icon v-if="reply.isAdmin" name="server-fill" size="18" color="#FFFFFF"></u-icon>
                <text v-else class="avatar-text">{{ (reply.createName || 'U').substring(0, 1).toUpperCase() }}</text>
              </view>

              <view class="message-body">
                <view class="sender-info">
                  <text class="message-time">{{ formatTime(reply.createTime) }}</text>
                  <text class="sender-name">{{ reply.isAdmin ? t('ticketDetail.admin') : reply.createName }}</text>
                </view>
                <view class="message-bubble">
                  <text class="message-text" v-if="reply.context">{{ reply.context }}</text>
                  
                  <!-- 图片附件 -->
                  <view v-if="reply.images && reply.images.length" class="image-grid" :class="{'single': reply.images.length === 1}">
                    <view
                      v-for="(img, imgIndex) in reply.images"
                      :key="imgIndex"
                      class="image-wrapper"
                      @click.stop="previewImage(img, reply.images)"
                    >
                      <image
                        class="chat-image"
                        :src="img"
                        mode="aspectFill"
                        lazy-load
                      ></image>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="replies.length === 0 && !record" class="empty-state">
            <u-empty mode="message" :text="t('ticketChat.noMessages')"></u-empty>
          </view>
        </view>
        
        <!-- 底部垫片 -->
        <view class="bottom-spacer"></view>
      </view>
    </scroll-view>

    <!-- 底部输入区域 -->
    <view class="input-area" :style="inputAreaStyle">
      <!-- 图片预览栏 -->
      <scroll-view v-if="uploadedImages.length > 0" scroll-x class="image-preview-bar">
        <view class="preview-list">
          <view v-for="(img, idx) in uploadedImages" :key="img.id" class="preview-item">
            <image :src="img.image" mode="aspectFill" class="preview-thumb"></image>
            <view class="remove-btn" @click="removeImage(idx)">
              <u-icon name="close" size="10" color="#FFFFFF"></u-icon>
            </view>
          </view>
          <view v-if="uploadingImage" class="preview-item uploading">
            <u-loading-icon mode="circle" size="16" color="var(--c-main)"></u-loading-icon>
          </view>
        </view>
      </scroll-view>

      <view class="input-toolbar">
        <view class="tool-btn" @click="chooseImage">
          <u-icon name="photo" size="24" color="var(--t-regular)"></u-icon>
        </view>
        
        <view class="input-box">
          <textarea
            v-model="inputText"
            class="chat-input"
            :placeholder="t('ticketChat.inputPlaceholder')"
            :maxlength="1000"
            :show-confirm-bar="false"
            :adjust-position="false"
            cursor-spacing="20"
          />
        </view>
        
        <view
          class="send-btn"
          :class="{ 'active': canSend, 'loading': sending }"
          @click="handleSend"
        >
          <u-loading-icon v-if="sending" mode="circle" size="18" color="#FFFFFF"></u-loading-icon>
          <text v-else class="send-btn-text">{{ t('common.submit') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import TicketAPI from '@/api/modules/ticket'
import type { TicketRecord, TicketReply } from '@/types/api'

const { t, locale } = useI18n()
const appStore = useAppStore()

watch(() => appStore.language, (newLang: string) => {
  locale.value = newLang
})

const themeClass = computed(() => appStore.theme)
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
const headerFixedStyle = {
  paddingTop: `${statusBarHeight}px`
}

const chatContentStyle = computed(() => ({
  height: `${uni.getSystemInfoSync().windowHeight}px`,
  paddingTop: `calc(100rpx + ${statusBarHeight}px)`
}))

const inputAreaStyle = {
  paddingBottom: `calc(env(safe-area-inset-bottom) + 20rpx)`
}

const ticketId = ref('')
const record = ref<TicketRecord | null>(null)
const replies = ref<TicketReply[]>([])
const loading = ref(false)
const scrollIntoView = ref('')

// 输入相关状态
const inputText = ref('')
const uploadedImages = ref<Array<{ id: string; image: string }>>([])
const uploadingImage = ref(false)
const sending = ref(false)

const chatTitle = computed(() => t('ticketChat.title'))

const canSend = computed(() => {
  return (inputText.value.trim().length > 0 || uploadedImages.value.length > 0) && !sending.value && !uploadingImage.value
})

onLoad((options: any) => {
  if (options.id) {
    ticketId.value = options.id
    loadChatData()
  }
})

const loadChatData = async (): Promise<void> => {
  loading.value = true
  try {
    const [detailResponse, replyResponse] = await Promise.all([
      TicketAPI.getList({ page: 1, pageSize: 100 }),
      TicketAPI.getReplyList(ticketId.value)
    ])

    const found = detailResponse.list.find(item => item.id === ticketId.value)
    if (found) {
      record.value = found
      replies.value = replyResponse.list
      await nextTick()
      scrollToBottom()
    } else {
      uni.showToast({ title: t('ticketDetail.recordNotFound'), icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  } catch (error) {
    console.error('Failed to load chat:', error)
    uni.showToast({ title: t('ticketDetail.loadFailed'), icon: 'none' })
  } finally {
    loading.value = false
  }
}

const scrollToBottom = (): void => {
  const lastIndex = replies.value.length
  scrollIntoView.value = lastIndex > 0 ? `msg-${lastIndex - 1}` : 'msg-original'
}

const formatTime = (timestamp: string): string => {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp) * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const getStatusClass = (status: number): string => {
  const map: Record<number, string> = {
    0: 'pending',
    1: 'replied',
    2: 'resolved',
    3: 'closed'
  }
  return map[status] || 'default'
}

const getStatusLabel = (status: number): string => {
  return t(`ticketStatus.${status}`)
}

const previewImage = (current: string, urls: string[]): void => {
  uni.previewImage({ current, urls })
}

const chooseImage = (): void => {
  if (uploadingImage.value || sending.value) return
  uni.chooseImage({
    count: 9 - uploadedImages.value.length,
    sizeType: ['compressed'],
    success: (res) => {
      res.tempFilePaths.forEach(uploadImage)
    }
  })
}

const uploadImage = async (filePath: string): Promise<void> => {
  uploadingImage.value = true
  try {
    const result = await TicketAPI.uploadReplyImage(filePath)
    if (result && result.length > 0) {
      uploadedImages.value.push(result[0])
    }
  } catch (error) {
    uni.showToast({ title: t('ticketChat.uploadFailed'), icon: 'none' })
  } finally {
    uploadingImage.value = false
  }
}

const removeImage = (index: number): void => {
  uploadedImages.value.splice(index, 1)
}

const handleSend = async (): Promise<void> => {
  if (!canSend.value || sending.value) return
  
  const content = inputText.value.trim()
  sending.value = true
  try {
    const replyAttIds = uploadedImages.value.map(img => img.id)
    await TicketAPI.addReply({
      ticketId: ticketId.value,
      replyAttIds,
      context: content
    })
    
    inputText.value = ''
    uploadedImages.value = []
    await loadChatData()
    uni.showToast({ title: t('ticketChat.sendSuccess'), icon: 'success' })
  } catch (error) {
    uni.showToast({ title: t('ticketChat.sendFailed'), icon: 'none' })
  } finally {
    sending.value = false
  }
}

const goBack = () => uni.navigateBack()
const onScrollToUpper = () => { /* Load more if needed */ }
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: var(--c-bg);
  
  &.light {
    --c-bg: #F5F7FA;
    --c-card: #FFFFFF;
    --c-main: #6366F1;
    --c-main-light: #EEF2FF;
    --t-primary: #1F2937;
    --t-regular: #4B5563;
    --t-light: #9CA3AF;
    --c-border: #E5E7EB;
    --c-input-bg: #F3F4F6;
    --c-bubble-user: #FFFFFF;
    --c-bubble-admin: #6366F1;
    --t-bubble-user: #1F2937;
    --t-bubble-admin: #FFFFFF;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  &.dark {
    --c-bg: #111827;
    --c-card: #1F2937;
    --c-main: #818CF8;
    --c-main-light: rgba(129, 140, 248, 0.1);
    --t-primary: #F9FAFB;
    --t-regular: #D1D5DB;
    --t-light: #6B7280;
    --c-border: #374151;
    --c-input-bg: #111827;
    --c-bubble-user: #374151;
    --c-bubble-admin: #6366F1;
    --t-bubble-user: #F3F4F6;
    --t-bubble-admin: #FFFFFF;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  }
}

/* Header */
.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(var(--c-card), 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--c-border);
  background: var(--c-card);
}

.header-content {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.header-left, .header-right {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  &:active { background-color: var(--c-border); }
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--t-primary);
}

.header-subtitle {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 2rpx;
}

.ticket-id {
  font-size: 20rpx;
  color: var(--t-light);
}

.status-badge {
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-size: 18rpx;
  font-weight: 500;
  
  &.pending { background: #FFF7ED; color: #F59E0B; }
  &.replied { background: #ECFDF5; color: #10B981; }
  &.resolved { background: #E0F2FE; color: #0EA5E9; }
  &.closed { background: #F3F4F6; color: #6B7280; }
}

.page.dark .status-badge {
  &.pending { background: rgba(245, 158, 11, 0.1); }
  &.replied { background: rgba(16, 185, 129, 0.1); }
  &.resolved { background: rgba(14, 165, 233, 0.1); }
  &.closed { background: rgba(107, 114, 128, 0.1); }
}

.tech-tag {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #EFF6FF;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat Area */
.chat-content {
  /* 确保 Web 端显示滚动条 */
  :deep(::-webkit-scrollbar) {
    display: block;
    width: 6px !important;
    height: 6px !important;
    background-color: transparent;
  }
  
  :deep(::-webkit-scrollbar-thumb) {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
}

.page.dark .chat-content {
  :deep(::-webkit-scrollbar-thumb) {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.chat-container {
  padding: 20rpx 24rpx;
}

.message-group {
  margin-bottom: 24rpx;
  
  .message-row {
    display: flex;
    gap: 16rpx;
    align-items: flex-start;
  }
  
  .avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.user-avatar {
      background: var(--c-input-bg);
      border: 1px solid var(--c-border);
      .avatar-text { color: var(--t-regular); font-weight: 600; font-size: 28rpx; }
    }
    
    &.admin-avatar {
      background: var(--c-main);
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
    }
  }
  
  .message-body {
    flex: 1;
    max-width: 70%;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }
  
  .sender-info {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-left: 8rpx;
  }

  .message-time {
    font-size: 20rpx;
    color: var(--t-light);
  }

  .sender-name {
    font-size: 20rpx;
    color: var(--t-light);
  }
  
  .message-bubble {
    padding: 16rpx 24rpx;
    border-radius: 24rpx;
    position: relative;
    box-shadow: var(--shadow-sm);
    word-break: break-word;
  }
  
  &.user {
    .message-row { flex-direction: row; } // User on left (Customer)
    .message-bubble {
      background: var(--c-bubble-user);
      color: var(--t-bubble-user);
      border-top-left-radius: 4rpx;
    }
  }
  
  &.admin {
    .message-row { flex-direction: row-reverse; } // Admin on right (Me)
    .message-body { align-items: flex-end; }
    .sender-info { margin-right: 8rpx; flex-direction: row-reverse; }
    .message-bubble {
      background: var(--c-bubble-admin);
      color: var(--t-bubble-admin);
      border-top-right-radius: 4rpx;
    }
  }
}

.bubble-title {
  font-weight: 600;
  margin-bottom: 8rpx;
  font-size: 28rpx;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.5;
}

/* Images in chat */
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
  
  .image-wrapper {
    width: 140rpx;
    height: 140rpx;
    border-radius: 12rpx;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  &.single .image-wrapper {
    width: 320rpx;
    height: auto;
    min-height: 200rpx;
    max-height: 400rpx;
    
    .chat-image { height: 100%; width: 100%; }
  }
  
  .chat-image {
    width: 100%;
    height: 100%;
  }
}

/* Errors */
.error-container {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1px solid rgba(0,0,0,0.05);
}
.error-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #EF4444;
  font-size: 24rpx;
  margin-top: 4rpx;
}

/* Input Area */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--c-card);
  box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
  z-index: 99;
}

.image-preview-bar {
  border-bottom: 1px solid var(--c-border);
  padding: 16rpx 24rpx;
  white-space: nowrap;
  
  .preview-list {
    display: flex;
    gap: 16rpx;
  }
  
  .preview-item {
    width: 100rpx;
    height: 100rpx;
    border-radius: 12rpx;
    overflow: hidden;
    position: relative;
    border: 1px solid var(--c-border);
    flex-shrink: 0;
    
    &.uploading {
      background: var(--c-input-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .preview-thumb {
    width: 100%;
    height: 100%;
  }
  
  .remove-btn {
    position: absolute;
    top: 4rpx;
    right: 4rpx;
    background: rgba(0,0,0,0.5);
    border-radius: 50%;
    width: 32rpx;
    height: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.input-toolbar {
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.tool-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--t-regular);
  &:active { background-color: var(--c-input-bg); }
}

.input-box {
  flex: 1;
  background: var(--c-input-bg);
  border-radius: 36rpx;
  padding: 10rpx 20rpx;
  height: 146rpx;
}

.chat-input {
  width: 100%;
  height: 126rpx;
  font-size: 28rpx;
  color: var(--t-primary);
  line-height: 1.5;
}

.send-btn {
  width: 88rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: var(--c-input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;

  &.active {
    background: var(--c-main);
    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
    transform: scale(1.05);

    .send-btn-text {
      color: #FFFFFF;
    }
  }

  &.loading {
    opacity: 0.8;
    transform: scale(1);
  }

  .send-btn-text {
    font-size: 26rpx;
    color: var(--t-light);
  }
}

.bottom-spacer {
  height: 300rpx;
}
</style>
