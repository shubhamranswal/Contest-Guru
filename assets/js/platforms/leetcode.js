export async function fetchLeetCodeContests(formatTimeDiff) {
  const API_URL = "https://contest-hive.vercel.app/api/leetcode";

  try {
    // Step 1: Fetch contest data
    const res = await fetch(API_URL, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`Failed to fetch contests: ${res.status}`);

    const data = await res.json();
    const contests = data.data || [];
    const now = Date.now() / 1000;

    console.log("LeetCode contests fetched:", data);

    // Step 2: Separate upcoming & completed
    const upcomingRaw = contests
      .filter(c => new Date(c.startTime).getTime() / 1000 > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5);

    const completedRaw = contests
      .filter(c => new Date(c.startTime).getTime() / 1000 <= now)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 30);

    // Step 3: Format contests
    const upcoming = upcomingRaw.map(c => formatContest(c, false, now, formatTimeDiff));
    const completed = completedRaw.map(c => formatContest(c, true, now, formatTimeDiff));

    return { upcoming, completed };

  } catch (err) {
    console.error("Error fetching LeetCode contests:", err);
    return { upcoming: [], completed: [] };
  }
}

// 🔧 Helper function
function formatContest(contest, isCompleted, now, formatTimeDiff) {
  const start = new Date(contest.startTime);
  const durationHours = Math.round((contest.duration || 5400) / 3600); // default 1.5h

  return {
    id: contest.url.split("/").pop(),
    title: contest.title,
    link: contest.url,
    utc: start.toLocaleString("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    ist: start.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    duration: `${durationHours}h`,
    startsIn: !isCompleted ? formatTimeDiff(start.getTime() / 1000 - now) : "-",
    participants: "-", // unavailable in API
    isCompleted,
  };
}
