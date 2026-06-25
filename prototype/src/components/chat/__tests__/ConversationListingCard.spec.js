import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import ConversationListingCard from '../ConversationListingCard.vue';
import * as ui from '../../../lib/ui';

// Mock formatTwd to simplify assertions if needed, though it's better to test the actual formatting.
// Since it's imported in the component, it will use the real one. Let's just expect the real formatted output.

describe('ConversationListingCard.vue', () => {
  let consoleWarnMock;

  beforeEach(() => {
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnMock.mockRestore();
  });

  const defaultProps = {
    title: 'Test Title',
    city: 'Test City',
    image: 'http://example.com/image.jpg'
  };

  it('renders correctly without a listing prop (placeholder mode)', () => {
    const wrapper = mount(ConversationListingCard, {
      props: defaultProps,
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    });

    // Should display title and city
    expect(wrapper.text()).toContain('Test Title');
    expect(wrapper.text()).toContain('Test City');
    
    // Should display image
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('http://example.com/image.jpg');

    // Should NOT display listing specs or link
    expect(wrapper.find('.conversation-card__specs').exists()).toBe(false);
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false);
  });

  it('renders correctly with a full listing prop', () => {
    const listing = {
      id: 'list-123',
      rent: 15000,
      deposit: 30000,
      managementFee: 1500,
      size: 10,
      layout: '1房1廳1衛',
      floor: '3F / 5F'
    };

    const wrapper = mount(ConversationListingCard, {
      props: {
        ...defaultProps,
        listing
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    });

    // Check link
    const link = wrapper.findComponent(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.props('to')).toBe('/listing/list-123');
    expect(link.text()).toBe('查看房源');

    // Check specs
    const specs = wrapper.find('.conversation-card__specs');
    expect(specs.exists()).toBe(true);
    const text = specs.text();
    expect(text).toContain('月租: NT$ 15,000');
    expect(text).toContain('押金: NT$ 30,000');
    expect(text).toContain('管理費: NT$ 1,500');
    expect(text).toContain('坪數: 10 坪');
    expect(text).toContain('格局: 1房1廳1衛');
    expect(text).toContain('樓層: 3F / 5F');
  });

  it('falls back to default calculations for missing deposit and managementFee', () => {
    const listing = {
      id: 2,
      rent: 20000,
      // Missing deposit and managementFee
      size: 12,
      layout: '2房',
      floor: '1F'
    };

    const wrapper = mount(ConversationListingCard, {
      props: {
        ...defaultProps,
        listing
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    });

    const text = wrapper.find('.conversation-card__specs').text();
    // Default deposit is rent * 2 (40,000)
    expect(text).toContain('押金: NT$ 40,000');
    // Default management fee is 0
    expect(text).toContain('管理費: NT$ 0');
  });

  it('warns when required props are missing', () => {
    // Vue logs a warning when required props are not provided.
    // We mock console.warn to verify this behavior.
    mount(ConversationListingCard, {
      props: {
        // Missing title, city, and image
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    });

    expect(consoleWarnMock).toHaveBeenCalled();
    const warnings = consoleWarnMock.mock.calls.map(call => call[0]).join(' ');
    expect(warnings).toContain('Missing required prop: "title"');
    expect(warnings).toContain('Missing required prop: "city"');
    expect(warnings).toContain('Missing required prop: "image"');
  });
});
