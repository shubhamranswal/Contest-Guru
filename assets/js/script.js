const platformCards = document.querySelectorAll('.platform-card');
const modal = document.getElementById('platformModal');
const closeBtn = document.querySelector('.close-btn');
const modalLogo = document.getElementById('modalLogo');
const modalHighlight = document.getElementById('modalHighlight');
const upcomingList = document.getElementById('upcomingList');
const completedList = document.getElementById('completedList');
const tabButtons = document.querySelectorAll('.tab-btn');

// TODO: Replace with real API data from Codeforces, LeetCode, etc.
// This is placeholder data for UI demonstration
const platformData = {
  codeforces: {
    logo: './assets/images/logos/platform/codeforces.svg',
    title: 'Codeforces',
    highlight: 'Next Contest:',
    upcoming: [],
    completed: []
  },
  leetcode: {
    logo: './assets/images/logos/platform/leetcode.svg',
    title: 'LeetCode',
    highlight: 'Next Contest: Weekly Contest 123 — Today 20:00 — 90min',
    upcoming: [
      'Weekly Contest 124 — Tomorrow 20:00 — 90min'
    ],
    completed: [
      'Weekly Contest 122 — Yesterday 20:00 — 90min'
    ]
  },
  codechef: {
    logo: './assets/images/logos/platform/codechef.svg',
    title: 'CodeChef',
    highlight: 'Next Contest: Long Challenge — 2nd Nov — 10 days',
    upcoming: ['Cook-Off — 5th Nov — 2h'],
    completed: ['Lunchtime — 29th Oct — 3h']
  },
  hackerrank: {
    logo: './assets/images/logos/platform/hackerrank.svg',
    title: 'HackerRank',
    highlight: 'No ongoing contest, showing last ended contest',
    upcoming: ['30 Days of Code — Today — 30 days'],
    completed: ['HackerRank Week of Code — Yesterday — 3h']
  },
  hackerearth: {
    logo: './assets/images/logos/platform/hackerearth.svg',
    title: 'HackerEarth',
    highlight: 'Next Contest: CodeMonk Challenge — Tomorrow — 3h',
    upcoming: ['CodeMonk Challenge 2 — 5th Nov — 3h'],
    completed: ['Hiring Challenge — 1st Nov — 3h']
  }
};

// Create contest table HTML
platformCards.forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.platform;
    const data = platformData[key];

    if (!data) {
      console.warn(`Platform data not found for key: ${key}`);
      return;
    }

    modalLogo.src = data.logo;
    modalHighlight.textContent = data.highlight;

    // 🧩 Render tables instead of <li> lists
    upcomingList.innerHTML = createContestTable(data.upcoming, 'Upcoming Contests');
    completedList.innerHTML = createContestTable(data.completed, 'Completed Contests');

    // Update participants for completed contests
    data.completed.forEach(async contest => {
      await fetchParticipants(contest);
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabButtons[0].classList.add('active');
    upcomingList.classList.add('active');
    completedList.classList.remove('active');
  });
});

// Function to create contest table HTML
function createContestTable(contests, title) {
  if (!contests || contests.length === 0) {
    return `<p class="no-contests">No ${title.toLowerCase()} available.</p>`;
  }

  const isObject = typeof contests[0] === 'object';
  const isCompleted = title.toLowerCase().includes('completed');

  const rows = contests
    .map(c => {
      if (!isObject) return `<tr><td colspan="6">${c}</td></tr>`;

      return `
        <tr>
          <td><a href="${c.link}" target="_blank" rel="noopener noreferrer">${c.title}</a></td>
          <td>${c.utc}</td>
          <td>${c.ist}</td>
          <td>${c.duration}</td>
          ${isCompleted
          ? `<td>${c.participants}</td>`
          : `<td>${c.startsIn}</td>`}
        </tr>`;
    })
    .join('');

  const headers = isCompleted
    ? `
      <tr>
        <th>Contest</th>
        <th>UTC</th>
        <th>IST</th>
        <th>Duration</th>
        <th>Participants</th>
      </tr>`
    : `
      <tr>
        <th>Contest</th>
        <th>UTC</th>
        <th>IST</th>
        <th>Duration</th>
        <th>Starts In</th>
      </tr>`;

  return `
    <table class="contest-table">
      <thead>${headers}</thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// Initial fetch to update Codeforces contests
await updateCodeforcesContests(platformData);

// Close modal
const closeModal = () => {
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Re-enable scrolling
};

closeBtn.addEventListener('click', closeModal);

// Close on backdrop click
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

// Tab switching
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

// Fetch and update Codeforces contests
async function updateCodeforcesContests(platformData) {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list');
    const data = await res.json();

    if (data.status !== 'OK') throw new Error('Failed to fetch contests');

    const contests = data.result;
    const now = Date.now() / 1000;
    const thirtyDaysLater = now + 30 * 24 * 60 * 60;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    // 🟩 Upcoming contests (next 30 days)
    const upcomingRaw = contests
      .filter(c => c.phase === 'BEFORE' && c.startTimeSeconds <= thirtyDaysLater)
      .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
      .slice(0, 5); // limit to 5

    // 🟥 Completed contests (past 30 days)
    const completedRaw = contests
      .filter(c => c.phase === 'FINISHED' && c.startTimeSeconds >= thirtyDaysAgo)
      .sort((a, b) => b.startTimeSeconds - a.startTimeSeconds) // most recent first
      .slice(0, 30); // limit to 30

    // ✅ Await both (important!)
    const upcoming = await Promise.all(upcomingRaw.map(c => formatContest(c, false)));
    const completed = await Promise.all(completedRaw.map(c => formatContest(c, true)));

    // ✅ Assign correctly
    platformData.codeforces.upcoming = upcoming;
    platformData.codeforces.completed = completed;

    // ✅ Highlight first upcoming
    if (upcoming.length > 0) {
      const next = upcoming[0];
      platformData.codeforces.highlight = `Next Contest: ${next.title} — UTC ${next.utc} | IST ${next.ist} — ${next.duration}`;
    } else {
      platformData.codeforces.highlight = 'No upcoming contests in next 30 days';
    }

  } catch (err) {
    console.error('❌ Error fetching Codeforces contests:', err);
  }
}

// Format contest details into a string - Codeforces style
async function formatContest(contest, isCompleted = false) {
  const start = new Date(contest.startTimeSeconds * 1000);
  const durationHours = Math.round(contest.durationSeconds / 3600);

  const link = `https://codeforces.com/contest/${contest.id}`;

  const utc = start.toLocaleString('en-GB', {
    timeZone: 'UTC', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const ist = start.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  let startsIn = '-';
  let participants = isCompleted ? 'Loading...' : '-';

  if (!isCompleted) {
    const now = Date.now() / 1000;
    const diff = contest.startTimeSeconds - now;
    startsIn = diff > 0 ? formatTimeDiff(diff) : 'Starting soon';
  }

  return {
    id: contest.id,
    title: contest.name,
    utc,
    ist,
    duration: `${durationHours}h`,
    startsIn,
    participants,
    link,
    isCompleted
  };
}

// After rendering modal rows
async function fetchParticipants(row) {
  try {
    // Fetch all rows to get total participants (slow for big contests)
    const res = await fetch(
      `https://codeforces.com/api/contest.standings?contestId=${row.id}`
    );
    const data = await res.json();
    if (data.status === "OK") {
      row.participants = data.result.rows.length.toLocaleString();
      console.log(`Fetched participants for contest ${row.id}: ${row.participants}`);
    } else {
      row.participants = "N/A";
    }
  } catch (err) {
    row.participants = "N/A";
  }

  // Update table cell dynamically
  const cell = document.querySelector(`#contest-${row.id} .participants`);
  if (cell) cell.textContent = row.participants;
}

// Helper: convert seconds to readable “X days Y hrs”
function formatTimeDiff(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
