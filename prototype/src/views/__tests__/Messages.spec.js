import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Messages from '../Messages.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/messages', name: 'messages', component: {} }]
})

describe('Messages.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('riap_user', JSON.stringify({ id: 'tenant1' }))
    // mock global.fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/chat/rooms')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 'abcd-1234', listingId: 1, landlordId: 'landlord1', tenantId: 'tenant1' }
          ])
        })
      }
      if (url.includes('/api/chat/history')) {
        return Promise.resolve({
          json: () => Promise.resolve([])
        })
      }
      if (url.includes('/api/chat/sendMessage')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'msg-1' })
        })
      }
      return Promise.resolve({ json: () => Promise.resolve({}) })
    })

    // Mock WebSocket
    global.WebSocket = vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      send: vi.fn(),
    }))
  })

  it('matches activeThreadId by UUID and sends messages with chatRoomId', async () => {
    // Navigate with UUID in query
    await router.push('/messages?roomId=abcd-1234')

    const wrapper = mount(Messages, {
      global: {
        plugins: [router],
        mocks: {
          $route: { query: { roomId: 'abcd-1234' } }
        }
      }
    })

    await flushPromises()

    // Assuming activeThreadId matches properly
    expect(wrapper.vm.activeThreadId).toBe('abcd-1234')

    // Simulate sending a message
    wrapper.vm.body = 'Hello world'
    await wrapper.vm.send()
    
    // Check if fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat/sendMessage'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chatRoomId: 'abcd-1234',
          content: 'Hello world'
        })
      })
    )
  })
})
