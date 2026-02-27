/**
 * 认证相关接口
 */

import request from '../index'
import type { LoginParams, LoginResponse, RefreshTokenResponse } from '@/types/api'

const AuthAPI = {
  /**
   * 后台管理员登录
   * @param data 登录数据
   * @returns 登录响应
   */
  login(data: LoginParams): Promise<LoginResponse> {
    return request.post('/api/app/auth-manager', data, {
      autoToken: false,
      skipAuthRefresh: true,
      withCredentials: true
    })
  },

  /**
   * 刷新 Access Token（Refresh Token 通过 HttpOnly Cookie 自动携带）
   */
  refresh(): Promise<RefreshTokenResponse> {
    return request.post('/api/app/auth-manager/refresh', {}, {
      autoToken: false,
      skipAuthRefresh: true,
      withCredentials: true
    })
  },

  /**
   * 退出登录
   * @returns 退出登录响应
   */
  logout(): Promise<unknown> {
    return request.post('/api/mgr/auth/logout', {}, {
      skipAuthRefresh: true
    })
  }
}

export default AuthAPI
