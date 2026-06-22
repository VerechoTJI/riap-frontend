import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ChatRoomList from '../ChatRoomList.vue'

describe('ChatRoomList.vue', () => {
  const mockRooms = [
    { id: 'uuid-1', title: 'Room 1', preview: 'Hi', hasUnread: true },
    { id: 'uuid-2', title: 'Room 2', preview: 'Hello', hasUnread: false }
  ]

  it('renders a list of rooms', () => {
    const wrapper = mount(ChatRoomList, {
      props: {
        chatRooms: mockRooms,
        activeChatRoomId: 'uuid-1'
      }
    })

    const items = wrapper.findAll('.thread-item')
    expect(items.length).toBe(2)
    
    // Check if unread dot is rendered for room 1
    expect(items[0].find('.unread-dot').exists()).toBe(true)
    // Check if room 2 has no unread dot
    expect(items[1].find('.unread-dot').exists()).toBe(false)
    
    // Check active class
    expect(items[0].classes()).toContain('active')
    expect(items[1].classes()).not.toContain('active')
  })

  it('emits select event when a room is clicked', async () => {
    const wrapper = mount(ChatRoomList, {
      props: {
        chatRooms: mockRooms,
        activeChatRoomId: 'uuid-1'
      }
    })

    const items = wrapper.findAll('.thread-item')
    await items[1].trigger('click')

    expect(wrapper.emitted().select).toBeTruthy()
    expect(wrapper.emitted().select[0]).toEqual(['uuid-2'])
  })
})
