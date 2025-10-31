export async function fetchCodechefContests(formatTimeDiff) {
  try {
    const res = await fetch('https://www.codechef.com/api/contests/all'); // Hypothetical endpoint
    const data = await res.json();

    const now = Date.now() / 1000;
    const thirtyDaysLater = now + 30*24*60*60;
    const thirtyDaysAgo = now - 30*24*60*60;

    // Filter upcoming and completed contests
    const upcomingRaw = data.contests
      .filter(c => c.status === 'UPCOMING' && c.start_time <= thirtyDaysLater)
      .sort((a,b)=>a.start_time-b.start_time)
      .slice(0,5);

    const completedRaw = data.contests
      .filter(c => c.status === 'PAST' && c.start_time >= thirtyDaysAgo)
      .sort((a,b)=>b.start_time-a.start_time)
      .slice(0,30);

    const upcoming = await Promise.all(upcomingRaw.map(c => formatContest(c,false)));
    const completed = await Promise.all(completedRaw.map(c => formatContest(c,true)));

    return { upcoming, completed };

  } catch (err) {
    console.error('Error fetching CodeChef contests:', err);
    return { upcoming: [], completed: [] };
  }

  async function formatContest(contest,isCompleted){
    const start = new Date(contest.start_time*1000);
    const durationHours = Math.round(contest.duration_seconds/3600);
    const now = Date.now()/1000;

    let participants = '-';
    if(isCompleted){
      try {
        const res = await fetch(`https://www.codechef.com/api/contest/${contest.code}/participants`);
        const pdata = await res.json();
        participants = pdata.count ? pdata.count.toLocaleString() : 'N/A';
      } catch(e){ participants='N/A'; }
    }

    return {
      id: contest.code,
      title: contest.name,
      link: `https://www.codechef.com/${contest.code}`,
      utc: start.toLocaleString('en-GB',{timeZone:'UTC',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}),
      ist: start.toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}),
      duration: `${durationHours}h`,
      startsIn: !isCompleted ? formatTimeDiff(contest.start_time-now) : '-',
      participants,
      isCompleted
    };
  }
}
