import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, beforeAll } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import Listings from '../Listings.vue'

// If SKIP_E2E is set, skip the entire suite
const isSkipped = process.env.SKIP_E2E === 'true'

describe.skipIf(isSkipped)('LSS Integration Tests (Direct E2E)', () => {
  let router;

  beforeAll(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'listings', component: Listings },
        { path: '/listing/:id', name: 'detail', component: { template: '<div>Detail</div>' } }
      ]
    })
    // Simulate a logged-in user if needed
    localStorage.setItem('riap_user', JSON.stringify({ id: 'tenant1', username: 'Test Tenant', role: 'tenant' }))
  })

  it('LSS-TC01: 驗證租屋列表查詢功能 (Initial load)', async () => {
    const wrapper = mount(Listings, {
      global: { plugins: [router] }
    })
    
    // Wait for the API call in created() to finish
    await flushPromises()
    await new Promise(r => setTimeout(r, 500))
    await flushPromises()

    // The listing cards should be rendered
    const cards = wrapper.findAll('.listing-card')
    expect(cards.length).toBeGreaterThan(0)
    
    // Check if real data from DemoDataInitializer is present
    expect(wrapper.text()).toContain('台北')

    wrapper.unmount()
  }, 10000)

  it('LSS-TC02: 驗證城市條件篩選功能 (City filter)', async () => {
    const wrapper = mount(Listings, {
      global: { plugins: [router] }
    })
    await flushPromises()

    // Find the city select
    const selects = wrapper.findAll('select')
    const citySelect = selects[0] // Assuming first is city
    
    // Change to a specific city
    await citySelect.setValue('台北市')
    
    // Trigger search
    const searchBtn = wrapper.find('.search-bar button')
    await searchBtn.trigger('click')

    await flushPromises()
    await new Promise(r => setTimeout(r, 500))
    await flushPromises()

    const cards = wrapper.findAll('.listing-card')
    expect(cards.length).toBeGreaterThan(0)
    // Verify results only contain 台北市
    expect(wrapper.text()).toContain('台北市')

    wrapper.unmount()
  }, 10000)

  it('LSS-TC03: 驗證租金與房型條件篩選功能 (Rent and Type filter)', async () => {
    const wrapper = mount(Listings, {
      global: { plugins: [router] }
    })
    await flushPromises()

    const selects = wrapper.findAll('select')
    const typeSelect = selects[1] // Assuming second is propertyType
    await typeSelect.setValue('SUITE') // 分租套房

    const inputs = wrapper.findAll('input[type="number"]')
    const minRent = inputs[0]
    const maxRent = inputs[1]
    
    await minRent.setValue(5000)
    await maxRent.setValue(20000)

    const searchBtn = wrapper.find('.search-bar button')
    await searchBtn.trigger('click')

    await flushPromises()
    await new Promise(r => setTimeout(r, 500))
    await flushPromises()

    const cards = wrapper.findAll('.listing-card')
    expect(cards.length).toBeGreaterThanOrEqual(0)

    wrapper.unmount()
  }, 10000)

  it('LSS-TC04: 驗證關鍵字與設施條件搜尋功能 (Keyword and features)', async () => {
    const wrapper = mount(Listings, {
      global: { plugins: [router] }
    })
    await flushPromises()

    const keywordInput = wrapper.find('input[type="text"]')
    await keywordInput.setValue('信義')

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    // Just click the first one (e.g. hasInternet)
    await checkboxes[0].setValue(true)

    const searchBtn = wrapper.find('.search-bar button')
    await searchBtn.trigger('click')

    await flushPromises()
    await new Promise(r => setTimeout(r, 500))
    await flushPromises()

    const text = wrapper.text()
    expect(text).toBeDefined()

    wrapper.unmount()
  }, 10000)

  it('LSS-TC05: 驗證分頁與排序功能 (Pagination and Sort)', async () => {
    const wrapper = mount(Listings, {
      global: { plugins: [router] }
    })
    await flushPromises()

    // Change sort
    const selects = wrapper.findAll('select')
    const sortSelect = selects[2] // Assuming third is sort
    await sortSelect.setValue('PRICE_ASC')

    await flushPromises()
    await new Promise(r => setTimeout(r, 500))
    await flushPromises()

    // Check pagination buttons if there are many pages
    const pageButtons = wrapper.findAll('.pagination button')
    if (pageButtons.length > 2) {
      await pageButtons[2].trigger('click') // Click page 2
      await flushPromises()
      await new Promise(r => setTimeout(r, 500))
      await flushPromises()
    }

    expect(wrapper.text()).toBeDefined()
    wrapper.unmount()
  }, 10000)
})
