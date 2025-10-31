// --------------------------
// Contest Guru - Main Script
// --------------------------

// Imports
import { CLIST_USERNAME, CLIST_API_KEY } from './config.js';

// --------------------------
// DOM Elements
// --------------------------
const platformCards = document.querySelectorAll('.platform-card');
const modal = document.getElementById('platformModal');
const closeBtn = document.querySelector('.close-btn');
const modalLogo = document.getElementById('modalLogo');
const modalHighlight = document.getElementById('modalHighlight');
const upcomingList = document.getElementById('upcomingList');
const completedList = document.getElementById('completedList');
const tabButtons = document.querySelectorAll('.tab-btn');

// Cache validity: 30 minutes
const CACHE_TTL_MS = 30 * 60 * 1000;
// Cached contest data
const platformData = {};

// --------------------------
// Platform configurations
// --------------------------
const platformConfig = {
  leetcode: {
    name: 'LeetCode',
    logo: './assets/images/logos/platform/leetcode.svg',
    fetcher: () => fetchClistContests('leetcode.com')
  },
  codechef: {
    name: 'CodeChef',
    logo: './assets/images/logos/platform/codechef.svg',
    fetcher: () => fetchClistContests('codechef.com')
  },
  hackerrank: {
    name: 'HackerRank',
    logo: './assets/images/logos/platform/hackerrank.svg',
    fetcher: () => fetchClistContests('hackerrank.com')
  },
  hackerearth: {
    name: 'HackerEarth',
    logo: './assets/images/logos/platform/hackerearth.svg',
    fetcher: () => fetchClistContests('hackerearth.com')
  },
  codeforces: {
    name: 'Codeforces',
    logo: './assets/images/logos/platform/codeforces.svg',
    fetcher: () => fetchClistContests('codeforces.com')
  },
  atcoder: {
    name: 'AtCoder',
    logo: './assets/images/logos/platform/atcoder.svg',
    fetcher: () => fetchClistContests('atcoder.jp')
  }
};

// --------------------------
// Platform card click handler
// --------------------------
platformCards.forEach(card => {
  card.addEventListener('click', async () => {
    const key = card.dataset.platform;
    const cfg = platformConfig[key];
    if (!cfg) return console.warn(`Unknown platform: ${key}`);

    modalLogo.src = cfg.logo;
    modalHighlight.textContent = 'Loading contests...';

    // Load or reuse contests
    await updatePlatformContests(key);

    const data = platformData[key];
    modalHighlight.textContent = data.highlight;
    upcomingList.innerHTML = createContestTable(data.upcoming, 'Upcoming Contests');
    completedList.innerHTML = createContestTable(data.completed, 'Completed Contests');

    // Open modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabButtons[0].classList.add('active');
    upcomingList.classList.add('active');
    completedList.classList.remove('active');
  });
});

// --------------------------
// Fetch contest data (with caching)
// --------------------------
async function updatePlatformContests(platformKey, forceRefresh = false) {
  const cfg = platformConfig[platformKey];
  const cached = platformData[platformKey];
  const now = Date.now();

  const isCacheValid = cached && now - cached.lastFetched < CACHE_TTL_MS;
  if (isCacheValid && !forceRefresh) {
    console.log(`🟢 Using cached ${cfg.name} data`);
    return;
  }

  console.log(`🔄 Fetching fresh ${cfg.name} data...`);
  try {
    const { upcoming, completed } = await cfg.fetcher();
    platformData[platformKey] = {
      upcoming,
      completed,
      highlight: upcoming.length
        ? `Next Contest: ${upcoming[0].title} — ${upcoming[0].startsIn}`
        : 'No upcoming contests found',
      lastFetched: now
    };
  } catch (err) {
    console.error(`Error fetching ${cfg.name}:`, err);
    platformData[platformKey] = {
      upcoming: [],
      completed: [],
      highlight: 'Failed to load contest data',
      lastFetched: now
    };
  }
}

// --------------------------
// Fetch Clist contests
// --------------------------
async function fetchClistContests(resource) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Format to YYYY-MM-DDTHH:MM:SS
  const formatDate = d => d.toISOString().split('.')[0];

  const start__gte = formatDate(thirtyDaysAgo); // contests ending after 30 days ago
  const start__lte = formatDate(thirtyDaysLater); // contests starting before 30 days from now

  const url = `https://clist.by/api/v2/contest/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&resource=${resource}&start__gte=${start__gte}&start__lte=${start__lte}&order_by=start`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Clist.by API error');

    const data = await res.json();
    const upcoming = [];
    const completed = [];

    data.objects.forEach(c => {
      const start = new Date(c.start);
      const end = new Date(c.end);
      if (start > now) upcoming.push(formatContestClist(c));
      else if (end < now) completed.push(formatContestClist(c));
    });

    completed.reverse();
    return { upcoming, completed };
  } catch (err) {
    console.error('Error fetching Clist.by contests:', err);
    return { upcoming: [], completed: [] };
  }
}

// --------------------------
// Format Clist contest
// --------------------------
function formatContestClist(c) {
  const start = new Date(c.start);
  const end = new Date(c.end);
  const duration = formatDuration(start, end);
  const diff = (start - new Date()) / 1000;
  const startsIn = diff > 0 ? formatTimeDiff(diff) : 'Started';

  return {
    id: `${c.resource}-${c.id}`,
    title: c.event,
    utc: formatTime(start, 'UTC'),
    ist: formatTime(start, 'Asia/Kolkata'),
    duration,
    startsIn,
    link: c.href,
    isCompleted: end < new Date()
  };
}

// --------------------------
// Utility functions
// --------------------------
function formatTimeDiff(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatDuration(start, end) {
  const diff = (end - start) / 1000;
  const hrs = Math.floor(diff / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

function formatTime(date, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    hour12: true,
  })
    .format(date)
    .replace(',', ' - ')
    .replace(' ', ' ');
}

// --------------------------
// Table rendering
// --------------------------
function createContestTable(contests, title) {
  if (!contests || contests.length === 0)
    return `<p class="no-contests">No ${title.toLowerCase()} available.</p>`;

  const isCompleted = title.toLowerCase().includes('completed');
  const headers = isCompleted
    ? `<tr><th>Contest</th><th>UTC</th><th>IST</th><th>Duration</th></tr>`
    : `<tr><th>Contest</th><th>UTC</th><th>IST</th><th>Duration</th><th>Starts In</th></tr>`;

  const rows = contests.map(c => `
    <tr id="contest-${c.id}">
      <td><a href="${c.link}" target="_blank">${c.title}</a></td>
      <td>${c.utc}</td>
      <td>${c.ist}</td>
      <td>${c.duration}</td>
      ${isCompleted ? '' : `<td>${c.startsIn}</td>`}
    </tr>`).join('');

  return `<table class="contest-table"><thead>${headers}</thead><tbody>${rows}</tbody></table>`;
}

// --------------------------
// Modal + tab controls
// --------------------------
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.tab === 'upcoming') {
      upcomingList.classList.add('active');
      completedList.classList.remove('active');
    } else {
      upcomingList.classList.remove('active');
      completedList.classList.add('active');
    }
  });
});
