/**
 * 提现相关接口
 */

import request from '../index'
import type {
  ApiResponse,
  WithdrawListParams,
  WithdrawListResponse,
  WithdrawRecord
} from '@/types/api'

const WithdrawAPI = {
  /**
   * 获取提现记录列表
   * @param params 查询参数
   * @param signal 取消信号
   * @returns 提现记录列表
   */
  getList(params: WithdrawListParams, signal?: AbortSignal): Promise<WithdrawListResponse> {
    return request.post('/api/mgr/gmall-user/withdraw/list', params, { signal })
  },

  /**
   * 确认提现
   * @param id 提现记录ID
   * @returns 操作结果
   */
  approve(id: string): Promise<ApiResponse> {
    return request.post(`/api/mgr/gmall-user/withdraw/${id}/accept`, {})
  },

  /**
   * 驳回提现
   * @param id 提现记录ID
   * @returns 操作结果
   */
  reject(id: string): Promise<ApiResponse> {
    return request.post(`/api/mgr/gmall-user/withdraw/${id}/reject`, {})
  }
}

export default WithdrawAPI
