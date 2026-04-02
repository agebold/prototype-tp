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
  const prim          = localStorage.getItem('boldPrimaryFocus') || focus[0] || 'balance';

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
  return `You are a supportive Bold trainer writing personalized messages for adults 65+ on Bold, a fitness and wellness platform.

Tone: warm but not patronizing, specific not generic, forward-looking, never evaluative.
Rules:
- Never make the member feel behind or judged
- Always reference their specific class or goal
- No fitness jargon, no calories, no weight, no performance metrics
- If pain is flagged, acknowledge it without alarm
- Do NOT use the member's name in the greeting — it is already displayed as the page heading

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
1. A greeting (1 sentence, max 110 characters) acknowledging their current state.${ctx.memberState === 'new' ? ' This is their first session — start with "I\'m Amanda, your Bold trainer." then one warm sentence.' : ''}
2. A "why this class" note (1–2 sentences, max 160 characters) connecting this specific class to their goal${ctx.accommodation ? ', acknowledging their health notes without alarm' : ''}

Format: GREETING|WHY_THIS_CLASS
No labels, no quotes.`;
}

async function generateCoachMessage(ctx) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{ role: 'user', content: buildPrompt(ctx) }],
    }),
  });
  clearTimeout(timer);

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  const text = data.content?.[0]?.text?.trim() || null;
  if (!text) return null;
  const [greeting, why] = text.split('|').map(s => s.trim());
  return { greeting: greeting || null, why: why || null };
}

// ── Plan bullets prompt ────────────────────────────────────
function buildPlanBulletsPrompt() {
  const focus        = JSON.parse(localStorage.getItem('boldFocus') || '[]');
  const duration     = localStorage.getItem('boldDuration') || '20 minutes';
  const intensity    = localStorage.getItem('boldIntensity') || 'moderate';
  const positions    = JSON.parse(localStorage.getItem('boldPosition') || '[]');
  const accommodation = localStorage.getItem('boldAccommodations') || '';
  const painArea     = JSON.parse(localStorage.getItem('boldPainArea') || '[]');
  const painRating   = localStorage.getItem('boldPainRating') || '';
  const fallHistory  = localStorage.getItem('boldFallHistory') || '';
  const fallFear     = localStorage.getItem('boldFallFear') || '';
  const prim         = localStorage.getItem('boldPrimaryFocus') || focus[0] || 'balance';

  const clinicalGoals = {
    balance:       'improve balance confidence and reduce fear of falling',
    pain:          `reduce ${painArea.length ? painArea.map(a => a.replace('_',' ')).join(' and ') + ' ' : ''}pain`,
    routine_new:   'build sustainable movement habits',
    routine_start: 'build sustainable movement habits',
    pelvic:        'improve pelvic floor strength and bladder control',
    brain:         'maintain mental sharpness and support cognitive health',
  };
  const functionalGoals = {
    balance:       fallHistory === 'multiple' ? 'feel safer and more confident in daily life after previous falls' : fallFear === 'very_worried' ? 'move through daily life without fear of falling' : 'stay independent and confident on your feet',
    pain:          'feel better and move more freely in daily life',
    routine_new:   'make movement a natural part of your week',
    routine_start: 'build consistency and feel stronger over time',
    pelvic:        'feel confident and in control in everyday activities',
    brain:         'stay sharp and engaged as you age',
  };

  const durationMap = {
    '10 minutes': '10 to 15 min', '20 minutes': '15 to 20 min',
    '30 minutes': '25 to 35 min', '45+ minutes': '30 to 40 min',
  };

  const therapeuticApproach = {
    balance:       'progressive balance training and leg strengthening',
    pain:          'building core stability and joint mobility',
    routine_new:   'full-body functional strength and mobility',
    routine_start: 'foundational strength and flexibility',
    pelvic:        'pelvic floor strengthening and bladder control',
    brain:         'supporting cognitive wellness through varied movement patterns',
  };
  const modalities = {
    balance:       'balance drills, stability work, and coordination exercises',
    pain:          'low-impact strength and gentle mobility exercises',
    routine_new:   'strength, cardio, and mobility work',
    routine_start: 'beginner-friendly strength and flexibility',
    pelvic:        'gentle progressive pelvic floor and core exercises',
    brain:         'coordination, rhythm, and Tai Chi-inspired movement',
  };

  // Determine position label — used in exactly ONE bullet (bullet 2 or 3, never both)
  const seatOnly  = positions.includes('seated') && !positions.includes('standing') && !positions.includes('floor') && !positions.includes('any');
  const standOnly = positions.includes('standing') && !positions.includes('seated') && !positions.includes('floor') && !positions.includes('any');
  const hasFloor  = positions.includes('floor') || positions.includes('any');
  const posLabel  = seatOnly ? 'fully seated' : standOnly ? 'standing' : hasFloor ? 'seated, standing, and floor' : 'seated and standing';

  // Decide where position lives: bullet 2 if it's a safety constraint (seat-only), else bullet 3
  const posInBullet2 = seatOnly;
  const posInBullet3 = !seatOnly;

  const painContext  = painArea.length ? `Pain areas: ${painArea.map(a => a.replace('_',' ')).join(', ')}. Severity: ${painRating}/10.` : '';
  const fallContext  = fallHistory && fallHistory !== 'no' ? `Fall history: ${fallHistory}. Fear: ${fallFear || 'not specified'}.` : '';
  const hasConstraint = accommodation || painArea.length || (fallHistory && fallHistory !== 'no') || prim === 'pelvic' || prim === 'brain' || seatOnly;

  return `Generate exactly 4 plan summary bullets for an adult 65+ on Bold, a fitness platform.

MEMBER:
- Goal: ${clinicalGoals[prim] || clinicalGoals.balance} — so they can ${functionalGoals[prim] || functionalGoals.balance}
- Duration: ${durationMap[duration] || duration}
- Intensity: ${intensity}
- Position: ${posLabel}
- Therapeutic approach: ${therapeuticApproach[prim] || therapeuticApproach.balance}
- Modalities: ${modalities[prim] || modalities.balance}
${accommodation ? `- Accommodation note: "${accommodation}"` : ''}
${painContext}
${fallContext}

STRICT RULES — follow exactly:
1. GOAL: 8–12 words. Combine clinical + functional goal. No filler. Hard cap: 70 characters.
2. DURATION: "X to Y min [${posInBullet2 ? posLabel + ' ' : ''}sessions, building gradually" — 8–12 words. Position appears here ONLY if seat-only (safety reason).
3. FOCUS: 12–18 words. Therapeutic approach + intensity + modalities.${posInBullet3 ? ' Include position label here (NOT in bullet 2).' : ' Do NOT repeat position here — already in bullet 2.'} Hard cap: 110 characters.
4. ACCOMMODATIONS (optional): 12–18 words. Hard cap: 110 characters.
   - ONLY include if there is a real, specific constraint: accommodation note, pain area, fall history, pelvic/brain symptoms, or seat-only position needing a safety note.
   - If none of the above apply, OMIT this line entirely — do not write it at all.
   - NEVER use generic filler. Must add something new not already in bullets 1–3.

Format — output only these lines, no markdown:
GOAL: ...
DURATION: ...
FOCUS: ...
ACCOMMODATIONS: ... (omit this line if no real constraint exists)`;
}

async function generatePlanBullets() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: buildPlanBulletsPrompt() }],
    }),
  });
  clearTimeout(timer);

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  const text = data.content?.[0]?.text?.trim() || null;
  if (!text) return null;

  const result = {};
  text.split('\n').forEach(line => {
    if (line.startsWith('GOAL:'))           result.goal     = line.replace('GOAL:', '').trim();
    else if (line.startsWith('DURATION:'))  result.duration = line.replace('DURATION:', '').trim();
    else if (line.startsWith('FOCUS:'))     result.focus    = line.replace('FOCUS:', '').trim();
    else if (line.startsWith('ACCOMMODATIONS:')) result.accommodations = line.replace('ACCOMMODATIONS:', '').trim();
  });
  return result;
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
