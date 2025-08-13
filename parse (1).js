// Tiny RSS XML parser using built-in string ops; handles common/simple feeds.
function between(s, startTag, endTag) {
  const start = s.indexOf(startTag);
  if (start === -1) return null;
  const end = s.indexOf(endTag, start + startTag.length);
  if (end === -1) return null;
  return s.substring(start + startTag.length, end);
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseRss(xml) {
  const items = [];
  const parts = xml.split(/<item\b[\s\S]*?>|<entry\b[\s\S]*?>/i);
  // The first part is header; item-like splits follow. Use regex to find closing tags.
  const itemRegex = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
  let match;
  while ((match = itemRegex.exec(xml))) {
    const block = match[0];
    const title = stripTags(between(block, '<title', '</title>') || '').replace(/^.*?>/, '');
    const description = stripTags(
      between(block, '<description', '</description>') ||
      between(block, '<summary', '</summary>') || ''
    ).replace(/^.*?>/, '');
    const linkRaw = between(block, '<link', '</link>') || '';
    const linkHref = /href\s*=\s*"([^"]+)"/.exec(block)?.[1] || linkRaw.replace(/^.*?>/, '');
    const pubDate = stripTags(
      between(block, '<pubDate', '</pubDate>') ||
      between(block, '<updated', '</updated>') ||
      between(block, '<published', '</published>') || ''
    ).replace(/^.*?>/, '');

    items.push({ title, description, link: linkHref, publishDate: pubDate });
  }
  return items;
}

function mockItems() {
  return [
    {
      title: 'Worker Cooperative Opens New Location Using Blockchain Technology',
      description: 'A worker-owned cooperative bakery has expanded to a second location, implementing blockchain-based decision making and profit sharing among all worker-owners.',
      link: 'https://example.com/coop-expansion',
      publishDate: '2025-08-10T12:00:00Z'
    },
    {
      title: 'Decentralized Mesh Network Provides Internet to Rural Communities',
      description: 'Community organizers have deployed a mesh network using open-source technology to provide internet access without relying on corporate ISPs.',
      link: 'https://example.com/mesh-network',
      publishDate: '2025-08-10T10:30:00Z'
    },
    {
      title: 'Traditional Stock Market Reaches New Highs',
      description: 'Wall Street experienced another record-breaking day as investors continued to pour money into technology stocks and corporate bonds.',
      link: 'https://example.com/stocks-high',
      publishDate: '2025-08-10T09:15:00Z'
    },
    {
      title: 'Mathematical Patterns Found in Nature Inspire New Architecture',
      description: 'Architects are incorporating golden ratio and fibonacci sequences found in natural growth patterns to design more harmonious and sustainable buildings.',
      link: 'https://example.com/nature-architecture',
      publishDate: '2025-08-10T14:45:00Z'
    },
    {
      title: 'Direct Action Campaign Wins Major Victory Against Corporate Development',
      description: 'Months of community organizing and direct action have successfully prevented a corporate developer from destroying a local forest for a shopping mall.',
      publishDate: '2025-08-10T16:20:00Z',
      link: 'https://example.com/direct-action-victory'
    }
  ];
}

module.exports = { parseRss, mockItems };
