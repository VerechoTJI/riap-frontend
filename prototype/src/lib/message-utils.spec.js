import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { sortMessagesAsc, buildThreads } from "./message-utils";

function readJson(relPath) {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "..", relPath), "utf8"),
  );
}

const messagesPath = "public/fixtures/messages.json";
const listingsPath = "public/fixtures/listings.json";

describe("message-utils", () => {
  it("sortMessagesAsc places a new message last (old->new)", () => {
    const messages = readJson(messagesPath);
    const max = messages.reduce(
      (m, it) => Math.max(m, new Date(it.createdAt).getTime()),
      0,
    );
    const newCreated = new Date(max + 60 * 1000).toISOString();
    const newMsg = {
      id: 999999,
      listingId: 1,
      from: "Test",
      to: "Bob Wang",
      body: "測試",
      createdAt: newCreated,
    };
    const copy = messages.slice();
    copy.push(newMsg);
    const sorted = sortMessagesAsc(copy);
    expect(sorted[sorted.length - 1].id).toBe(newMsg.id);
  });

  it("buildThreads orders threads by recent message and moves listing 1 to top after new message", () => {
    const messages = readJson(messagesPath);
    const listings = readJson(listingsPath);
    // baseline: listing 1 should be near top because fixtures have recent messages for it
    const threadsBefore = buildThreads(listings, messages);
    expect(threadsBefore.length).toBeGreaterThan(0);

    const max = messages.reduce(
      (m, it) => Math.max(m, new Date(it.createdAt).getTime()),
      0,
    );
    const newCreated = new Date(max + 60 * 1000).toISOString();
    const newMsg = {
      id: Date.now(),
      listingId: 1,
      from: "Tester",
      to: "Bob Wang",
      body: "新增測試訊息",
      createdAt: newCreated,
    };
    const copy = messages.slice();
    copy.push(newMsg);

    const threadsAfter = buildThreads(listings, copy);
    expect(threadsAfter[0].listingId).toBe(1);
  });
});
