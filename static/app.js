'use strict';

const STORAGE_KEY = 'zentrack-habits-v1';

const initialProjects = [
  {
    id: 'P-201',
    name: 'Product Launch Site',
    owner: 'Maya',
    progress: 72,
    health: 'On track',
    raidStatus: 'Green',
    progressNote: 'Launch landing pages approved and QA pass rate is improving.'
  },
  {
    id: 'P-198',
    name: 'Mobile App v2',
    owner: 'Jordan',
    progress: 54,
    health: 'At risk',
    raidStatus: 'Red',
    progressNote: 'Android crash fix is blocked by dependency upgrade.'
  },
  {
    id: 'P-176',
    name: 'Sales Dashboard Revamp',
    owner: 'Nia',
    progress: 88,
    health: 'On track',
    raidStatus: 'Green',
    progressNote: 'Visualization polish and rollout checklist nearly complete.'
  }
];

const weeklyThroughput = [
  { day: 'Mon', value: 7 },
  { day: 'Tue', value: 9 },
  { day: 'Wed', value: 8 },
  { day: 'Thu', value: 10 },
  { day: 'Fri', value: 6 }
];

const tasks = [
  {
    id: 'T-412',
    title: 'Finalize launch hero copy and legal disclaimer',
    project: 'Product Launch Site',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-03-17',
    estimateHours: 3,
    tags: ['content', 'marketing']
  },
  {
    id: 'T-428',
    title: 'Fix onboarding crash on Android 15',
    project: 'Mobile App v2',
    priority: 'Critical',
    status: 'In Progress',
    dueDate: '2026-03-16',
    estimateHours: 4,
    tags: ['bug', 'mobile']
  },
  {
    id: 'T-431',
    title: 'Prepare investor metrics deck draft',
    project: 'Sales Dashboard Revamp',
    priority: 'Medium',
    status: 'Not Started',
    dueDate: '2026-03-21',
    estimateHours: 2,
    tags: ['reporting']
  },
  {
    id: 'T-437',
    title: 'Create QA test script for payment retry flow',
    project: 'Mobile App v2',
    priority: 'High',
    status: 'Not Started',
    dueDate: '2026-03-14',
    estimateHours: 3,
    tags: ['qa', 'payments']
  },
  {
    id: 'T-444',
    title: 'Publish release notes and customer update',
    project: 'Product Launch Site',
    priority: 'Medium',
    status: 'Not Started',
    dueDate: '2026-03-20',
    estimateHours: 1,
    tags: ['release']
  },
  {
    id: 'T-450',
    title: 'Review analytics event naming consistency',
    project: 'Sales Dashboard Revamp',
    priority: 'Low',
    status: 'Not Started',
    dueDate: '2026-03-24',
    estimateHours: 2,
    tags: ['analytics']
  }
];

function buildInitialDeadlines(taskList) {
  return taskList.map(task => ({
    id: `D-${task.id}`,
    title: task.title,
    date: task.dueDate,
    project: task.project,
    priority: task.priority,
    sourceTaskId: task.id
  }));
}

const state = {
  filter: 'all',
  sortMode: 'ai',
  projects: initialProjects.map(item => ({ ...item })),
  tasks: tasks.map(item => ({ ...item })),
  deadlines: buildInitialDeadlines(tasks),
  focus: {
    active: false,
    startedAtMs: null,
    elapsedSeconds: 0,
    completedAtStart: 0
  },
  habits: loadHabits()
};

const statsGrid = document.getElementById('stats-grid');
const projectGrid = document.getElementById('project-grid');
const taskList = document.getElementById('task-list');
const taskFilter = document.getElementById('task-filter');
const calendarGrid = document.getElementById('calendar-grid');
const deadlineList = document.getElementById('deadline-list');
const chartWrap = document.getElementById('chart-wrap');
const analyticsNotes = document.getElementById('analytics-notes');
const insightGrid = document.getElementById('insight-grid');
const heroPlan = document.getElementById('hero-plan');
const zeniIntro = document.getElementById('zeni-intro');
const zeniConfidence = document.getElementById('zeni-confidence');
const controlButtons = document.getElementById('control-buttons');
const previewModal = document.getElementById('preview-modal');
const previewTitle = document.getElementById('preview-title');
const previewBody = document.getElementById('preview-body');
const previewClose = document.getElementById('preview-close');
const projectModal = document.getElementById('project-modal');
const projectModalTitle = document.getElementById('project-modal-title');
const projectModalClose = document.getElementById('project-modal-close');
const projectForm = document.getElementById('project-form');
const projectNameInput = document.getElementById('project-name-input');
const projectOwnerInput = document.getElementById('project-owner-input');
const projectProgressInput = document.getElementById('project-progress-input');
const projectRaidInput = document.getElementById('project-raid-input');
const projectSummaryInput = document.getElementById('project-summary-input');
const projectCancel = document.getElementById('project-cancel');
const addProjectBtn = document.getElementById('add-project');
const removeProjectBtn = document.getElementById('remove-project');
const addDeadlineBtn = document.getElementById('add-deadline');
const focusToggle = document.getElementById('focus-toggle');
const focusPill = document.getElementById('focus-pill');
const aiPrioritizeBtn = document.getElementById('ai-prioritize');
const nlTaskInput = document.getElementById('nl-task-input');
const nlTaskAdd = document.getElementById('nl-task-add');
const zeniFab = document.getElementById('zeni-fab');
const zeniBadge = document.getElementById('zeni-badge');
const zeniChatPanel = document.getElementById('zeni-chat-panel');
const zeniChatClose = document.getElementById('zeni-chat-close');
const zeniChatMessages = document.getElementById('zeni-chat-messages');
const zeniChatNotifications = document.getElementById('zeni-chat-notifications');
const zeniChatSuggestions = document.getElementById('zeni-chat-suggestions');
const zeniChatForm = document.getElementById('zeni-chat-form');
const zeniChatText = document.getElementById('zeni-chat-text');

let activePreviewType = null;
let activeProjectId = null;
const chatState = {
  opened: false,
  greeted: false,
  unreadCount: 0
};

let focusIntervalId = null;

function loadHabits() {
  const defaults = {
    acceptedPlans: 5,
    completedByHour: { '9': 3, '10': 2, '11': 1, '14': 1, '15': 2 },
    snoozedTags: { design: 3, reporting: 2 },
    completedTasks: 14,
    focusMinutesWeek: 95
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.habits));
}

function dayDiff(dateString) {
  const today = new Date('2026-03-15T09:00:00');
  const date = new Date(`${dateString}T09:00:00`);
  return Math.floor((date - today) / (1000 * 60 * 60 * 24));
}

function priorityScore(task) {
  let score = 0;
  const due = dayDiff(task.dueDate);
  if (due < 0) score += 9;
  if (due >= 0 && due <= 2) score += 6;

  const priorityMap = { Critical: 8, High: 6, Medium: 3, Low: 1 };
  score += priorityMap[task.priority] || 2;

  if (task.status === 'In Progress') score += 2;
  if (task.tags.some(tag => state.habits.snoozedTags[tag])) score -= 1;
  return score;
}

function effortHours(task) {
  const raw = Number(task.estimateHours);
  if (!Number.isNaN(raw) && raw > 0) return raw;
  return 2;
}

function urgencyScore(task) {
  const due = dayDiff(task.dueDate);
  if (due < 0) return 10;
  if (due <= 1) return 8;
  if (due <= 3) return 6;
  if (due <= 7) return 4;
  return 2;
}

function effortScore(task) {
  const hours = effortHours(task);
  if (hours <= 2) return 4;
  if (hours <= 4) return 3;
  if (hours <= 6) return 2;
  return 1;
}

function aiTaskScore(task) {
  const priorityMap = { Critical: 5, High: 4, Medium: 2, Low: 1 };
  const progressBoost = task.status === 'In Progress' ? 1 : 0;
  return (urgencyScore(task) * 2) + effortScore(task) + (priorityMap[task.priority] || 2) + progressBoost;
}

function rankTasksByAi(taskItems) {
  return [...taskItems].sort((a, b) => aiTaskScore(b) - aiTaskScore(a));
}

function nextTaskId() {
  const maxNumeric = state.tasks.reduce((max, task) => {
    const match = String(task.id).match(/T-(\d+)/i);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);
  return `T-${String(maxNumeric + 1).padStart(3, '0')}`;
}

function normalizeDateInput(rawDate) {
  if (!rawDate) return null;
  const trimmed = String(rawDate).trim();
  const hasYear = /\b\d{4}\b/.test(trimmed);
  const withYearInput = hasYear ? trimmed : `${trimmed} 2026`;
  const withYear = new Date(withYearInput);
  if (!Number.isNaN(withYear.getTime())) {
    return withYear.toISOString().slice(0, 10);
  }

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) {
    return direct.toISOString().slice(0, 10);
  }
  return null;
}

function parseNaturalLanguageTask(text) {
  const source = String(text || '').trim();
  if (!source) return null;

  const priorityMatch = source.match(/\b(critical|high|medium|low)\b/i);
  const priority = priorityMatch ? `${priorityMatch[1][0].toUpperCase()}${priorityMatch[1].slice(1).toLowerCase()}` : 'Medium';

  const effortMatch = source.match(/(\d+)\s*(h|hr|hrs|hour|hours)\b/i);
  const estimateHours = effortMatch ? Number(effortMatch[1]) : 2;

  const dueMatch = source.match(/\b(?:by|due)\s+([a-z]{3,9}\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2})/i);
  const parsedDate = normalizeDateInput(dueMatch ? dueMatch[1] : null);
  const dueDate = parsedDate || '2026-03-25';

  const projectMatch = source.match(/\bfor\s+([a-z0-9][a-z0-9\s&-]{2,40}?)(?:\s+\d+\s*(?:h|hr|hrs|hour|hours)\b)?$/i);
  const project = projectMatch ? projectMatch[1].trim() : 'General';

  let title = source
    .replace(/\b(?:add|create|new)\s+task\b[:\-\s]*/i, '')
    .replace(/\b(?:by|due)\s+[a-z0-9,\s-]+/i, '')
    .replace(/\bfor\s+[a-z0-9][a-z0-9\s&-]{2,40}$/i, '')
    .replace(/\b(critical|high|medium|low)\b/i, '')
    .replace(/(\d+)\s*(h|hr|hrs|hour|hours)\b/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!title) title = 'New Task';

  return {
    title,
    project,
    priority,
    dueDate,
    estimateHours,
    status: 'Not Started',
    tags: ['nl-input']
  };
}

function addTaskRecord(taskLike) {
  const newTask = {
    id: nextTaskId(),
    title: taskLike.title,
    project: taskLike.project || 'General',
    priority: taskLike.priority || 'Medium',
    status: taskLike.status || 'Not Started',
    dueDate: taskLike.dueDate || '2026-03-25',
    estimateHours: Number(taskLike.estimateHours) || 2,
    tags: Array.isArray(taskLike.tags) ? taskLike.tags : ['manual']
  };

  state.tasks.push(newTask);
  state.deadlines.push({
    id: `D-${newTask.id}`,
    title: newTask.title,
    date: newTask.dueDate,
    project: newTask.project,
    priority: newTask.priority,
    sourceTaskId: newTask.id
  });

  return newTask;
}

function getAdaptiveInsights() {
  const overdue = state.tasks.filter(t => dayDiff(t.dueDate) < 0 && t.status !== 'Done').length;
  const morningFocus = (state.habits.completedByHour['9'] || 0) + (state.habits.completedByHour['10'] || 0) + (state.habits.completedByHour['11'] || 0);
  const afternoonFocus = (state.habits.completedByHour['14'] || 0) + (state.habits.completedByHour['15'] || 0) + (state.habits.completedByHour['16'] || 0);
  const bestWindow = morningFocus >= afternoonFocus ? '09:00-12:00' : '14:00-17:00';

  const snoozed = Object.entries(state.habits.snoozedTags)
    .sort((a, b) => b[1] - a[1])[0];

  const confidence = Math.min(97, 72 + state.habits.acceptedPlans * 2 + Math.floor(state.habits.completedTasks / 5));

  return {
    confidence,
    intro: `Zeni has analyzed your current workload and recent execution pattern. You finish most tasks in ${bestWindow}, so your highest effort items are scheduled there first.`,
    cards: [
      {
        title: 'Priority tune-up',
        text: overdue > 0
          ? `${overdue} overdue task${overdue > 1 ? 's are' : ' is'} now above all medium-priority work. Zeni moved them to the top of today plan.`
          : 'No overdue items right now. Zeni recommends preserving momentum on high-impact work.'
      },
      {
        title: 'Habit adaptation',
        text: `You complete more tasks in ${bestWindow}. Zeni now places complex work before low-focus windows.`
      },
      {
        title: 'Snooze pattern',
        text: snoozed
          ? `You postpone ${snoozed[0]} tasks frequently. Zeni bundles these into one focused block with lighter context-switching.`
          : 'No recurring postpone pattern detected this week. Great consistency.'
      },
      {
        title: 'Recommendation confidence',
        text: `Model confidence is ${confidence}%. It increases when you accept plans and complete suggested tasks on time.`
      }
    ]
  };
}

function getTodayPlan() {
  return state.tasks
    .filter(task => task.status !== 'Done')
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 3)
    .map(task => `${task.id}: ${task.title} (${task.priority}, due ${formatDate(task.dueDate)})`);
}

function formatDate(dateString) {
  return new Date(`${dateString}T09:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function isValidDateInput(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T09:00:00`).getTime());
}

function renderStats() {
  const completed = state.tasks.filter(t => t.status === 'Done').length;
  const activeProjects = state.projects.length;
  const overdue = state.tasks.filter(t => dayDiff(t.dueDate) < 0 && t.status !== 'Done').length;
  const dueSoon = state.tasks.filter(t => {
    const d = dayDiff(t.dueDate);
    return d >= 0 && d <= 3 && t.status !== 'Done';
  }).length;

  const cards = [
    { label: 'Active Projects', value: activeProjects, preview: 'active-projects' },
    { label: 'Tasks Completed', value: `${completed}/${state.tasks.length}`, preview: 'tasks-completed' },
    { label: 'Overdue Items', value: overdue, preview: 'overdue-items' },
    { label: 'Due This Week', value: dueSoon, preview: 'due-this-week' }
  ];

  statsGrid.innerHTML = cards.map(card => `
    <button class="stat-card ${card.preview ? 'stat-button' : ''}" ${card.preview ? `data-preview="${card.preview}"` : ''}>
      <p>${card.label}</p>
      <h4>${card.value}</h4>
    </button>
  `).join('');
}

function renderProjects() {
  const raidColorClass = {
    Green: 'green',
    Amber: 'amber',
    Red: 'red'
  };

  projectGrid.innerHTML = state.projects.map(project => `
    <div class="project-card">
      <h4>${project.name}</h4>
      <div class="project-meta">
        <p>${project.owner}</p>
        <span class="raid-pill ${raidColorClass[project.raidStatus] || 'green'}">${project.raidStatus || 'Green'}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${project.progress}%; ${getRaidProgressColor(project.raidStatus)}"></div>
      </div>
      <p class="project-summary">${project.progressNote || 'No progress note yet.'}</p>
      <div class="project-card-foot">
        <p>${project.progress}% complete</p>
        <button class="btn ghost btn-sm" data-project-action="edit" data-id="${project.id}" type="button">Edit</button>
      </div>
    </div>
  `).join('');

  if (!state.projects.length) {
    projectGrid.innerHTML = '<p class="task-meta">No active projects right now. Add one to get started.</p>';
  }
}

function applyFilter(list) {
  const todayFiltered = list.filter(item => dayDiff(item.dueDate) <= 7 && item.status !== 'Done');
  if (state.filter === 'today') return todayFiltered;
  if (state.filter === 'overdue') return list.filter(item => dayDiff(item.dueDate) < 0 && item.status !== 'Done');
  if (state.filter === 'high') return list.filter(item => ['High', 'Critical'].includes(item.priority) && item.status !== 'Done');
  return list;
}

function renderTasks() {
  const filtered = applyFilter(state.tasks);
  const ranked = state.sortMode === 'ai' ? rankTasksByAi(filtered) : filtered;

  taskList.innerHTML = ranked.map((task, index) => {
    const dueIn = dayDiff(task.dueDate);
    const dueLabel = dueIn < 0 ? `${Math.abs(dueIn)} day(s) overdue` : `Due in ${dueIn} day(s)`;
    const statusClass = task.status === 'Done' ? 'completed' : '';
    const rankPill = state.sortMode === 'ai' ? `<span class="rank-pill">Zeni Rank #${index + 1}</span>` : '';
    return `
      <div class="task-item ${statusClass}">
        <div>
          <strong>${task.title}</strong>
          <div class="task-meta">${task.id} • ${task.project} • ${task.status} • ${effortHours(task)}h</div>
          ${rankPill}
        </div>
        <div>
          <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
        </div>
        <div class="task-meta">${dueLabel}</div>
        <div class="task-actions">
          <button data-action="done" data-id="${task.id}">Done</button>
          <button data-action="snooze" data-id="${task.id}">Snooze</button>
        </div>
      </div>
    `;
  }).join('');

  if (!filtered.length) {
    taskList.innerHTML = '<p class="task-meta">No tasks match this filter.</p>';
  }
}

function renderCalendar() {
  const start = new Date('2026-03-15T00:00:00');
  const days = Array.from({ length: 14 }).map((_, idx) => {
    const date = new Date(start);
    date.setDate(start.getDate() + idx);
    return date;
  });

  calendarGrid.innerHTML = days.map(date => {
    const dayText = date.toISOString().slice(0, 10);
    const dayDeadlines = state.deadlines.filter(item => item.date === dayText);
    const urgent = dayDeadlines.some(item => item.priority === 'Critical' || item.priority === 'High') ? 'urgent' : '';
    return `
      <div class="calendar-day ${urgent}">
        <h5>${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h5>
        <ul>${dayDeadlines.slice(0, 2).map(item => `<li>${item.id}</li>`).join('') || '<li>-</li>'}</ul>
      </div>
    `;
  }).join('');

  const upcoming = state.deadlines
    .sort((a, b) => dayDiff(a.date) - dayDiff(b.date))
    .slice(0, 5);

  deadlineList.innerHTML = upcoming.map(item => `
    <div class="deadline-item">
      <div>
        <span>${item.title}</span>
        <div class="task-meta">${item.project} • ${item.priority}</div>
      </div>
      <div class="deadline-actions">
        <strong>${formatDate(item.date)}</strong>
        <button data-deadline-action="edit" data-id="${item.id}">Edit</button>
        <button data-deadline-action="remove" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `).join('');

  if (!upcoming.length) {
    deadlineList.innerHTML = '<p class="task-meta">No deadlines scheduled.</p>';
  }
}

function renderAnalytics() {
  const max = Math.max(...weeklyThroughput.map(item => item.value));
  chartWrap.innerHTML = weeklyThroughput.map(item => `
    <div class="bar-row">
      <span>${item.day}</span>
      <div class="bar"><span style="width:${(item.value / max) * 100}%"></span></div>
      <strong>${item.value}</strong>
    </div>
  `).join('');

  const completed = state.tasks.filter(task => task.status === 'Done').length;
  const openTasks = state.tasks.filter(task => task.status !== 'Done').length;
  const overdue = getOverdueTasks().length;
  const focusMinutes = state.habits.focusMinutesWeek + Math.floor(getCurrentFocusElapsedSeconds() / 60);
  const acceptanceRate = Math.min(96, 52 + state.habits.acceptedPlans * 4);

  analyticsNotes.innerHTML = `
    <p><strong>Weekly Productivity Report:</strong> ${completed} completed, ${openTasks} open, ${overdue} overdue, and ${focusMinutes} minutes in focus sessions.</p>
    <p>Zeni suggestion acceptance rate is <strong>${acceptanceRate}%</strong>. Keeping this above 70% improves forecasting accuracy for deadlines and staffing.</p>
    <p>Recommendation: maintain a 2-task priority cap during peak hours to reduce context switching.</p>
  `;
}

function renderZeni() {
  const insight = getAdaptiveInsights();
  zeniIntro.textContent = insight.intro;
  zeniConfidence.textContent = `Confidence ${insight.confidence}%`;
  insightGrid.innerHTML = insight.cards.map(card => `
    <div class="insight-card">
      <h4>${card.title}</h4>
      <p>${card.text}</p>
    </div>
  `).join('');

  heroPlan.innerHTML = getTodayPlan().map(item => `<li>${item}</li>`).join('');
}

function appendChatMessage(role, text) {
  const safeText = String(text || '').trim();
  if (!safeText) return;
  const article = document.createElement('article');
  article.className = `zeni-message ${role}`;
  article.textContent = safeText;
  zeniChatMessages.appendChild(article);
  zeniChatMessages.scrollTop = zeniChatMessages.scrollHeight;
}

function getOverdueTasks() {
  return state.tasks
    .filter(task => dayDiff(task.dueDate) < 0 && task.status !== 'Done')
    .sort((a, b) => dayDiff(a.dueDate) - dayDiff(b.dueDate));
}

function getDueThisWeekTasks() {
  return state.tasks
    .filter(task => {
      const d = dayDiff(task.dueDate);
      return d >= 0 && d <= 7 && task.status !== 'Done';
    })
    .sort((a, b) => dayDiff(a.dueDate) - dayDiff(b.dueDate));
}

function getTopPriorityTasks(limit = 3) {
  return state.tasks
    .filter(task => task.status !== 'Done')
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, limit);
}

function buildZeniNotifications() {
  const overdue = getOverdueTasks();
  const weekly = getDueThisWeekTasks();
  const atRiskProjects = state.projects.filter(project => project.health.toLowerCase() === 'at risk');
  const notes = [];

  if (overdue.length) {
    notes.push(`Overdue alert: ${overdue.length} task${overdue.length > 1 ? 's are' : ' is'} overdue. Highest risk: ${overdue[0].title}.`);
  }

  if (weekly.length) {
    notes.push(`Upcoming deadlines: ${weekly.length} task${weekly.length > 1 ? 's' : ''} due this week. Next due: ${weekly[0].title}.`);
  }

  if (atRiskProjects.length) {
    notes.push(`Project health warning: ${atRiskProjects.map(project => project.name).join(', ')} currently marked at risk.`);
  }

  if (!notes.length) {
    notes.push('Everything looks stable right now. Keep momentum with your top-priority task block.');
  }

  return notes;
}

function renderZeniNotifications() {
  const notes = buildZeniNotifications();
  zeniChatNotifications.innerHTML = notes.map(note => `<div class="zeni-note">${note}</div>`).join('');

  if (!chatState.opened) {
    chatState.unreadCount = notes.length;
  } else {
    chatState.unreadCount = 0;
  }
  zeniBadge.textContent = String(chatState.unreadCount);
}

function getZeniResponse(question) {
  const query = question.toLowerCase();
  const overdue = getOverdueTasks();
  const weekly = getDueThisWeekTasks();
  const topTasks = getTopPriorityTasks(3);

  if (query.startsWith('add task') || query.startsWith('create task') || query.startsWith('new task')) {
    const parsed = parseNaturalLanguageTask(question);
    if (!parsed) {
      return 'I could not parse that task. Try: Add task Finish QA report by Mar 21 high for Mobile App v2 3h.';
    }
    const task = addTaskRecord(parsed);
    renderAll();
    return `Added task ${task.id}: ${task.title} due ${formatDate(task.dueDate)} with ${task.priority} priority.`;
  }

  if (query.includes('first') || query.includes('priority') || query.includes('top')) {
    if (!topTasks.length) return 'You are clear right now. No open tasks are waiting for immediate action.';
    return `Start with ${topTasks[0].title}. Then move to ${topTasks[1] ? topTasks[1].title : 'the next backlog item'} for best flow.`;
  }

  if (query.includes('overdue') || query.includes('late') || query.includes('risk')) {
    if (!overdue.length) return 'No overdue tasks at the moment. Risk level is currently low.';
    return `You have ${overdue.length} overdue item${overdue.length > 1 ? 's' : ''}. First recover ${overdue[0].title}, then ${overdue[1] ? overdue[1].title : 'review remaining due dates'}.`;
  }

  if (query.includes('due this week') || query.includes('this week') || query.includes('deadline')) {
    if (!weekly.length) return 'No pending deadlines this week. You can focus on strategic work and backlog cleanup.';
    return `This week has ${weekly.length} due task${weekly.length > 1 ? 's' : ''}. Next milestone is ${weekly[0].title} due ${formatDate(weekly[0].dueDate)}.`;
  }

  if (query.includes('project') || query.includes('status')) {
    const atRisk = state.projects.filter(project => project.health.toLowerCase() === 'at risk');
    if (!atRisk.length) return `All ${state.projects.length} active projects are currently on track.`;
    return `Project status: ${state.projects.length} active. At-risk project${atRisk.length > 1 ? 's' : ''}: ${atRisk.map(project => project.name).join(', ')}.`;
  }

  if (query.includes('suggest') || query.includes('recommend') || query.includes('improve')) {
    return 'Project management suggestion: lock one priority sprint lane, clear overdue blockers daily, and reserve a 20-minute end-of-day planning checkpoint.';
  }

  return 'I can help with priorities, overdue risks, weekly deadlines, project status, and next-step recommendations. Ask me a specific planning question.';
}

function getCurrentFocusElapsedSeconds() {
  if (!state.focus.active || !state.focus.startedAtMs) {
    return state.focus.elapsedSeconds;
  }
  const delta = Math.floor((Date.now() - state.focus.startedAtMs) / 1000);
  return state.focus.elapsedSeconds + Math.max(delta, 0);
}

function updateFocusPill() {
  const completedNow = state.tasks.filter(task => task.status === 'Done').length;

  if (!state.focus.active) {
    focusPill.textContent = 'Focus Off';
    focusPill.classList.remove('active');
    return;
  }

  const seconds = getCurrentFocusElapsedSeconds();
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const doneDelta = Math.max(0, completedNow - state.focus.completedAtStart);

  focusPill.classList.add('active');
  focusPill.textContent = `Focus ${mm}:${ss} | Done +${doneDelta}`;
}

function setFocusMode(active) {
  if (active && !state.focus.active) {
    state.focus.active = true;
    state.focus.startedAtMs = Date.now();
    state.focus.completedAtStart = state.tasks.filter(task => task.status === 'Done').length;
    document.body.classList.add('focus-mode');
    focusToggle.textContent = 'Exit Focus';

    if (focusIntervalId) window.clearInterval(focusIntervalId);
    focusIntervalId = window.setInterval(updateFocusPill, 1000);
    updateFocusPill();
    return;
  }

  if (!active && state.focus.active) {
    state.focus.elapsedSeconds = getCurrentFocusElapsedSeconds();
    state.focus.active = false;
    state.focus.startedAtMs = null;
    document.body.classList.remove('focus-mode');
    focusToggle.textContent = 'Focus Mode';

    if (focusIntervalId) {
      window.clearInterval(focusIntervalId);
      focusIntervalId = null;
    }

    const earnedMinutes = Math.floor(state.focus.elapsedSeconds / 60);
    if (earnedMinutes > 0) {
      state.habits.focusMinutesWeek += earnedMinutes;
      state.focus.elapsedSeconds = 0;
      saveHabits();
    }

    updateFocusPill();
  }
}

function openZeniChat() {
  zeniChatPanel.classList.remove('hidden');
  zeniFab.setAttribute('aria-expanded', 'true');
  chatState.opened = true;
  chatState.unreadCount = 0;
  zeniBadge.textContent = '0';

  if (!chatState.greeted) {
    appendChatMessage('bot', 'Hi, I am Zeni. I can summarize project status, priorities, deadlines, and risks in real time.');
    chatState.greeted = true;
  }

  zeniChatText.focus();
}

function closeZeniChat() {
  zeniChatPanel.classList.add('hidden');
  zeniFab.setAttribute('aria-expanded', 'false');
  chatState.opened = false;
  renderZeniNotifications();
}

function submitZeniQuestion(question) {
  const text = String(question || '').trim();
  if (!text) return;
  appendChatMessage('user', text);
  const answer = getZeniResponse(text);
  appendChatMessage('bot', answer);
}

function bindZeniChat() {
  if (!zeniFab || !zeniChatPanel) return;

  zeniFab.addEventListener('click', () => {
    if (zeniChatPanel.classList.contains('hidden')) {
      openZeniChat();
      return;
    }
    closeZeniChat();
  });

  zeniChatClose.addEventListener('click', closeZeniChat);

  zeniChatSuggestions.addEventListener('click', event => {
    const button = event.target.closest('button[data-chat-suggestion]');
    if (!button) return;
    const prompt = button.dataset.chatSuggestion;
    submitZeniQuestion(prompt);
  });

  zeniChatForm.addEventListener('submit', event => {
    event.preventDefault();
    submitZeniQuestion(zeniChatText.value);
    zeniChatText.value = '';
  });
}

function buildPreview(previewType) {
  if (previewType === 'active-projects') {
    if (!state.projects.length) {
      return {
        title: 'Active Projects',
        items: [{ heading: 'No active projects', text: 'Add a project and it will appear here immediately.' }]
      };
    }

    return {
      title: `Active Projects (${state.projects.length})`,
      items: state.projects.map(project => ({
        heading: `${project.id} • ${project.name}`,
        text: `Owner: ${project.owner}. Health: ${project.health}. Progress: ${project.progress}%.`
      }))
    };
  }

  if (previewType === 'projects') {
    return {
      title: 'Project Overview Preview',
      items: state.projects.map(project => ({
        heading: `${project.name} (${project.progress}%)`,
        text: `Owner: ${project.owner}. Health: ${project.health}.`
      }))
    };
  }

  if (previewType === 'tasks-completed') {
    const completedTasks = state.tasks.filter(task => task.status === 'Done');
    if (!completedTasks.length) {
      return {
        title: 'Tasks Completed',
        items: [{ heading: 'No completed tasks yet', text: 'Mark a task as Done and it will appear here immediately.' }]
      };
    }

    return {
      title: `Tasks Completed (${completedTasks.length})`,
      items: completedTasks.map(task => ({
        heading: `${task.id} • ${task.project}`,
        text: `${task.title} (Completed)`
      }))
    };
  }

  if (previewType === 'overdue-items') {
    const overdueTasks = state.tasks
      .filter(task => dayDiff(task.dueDate) < 0 && task.status !== 'Done')
      .sort((a, b) => dayDiff(a.dueDate) - dayDiff(b.dueDate));

    if (!overdueTasks.length) {
      return {
        title: 'Overdue Items',
        items: [{ heading: 'No overdue items', text: 'Everything is currently on track.' }]
      };
    }

    return {
      title: `Overdue Items (${overdueTasks.length})`,
      items: overdueTasks.map(task => ({
        heading: `${task.id} • ${Math.abs(dayDiff(task.dueDate))} day(s) overdue`,
        text: `${task.title} (${task.project})`
      }))
    };
  }

  if (previewType === 'due-this-week') {
    const weeklyTasks = state.tasks
      .filter(task => {
        const d = dayDiff(task.dueDate);
        return d >= 0 && d <= 7 && task.status !== 'Done';
      })
      .sort((a, b) => dayDiff(a.dueDate) - dayDiff(b.dueDate));

    if (!weeklyTasks.length) {
      return {
        title: 'Due This Week',
        items: [{ heading: 'No tasks due this week', text: 'You have clear runway for upcoming work.' }]
      };
    }

    return {
      title: `Due This Week (${weeklyTasks.length})`,
      items: weeklyTasks.map(task => ({
        heading: `${task.id} • due ${formatDate(task.dueDate)}`,
        text: `${task.title} (${task.priority})`
      }))
    };
  }

  if (previewType === 'tasks') {
    const topTasks = state.tasks
      .filter(task => task.status !== 'Done')
      .sort((a, b) => priorityScore(b) - priorityScore(a))
      .slice(0, 4);
    return {
      title: 'Task List Preview',
      items: topTasks.map(task => ({
        heading: `${task.id} • ${task.priority}`,
        text: `${task.title} (Due ${formatDate(task.dueDate)})`
      }))
    };
  }

  if (previewType === 'calendar') {
    const upcoming = state.deadlines
      .sort((a, b) => dayDiff(a.date) - dayDiff(b.date))
      .slice(0, 4);
    return {
      title: 'Deadline Calendar Preview',
      items: upcoming.map(item => ({
        heading: `${formatDate(item.date)} • ${item.id}`,
        text: `${item.title} (${item.project})`
      }))
    };
  }

  if (previewType === 'analytics') {
    const max = Math.max(...weeklyThroughput.map(item => item.value));
    return {
      title: 'Analytics Preview',
      items: weeklyThroughput.map(item => ({
        heading: `${item.day}: ${item.value} tasks`,
        text: `Productivity level: ${Math.round((item.value / max) * 100)}% of weekly peak.`
      }))
    };
  }

  const insight = getAdaptiveInsights();
  return {
    title: 'Zeni Assistant Preview',
    items: insight.cards.map(card => ({
      heading: card.title,
      text: card.text
    }))
  };
}

function openPreview(previewType) {
  const content = buildPreview(previewType);
  activePreviewType = previewType;
  previewTitle.textContent = content.title;
  previewBody.innerHTML = content.items.map(item => `
    <article class="preview-item">
      <strong>${item.heading}</strong>
      <p>${item.text}</p>
    </article>
  `).join('');
  previewModal.classList.remove('hidden');
  previewModal.setAttribute('aria-hidden', 'false');
}

function closePreview() {
  activePreviewType = null;
  previewModal.classList.add('hidden');
  previewModal.setAttribute('aria-hidden', 'true');
}

function refreshOpenPreview() {
  if (!activePreviewType || previewModal.classList.contains('hidden')) return;
  openPreview(activePreviewType);
}

function bindPreviewModal() {
  controlButtons.addEventListener('click', event => {
    const button = event.target.closest('button[data-preview]');
    if (!button) return;
    openPreview(button.dataset.preview);
  });

  statsGrid.addEventListener('click', event => {
    const button = event.target.closest('button[data-preview]');
    if (!button) return;
    openPreview(button.dataset.preview);
  });

  previewModal.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('[data-close-preview="true"]')) {
      closePreview();
    }
  });

  previewClose.addEventListener('click', closePreview);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !previewModal.classList.contains('hidden')) {
      closePreview();
    }
  });
}

function nextProjectId() {
  const maxNumeric = state.projects.reduce((max, project) => {
    const match = String(project.id).match(/P-(\d+)/i);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `P-${String(maxNumeric + 1).padStart(3, '0')}`;
}

function normalizeRaidStatus(rawRaid) {
  const normalized = String(rawRaid || '').trim().toLowerCase();
  if (normalized === 'green') return 'Green';
  if (normalized === 'amber' || normalized === 'yellow') return 'Amber';
  if (normalized === 'red') return 'Red';
  return '';
}

function healthFromRaid(raidStatus) {
  return raidStatus === 'Red' ? 'At risk' : 'On track';
}

function getRaidProgressColor(raidStatus) {
  if (raidStatus === 'Red') return 'background:#d86c6c;';
  if (raidStatus === 'Amber') return 'background:#d9a54d;';
  return 'background:#48b680;';
}

function openProjectModal(mode, project = null) {
  if (!projectModal || !projectForm) return;

  const isEdit = mode === 'edit' && project;
  activeProjectId = isEdit ? project.id : null;
  projectModalTitle.textContent = isEdit ? 'Edit Project' : 'Create Project';

  projectNameInput.value = isEdit ? project.name : '';
  projectOwnerInput.value = isEdit ? project.owner : '';
  projectProgressInput.value = isEdit ? String(project.progress) : '0';
  projectRaidInput.value = isEdit ? normalizeRaidStatus(project.raidStatus || '') || 'Green' : 'Green';
  projectSummaryInput.value = isEdit ? (project.progressNote || '') : '';

  projectModal.classList.remove('hidden');
  projectModal.setAttribute('aria-hidden', 'false');
  projectNameInput.focus();
}

function closeProjectModal() {
  if (!projectModal || !projectForm) return;
  activeProjectId = null;
  projectForm.reset();
  projectRaidInput.value = 'Green';
  projectModal.classList.add('hidden');
  projectModal.setAttribute('aria-hidden', 'true');
}

function projectFormToData() {
  const name = String(projectNameInput.value || '').trim();
  const owner = String(projectOwnerInput.value || '').trim();
  const progress = Number(projectProgressInput.value);
  const raidStatus = normalizeRaidStatus(projectRaidInput.value);
  const progressNote = String(projectSummaryInput.value || '').trim();

  if (!name) {
    window.alert('Project name is required.');
    return null;
  }

  if (!owner) {
    window.alert('Assigned to is required.');
    return null;
  }

  if (Number.isNaN(progress) || progress < 0 || progress > 100) {
    window.alert('Percentage completed must be between 0 and 100.');
    return null;
  }

  if (!raidStatus) {
    window.alert('Please select a valid RAID status color.');
    return null;
  }

  return {
    name,
    owner,
    progress,
    raidStatus,
    progressNote,
    health: healthFromRaid(raidStatus)
  };
}

function addProject() {
  openProjectModal('create');
}

function editProject(projectId) {
  const project = state.projects.find(item => item.id === projectId);
  if (!project) return;

  openProjectModal('edit', project);
}

function removeProject() {
  if (!state.projects.length) return;
  state.projects.pop();
  renderStats();
  renderProjects();
  refreshOpenPreview();
}

function addDeadline() {
  const title = window.prompt('Deadline title:');
  if (!title) return;

  const date = window.prompt('Deadline date (YYYY-MM-DD):', '2026-03-22');
  if (!date) return;

  if (!isValidDateInput(date)) {
    window.alert('Please use a valid date in YYYY-MM-DD format.');
    return;
  }

  const project = window.prompt('Project name:', 'General');
  const priority = window.prompt('Priority (Critical, High, Medium, Low):', 'Medium') || 'Medium';
  const nextId = `D-CUSTOM-${String(state.deadlines.length + 1).padStart(2, '0')}`;

  state.deadlines.push({
    id: nextId,
    title: title.trim(),
    date,
    project: (project || 'General').trim(),
    priority: priority.trim() || 'Medium'
  });

  renderCalendar();
  refreshOpenPreview();
}

function editDeadline(deadlineId) {
  const target = state.deadlines.find(item => item.id === deadlineId);
  if (!target) return;

  const title = window.prompt('Edit deadline title:', target.title);
  if (!title) return;

  const date = window.prompt('Edit deadline date (YYYY-MM-DD):', target.date);
  if (!date) return;

  if (!isValidDateInput(date)) {
    window.alert('Please use a valid date in YYYY-MM-DD format.');
    return;
  }

  const project = window.prompt('Edit project name:', target.project);
  const priority = window.prompt('Edit priority (Critical, High, Medium, Low):', target.priority);

  target.title = title.trim();
  target.date = date;
  target.project = (project || 'General').trim();
  target.priority = (priority || 'Medium').trim();

  if (target.sourceTaskId) {
    const linkedTask = state.tasks.find(task => task.id === target.sourceTaskId);
    if (linkedTask) {
      linkedTask.dueDate = date;
      linkedTask.title = target.title;
      linkedTask.project = target.project;
      linkedTask.priority = target.priority;
    }
  }

  renderAll();
}

function removeDeadline(deadlineId) {
  const idx = state.deadlines.findIndex(item => item.id === deadlineId);
  if (idx === -1) return;
  const deadline = state.deadlines[idx];
  const ok = window.confirm(`Remove deadline "${deadline.title}"?`);
  if (!ok) return;

  state.deadlines.splice(idx, 1);
  if (deadline.sourceTaskId) {
    const task = state.tasks.find(item => item.id === deadline.sourceTaskId);
    if (task) {
      task.dueDate = '2026-04-01';
    }
  }

  renderAll();
}

function registerDeadlineActions() {
  deadlineList.addEventListener('click', event => {
    const button = event.target.closest('button[data-deadline-action]');
    if (!button) return;

    const action = button.dataset.deadlineAction;
    const deadlineId = button.dataset.id;

    if (action === 'edit') {
      editDeadline(deadlineId);
      return;
    }

    if (action === 'remove') {
      removeDeadline(deadlineId);
    }
  });
}

function registerTaskActions() {
  taskList.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const taskId = button.dataset.id;
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    if (action === 'done') {
      task.status = 'Done';
      state.habits.completedTasks += 1;
      const hour = String(new Date().getHours());
      state.habits.completedByHour[hour] = (state.habits.completedByHour[hour] || 0) + 1;
    }

    if (action === 'snooze') {
      task.tags.forEach(tag => {
        state.habits.snoozedTags[tag] = (state.habits.snoozedTags[tag] || 0) + 1;
      });
      const due = new Date(`${task.dueDate}T09:00:00`);
      due.setDate(due.getDate() + 1);
      task.dueDate = due.toISOString().slice(0, 10);
    }

    saveHabits();
    renderAll();
  });
}

function registerProjectActions() {
  projectGrid.addEventListener('click', event => {
    const button = event.target.closest('button[data-project-action]');
    if (!button) return;

    const action = button.dataset.projectAction;
    const projectId = button.dataset.id;
    if (action === 'edit') {
      editProject(projectId);
    }
  });
}

function bindProjectModal() {
  if (!projectModal || !projectForm) return;

  projectModal.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('[data-close-project-modal="true"]')) {
      closeProjectModal();
    }
  });

  projectModalClose.addEventListener('click', closeProjectModal);
  projectCancel.addEventListener('click', closeProjectModal);

  projectForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = projectFormToData();
    if (!formData) return;

    if (activeProjectId) {
      const project = state.projects.find(item => item.id === activeProjectId);
      if (!project) return;
      project.name = formData.name;
      project.owner = formData.owner;
      project.progress = formData.progress;
      project.raidStatus = formData.raidStatus;
      project.progressNote = formData.progressNote;
      project.health = formData.health;
    } else {
      state.projects.push({
        id: nextProjectId(),
        ...formData
      });
    }

    closeProjectModal();
    renderStats();
    renderProjects();
    refreshOpenPreview();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !projectModal.classList.contains('hidden')) {
      closeProjectModal();
    }
  });
}

function bindTopActions() {
  taskFilter.addEventListener('change', event => {
    state.filter = event.target.value;
    renderTasks();
  });

  document.getElementById('start-day').addEventListener('click', () => {
    document.getElementById('tasks').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('jump-zeni').addEventListener('click', () => {
    document.getElementById('zeni').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('refresh-insights').addEventListener('click', () => {
    renderZeni();
  });

  document.getElementById('accept-plan').addEventListener('click', () => {
    state.habits.acceptedPlans += 1;
    saveHabits();
    renderZeni();
    renderAnalytics();
  });

  focusToggle.addEventListener('click', () => {
    setFocusMode(!state.focus.active);
  });

  aiPrioritizeBtn.addEventListener('click', () => {
    state.sortMode = 'ai';
    renderTasks();
    appendChatMessage('bot', 'Zeni reprioritized tasks using urgency and effort scoring.');
  });

  nlTaskAdd.addEventListener('click', () => {
    const parsed = parseNaturalLanguageTask(nlTaskInput.value);
    if (!parsed) return;
    const task = addTaskRecord(parsed);
    nlTaskInput.value = '';
    renderAll();
    appendChatMessage('bot', `Task added: ${task.title} (${task.priority}) due ${formatDate(task.dueDate)}.`);
  });

  nlTaskInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      nlTaskAdd.click();
    }
  });

  addProjectBtn.addEventListener('click', addProject);
  removeProjectBtn.addEventListener('click', removeProject);
  addDeadlineBtn.addEventListener('click', addDeadline);
}

function renderAll() {
  renderStats();
  renderProjects();
  renderTasks();
  renderCalendar();
  renderAnalytics();
  renderZeni();
  renderZeniNotifications();
  updateFocusPill();
  refreshOpenPreview();
}

bindTopActions();
registerTaskActions();
registerDeadlineActions();
registerProjectActions();
bindPreviewModal();
bindProjectModal();
bindZeniChat();
renderAll();
