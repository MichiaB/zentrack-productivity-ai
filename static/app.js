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
const timelineDays = document.getElementById('timeline-days');
const timelineGrid = document.getElementById('timeline-grid');
const timelineAiSummary = document.getElementById('timeline-ai-summary');
const timelineAiDetail = document.getElementById('timeline-ai-detail');
const riskAlert = document.getElementById('risk-alert');
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
const timelineAddTaskBtn = document.getElementById('timeline-add-task');
const timelineTaskModal = document.getElementById('timeline-task-modal');
const timelineTaskModalClose = document.getElementById('timeline-task-modal-close');
const timelineTaskForm = document.getElementById('timeline-task-form');
const timelineTaskNameInput = document.getElementById('timeline-task-name-input');
const timelineTaskProjectInput = document.getElementById('timeline-task-project-input');
const timelineTaskDueInput = document.getElementById('timeline-task-due-input');
const timelineTaskPriorityInput = document.getElementById('timeline-task-priority-input');
const timelineTaskRaidInput = document.getElementById('timeline-task-raid-input');
const timelineTaskEstimateInput = document.getElementById('timeline-task-estimate-input');
const timelineTaskStatusInput = document.getElementById('timeline-task-status-input');
const timelineTaskCancel = document.getElementById('timeline-task-cancel');
const timelineTaskDetailModal = document.getElementById('timeline-task-detail-modal');
const timelineTaskDetailClose = document.getElementById('timeline-task-detail-close');
const timelineTaskDetailBody = document.getElementById('timeline-task-detail-body');
const zeniQuickInput = document.getElementById('zeni-quick-input');
const zeniQuickSubmit = document.getElementById('zeni-quick-submit');
const zeniReviewDeadlinesBtn = document.getElementById('zeni-review-deadlines');
const zeniStartFocusBtn = document.getElementById('zeni-start-focus');
const zeniAddTaskBtn = document.getElementById('zeni-add-task');
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
let selectedTimelineTaskId = null;
let selectedCalendarDate = null;
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
  const raidStatus = String(taskLike.raidStatus || '').trim();
  const tags = Array.isArray(taskLike.tags) ? [...taskLike.tags] : ['manual'];
  if (raidStatus) {
    tags.push(`raid-${raidStatus.toLowerCase()}`);
  }

  const newTask = {
    id: nextTaskId(),
    title: taskLike.title,
    project: taskLike.project || 'General',
    priority: taskLike.priority || 'Medium',
    status: taskLike.status || 'Not Started',
    dueDate: taskLike.dueDate || '2026-03-25',
    estimateHours: Number(taskLike.estimateHours) || 2,
    raidStatus: raidStatus || 'Green',
    tags
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
  const topTasks = state.tasks
    .filter(task => task.status !== 'Done')
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 2);

  const weeklyDeadlines = getDueThisWeekTasks().length;
  const morningFocus = (state.habits.completedByHour['9'] || 0) + (state.habits.completedByHour['10'] || 0) + (state.habits.completedByHour['11'] || 0);
  const afternoonFocus = (state.habits.completedByHour['14'] || 0) + (state.habits.completedByHour['15'] || 0) + (state.habits.completedByHour['16'] || 0);
  const bestWindow = morningFocus >= afternoonFocus ? 'morning' : 'afternoon';

  return [
    topTasks[0] ? `Start with ${topTasks[0].title} — it is your top priority today.` : 'Your priority queue is clear right now.',
    weeklyDeadlines ? `You have ${weeklyDeadlines} deadline${weeklyDeadlines > 1 ? 's' : ''} approaching this week.` : 'No urgent deadlines are pressing this week.',
    topTasks[1] ? `Follow with ${topTasks[1].title} once the first lane is stable.` : null,
    `You work best in the ${bestWindow} — schedule deep work there first.`
  ].filter(Boolean);
}

function formatDate(dateString) {
  return new Date(`${dateString}T09:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function completionRatio(task) {
  if (task.status === 'Done') return 100;
  if (task.status === 'In Progress') return 62;
  return 18;
}

function taskDueDate(task) {
  const raw = new Date(`${task.dueDate}T09:00:00`);
  if (Number.isNaN(raw.getTime())) {
    return new Date('2026-03-15T09:00:00');
  }
  return raw;
}

function mondayAnchor(dateLike) {
  const base = new Date(dateLike);
  base.setHours(9, 0, 0, 0);

  const day = base.getDay();
  if (day === 0) {
    base.setDate(base.getDate() + 1);
  } else if (day === 6) {
    base.setDate(base.getDate() + 2);
  } else {
    base.setDate(base.getDate() - (day - 1));
  }

  return base;
}

function getTimelineDays() {
  const openTasks = state.tasks.filter(task => task.status !== 'Done');
  const earliestDue = openTasks.length
    ? openTasks
      .map(taskDueDate)
      .sort((a, b) => a.getTime() - b.getTime())[0]
    : new Date();

  const days = [];
  const cursor = mondayAnchor(earliestDue);

  while (days.length < 10) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      days.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function getTimelineTasks(limit = 5) {
  return state.tasks
    .filter(task => task.status !== 'Done')
    .sort((a, b) => {
      const dueDiff = taskDueDate(a).getTime() - taskDueDate(b).getTime();
      if (dueDiff !== 0) return dueDiff;
      return aiTaskScore(b) - aiTaskScore(a);
    })
    .slice(0, limit);
}

function timelineEndIndex(task, days) {
  const dueDate = new Date(`${task.dueDate}T09:00:00`);
  const firstUpcomingIndex = days.findIndex(day => day.getTime() >= dueDate.getTime());
  if (firstUpcomingIndex !== -1) return firstUpcomingIndex;

  if (dueDate.getTime() <= days[0].getTime()) return 0;
  return days.length - 1;
}

function focusScoreValue() {
  const focusMinutes = state.habits.focusMinutesWeek + Math.floor(getCurrentFocusElapsedSeconds() / 60);
  return Math.min(99, 54 + Math.round(focusMinutes / 3) + state.habits.acceptedPlans * 2);
}

function getBestWorkWindow() {
  const morningFocus = (state.habits.completedByHour['9'] || 0) + (state.habits.completedByHour['10'] || 0) + (state.habits.completedByHour['11'] || 0);
  const afternoonFocus = (state.habits.completedByHour['14'] || 0) + (state.habits.completedByHour['15'] || 0) + (state.habits.completedByHour['16'] || 0);
  return morningFocus >= afternoonFocus ? 'morning' : 'afternoon';
}

function getTimelineAiData(task) {
  const dueIn = dayDiff(task.dueDate);
  const completion = completionRatio(task);
  const raidStatus = String(task.raidStatus || '').toLowerCase();
  const isCritical = task.priority === 'Critical' || raidStatus === 'red';
  const isHigh = task.priority === 'High' || isCritical;
  const bestWindow = getBestWorkWindow();

  let visualState = 'on-track';
  if (dueIn < 0) {
    visualState = 'delayed';
  } else if (isCritical || raidStatus === 'amber' || (dueIn <= 1 && completion < 70) || (task.status === 'Not Started' && dueIn <= 2)) {
    visualState = 'at-risk';
  }

  const tags = [];
  if (isHigh) tags.push('Top Priority');
  if (dueIn <= 2 && dueIn >= 0) tags.push('Due Soon');
  if (visualState === 'at-risk') tags.push('At Risk');
  if (visualState === 'delayed') tags.push('Falling Behind');
  if (completion >= 70 && visualState === 'on-track') tags.push('Good Progress');

  const primaryInsight = visualState === 'delayed'
    ? 'This task is behind schedule - recover it first to avoid timeline drag.'
    : visualState === 'at-risk'
      ? 'This task is at risk of delay. Move it into your next focus block.'
      : 'Start this task first for strong momentum and clearer dependencies.';

  const personalizedInsight = dueIn <= 3
    ? `You usually complete similar work faster in the ${bestWindow}.`
    : task.status === 'Not Started' && !task.dueDate
      ? 'You tend to delay tasks without deadlines. Add a date to protect momentum.'
      : 'You complete shorter tasks faster when they are batched together.';

  const recommendation = visualState === 'delayed'
    ? 'Suggested action: re-scope this task and complete a minimum deliverable today.'
    : visualState === 'at-risk'
      ? 'Suggested action: allocate 60-90 minutes of deep work and clear blockers first.'
      : 'Suggested action: keep this in the first lane to preserve on-time delivery.';

  const showFloatingCard = visualState !== 'on-track' || isHigh;

  return {
    visualState,
    tags,
    primaryInsight,
    personalizedInsight,
    recommendation,
    showFloatingCard,
    isCritical,
    isHigh,
    completion,
    dueIn
  };
}

function isValidDateInput(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T09:00:00`).getTime());
}

function renderStats() {
  if (!statsGrid) return;

  const weeklyTasks = getDueThisWeekTasks().length;
  const upcomingDeadlines = state.deadlines.filter(item => {
    const d = dayDiff(item.date);
    return d >= 0 && d <= 7;
  }).length;
  const averageProgress = state.projects.length
    ? Math.round(state.projects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / state.projects.length)
    : 0;
  const overdue = state.tasks.filter(t => dayDiff(t.dueDate) < 0 && t.status !== 'Done').length;
  const focusScore = focusScoreValue();

  const cards = [
    {
      label: 'Tasks This Week',
      value: weeklyTasks,
      meta: overdue ? `${overdue} overdue item${overdue > 1 ? 's' : ''} need recovery` : 'Priority queue is stable',
      meter: Math.min(100, weeklyTasks * 12),
      preview: 'due-this-week'
    },
    {
      label: 'Upcoming Deadlines',
      value: upcomingDeadlines,
      meta: upcomingDeadlines ? 'Next 7 days across active work' : 'No immediate date pressure detected',
      meter: Math.min(100, upcomingDeadlines * 14),
      preview: 'calendar'
    },
    {
      label: 'Progress %',
      value: `${averageProgress}%`,
      meta: `${state.projects.length} active project${state.projects.length === 1 ? '' : 's'} tracked live`,
      meter: averageProgress,
      preview: 'active-projects'
    },
    {
      label: 'Focus Score',
      value: `${focusScore}%`,
      meta: `Built from ${state.habits.acceptedPlans} accepted plans and focus time`,
      meter: focusScore,
      preview: 'analytics'
    }
  ];

  statsGrid.innerHTML = cards.map(card => `
    <button class="stat-card ${card.preview ? 'stat-button' : ''}" ${card.preview ? `data-preview="${card.preview}"` : ''}>
      <p>${card.label}</p>
      <h4>${card.value}</h4>
      <div class="stat-meta">${card.meta}</div>
      <div class="mini-meter"><span style="width:${card.meter}%"></span></div>
    </button>
  `).join('');
}

function renderProjects() {
  if (!projectGrid) return;

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
  if (!taskList) return;

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
  if (!calendarGrid || !deadlineList) return;

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
    const selected = selectedCalendarDate === dayText ? 'selected' : '';
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const lines = dayDeadlines.slice(0, 2).map(item => {
      const priorityClass = String(item.priority || 'medium').toLowerCase();
      return `<li class="calendar-task-line ${priorityClass}"><span class="calendar-task-dot" aria-hidden="true"></span><span>${item.title}</span></li>`;
    }).join('');

    return `
      <button type="button" class="calendar-day ${urgent} ${selected}" data-calendar-date="${dayText}" aria-pressed="${selected ? 'true' : 'false'}">
        <div class="calendar-day-head">
          <h5><span class="calendar-weekday">${weekday}</span><span class="calendar-date">${shortDate}</span></h5>
          <span class="calendar-count">${dayDeadlines.length}</span>
        </div>
        <ul>${lines || '<li class="calendar-empty">No deadlines</li>'}</ul>
      </button>
    `;
  }).join('');

  const upcomingSource = selectedCalendarDate
    ? state.deadlines.filter(item => item.date === selectedCalendarDate)
    : state.deadlines;

  const upcoming = [...upcomingSource]
    .sort((a, b) => dayDiff(a.date) - dayDiff(b.date))
    .slice(0, selectedCalendarDate ? 8 : 5);

  const toolbarLabel = selectedCalendarDate
    ? `Showing deadlines for ${formatDate(selectedCalendarDate)}`
    : 'Upcoming deadlines';

  const toolbar = `
    <div class="deadline-toolbar">
      <strong>${toolbarLabel}</strong>
      ${selectedCalendarDate ? '<button data-deadline-action="clear-filter" type="button">Show all</button>' : ''}
    </div>
  `;

  deadlineList.innerHTML = toolbar + upcoming.map(item => {
    const d = dayDiff(item.date);
    const dueLabel = d < 0 ? `${Math.abs(d)} day(s) overdue` : d === 0 ? 'Due today' : `Due in ${d} day(s)`;
    const priorityClass = String(item.priority || 'medium').toLowerCase();
    return `
    <div class="deadline-item">
      <div>
        <span>${item.title}</span>
        <div class="task-meta">${item.project}</div>
      </div>
      <div class="deadline-actions">
        <span class="priority ${priorityClass}">${item.priority}</span>
        <span class="deadline-date-chip"><span class="deadline-date-main">${formatDate(item.date)}</span><span class="deadline-date-meta">${dueLabel}</span></span>
        <button data-deadline-action="edit" data-id="${item.id}">Edit</button>
        <button data-deadline-action="remove" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `;
  }).join('');

  if (!upcoming.length) {
    deadlineList.innerHTML = toolbar + '<p class="task-meta">No deadlines scheduled for this range.</p>';
  }
}

function renderTimeline() {
  if (!timelineDays || !timelineGrid || !timelineAiSummary || !timelineAiDetail) return;

  const days = getTimelineDays();
  timelineDays.innerHTML = `
    <span class="timeline-spacer">Task lanes</span>
    ${days.map(day => `<span class="timeline-day">${day.toLocaleDateString('en-US', { weekday: 'short' })} ${day.toLocaleDateString('en-US', { day: 'numeric' })}</span>`).join('')}
  `;

  const timelineTasks = getTimelineTasks(5);
  const aiSnapshot = timelineTasks.map(task => ({ task, ai: getTimelineAiData(task) }));

  const dueSoonCount = aiSnapshot.filter(item => item.ai.tags.includes('Due Soon')).length;
  const atRiskCount = aiSnapshot.filter(item => item.ai.visualState === 'at-risk' || item.ai.visualState === 'delayed').length;
  const onTrackCount = aiSnapshot.filter(item => item.ai.visualState === 'on-track').length;
  const onTrackPct = aiSnapshot.length ? Math.round((onTrackCount / aiSnapshot.length) * 100) : 100;

  timelineAiSummary.innerHTML = `
    <div class="timeline-ai-summary-item">
      <span class="timeline-ai-icon" aria-hidden="true">+</span>
      <div>
        <strong>You have ${dueSoonCount} deadlines approaching this week.</strong>
        <p>${atRiskCount} task${atRiskCount === 1 ? ' is' : 's are'} at risk of delay. ${onTrackPct}% of timeline lanes are on track.</p>
      </div>
    </div>
    <div class="timeline-ai-summary-item muted">
      <span class="timeline-ai-icon" aria-hidden="true">Z</span>
      <div>
        <strong>Zeni pattern:</strong>
        <p>You are most productive in the ${getBestWorkWindow()} and finish short tasks faster in batches.</p>
      </div>
    </div>
  `;

  const selectedTask = timelineTasks.find(item => item.id === selectedTimelineTaskId);
  if (selectedTask) {
    const selectedAi = getTimelineAiData(selectedTask);
    timelineAiDetail.classList.remove('hidden');
    timelineAiDetail.innerHTML = `
      <div class="timeline-ai-detail-head">
        <h4>Zeni Recommendation - ${selectedTask.id}</h4>
        <span class="chip">${selectedAi.visualState === 'on-track' ? 'On Track' : selectedAi.visualState === 'at-risk' ? 'At Risk' : 'Delayed'}</span>
      </div>
      <p><strong>${selectedTask.title}</strong> (${selectedTask.project})</p>
      <p>${selectedAi.primaryInsight}</p>
      <p>${selectedAi.personalizedInsight}</p>
      <p>${selectedAi.recommendation}</p>
    `;
  } else {
    timelineAiDetail.classList.add('hidden');
    timelineAiDetail.innerHTML = '';
  }

  timelineGrid.innerHTML = timelineTasks.map(task => {
    const endIndex = timelineEndIndex(task, days);
    const span = Math.max(1, Math.min(4, Math.ceil(effortHours(task) / 2)));
    const startIndex = Math.max(0, endIndex - span + 1);
    const ai = getTimelineAiData(task);
    const completion = ai.completion;
    const priorityClass = String(task.priority || 'medium').toLowerCase();
    const stateClass = `ai-${ai.visualState}`;
    const highClass = ai.isHigh ? 'ai-high' : '';
    const criticalClass = ai.isCritical ? 'ai-critical' : '';
    const autoCardClass = ai.showFloatingCard ? 'auto-insight' : '';
    const selectedClass = selectedTimelineTaskId === task.id ? 'is-selected' : '';

    const tagMarkup = ai.tags
      .slice(0, 3)
      .map(tag => `<span class="timeline-ai-tag ${tag.toLowerCase().replace(/\s+/g, '-')}">${tag}</span>`)
      .join('');

    return `
      <div class="timeline-row ${selectedClass}" data-task-id="${task.id}">
        <div class="timeline-task-card">
          <div class="timeline-task-top">
            <div>
              <strong>${task.title}</strong>
              <p>${task.project} • ${task.priority} • ${task.status}</p>
            </div>
            <span class="priority ${priorityClass}">${task.priority}</span>
          </div>
          <div class="timeline-ai-tags">${tagMarkup || '<span class="timeline-ai-tag">Good Progress</span>'}</div>
          <div class="timeline-progress-track">
            <span class="timeline-progress-fill" style="width:${completion}%"></span>
          </div>
        </div>
        <div class="timeline-track">
          <div class="timeline-bar ${priorityClass} ${stateClass} ${highClass} ${criticalClass} ${autoCardClass}" style="grid-column:${startIndex + 1} / span ${span};" data-task-id="${task.id}" tabindex="0" role="button" aria-label="Open AI recommendation for ${task.title}">
            ${ai.visualState !== 'on-track' || ai.isCritical ? '<span class="timeline-warning" aria-hidden="true">!</span>' : ''}
            <strong>${task.id}</strong>
            <div class="timeline-bar-meta">
              <span>Due ${formatDate(task.dueDate)}</span>
              <span>${completion}% complete</span>
            </div>
            <article class="timeline-zeni-card" role="note">
              <h5>Zeni insight</h5>
              <p>${ai.primaryInsight}</p>
              <p>${ai.personalizedInsight}</p>
            </article>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (!timelineTasks.length) {
    timelineGrid.innerHTML = '<p class="task-meta">No task lanes to visualize right now.</p>';
    timelineAiDetail.classList.add('hidden');
    timelineAiSummary.innerHTML = '<p class="task-meta">No timeline insights available yet. Add tasks to activate Zeni timeline guidance.</p>';
  }
}

function bindTimelineInteractions() {
  if (!timelineGrid) return;

  timelineGrid.addEventListener('click', event => {
    const row = event.target.closest('.timeline-row[data-task-id]');
    if (!row) return;
    const taskId = row.dataset.taskId;
    if (!taskId) return;

    selectedTimelineTaskId = selectedTimelineTaskId === taskId ? null : taskId;
    renderTimeline();
    openTimelineTaskDetailModal(taskId);
  });

  timelineGrid.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const bar = event.target.closest('.timeline-bar[data-task-id]');
    if (!bar) return;

    event.preventDefault();
    const taskId = bar.dataset.taskId;
    selectedTimelineTaskId = selectedTimelineTaskId === taskId ? null : taskId;
    renderTimeline();
    openTimelineTaskDetailModal(taskId);
  });
}

function renderRiskAlert() {
  if (!riskAlert) return;

  const atRiskProject = state.projects.find(project => String(project.health || '').toLowerCase() === 'at risk');
  const overdue = getOverdueTasks();
  const dueThisWeek = getDueThisWeekTasks();

  let title = 'Flow is stable across the portfolio.';
  let detail = 'Zeni recommends protecting your highest-value work block and keeping calendar review lightweight.';

  if (atRiskProject) {
    const linkedTask = state.tasks
      .filter(task => task.project === atRiskProject.name && task.status !== 'Done')
      .sort((a, b) => dayDiff(a.dueDate) - dayDiff(b.dueDate))[0];
    title = `Project Risk: ${atRiskProject.name} is at risk of delay.`;
    detail = linkedTask
      ? `Consider reallocating effort to ${linkedTask.title}, which is due ${formatDate(linkedTask.dueDate)} and is currently ${linkedTask.status.toLowerCase()}.`
      : 'The project is flagged red. Review staffing, blockers, and the next milestone before end of day.';
  } else if (overdue.length) {
    title = `Deadline Risk: ${overdue[0].title} is overdue.`;
    detail = `Recover the overdue item first, then rebalance the ${dueThisWeek.length} other deadlines approaching this week.`;
  } else if (dueThisWeek.length) {
    title = `${dueThisWeek.length} deadlines are approaching this week.`;
    detail = `Start with ${dueThisWeek[0].title} to protect your delivery window and keep downstream work clear.`;
  }

  riskAlert.innerHTML = `
    <span class="risk-icon" aria-hidden="true">!</span>
    <div>
      <strong>${title}</strong>
      <p>${detail}</p>
    </div>
  `;
}

function renderAnalytics() {
  if (!chartWrap || !analyticsNotes) return;

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
  if (!zeniIntro || !zeniConfidence || !insightGrid || !heroPlan) return;

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
  if (!zeniChatMessages) return;

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
  if (!zeniChatNotifications || !zeniBadge) return;

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
  if (!focusPill) return;

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
  if (!focusToggle) return;

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
  if (!zeniChatPanel || !zeniFab) return;

  zeniChatPanel.classList.remove('hidden');
  zeniFab.setAttribute('aria-expanded', 'true');
  chatState.opened = true;
  chatState.unreadCount = 0;
  zeniBadge.textContent = '0';

  if (!chatState.greeted) {
    appendChatMessage('bot', 'Hi, I am Zeni. I can summarize project status, priorities, deadlines, and risks in real time.');
    chatState.greeted = true;
  }

  if (zeniChatText) zeniChatText.focus();
}

function closeZeniChat() {
  if (!zeniChatPanel || !zeniFab) return;

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
  if (!zeniFab || !zeniChatPanel || !zeniChatClose || !zeniChatSuggestions || !zeniChatForm) return;

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
  if (!previewModal || !previewClose || !previewBody || !previewTitle) return;

  if (controlButtons) {
    controlButtons.addEventListener('click', event => {
      const button = event.target.closest('button[data-preview]');
      if (!button) return;
      openPreview(button.dataset.preview);
    });
  }

  if (statsGrid) {
    statsGrid.addEventListener('click', event => {
      const button = event.target.closest('button[data-preview]');
      if (!button) return;
      openPreview(button.dataset.preview);
    });
  }

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

function openTimelineTaskModal() {
  if (!timelineTaskModal || !timelineTaskForm) return;

  timelineTaskModal.classList.remove('hidden');
  timelineTaskModal.setAttribute('aria-hidden', 'false');

  if (timelineTaskDueInput) {
    timelineTaskDueInput.value = '2026-03-25';
  }
  if (timelineTaskPriorityInput) timelineTaskPriorityInput.value = 'High';
  if (timelineTaskRaidInput) timelineTaskRaidInput.value = 'Green';
  if (timelineTaskEstimateInput) timelineTaskEstimateInput.value = '2';
  if (timelineTaskStatusInput) timelineTaskStatusInput.value = 'Not Started';

  if (timelineTaskNameInput) timelineTaskNameInput.focus();
}

function closeTimelineTaskModal() {
  if (!timelineTaskModal || !timelineTaskForm) return;
  timelineTaskForm.reset();
  timelineTaskModal.classList.add('hidden');
  timelineTaskModal.setAttribute('aria-hidden', 'true');
}

function timelineTaskFormToData() {
  const title = String(timelineTaskNameInput?.value || '').trim();
  const project = String(timelineTaskProjectInput?.value || '').trim();
  const dueDate = String(timelineTaskDueInput?.value || '').trim();
  const priority = String(timelineTaskPriorityInput?.value || 'High').trim();
  const raidStatus = String(timelineTaskRaidInput?.value || 'Green').trim();
  const status = String(timelineTaskStatusInput?.value || 'Not Started').trim();
  const estimateHours = Number(timelineTaskEstimateInput?.value || 2);

  if (!title) {
    window.alert('Task name is required.');
    return null;
  }

  if (!project) {
    window.alert('Project name is required.');
    return null;
  }

  if (!isValidDateInput(dueDate)) {
    window.alert('Please choose a valid due date.');
    return null;
  }

  if (Number.isNaN(estimateHours) || estimateHours < 1 || estimateHours > 24) {
    window.alert('Estimated hours must be between 1 and 24.');
    return null;
  }

  return {
    title,
    project,
    dueDate,
    priority,
    raidStatus,
    status,
    estimateHours,
    tags: ['manual-entry']
  };
}

function bindTimelineTaskModal() {
  if (!timelineTaskModal || !timelineTaskForm) return;

  timelineTaskModal.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('[data-close-timeline-task-modal="true"]')) {
      closeTimelineTaskModal();
    }
  });

  if (timelineTaskModalClose) timelineTaskModalClose.addEventListener('click', closeTimelineTaskModal);
  if (timelineTaskCancel) timelineTaskCancel.addEventListener('click', closeTimelineTaskModal);

  timelineTaskForm.addEventListener('submit', event => {
    event.preventDefault();
    const taskData = timelineTaskFormToData();
    if (!taskData) return;

    const task = addTaskRecord(taskData);
    selectedTimelineTaskId = task.id;
    closeTimelineTaskModal();
    renderAll();
    appendChatMessage('bot', `Timeline task added: ${task.title} (${task.priority}) due ${formatDate(task.dueDate)}.`);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !timelineTaskModal.classList.contains('hidden')) {
      closeTimelineTaskModal();
    }
  });
}

function openTimelineTaskDetailModal(taskId) {
  if (!timelineTaskDetailModal || !timelineTaskDetailBody) return;

  const task = state.tasks.find(item => item.id === taskId);
  if (!task) return;

  const ai = getTimelineAiData(task);
  const dueIn = ai.dueIn;
  const dueLabel = dueIn < 0 ? `${Math.abs(dueIn)} day(s) overdue` : `Due in ${dueIn} day(s)`;
  const raidStatus = task.raidStatus || 'Green';

  timelineTaskDetailBody.innerHTML = `
    <article class="preview-item">
      <strong>${task.id} • ${task.title}</strong>
      <p>${task.project} • ${task.priority} priority • ${task.status}</p>
    </article>
    <article class="preview-item">
      <strong>Schedule Details</strong>
      <p>Due date: ${formatDate(task.dueDate)} (${dueLabel})</p>
      <p>Estimated effort: ${effortHours(task)}h</p>
      <p>RAID status: ${raidStatus}</p>
    </article>
    <article class="preview-item">
      <strong>Zeni Recommendation</strong>
      <p>${ai.primaryInsight}</p>
      <p>${ai.personalizedInsight}</p>
      <p>${ai.recommendation}</p>
    </article>
    <article class="preview-item">
      <strong>AI Labels</strong>
      <p>${ai.tags.length ? ai.tags.join(' • ') : 'Good Progress'}</p>
    </article>
  `;

  timelineTaskDetailModal.classList.remove('hidden');
  timelineTaskDetailModal.setAttribute('aria-hidden', 'false');
}

function closeTimelineTaskDetailModal() {
  if (!timelineTaskDetailModal || !timelineTaskDetailBody) return;
  timelineTaskDetailModal.classList.add('hidden');
  timelineTaskDetailModal.setAttribute('aria-hidden', 'true');
  timelineTaskDetailBody.innerHTML = '';
}

function bindTimelineTaskDetailModal() {
  if (!timelineTaskDetailModal || !timelineTaskDetailBody) return;

  timelineTaskDetailModal.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('[data-close-timeline-task-detail-modal="true"]')) {
      closeTimelineTaskDetailModal();
    }
  });

  if (timelineTaskDetailClose) {
    timelineTaskDetailClose.addEventListener('click', closeTimelineTaskDetailModal);
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !timelineTaskDetailModal.classList.contains('hidden')) {
      closeTimelineTaskDetailModal();
    }
  });
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
  if (!deadlineList) return;

  deadlineList.addEventListener('click', event => {
    const button = event.target.closest('button[data-deadline-action]');
    if (!button) return;

    const action = button.dataset.deadlineAction;
    const deadlineId = button.dataset.id;

    if (action === 'clear-filter') {
      selectedCalendarDate = null;
      renderCalendar();
      return;
    }

    if (action === 'edit') {
      editDeadline(deadlineId);
      return;
    }

    if (action === 'remove') {
      removeDeadline(deadlineId);
    }
  });
}

function bindCalendarInteractions() {
  if (!calendarGrid) return;

  calendarGrid.addEventListener('click', event => {
    const button = event.target.closest('button[data-calendar-date]');
    if (!button) return;

    const date = button.dataset.calendarDate;
    if (!date) return;
    selectedCalendarDate = selectedCalendarDate === date ? null : date;
    renderCalendar();
  });
}

function registerTaskActions() {
  if (!taskList) return;

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
  if (!projectGrid) return;

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
  if (taskFilter) {
    taskFilter.addEventListener('change', event => {
      state.filter = event.target.value;
      renderTasks();
    });
  }

  const startDayBtn = document.getElementById('start-day');
  if (startDayBtn) {
    startDayBtn.addEventListener('click', () => {
      const tasksSection = document.getElementById('tasks');
      if (tasksSection) {
        tasksSection.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      window.location.href = './index.html#tasks';
    });
  }

  const jumpZeniBtn = document.getElementById('jump-zeni');
  if (jumpZeniBtn) {
    jumpZeniBtn.addEventListener('click', () => {
      const zeniSection = document.getElementById('zeni');
      if (zeniSection) {
        zeniSection.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      window.location.href = './zeni.html#zeni';
    });
  }

  const refreshInsightsBtn = document.getElementById('refresh-insights');
  if (refreshInsightsBtn) {
    refreshInsightsBtn.addEventListener('click', () => {
      renderZeni();
    });
  }

  const acceptPlanBtn = document.getElementById('accept-plan');
  if (acceptPlanBtn) {
    acceptPlanBtn.addEventListener('click', () => {
      state.habits.acceptedPlans += 1;
      saveHabits();
      renderZeni();
      renderAnalytics();
    });
  }

  if (focusToggle) {
    focusToggle.addEventListener('click', () => {
      setFocusMode(!state.focus.active);
    });
  }

  if (zeniReviewDeadlinesBtn) {
    zeniReviewDeadlinesBtn.addEventListener('click', () => {
      document.getElementById('calendar').scrollIntoView({ behavior: 'smooth' });
      if (zeniChatPanel.classList.contains('hidden')) openZeniChat();
      appendChatMessage('bot', getZeniResponse('What is due this week?'));
    });
  }

  if (zeniStartFocusBtn) {
    zeniStartFocusBtn.addEventListener('click', () => {
      if (!state.focus.active) {
        setFocusMode(true);
      }
      document.getElementById('tasks').scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (zeniAddTaskBtn) {
    zeniAddTaskBtn.addEventListener('click', () => {
      document.getElementById('tasks').scrollIntoView({ behavior: 'smooth' });
      nlTaskInput.focus();
    });
  }

  if (aiPrioritizeBtn) {
    aiPrioritizeBtn.addEventListener('click', () => {
      state.sortMode = 'ai';
      renderTasks();
      renderTimeline();
      appendChatMessage('bot', 'Zeni reprioritized tasks using urgency and effort scoring.');
    });
  }

  if (nlTaskAdd && nlTaskInput) {
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
  }

  if (timelineAddTaskBtn) {
    timelineAddTaskBtn.addEventListener('click', () => {
      openTimelineTaskModal();
    });
  }

  if (zeniQuickSubmit && zeniQuickInput) {
    const submitQuickPrompt = () => {
      const prompt = String(zeniQuickInput.value || '').trim();
      if (!prompt) return;
      if (zeniChatPanel.classList.contains('hidden')) openZeniChat();
      submitZeniQuestion(prompt);
      zeniQuickInput.value = '';
    };

    zeniQuickSubmit.addEventListener('click', submitQuickPrompt);
    zeniQuickInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitQuickPrompt();
      }
    });
  }

  if (addProjectBtn) addProjectBtn.addEventListener('click', addProject);
  if (removeProjectBtn) removeProjectBtn.addEventListener('click', removeProject);
  if (addDeadlineBtn) addDeadlineBtn.addEventListener('click', addDeadline);
}

function renderAll() {
  renderStats();
  renderProjects();
  renderTasks();
  renderCalendar();
  renderTimeline();
  renderRiskAlert();
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
bindTimelineTaskModal();
bindTimelineTaskDetailModal();
bindZeniChat();
bindTimelineInteractions();
bindCalendarInteractions();
renderAll();
