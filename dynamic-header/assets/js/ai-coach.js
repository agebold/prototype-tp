// ── Bold AI Coach ─────────────────────────────────────────
const WORKER_URL = 'https://old-cherry-b9dc.izabela-186.workers.dev';

const GOAL_LABELS = {
  balance:       'improve balance and reduce fall risk',
  pain:          'reduce pain and move more freely',
  routine_new:   'add structured movement to daily life',
  routine_start: 'build a consistent exercise routine',
  pelvic:        'strengthen pelvic floor and core',
  brain:         'support brain health through movement',
};

const MOTIVATION_LABELS = {
  balance:       'staying independent and confident on my feet',
  pain:          'feeling better and moving without discomfort',
  routine_new:   'making movement a natural part of daily life',
  routine_start: 'building healthy habits that last',
  pelvic:        'feeling strong and in control',
  brain:         'keeping my mind sharp as I age',
};

const CLASS_TITLES = {
  balance:       'Balance & Stability Flow',
  pain:          'Gentle Joint Relief',
  routine_new:   'Strength: Full Body Toning',
  routine_start: 'Beginner Full Body Strength',
  pelvic:        'Core & Pelvic Floor Essentials',
  brain:         'Mind-Body Coordination',
};

const SELECTION_REASONS = {
  balance:       'selected to build lower-body strength and proprioception for fall prevention',
  pain:          'selected for its low-impact, joint-supportive movements that reduce inflammation',
  routine_new:   'selected as a structured complement to an already-active lifestyle',
  routine_start: 'selected as a gentle first step to establish a sustainable routine',
  pelvic:        'selected for its focus on discreet, effective pelvic floor rehabilitation',
  brain:         'selected for its coordination and rhythm exercises that support neuromotor health',
};

function getBoldContext() {
  const name          = localStorage.getItem('boldUserName') || 'there';
  const focus         = JSON.parse(localStorage.getItem('boldFocus') || '[]');
  const intensity     = localStorage.getItem('boldIntensity') || 'moderate';
  const duration      = localStorage.getItem('boldDuration') || '20 minutes';
  const accommodation = localStorage.getItem('boldAccommodations') || '';
  const lastSession   = localStorage.getItem('boldLastSession') || '';
  const weekNumber    = parseInt(localStorage.getItem('boldWeekNumber') || '1');
  const prim          = focus[0] || 'balance';

  const h = new Date().getHours();
  const timeOfDay = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';

  const daysAgo = lastSession
    ? Math.floor((Date.now() - new Date(lastSession).getTime()) / 86400000)
    : 0;

  const accLower = accommodation.toLowerCase();
  let memberState = 'new';
  if (accLower && /pain|knee|back|hip|shoulder|neck|ankle|wrist/.test(accLower)) {
    memberState = 'pain_flagged';
  } else if (weekNumber >= 4 && weekNumber % 4 === 0) {
    memberState = 'milestone';
  } else if (daysAgo >= 7) {
    memberState = 'returning';
  } else if (daysAgo > 0) {
    memberState = 'active';
  }

  const durMin = parseInt(duration) || 20;

  return {
    name,
    timeOfDay,
    weekNumber,
    memberState,
    goal: GOAL_LABELS[prim] || GOAL_LABELS.balance,
    motivation: MOTIVATION_LABELS[prim] || MOTIVATION_LABELS.balance,
    className: `${durMin} min ${CLASS_TITLES[prim] || CLASS_TITLES.balance}`,
    selectionReason: SELECTION_REASONS[prim] || SELECTION_REASONS.balance,
    daysAgo,
    accommodation,
    prim,
    intensity,
    duration,
  };
}

function buildPrompt(ctx) {
  return `You are a supportive health coach writing personalized messages for adults 65+ on Age Bold, a fitness and wellness platform.

Tone: warm but not patronizing, specific not generic, forward-looking, never evaluative.
Rules:
- Never make the member feel behind or judged
- Always reference their specific class or goal
- No fitness jargon, no calories, no weight, no performance metrics
- If pain is flagged, acknowledge it without alarm

Member details:
Name: ${ctx.name}
Time of day: ${ctx.timeOfDay}
Week in journey: ${ctx.weekNumber}
Member state: ${ctx.memberState}
Primary goal: ${ctx.goal}
Primary motivation: ${ctx.motivation}
Today's class: ${ctx.className}
Why this class was selected: ${ctx.selectionReason}
Days since last session: ${ctx.daysAgo}
${ctx.accommodation ? `Health notes: ${ctx.accommodation}` : ''}

Write two things separated by the pipe character |:
1. A greeting (1 sentence, max 100 characters) acknowledging their current state
2. A "why this class" note (1–2 sentences, max 160 characters) connecting this specific class to their goal${ctx.accommodation ? ', acknowledging their health notes without alarm' : ''}

Format: GREETING|WHY_THIS_CLASS
No labels, no quotes.`;
}

async function generateCoachMessage(ctx) {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{ role: 'user', content: buildPrompt(ctx) }],
    }),
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  const text = data.content?.[0]?.text?.trim() || null;
  if (!text) return null;
  const [greeting, why] = text.split('|').map(s => s.trim());
  return { greeting: greeting || null, why: why || null };
}

// Track last session on first load
(function trackSession() {
  const today = new Date().toDateString();
  const last  = localStorage.getItem('boldLastSessionDate');
  if (last !== today) {
    localStorage.setItem('boldLastSession', new Date().toISOString());
    localStorage.setItem('boldLastSessionDate', today);
  }
})();
