<template>
  <view :class="['profile-container', themeClass]">
    <view class="bg-layer">
      <view class="bg-orb orb-main"></view>
      <view class="bg-orb orb-accent"></view>
      <view class="bg-grid"></view>
    </view>

    <view class="top-bar" :style="topBarStyle">
      <view class="switch-group">
        <view class="switch-btn" @click="handleLanguageToggle">
          <text class="switch-icon">{{ currentLang }}</text>
        </view>
        <view class="switch-btn" @click="handleThemeToggle">
          <text class="switch-icon">{{ appStore.theme === 'light' ? '☀️' : '🌙' }}</text>
        </view>
        <view class="switch-btn" @click="handleAuthDebug">
          <text class="switch-icon">🔐</text>
        </view>
        <view class="switch-btn" @click="handleBaseURLSetting">
          <text class="switch-icon">URL</text>
        </view>
      </view>
    </view>

    <view class="content">
      <view v-if="userInfo" class="user-card">
        <view class="user-header">
          <view class="avatar-wrapper">
            <view class="avatar-placeholder">
              <text class="avatar-text">{{ userInfo?.username?.charAt(0)?.toUpperCase() || '?' }}</text>
            </view>
          </view>
          <view class="user-info">
            <text class="username">{{ userInfo?.nickname || userInfo?.realname || userInfo?.username || '-' }}</text>
            <text class="user-email">{{ userInfo?.email || '-' }}</text>
          </view>
        </view>

        <view class="info-sections">
          <view class="info-section">
            <view class="section-title">{{ t('profile.accountInfo') }}</view>
            <view class="info-list">
              <view class="info-item">
                <text class="info-label">{{ t('profile.username') }}</text>
                <text class="info-value">{{ userInfo?.username || '-' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">{{ t('profile.realname') }}</text>
                <text class="info-value">{{ userInfo?.realname || '-' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">{{ t('profile.email') }}</text>
                <text class="info-value">{{ userInfo?.email || '-' }}</text>
              </view>
            </view>
          </view>

          <view class="info-section">
            <view class="section-title">{{ t('profile.roleInfo') }}</view>
            <view class="info-list">
              <view class="info-item">
                <text class="info-label">{{ t('profile.roles') }}</text>
                <view class="role-tags">
                  <text v-if="userInfo?.roles?.length" v-for="role in userInfo.roles" :key="role.id" class="role-tag">
                    {{ role.name }}
                  </text>
                  <text v-else class="info-value">{{ t('profile.noRoles') }}</text>
                </view>
              </view>
              <view class="info-item">
                <text class="info-label">{{ t('profile.accountStatus') }}</text>
                <view :class="['status-badge', userInfo?.accountLocked ? 'locked' : 'normal']">
                  {{ userInfo?.accountLocked ? t('status.locked') : t('status.normal') }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="action-section">
        <u-button
          type="primary"
          @click="showLogoutModal = true"
          :custom-style="buttonStyle"
        >
          {{ t('profile.logout') }}
        </u-button>
      </view>
    </view>

    <u-modal
      :show="showLogoutModal"
      :title="t('profile.logoutConfirm')"
      :content="t('profile.logoutMessage')"
      :show-cancel-button="true"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      custom-class="theme-modal"
      confirm-color="#EF4444"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
    ></u-modal>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { redirectToLogin } from '@/utils/navigation'
import AuthAPI from '@/api/modules/auth'
import UserAPI from '@/api/modules/user'

const { t, locale } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()

const themeClass = computed(() => appStore.theme)
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
const topBarStyle = {
  paddingTop: `calc(32rpx + ${statusBarHeight}px)`
}
const userInfo = computed(() => userStore.userInfo)

const showLogoutModal = ref(false)

const currentLang = computed(() => {
  return appStore.language === 'zh-CN' ? 'CN' : 'EN'
})

const buttonStyle = computed(() => ({
  width: '100%',
  height: '88rpx',
  borderRadius: '16rpx',
  fontSize: '32rpx',
  fontWeight: '500',
  backgroundColor: 'var(--c-main)',
  border: 'none'
}))

const fetchUserInfo = async (): Promise<void> => {
  try {
    const userInfoResponse = await UserAPI.getUserInfo()
    userStore.setUserInfo({
      id: userInfoResponse.id,
      username: userInfoResponse.username,
      nickname: userInfoResponse.nickname,
      realName: userInfoResponse.realname,
      realname: userInfoResponse.realname,
      email: userInfoResponse.email,
      roles: userInfoResponse.roles,
      accountLocked: userInfoResponse.accountLocked
    })
  } catch (error) {
    console.error('[个人中心] 获取用户信息失败', error)
  }
}

onShow(() => {
  if (!userStore.isLoggedIn()) {
    redirectToLogin()
    return
  }
  fetchUserInfo()
})

const handleThemeToggle = (): void => {
  appStore.toggleTheme()
}

const handleLanguageToggle = (): void => {
  appStore.toggleLanguage()
  locale.value = appStore.language
}

const handleBaseURLSetting = (): void => {
  uni.navigateTo({
    url: '/pages/baseurl/index'
  })
}

const handleAuthDebug = (): void => {
  uni.navigateTo({
    url: '/pages/auth-debug/index'
  })
}

const handleLogout = async (): Promise<void> => {
  showLogoutModal.value = false
  try {
    await AuthAPI.logout()
    console.log('[个人中心] 退出登录成功')
  } catch (error) {
    console.log('[个人中心] 退出登录失败（可能是Token已过期）', error)
  }

  userStore.logout()
  appStore.resetListTabInitialized()

  redirectToLogin()
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, var(--c-bg) 0%, var(--c-bg-2) 100%);
}

.profile-container.light {
  --c-bg: #f4f7ff;
  --c-bg-2: #edf2ff;
  --c-card: rgba(255, 255, 255, 0.72);
  --c-main: #3f62ff;
  --c-main-light: rgba(63, 98, 255, 0.12);
  --t-primary: #0f172a;
  --t-regular: #475569;
  --t-secondary: #8090b0;
  --c-border: rgba(132, 158, 225, 0.24);
  --c-shadow: rgba(29, 41, 83, 0.14);
}

.profile-container.dark {
  --c-bg: #070d1a;
  --c-bg-2: #0a1428;
  --c-card: rgba(12, 22, 41, 0.74);
  --c-main: #80a2ff;
  --c-main-light: rgba(128, 162, 255, 0.2);
  --t-primary: #f8fbff;
  --t-regular: #c6d2ea;
  --t-secondary: #7a90b7;
  --c-border: rgba(101, 125, 170, 0.36);
  --c-shadow: rgba(0, 0, 0, 0.34);
}

.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(12rpx);
}

.orb-main {
  width: 620rpx;
  height: 620rpx;
  top: -170rpx;
  right: -180rpx;
  background: radial-gradient(circle, rgba(91, 123, 255, 0.34) 0%, rgba(91, 123, 255, 0) 74%);
}

.orb-accent {
  width: 420rpx;
  height: 420rpx;
  bottom: 80rpx;
  left: -120rpx;
  background: radial-gradient(circle, rgba(33, 184, 255, 0.26) 0%, rgba(33, 184, 255, 0) 76%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.18) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(255, 255, 255, 0.14) 1rpx, transparent 1rpx);
  background-size: 42rpx 42rpx;
}

.top-bar {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  padding: 32rpx 40rpx 0;
}

.switch-group {
  display: flex;
  gap: 16rpx;
}

.switch-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10rpx);
  border: 2rpx solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.switch-btn:active {
  transform: scale(0.92);
  background-color: var(--c-border);
}

.switch-icon {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--t-regular);
}

.content {
  flex: 1;
  position: relative;
  z-index: 2;
  padding: 40rpx;
  padding-bottom: 200rpx;
}

.user-card {
  background-color: var(--c-card);
  backdrop-filter: blur(16rpx);
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  border: 2rpx solid var(--c-border);
  box-shadow: 0 8rpx 32rpx var(--c-shadow);
  margin-bottom: 32rpx;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding-bottom: 32rpx;
  border-bottom: 2rpx solid var(--c-border);
  margin-bottom: 32rpx;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, var(--c-main) 0%, rgba(99, 102, 241, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.username {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--t-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 26rpx;
  color: var(--t-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--t-regular);
  padding-bottom: 8rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: var(--c-bg);
  border-radius: 16rpx;
  border: 2rpx solid var(--c-border);
}

.info-label {
  font-size: 28rpx;
  color: var(--t-regular);
}

.info-value {
  font-size: 28rpx;
  color: var(--t-primary);
  font-weight: 500;
  text-align: right;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: flex-end;
}

.role-tag {
  padding: 8rpx 20rpx;
  background-color: var(--c-main-light);
  border-radius: 8rpx;
  font-size: 24rpx;
  color: var(--c-main);
  font-weight: 500;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-badge.normal {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.locked {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

::v-deep .theme-modal .u-popup__content {
  background: var(--c-card) !important;
  border: 2rpx solid var(--c-border);
  border-radius: 24rpx !important;
  backdrop-filter: blur(16rpx);
  box-shadow: 0 16rpx 40rpx var(--c-shadow);
}

::v-deep .theme-modal .u-modal {
  background: transparent;
}

::v-deep .theme-modal .u-modal__title {
  color: var(--t-primary);
}

::v-deep .theme-modal .u-modal__content__text {
  color: var(--t-regular);
}

::v-deep .theme-modal .u-line {
  border-color: var(--c-border) !important;
}

::v-deep .theme-modal .u-modal__button-group__wrapper--hover {
  background-color: var(--c-main-light);
}
</style>
