import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ChatComposer from '../ChatComposer.vue'

describe('ChatComposer.vue', () => {
  it('emits send event with trimmed text when send is clicked', async () => {
    const wrapper = mount(ChatComposer)
    
    // Set text
    await wrapper.setData({ text: '  Hello world  ' })
    
    // Find button and click
    const button = wrapper.find('button')
    await button.trigger('click')
    
    // Expect emit
    expect(wrapper.emitted().send).toBeTruthy()
    expect(wrapper.emitted().send[0]).toEqual(['Hello world'])
    
    // Expect text to be cleared
    expect(wrapper.vm.text).toBe('')
  })

  it('disables button when text is empty or too long', async () => {
    const wrapper = mount(ChatComposer)
    
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    
    await wrapper.setData({ text: 'a'.repeat(241) })
    expect(button.attributes('disabled')).toBeDefined()
    
    await wrapper.setData({ text: 'Valid text' })
    expect(button.attributes('disabled')).toBeUndefined()
  })
})
