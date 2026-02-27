/**
 * Ticket related APIs
 */

import request from '../index'
import { getCurrentBaseURL } from '@/utils/baseurl'
import { getToken, getAuthHeaderName } from '../config'
import type { TicketListParams, TicketListResponse, TicketReplyListResponse } from '@/types/api'

const TicketAPI = {
  /**
   * Fetch ticket list
   * @param params Query params
   * @param signal Abort signal
   * @returns Ticket list
   */
  getList(params: TicketListParams, signal?: AbortSignal): Promise<TicketListResponse> {
    return request.post('/api/mgr/gmall-ticket/list', params, { signal })
  },

  /**
   * Enable technical support for ticket
   * @param ticketId Ticket ID
   * @returns Response
   */
  enableTechSupport(ticketId: string): Promise<any> {
    return request.put(`/api/mgr/gmall-ticket/${ticketId}/technical/support`)
  },

  /**
   * Cancel technical support for ticket
   * @param ticketId Ticket ID
   * @returns Response
   */
  cancelTechSupport(ticketId: string): Promise<any> {
    return request.put(`/api/mgr/gmall-ticket/${ticketId}/technical/cancel`)
  },

  /**
   * Ignore ticket
   * @param ticketId Ticket ID
   * @returns Response
   */
  ignoreTicket(ticketId: string): Promise<any> {
    return request.put(`/api/mgr/gmall-ticket/${ticketId}/ignore`)
  },

  /**
   * Fetch ticket reply list
   * @param ticketId Ticket ID
   * @returns Reply list
   */
  getReplyList(ticketId: string): Promise<TicketReplyListResponse> {
    return request.post('/api/mgr/gmall-ticket/reply/list', { ticketId })
  },

  /**
   * Upload reply image
   * @param filePath Image file path
   * @returns Upload response with image id and url
   */
  uploadReplyImage(filePath: string): Promise<{ id: string; image: string; createTime: string }[]> {
    return new Promise((resolve, reject) => {
      const token = getToken()
      const authHeader = getAuthHeaderName()

      uni.uploadFile({
        url: getCurrentBaseURL() + '/api/mgr/gmall-ticket/reply/upload',
        filePath,
        name: 'file',
        header: {
          [authHeader]: token || ''
        },
        success: (res: any) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.datas)
            } else {
              reject(new Error(data.message || 'Upload failed'))
            }
          } else {
            reject(new Error(`Upload failed with status ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * Add reply to ticket
   * @param data Reply data
   * @returns Response
   */
  addReply(data: { ticketId: string; replyAttIds: string[]; context: string }): Promise<any> {
    return request.post('/api/mgr/gmall-ticket/reply/add', data)
  }
}

export default TicketAPI
