import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import Messages from '../Messages.vue'
import ListingDetail from '../ListingDetail.vue'

vi.mock('../../lib/fixtures', () => ({
  getListings: vi.fn().mockImplementation(() => Promise.resolve([
    { id: window.__TEST_REAL_LISTING_ID || '1', title: '精華地段套房', city: 'Taipei', rent: 15000, status: 'published' }
  ])),
  getUsers: vi.fn().mockResolvedValue([
    { id: "tenant1", username: "test_tenant", displayName: "Test Tenant", role: "tenant" },
    { id: "2", username: "test_landlord", displayName: "Test Landlord", role: "landlord" }
  ])
}))

// DO NOT MOCK fetch or WebSocket as requested by user.

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/messages' },
    { path: '/messages', name: 'messages', component: Messages },
    { path: '/:pathMatch(.*)*', component: { template: '<div>Mock</div>' } }
  ]
})

const isSkipped = process.argv.includes('--skip-e2e')

describe.skipIf(isSkipped)('RCS Integration Tests (Black-box with Real API)', () => {
  let createdRoomId = null;
  let realListingId = '1';

  beforeAll(async () => {
    window.alert = vi.fn()
    window.prompt = vi.fn()
    window.confirm = vi.fn()
    
    // We assume the backend is running on http://localhost:8080
    // and tenant1 is our test user.
    localStorage.setItem('riap_user', JSON.stringify({ id: 'tenant1', username: 'Test Tenant', role: 'tenant' }))

    try {
      const res = await fetch('/api/listings?size=1')
      if (!res.ok) throw new Error('API Error: ' + res.status)
      const data = await res.json()
      const items = data.content || data.data || data.listings || []
      if (items.length > 0) {
        realListingId = items[0].id || (items[0]._links ? items[0]._links.self.href.split('/').pop() : '1')
        window.__TEST_REAL_LISTING_ID = realListingId
      }
    } catch (e) {
      console.error('RCS-TC fetch realListingId failed:', e)
    }
  })

  it('RCS-TC01: 建立聊天室測試 (Create chat room)', async () => {
    const wrapper = mount(ListingDetail, {
      global: {
        plugins: [router],
        mocks: {
          $route: { params: { id: realListingId } }
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

    // Wait for API
    await new Promise(r => setTimeout(r, 500))

    // Simulate WebSocket event since happy-dom doesn't connect real WebSockets
    window.dispatchEvent(new CustomEvent("riap-ws-message", { detail: { chatRoomId: createdRoomId } }))
    await flushPromises()
    await new Promise(r => setTimeout(r, 1000))
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
