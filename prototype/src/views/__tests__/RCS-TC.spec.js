import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import Messages from '../Messages.vue'
import ListingDetail from '../ListingDetail.vue'

vi.mock('../../lib/fixtures', () => ({
  getListings: vi.fn().mockResolvedValue([
    { id: 1, title: 'Test Room', city: 'Taipei', rent: 15000, status: 'published' }
  ]),
  getUsers: vi.fn().mockResolvedValue([
    { id: "tenant1", username: "test_tenant", displayName: "Test Tenant", role: "tenant" },
    { id: "2", username: "test_landlord", displayName: "Test Landlord", role: "landlord" }
  ])
}))

// DO NOT MOCK fetch or WebSocket as requested by user.

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/messages', name: 'messages', component: Messages }]
})

describe('RCS Integration Tests (Black-box with Real API)', () => {
  let createdRoomId = null;

  beforeAll(() => {
    // We assume the backend is running on http://localhost:8080
    // and tenant1 is our test user.
    localStorage.setItem('riap_user', JSON.stringify({ id: 'tenant1', username: 'Test Tenant', role: 'tenant' }))
  })

  it('RCS-TC01: 建立聊天室測試 (Create chat room)', async () => {
    const wrapper = mount(ListingDetail, {
      global: {
        plugins: [router],
        mocks: {
          $route: { params: { id: '1' } }
        }
      }
    })
    
    // wait for created() to fetch listing fixture
    await flushPromises()

    const pushSpy = vi.spyOn(router, 'push')

    // Find "Contact Landlord" button and click
    const button = wrapper.find('button.primary-button')
    expect(button.exists()).toBe(true)
    await button.trigger('click')

    // wait for API call to complete
    await new Promise(r => setTimeout(r, 1000))
    await flushPromises()

    // It should have pushed to router
    expect(pushSpy).toHaveBeenCalled()
    const callArgs = pushSpy.mock.calls[0][0]
    expect(callArgs).toMatch(/\/messages\?roomId=/)
    
    // Extract created room ID for subsequent tests
    createdRoomId = callArgs.split('=')[1]
    expect(createdRoomId).toBeTruthy()
  })

  it('RCS-TC02: 顯示聊天室列表測試 (Show chat room list)', async () => {
    // Mount messages view
    const wrapper = mount(Messages, {
      global: {
        plugins: [router],
        mocks: {
          $route: { query: { roomId: createdRoomId } }
        }
      }
    })

    // wait for fetchRooms
    await new Promise(r => setTimeout(r, 1000))
    await flushPromises()

    // Check if the chat room list has the room
    const roomList = wrapper.findComponent({ name: 'ChatRoomList' })
    expect(roomList.exists()).toBe(true)
    const items = wrapper.findAll('.thread-item')
    expect(items.length).toBeGreaterThan(0)
    
    wrapper.unmount()
  })

  it('RCS-TC03: 顯示聊天室測試 (Show chat room)', async () => {
    const wrapper = mount(Messages, {
      global: {
        plugins: [router],
        mocks: {
          $route: { query: { roomId: createdRoomId } }
        }
      }
    })

    await new Promise(r => setTimeout(r, 1000))
    await flushPromises()

    // Right panel should have Composer and Stream
    const composer = wrapper.findComponent({ name: 'ChatComposer' })
    const stream = wrapper.findComponent({ name: 'ChatStream' })
    expect(composer.exists()).toBe(true)
    expect(stream.exists()).toBe(true)

    wrapper.unmount()
  })

  it('RCS-TC05 & TC06: 發送與接收訊息測試 (Send and receive messages)', async () => {
    const wrapper = mount(Messages, {
      global: {
        plugins: [router],
        mocks: {
          $route: { query: { roomId: createdRoomId } }
        }
      }
    })

    await new Promise(r => setTimeout(r, 1000))
    await flushPromises()

    const composer = wrapper.findComponent({ name: 'ChatComposer' })
    const input = composer.find('textarea') // ChatComposer uses textarea
    await input.setValue('Integration Test Message')
    const sendBtn = composer.find('button')
    await sendBtn.trigger('click')

    // Wait for API and WebSocket
    await new Promise(r => setTimeout(r, 2000))
    await flushPromises()

    const stream = wrapper.findComponent({ name: 'ChatStream' })
    expect(stream.text()).toContain('Integration Test Message')
    
    wrapper.unmount()
  }, 10000)

  it('RCS-TC07: 顯示歷史紀錄測試 (Show message history)', async () => {
    const wrapper = mount(Messages, {
      global: {
        plugins: [router],
        mocks: {
          $route: { query: { roomId: createdRoomId } }
        }
      }
    })

    await new Promise(r => setTimeout(r, 1000))
    await flushPromises()

    const stream = wrapper.findComponent({ name: 'ChatStream' })
    // The message we sent in previous test should be loaded from history
    expect(stream.text()).toContain('Integration Test Message')
    
    wrapper.unmount()
  })

  it('RCS-TC09: 引用房源資料測試 (Quote listing data)', async () => {
    const wrapper = mount(Messages, {
      global: {
        plugins: [router],
        mocks: {
          $route: { query: { roomId: createdRoomId } }
        }
      }
    })

    await new Promise(r => setTimeout(r, 1000))
    await flushPromises()

    const card = wrapper.find('.conversation-card')
    expect(card.exists()).toBe(true)
    // Check basic data exists
    expect(card.text()).toContain('套房') // from real backend DemoDataInitializer
    
    wrapper.unmount()
  })
})
