/**
 * 交易相关接口
 */

import request from '../index'
import type {
  ApiResponse,
  TradeListParams,
  TradeListResponse,
  TradeItemListParams,
  TradeItemListResponse
} from '@/types/api'

const TradeAPI = {
  /**
   * 获取交易记录列表
   * @param params 查询参数
   * @param signal 取消信号
   * @returns 交易记录列表
   */
  getList(params: TradeListParams, signal?: AbortSignal): Promise<TradeListResponse> {
    return request.post('/api/mgr/gmall-record/list', params, { signal })
  },

  /**
   * 获取物品详情列表
   * @param params 查询参数
   * @param signal 取消信号
   * @returns 物品详情列表
   */
  getItemList(params: TradeItemListParams, signal?: AbortSignal): Promise<TradeItemListResponse> {
    return request.post('/api/mgr/gmall-record/details/list', params, { signal })
  },

  /**
   * 结算恢复
   * @param id 交易记录ID
   * @returns 操作结果
   */
  settlementResume(id: string): Promise<ApiResponse> {
    return request.post(`/api/mgr/gmall-record/${id}/settlement/resume`, {})
  },

  /**
   * 结算同步
   * @param id 交易记录ID
   * @returns 操作结果
   */
  settlementSync(id: string): Promise<ApiResponse> {
    return request.post(`/api/mgr/gmall-record/${id}/settlement/sync`, {})
  },

  /**
   * 获取自营交易记录列表
   * @param params 查询参数
   * @param signal 取消信号
   * @returns 自营交易记录列表
   */
  getSelfList(params: TradeListParams, signal?: AbortSignal): Promise<TradeListResponse> {
    return request.post('/api/mgr/gmall-record/self/list', params, { signal })
  },

  /**
   * 取消交易
   * @param id 交易记录ID
   * @param code 取消原因代码
   * @returns 操作结果
   */
  cancelTrade(id: string, code: number): Promise<ApiResponse> {
    return request.post(`/api/mgr/gmall-record/${id}/cancel`, { code })
  }
}

export default TradeAPI
