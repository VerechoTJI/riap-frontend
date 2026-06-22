import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ChatStream from '../ChatStream.vue'

describe('ChatStream.vue', () => {
  const mockMessages = [
    { id: '1', body: 'Msg 1', senderUserId: 'user1', from: '我', createdAt: new Date().toISOString(), isRead: true },
    { id: '2', body: 'Msg 2', senderUserId: 'user2', from: '對方', createdAt: new Date().toISOString(), isRead: false }
  ]

  it('renders messages and identifies inbound vs outbound', () => {
    const wrapper = mount(ChatStream, {
      props: {
        messages: mockMessages,
        currentUserId: 'user1'
      }
    })

    const bubbles = wrapper.findAll('.bubble')
    expect(bubbles.length).toBe(2)
    
    // User1 should be outbound
    expect(bubbles[0].classes()).toContain('outbound')
    // User2 should be inbound
    expect(bubbles[1].classes()).toContain('inbound')
    
    // Read status should be visible for read outbound message
    expect(bubbles[0].find('.read-status').exists()).toBe(true)
    // Read status should not be visible for inbound message
    expect(bubbles[1].find('.read-status').exists()).toBe(false)
  })
})
