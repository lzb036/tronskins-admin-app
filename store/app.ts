import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'
export type LanguageMode = 'zh-CN' | 'en-US'
export type ListTabKey = 'trade' | 'withdraw' | 'ticket'

// 类型守卫函数
function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function isLanguageMode(value: unknown): value is LanguageMode {
  return value === 'zh-CN' || value === 'en-US'
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>('light')
  const language = ref<LanguageMode>('zh-CN')
  const listTabInitialized = ref<Record<ListTabKey, boolean>>({
    trade: false,
    withdraw: false,
    ticket: false
  })
  const listTabCache = ref<Partial<Record<ListTabKey, unknown>>>({})

  const setTheme = (newTheme: ThemeMode): void => {
    theme.value = newTheme
  }

  const setLanguage = (newLanguage: LanguageMode): void => {
    language.value = newLanguage
  }

  const toggleTheme = (): void => {
    const newTheme: ThemeMode = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const toggleLanguage = (): void => {
    const newLanguage: LanguageMode = language.value === 'zh-CN' ? 'en-US' : 'zh-CN'
    setLanguage(newLanguage)
  }

  const initTheme = (): void => {
    try {
      const savedTheme = uni.getStorageSync('app_theme')
      const savedLanguage = uni.getStorageSync('app_language')

      if (isThemeMode(savedTheme)) {
        theme.value = savedTheme
      }
      if (isLanguageMode(savedLanguage)) {
        language.value = savedLanguage
      }
    } catch {
      // 存储读取失败，静默处理
    }
  }

  const hasListTabInitialized = (tab: ListTabKey): boolean => {
    return !!listTabInitialized.value[tab]
  }

  const markListTabInitialized = (tab: ListTabKey): void => {
    listTabInitialized.value[tab] = true
  }

  const resetListTabInitialized = (tab?: ListTabKey): void => {
    if (tab) {
      listTabInitialized.value[tab] = false
      delete listTabCache.value[tab]
      return
    }
    listTabInitialized.value = {
      trade: false,
      withdraw: false,
      ticket: false
    }
    listTabCache.value = {}
  }

  const setListTabCache = <T>(tab: ListTabKey, payload: T): void => {
    listTabCache.value[tab] = payload
  }

  const getListTabCache = <T>(tab: ListTabKey): T | null => {
    const cache = listTabCache.value[tab]
    if (typeof cache === 'undefined') return null
    return cache as T
  }

  watch(theme, (newTheme: ThemeMode) => {
    try {
      uni.setStorageSync('app_theme', newTheme)
    } catch {
      // 存储写入失败，静默处理
    }
  })

  watch(language, (newLanguage: LanguageMode) => {
    try {
      uni.setStorageSync('app_language', newLanguage)
    } catch {
      // 存储写入失败，静默处理
    }
  })

  return {
    theme,
    language,
    listTabInitialized,
    listTabCache,
    setTheme,
    setLanguage,
    toggleTheme,
    toggleLanguage,
    initTheme,
    hasListTabInitialized,
    markListTabInitialized,
    resetListTabInitialized,
    setListTabCache,
    getListTabCache
  }
})

// 持久化配置
export const piniaPluginPersistedstate = {
  key: 'app-store',
  paths: ['theme', 'language']
}
