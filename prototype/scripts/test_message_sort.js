#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const messagesPath = path.join(__dirname, '..', 'public', 'fixtures', 'messages.json');
const listingsPath = path.join(__dirname, '..', 'public', 'fixtures', 'listings.json');

const messages = readJson(messagesPath);
const listings = readJson(listingsPath);

function buildThreads(listingsArg, messagesArg) {
  const msgs = messagesArg || [];
  const lst = listingsArg || [];
  const all = lst.map((listing) => {
    const m = msgs.filter((mm) => mm.listingId === listing.id);
    const recent = m.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return {
      id: listing.id,
      listingId: listing.id,
      title: listing.title,
      city: listing.city,
      preview: recent ? recent.body : `${listing.city} · NT$ ${listing.rent}`,
      recentAt: recent?.createdAt || listing.postedAt || null,
    };
  });
  all.sort((a, b) => new Date(b.recentAt || 0) - new Date(a.recentAt || 0));
  return all.slice(0, 3);
}

function printMessagesFor(listingId, arr) {
  return arr
    .filter((m) => m.listingId === listingId)
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((m) => `${m.createdAt} - ${m.from}: ${m.body}`);
}

console.log('--- Initial state ---');
console.log('Messages for listing 1:');
console.log(printMessagesFor(1, messages).join('\n'));
console.log('\nThreads order:');
console.log(buildThreads(listings, messages).map((t) => `${t.listingId} - ${t.title} - recentAt:${t.recentAt}`).join('\n'));

// simulate adding a new message via UI
const newMsg = {
  id: Date.now(),
  listingId: 1,
  from: 'Charlie',
  to: 'Bob Wang',
  body: '我想知道何時可以看房？',
  createdAt: new Date().toISOString(),
};

messages.push(newMsg); // UI uses push

console.log('\n--- After pushing new message ---');
console.log('Messages for listing 1:');
console.log(printMessagesFor(1, messages).join('\n'));

// verify new message sorts to the end (old->new)
const msgsFor1 = messages
  .filter((m) => m.listingId === 1)
  .slice()
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

if (msgsFor1[msgsFor1.length - 1].id !== newMsg.id) {
  console.error('TEST FAILED: new message is not last after ascending sort');
  process.exit(2);
}

// verify thread ordering (new thread should be first)
const threadsAfter = buildThreads(listings, messages);
console.log('\nThreads after:');
console.log(threadsAfter.map((t) => `${t.listingId} - ${t.title} - recentAt:${t.recentAt}`).join('\n'));

if (threadsAfter[0].listingId !== 1) {
  console.error('TEST FAILED: thread for listing 1 is not first after adding message');
  process.exit(3);
}

console.log('\nTEST PASSED: new message sorted last and thread moved to top');
process.exit(0);
