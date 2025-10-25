const platformCards = document.querySelectorAll('.platform-card');
const modal = document.getElementById('platformModal');
const closeBtn = document.querySelector('.close-btn');
const modalLogo = document.getElementById('modalLogo');
const modalHighlight = document.getElementById('modalHighlight');
const upcomingList = document.getElementById('upcomingList');
const completedList = document.getElementById('completedList');
const tabButtons = document.querySelectorAll('.tab-btn');

// Verify required elements exist
if (!modal || !closeBtn || !modalLogo || !modalHighlight || !upcomingList || !completedList) {
  console.error('Required modal elements not found');
  return;
}

if (platformCards.length === 0 || tabButtons.length === 0) {
  console.error('Required interactive elements not found');
  return;
}

const platformData = {
  codeforces: {
    logo:'./assets/images/logos/platform/codeforces.svg',
    title:'Codeforces',
    highlight:'Next Contest: Round #XXX — Today 18:00 — 2h',
    upcoming:[
      'Educational Round #YYY — Tomorrow 15:00 — 2h',
      'Round #ZZZ — 3rd Nov 18:00 — 2h'
    ],
    completed:[
      'Round #AAA — 1st Nov 18:00 — 2h',
      'Round #BBB — 30th Oct 18:00 — 2h'
    ]
  },
  leetcode: {
    logo:'./assets/images/logos/platform/leetcode.svg',
    title:'LeetCode',
    highlight:'Next Contest: Weekly Contest 123 — Today 20:00 — 90min',
    upcoming:[
      'Weekly Contest 124 — Tomorrow 20:00 — 90min'
    ],
    completed:[
      'Weekly Contest 122 — Yesterday 20:00 — 90min'
    ]
  },
  codechef: {
    logo:'./assets/images/logos/platform/codechef.svg',
    title:'CodeChef',
    highlight:'Next Contest: Long Challenge — 2nd Nov — 10 days',
    upcoming:['Cook-Off — 5th Nov — 2h'],
    completed:['Lunchtime — 29th Oct — 3h']
  },
  hackerrank: {
    logo:'./assets/images/logos/platform/hackerrank.svg',
    title:'HackerRank',
    highlight:'No ongoing contest, showing last ended contest',
    upcoming:['30 Days of Code — Today — 30 days'],
    completed:['HackerRank Week of Code — Yesterday — 3h']
  },
  hackerearth: {
    logo:'./assets/images/logos/platform/hackerearth.svg',
    title:'HackerEarth',
    highlight:'Next Contest: CodeMonk Challenge — Tomorrow — 3h',
    upcoming:['CodeMonk Challenge 2 — 5th Nov — 3h'],
    completed:['Hiring Challenge — 1st Nov — 3h']
  }
};

// Open modal with data
platformCards.forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.platform;
    const data = platformData[key];

    modalLogo.src = data.logo;
    modalHighlight.textContent = data.highlight;

    upcomingList.innerHTML = data.upcoming.map(c => `<li>${c}</li>`).join('');
    completedList.innerHTML = data.completed.map(c => `<li>${c}</li>`).join('');

    modal.classList.add('active');

    // Show upcoming tab by default
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabButtons[0].classList.add('active');
    upcomingList.classList.add('active');
    completedList.classList.remove('active');
  });
});

// Close modal
closeBtn.addEventListener('click', () => modal.classList.remove('active'));

// Tab switching
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(btn.dataset.tab==='upcoming'){
      upcomingList.classList.add('active');
      completedList.classList.remove('active');
    } else {
      upcomingList.classList.remove('active');
      completedList.classList.add('active');
    }
  });
});
