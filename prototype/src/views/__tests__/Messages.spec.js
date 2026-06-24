import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Messages from '../Messages.vue'
import ChatRoomList from '../../components/chat/ChatRoomList.vue'
import ChatComposer from '../../components/chat/ChatComposer.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/messages', name: 'messages', component: {} }]
})

vi.mock('../../lib/fixtures', () => ({
  getListings: vi.fn().mockResolvedValue([
    { id: 1, title: 'Test Room', city: 'Taipei', rent: 15000, status: 'published' }
  ]),
  getUsers: vi.fn().mockResolvedValue([
    { id: "tenant1", username: "test_tenant", displayName: "Test Tenant", role: "tenant" },
    { id: "2", username: "test_landlord", displayName: "Test Landlord", role: "landlord" }
  ])
}))

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

  it('matches activeChatRoomId by UUID and sends messages with chatRoomId', async () => {
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

    // Assuming activeChatRoomId matches properly
    expect(wrapper.vm.activeChatRoomId).toBe('abcd-1234')

    // Find the composer component and trigger send
    const composer = wrapper.findComponent(ChatComposer)
    expect(composer.exists()).toBe(true)
    
    await composer.vm.$emit('send', 'Hello world')
    await flushPromises()
    
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
