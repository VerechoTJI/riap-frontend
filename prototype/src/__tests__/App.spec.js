import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import App from "../App.vue";
import * as uiLib from "../lib/ui";

// Mock router
const pushMock = vi.fn();
const mockRouter = {
  push: pushMock
};

describe("App.vue Global WebSocket Notification", () => {
  let originalWebSocket;
  let mockWebSocketInstance;
  let dispatchEventSpy;

  beforeEach(() => {
    // Mock user login
    vi.spyOn(uiLib, "readCurrentUser").mockReturnValue({ id: "tenant-1", displayName: "Tenant 1", token: "tenant-1" });

    // Mock WebSocket
    mockWebSocketInstance = {
      close: vi.fn(),
      send: vi.fn(),
    };
    originalWebSocket = global.WebSocket;
    global.WebSocket = vi.fn(function() { return mockWebSocketInstance; });

    // Spy on window.dispatchEvent
    dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
  });

  afterEach(() => {
    global.WebSocket = originalWebSocket;
    vi.restoreAllMocks();
  });

  it("should connect to WebSocket on mount if user is logged in", () => {
    mount(App, {
      global: { 
        mocks: { $router: mockRouter },
        stubs: { 'router-link': { template: '<a><slot/></a>' }, 'router-view': true }
      }
    });
    
    expect(global.WebSocket).toHaveBeenCalledWith("ws://localhost:8080/ws/chat/connect?token=tenant-1");
  });

  it("should display unread dot when receiving a WebSocket message", async () => {
    const wrapper = mount(App, {
      global: { 
        mocks: { $router: mockRouter },
        stubs: { 'router-link': { template: '<a><slot/></a>' }, 'router-view': true }
      }
    });
    
    // Initially no dot
    expect(wrapper.find(".global-unread-dot").exists()).toBe(false);

    // Simulate incoming message
    const messageEvent = new MessageEvent("message", {
      data: JSON.stringify({ chatRoomId: "room-1", content: "hello" })
    });
    mockWebSocketInstance.onmessage(messageEvent);

    await wrapper.vm.$nextTick();

    // Red dot should appear
    expect(wrapper.find(".global-unread-dot").exists()).toBe(true);
  });

  it("should dispatch 'riap-ws-message' event when receiving a message", () => {
    mount(App, {
      global: { 
        mocks: { $router: mockRouter },
        stubs: { 'router-link': { template: '<a><slot/></a>' }, 'router-view': true }
      }
    });

    const payload = { chatRoomId: "room-1", content: "hello" };
    const messageEvent = new MessageEvent("message", {
      data: JSON.stringify(payload)
    });
    mockWebSocketInstance.onmessage(messageEvent);

    expect(dispatchEventSpy).toHaveBeenCalled();
    const eventArg = dispatchEventSpy.mock.calls[0][0];
    expect(eventArg.type).toBe("riap-ws-message");
    expect(eventArg.detail).toEqual(payload);
  });

  it("should clear unread dot when receiving 'riap-clear-unread' event", async () => {
    const wrapper = mount(App, {
      global: { 
        mocks: { $router: mockRouter },
        stubs: { 'router-link': { template: '<a><slot/></a>' }, 'router-view': true }
      }
    });

    // Make the dot appear first
    const messageEvent = new MessageEvent("message", {
      data: JSON.stringify({ chatRoomId: "room-1", content: "hello" })
    });
    mockWebSocketInstance.onmessage(messageEvent);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".global-unread-dot").exists()).toBe(true);

    // Dispatch clear event
    window.dispatchEvent(new Event("riap-clear-unread"));
    await wrapper.vm.$nextTick();

    // Red dot should disappear
    expect(wrapper.find(".global-unread-dot").exists()).toBe(false);
  });

  it("should close WebSocket on logout", async () => {
    const wrapper = mount(App, {
      global: { 
        mocks: { $router: mockRouter },
        stubs: { 'router-link': { template: '<a><slot/></a>' }, 'router-view': true }
      }
    });

    await wrapper.vm.logout();
    expect(mockWebSocketInstance.close).toHaveBeenCalled();
  });

  it("should fetch initial unread status on mount", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(true)
    });

    const wrapper = mount(App, {
      global: { 
        mocks: { $router: mockRouter },
        stubs: { 'router-link': { template: '<a><slot/></a>' }, 'router-view': true }
      }
    });

    await flushPromises();
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/api/chat/hasUnread", expect.any(Object));
    expect(wrapper.find(".global-unread-dot").exists()).toBe(true);
  });
});
