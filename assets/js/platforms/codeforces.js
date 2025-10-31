export async function fetchCodeforcesContests(formatTimeDiff) {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list');
    const data = await res.json();
    if (data.status !== 'OK') throw new Error('Failed to fetch contests');

    const now = Date.now() / 1000;
    const thirtyDaysLater = now + 30 * 24 * 60 * 60;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    // Upcoming contests (next 30 days)
    const upcomingRaw = data.result
      .filter(c => c.phase === 'BEFORE' && c.startTimeSeconds <= thirtyDaysLater)
      .sort((a,b) => a.startTimeSeconds - b.startTimeSeconds)
      .slice(0, 5);

    // Completed contests (past 30 days)
    const completedRaw = data.result
      .filter(c => c.phase === 'FINISHED' && c.startTimeSeconds >= thirtyDaysAgo)
      .sort((a,b) => b.startTimeSeconds - a.startTimeSeconds)
      .slice(0, 30); // optional limit to avoid API overload

    // Format upcoming & completed contests
    const upcoming = upcomingRaw.map(c => formatContest(c, false));
    const completed = completedRaw.map(c => formatContest(c, true));

    // Highlight first upcoming contest
    let highlight = 'No upcoming contests in next 30 days';
    if (upcoming.length > 0) {
      const next = upcoming[0];
      highlight = `Next Contest: ${next.title} — UTC ${next.utc} | IST ${next.ist} — ${next.duration}`;
    }

    return { upcoming, completed, highlight };

  } catch (err) {
    console.error('Error fetching Codeforces contests:', err);
    return { upcoming: [], completed: [], highlight: 'Unable to fetch contests' };
  }

  // Format contest data
  function formatContest(contest, isCompleted) {
    const start = new Date(contest.startTimeSeconds * 1000);
    const durationHours = Math.round(contest.durationSeconds / 3600);
    const now = Date.now() / 1000;

    return {
      id: contest.id,
      title: contest.name,
      link: `https://codeforces.com/contest/${contest.id}`,
      utc: start.toLocaleString('en-GB', { timeZone:'UTC', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', hour12:false }),
      ist: start.toLocaleString('en-IN', { timeZone:'Asia/Kolkata', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', hour12:false }),
      duration: `${durationHours}h`,
      startsIn: !isCompleted ? formatTimeDiff(contest.startTimeSeconds - now) : '-',
      participants: isCompleted ? 'Click to load' : '-',
      isCompleted
    };
  }
}

// Lazy fetch participants (only when user clicks)
export async function fetchParticipantsLazy(contest) {
  try {
    const res = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contest.id}`);
    const data = await res.json();
    if(data.status === "OK") {
      contest.participants = data.result.rows.length.toLocaleString();
    } else {
      contest.participants = "N/A";
    }
  } catch(err) {
    contest.participants = "N/A";
  }
}

export function attachLazyParticipants(completedList, platformData, key) {
  completedList.addEventListener('click', async e => {
    const rowEl = e.target.closest('tr.completed-contest');
    if (!rowEl) return;

    const contestId = rowEl.dataset.contestId;
    const contest = platformData[key].completed.find(c => c.id == contestId);
    if (!contest || contest.participants !== 'Click to load') return;

    // Start loading animation
    const cell = rowEl.querySelector('.participants');
    let dots = 0;
    cell.textContent = 'Loading';
    const interval = setInterval(() => {
      dots = (dots + 1) % 4;
      cell.textContent = 'Loading' + '.'.repeat(dots);
    }, 300);

    try {
      await fetchParticipantsLazy(contest);
    } catch(err) {
      contest.participants = 'N/A';
    } finally {
      clearInterval(interval);
      cell.textContent = contest.participants;
    }
  });
}
