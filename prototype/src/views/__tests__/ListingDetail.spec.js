import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ListingDetail from '../ListingDetail.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/messages', name: 'messages', component: {} }]
})

vi.mock('../../lib/fixtures', () => ({
  getListings: vi.fn().mockResolvedValue([
    { id: 1, title: 'Test Room', status: 'published' }
  ])
}))

describe('ListingDetail.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('riap_user', JSON.stringify({ id: 'tenant1' }))
  })

  it('correctly parses JSON and redirects to the correct room UUID', async () => {
    // Mock fetch to return a JSON object like the real backend
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ id: 'abcd-1234-uuid', tenantId: 'tenant1', landlordId: 'landlord1', listingId: 1 }),
      text: vi.fn().mockResolvedValue('{"id":"abcd-1234-uuid"}') // Mocking old wrong behavior
    })

    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(ListingDetail, {
      global: {
        plugins: [router],
        mocks: {
          $route: { params: { id: '1' } }
        }
      }
    })

    // wait for created() to finish fetching fixtures
    await flushPromises()

    // Find the button and trigger click
    const button = wrapper.find('button.primary-button')
    expect(button.exists()).toBe(true)
    await button.trigger('click')

    // flush promises to wait for contactLandlord logic
    await flushPromises()

    // It should push to the new UUID, NOT the JSON string
    expect(pushSpy).toHaveBeenCalledWith('/messages?roomId=abcd-1234-uuid')
  })
})
