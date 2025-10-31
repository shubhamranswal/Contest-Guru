import { fetchCodeforcesContests, attachLazyParticipants } from './platforms/codeforces.js';
import { fetchCodechefContests } from './platforms/codechef.js';
import { fetchLeetCodeContests } from './platforms/leetcode.js';

const platformCards = document.querySelectorAll('.platform-card');
const modal = document.getElementById('platformModal');
const closeBtn = document.querySelector('.close-btn');
const modalLogo = document.getElementById('modalLogo');
const modalHighlight = document.getElementById('modalHighlight');
const upcomingList = document.getElementById('upcomingList');
const completedList = document.getElementById('completedList');
const tabButtons = document.querySelectorAll('.tab-btn');

const platformData = {
  codeforces: { logo: './assets/images/logos/platform/codeforces.svg', title: 'Codeforces', highlight: '', upcoming: [], completed: [] },
  leetcode: { logo: './assets/images/logos/platform/leetcode.svg', title: 'LeetCode', highlight: '', upcoming: [], completed: [] },
  codechef: { logo: './assets/images/logos/platform/codechef.svg', title: 'CodeChef', highlight: '', upcoming: [], completed: [] },
  hackerrank: { logo: './assets/images/logos/platform/hackerrank.svg', title: 'HackerRank', highlight: '', upcoming: [], completed: [] },
  hackerearth: { logo: './assets/images/logos/platform/hackerearth.svg', title: 'HackerEarth', highlight: '', upcoming: [], completed: [] },
};

attachLazyParticipants(completedList, platformData, 'codeforces');

function formatTimeDiff(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function createContestTable(contests, title) {
  if (!contests || contests.length === 0) return `<p class="no-contests">No ${title.toLowerCase()} available.</p>`;
  const isCompleted = title.toLowerCase().includes('completed');
  const rows = contests.map(c => `
  <tr id="contest-${c.id}" data-contest-id="${c.id}" ${c.isCompleted ? 'class="completed-contest"' : ''}>
    <td><a href="${c.link}" target="_blank">${c.title}</a></td>
    <td>${c.utc}</td>
    <td>${c.ist}</td>
    <td>${c.duration}</td>
    ${isCompleted
      ? `<td class="participants">${c.participants === 'Loading...' ? 'Click to load' : c.participants}</td>`
      : `<td>${c.startsIn}</td>`}
  </tr>
`).join('');
  const headers = isCompleted
    ? `<tr><th>Contest</th><th>UTC</th><th>IST</th><th>Duration</th><th>Participants</th></tr>`
    : `<tr><th>Contest</th><th>UTC</th><th>IST</th><th>Duration</th><th>Starts In</th></tr>`;
  return `<table class="contest-table"><thead>${headers}</thead><tbody>${rows}</tbody></table>`;
}

async function openPlatformModal(key) {
  const data = platformData[key];
  if (!data) return;

  modalLogo.src = data.logo;

  // Fetch platform-specific contests
  switch (key) {
    case 'codeforces':
      const contests = await fetchCodeforcesContests(formatTimeDiff);
      data.upcoming = contests.upcoming;
      data.completed = contests.completed;
      break;
    case 'codechef':
      const cc = await fetchCodechefContests(formatTimeDiff);
      data.upcoming = cc.upcoming;
      data.completed = cc.completed;
      break;
    case 'leetcode':
      const lc = await fetchLeetCodeContests(formatTimeDiff);
      data.upcoming = lc.upcoming;
      data.completed = lc.completed;
      break;
  }

  // Highlight next upcoming
  if (data.upcoming.length > 0) data.highlight = `Next Contest: ${data.upcoming[0].title} — UTC ${data.upcoming[0].utc} | IST ${data.upcoming[0].ist} — ${data.upcoming[0].duration}`;
  else data.highlight = 'No upcoming contests in next 30 days';
  modalHighlight.textContent = data.highlight;

  upcomingList.innerHTML = createContestTable(data.upcoming, 'Upcoming Contests');
  completedList.innerHTML = createContestTable(data.completed, 'Completed Contests');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();

  tabButtons.forEach(b => b.classList.remove('active'));
  tabButtons[0].classList.add('active');
  upcomingList.classList.add('active');
  completedList.classList.remove('active');
}

platformCards.forEach(card => card.addEventListener('click', () => openPlatformModal(card.dataset.platform)));
closeBtn.addEventListener('click', () => { modal.classList.remove('active'); document.body.style.overflow = ''; });
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) modal.classList.remove('active'); });
tabButtons.forEach(btn => btn.addEventListener('click', () => {
  tabButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (btn.dataset.tab === 'upcoming') { upcomingList.classList.add('active'); completedList.classList.remove('active'); }
  else { upcomingList.classList.remove('active'); completedList.classList.add('active'); }
}));
