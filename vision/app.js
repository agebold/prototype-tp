/* ================================================================
   Bold Redesign — Interactive Prototype Logic
   ================================================================ */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 1.  VIEW TOGGLE
  // ------------------------------------------------------------------
  const viewMap = {
    day1:           'day1View',
    fresh:          'freshView',
    comeback:       'comebackView',
    day2:           'day2View',
    checkin:        'checkinView',
    completed:      'completedView',
    profile:        'profileView',
    care:           'careView',
    discover:       'discoverView',
    notifications:  'notificationsView',
  };

  const toggleBtns = document.querySelectorAll('.view-toggle__btn');
  const views = document.querySelectorAll('.view');
  const timeGroup = document.getElementById('timeGroup');
  const todayViews = new Set(['day1', 'fresh', 'comeback', 'day2', 'checkin', 'completed']);

  function showView(viewKey, scrollTarget) {
    views.forEach(v => v.classList.add('hidden'));
    toggleBtns.forEach(b => b.classList.remove('active'));

    const targetId = viewMap[viewKey];
    const targetView = document.getElementById(targetId);
    const targetBtn = document.querySelector(`.view-toggle__btn[data-view="${viewKey}"]`);

    if (targetView) {
      targetView.classList.remove('hidden');
      // Re-trigger fade animation
      targetView.style.animation = 'none';
      void targetView.offsetHeight;          // force reflow
      targetView.style.animation = '';
    }
    if (targetBtn) targetBtn.classList.add('active');

    // Show/hide time-of-day controls — only relevant for Today views
    if (timeGroup) {
      timeGroup.style.display = todayViews.has(viewKey) ? '' : 'none';
    }

    if (scrollTarget) {
      // Scroll to a specific section after a brief delay for animation
      setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });


  // ------------------------------------------------------------------
  // 2.  TIME-OF-DAY TOGGLE
  // ------------------------------------------------------------------
  let currentTime = 'morning';
  const timeBtns = document.querySelectorAll('.view-toggle__time');

  const timeConfig = {
    morning:   { greeting: 'Good morning',   emoji: { day1: '👋', fresh: '🌱', day2: '☀️', checkin: '📋', comeback: '💜' } },
    afternoon: { greeting: 'Good afternoon',  emoji: { day1: '👋', fresh: '🌿', day2: '🌤', checkin: '📋', comeback: '💜' } },
    evening:   { greeting: 'Good evening',    emoji: { day1: '👋', fresh: '🌱', day2: '🌅', checkin: '📋', comeback: '💜' } },
    night:     { greeting: 'Good night',      emoji: { day1: '👋', fresh: '🌙', day2: '🌙', checkin: '📋', comeback: '💜' } },
  };

  function applyTimeOfDay(time) {
    currentTime = time;

    // Update all elements with data-[time] attributes
    document.querySelectorAll('[data-morning]').forEach(el => {
      const content = el.getAttribute(`data-${time}`);
      if (content) {
        // If the element uses innerHTML (contains HTML tags in content)
        if (content.includes('<strong>') || content.includes('<em>')) {
          el.innerHTML = content;
        } else {
          el.textContent = content;
        }
      }
    });

    // Update time toggle buttons
    timeBtns.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.view-toggle__time[data-time="${time}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  // Auto-detect time of day on load
  function detectTime() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTimeOfDay(btn.dataset.time);
    });
  });

  // Apply detected time on load
  const detectedTime = detectTime();
  applyTimeOfDay(detectedTime);


  // ------------------------------------------------------------------
  // 3.  SETTINGS BUTTON (placeholder — opens settings in future)
  // ------------------------------------------------------------------
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      // Placeholder: could open a settings page/modal in the future
      alert('Settings page coming soon.');
    });
  }


  // ------------------------------------------------------------------
  // 4.  NOTIFICATIONS — now a full page view
  // ------------------------------------------------------------------
  const mobileNotifBtn = document.getElementById('mobileNotifBtn');

  // Mobile notification bell → navigate to notifications page
  if (mobileNotifBtn) {
    mobileNotifBtn.addEventListener('click', () => {
      updateAllNavStates('notifications');
      navigateToView('notifications');
    });
  }

  // "Mark all as read" on notifications page
  const notifMarkAll = document.getElementById('notifMarkAll');
  if (notifMarkAll) {
    notifMarkAll.addEventListener('click', () => {
      document.querySelectorAll('.notif-page__item--unread').forEach(item => {
        item.classList.remove('notif-page__item--unread');
      });
      // Hide badges everywhere
      document.querySelectorAll('.sidebar__badge, .mobile-topbar__badge, .mobile-menu__badge').forEach(badge => {
        badge.style.display = 'none';
      });
    });
  }

  // "Start check-in" buttons on notification page → open check-in modal
  document.querySelectorAll('.notif-page__item-action.notif-item__action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const checkinModal = document.getElementById('checkinModal');
      if (checkinModal) checkinModal.classList.remove('hidden');
    });
  });


  // ------------------------------------------------------------------
  // 4b. MOBILE HAMBURGER MENU
  // ------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  function openMobileMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('hidden');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('hidden');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay) closeMobileMenu();
    });
  }

  // Mobile menu nav links
  document.querySelectorAll('.mobile-menu__link[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const nav = link.dataset.nav;
      updateAllNavStates(nav);
      navigateToView(nav);
      closeMobileMenu();
    });
  });

  // Mobile menu extras
  const mobileStreakBtn = document.getElementById('mobileStreakBtn');
  if (mobileStreakBtn) {
    mobileStreakBtn.addEventListener('click', () => {
      closeMobileMenu();
      showView('profile', 'profileProgress');
      updateAllNavStates('profile');
    });
  }


  // ------------------------------------------------------------------
  // 5.  BOLD STREAK → Opens Profile on Progress section
  // ------------------------------------------------------------------
  const streakBtn = document.getElementById('streakBtn');
  if (streakBtn) {
    streakBtn.addEventListener('click', () => {
      showView('profile', 'profileProgress');
      updateAllNavStates('profile');
    });
  }


  // ------------------------------------------------------------------
  // 6.  MOOD OVERLAY — Opens from trigger pill, selects mood
  // ------------------------------------------------------------------
  const moodResponses = {
    low:   "I hear you, June. Let's take it easy today — I've adjusted your plan to something lighter and more comfortable. 💛",
    okay:  "Thanks for sharing! Your plan for today stays as is — a good balance of movement and rest. 🙂",
    good:  "That's wonderful to hear! Let's keep the momentum going with today's class. You're doing great! 😊",
    great: "Amazing, June! Since you're feeling great, I've added a bonus stretch session if you're up for it! 🎉",
    tired: "That's completely okay — rest is part of the journey. I've picked something gentle and restorative for you. 😴",
    sore:  "Thanks for letting me know. I'll suggest a lighter class that's easier on your body today. Take it slow! 🤕",
  };

  const moodModal = document.getElementById('moodModal');
  const moodModalClose = document.getElementById('moodModalClose');
  let activeMoodTrigger = null; // track which trigger pill opened the modal

  function openMoodModal() { if (moodModal) moodModal.classList.remove('hidden'); }
  function closeMoodModal() { if (moodModal) moodModal.classList.add('hidden'); }

  // Trigger pills → open mood overlay
  document.querySelectorAll('.mood-trigger-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      activeMoodTrigger = this;
      // Reset selection in the modal
      moodModal.querySelectorAll('.mood-modal__btn').forEach(b => b.classList.remove('mood-modal__btn--selected'));
      openMoodModal();
    });
  });

  // Close mood modal
  if (moodModalClose) moodModalClose.addEventListener('click', closeMoodModal);
  if (moodModal) moodModal.addEventListener('click', (e) => { if (e.target === moodModal) closeMoodModal(); });

  // Mood option buttons inside modal
  document.querySelectorAll('.mood-modal__btn').forEach(btn => {
    btn.addEventListener('click', function () {
      // Highlight selection
      moodModal.querySelectorAll('.mood-modal__btn').forEach(b => b.classList.remove('mood-modal__btn--selected'));
      this.classList.add('mood-modal__btn--selected');

      const mood = this.dataset.mood;

      // Update the trigger pill that opened the modal
      if (activeMoodTrigger) {
        const emojiMap = { great: '😄', good: '😊', okay: '😐', tired: '😴', sore: '🤕' };
        activeMoodTrigger.textContent = (emojiMap[mood] || '😊') + ' Feeling ' + mood;
        activeMoodTrigger.classList.add('today-compact__action-pill--done');
      }

      // Show mood response bubble in the active view
      const activeView = document.querySelector('.view:not(.hidden)');
      const moodResponse = activeView ? activeView.querySelector('.today-compact__mood-response') : document.getElementById('moodResponse');
      const moodResponseText = moodResponse ? moodResponse.querySelector('.today-compact__resp-text') : null;
      if (moodResponse && moodResponseText) {
        moodResponseText.textContent = moodResponses[mood] || moodResponses.okay;
        moodResponse.classList.remove('hidden');
        moodResponse.style.animation = 'none';
        void moodResponse.offsetHeight;
        moodResponse.style.animation = '';
      }

      // Close modal after a short delay for visual feedback
      setTimeout(closeMoodModal, 400);
    });
  });


  // ------------------------------------------------------------------
  // 7.  INLINE CHECK-IN OPTIONS — Toggle selected state
  // ------------------------------------------------------------------
  document.querySelectorAll('.inline-checkin__options').forEach(group => {
    const options = group.querySelectorAll('.inline-checkin__option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('inline-checkin__option--selected'));
        opt.classList.add('inline-checkin__option--selected');
      });
    });
  });


  // ------------------------------------------------------------------
  // 8.  BUTTON FEEDBACK — "Start class" buttons get brief press effect
  // ------------------------------------------------------------------
  document.querySelectorAll('.btn--primary').forEach(btn => {
    btn.addEventListener('click', function () {
      const original = this.textContent;
      if (original.toLowerCase().includes('start') || original.toLowerCase().includes('submit')) {
        this.textContent = '✓ Got it!';
        this.style.background = '#16A34A';
        setTimeout(() => {
          this.textContent = original;
          this.style.background = '';
        }, 1200);
      }
    });
  });


  // ------------------------------------------------------------------
  // 9.  SAVE CLASS TOGGLE
  // ------------------------------------------------------------------
  document.querySelectorAll('.class-card__save, .today-card__save').forEach(btn => {
    btn.addEventListener('click', function () {
      const isSaved = this.classList.toggle('saved');
      const label = isSaved ? 'Saved ♥' : 'Save';
      // Keep SVG intact, just change the text node
      const textNode = [...this.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = label;
    });
  });


  // ------------------------------------------------------------------
  // 9b. LOG YOUR DAY — toggle logged state (chips in strip)
  // ------------------------------------------------------------------
  document.querySelectorAll('.today-log__chip').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.toggle('today-log__chip--logged');
      // Update the summary badge to show logged count
      const toggle = this.closest('.today-compact__log-toggle');
      if (toggle) {
        const logged = toggle.querySelectorAll('.today-log__chip--logged').length;
        let badge = toggle.querySelector('.today-compact__log-badge');
        if (logged > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'today-compact__log-badge';
            toggle.querySelector('.today-compact__log-summary').appendChild(badge);
          }
          badge.textContent = logged;
        } else if (badge) {
          badge.remove();
        }
      }
    });
  });


  // ------------------------------------------------------------------
  // 10.  DYNAMIC DATE in calendar badges
  // ------------------------------------------------------------------
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const now = new Date();
  document.querySelectorAll('.plan-hero__calendar-month').forEach(el => {
    el.textContent = months[now.getMonth()];
  });
  document.querySelectorAll('.plan-hero__calendar-day').forEach(el => {
    el.textContent = now.getDate();
  });


  // ------------------------------------------------------------------
  // 11.  NAVIGATION — unified handler for sidebar, bottom nav, mobile menu
  // ------------------------------------------------------------------

  // Helper: update active state across all nav locations
  function updateAllNavStates(navKey) {
    // Sidebar links
    document.querySelectorAll('.sidebar__link').forEach(l => {
      l.classList.remove('sidebar__link--active');
      l.removeAttribute('aria-current');
    });
    const activeSidebar = document.querySelector(`.sidebar__link[data-nav="${navKey}"]`);
    if (activeSidebar) {
      activeSidebar.classList.add('sidebar__link--active');
      activeSidebar.setAttribute('aria-current', 'page');
    }

    // Bottom nav links
    document.querySelectorAll('.bottom-nav__item').forEach(l => {
      l.classList.remove('bottom-nav__item--active');
    });
    const activeBottom = document.querySelector(`.bottom-nav__item[data-nav="${navKey}"]`);
    if (activeBottom) activeBottom.classList.add('bottom-nav__item--active');

    // Mobile menu links
    document.querySelectorAll('.mobile-menu__link').forEach(l => {
      l.classList.remove('mobile-menu__link--active');
    });
    const activeMobile = document.querySelector(`.mobile-menu__link[data-nav="${navKey}"]`);
    if (activeMobile) activeMobile.classList.add('mobile-menu__link--active');
  }

  // Helper: navigate to the view for a given nav key
  function navigateToView(navKey) {
    if (navKey === 'today') {
      showView('day2');
    } else if (navKey === 'discover') {
      showView('discover');
    } else if (navKey === 'care') {
      showView('care');
    } else if (navKey === 'profile') {
      showView('profile');
    } else if (navKey === 'notifications') {
      showView('notifications');
    }
  }

  // Sidebar links
  document.querySelectorAll('.sidebar__link[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const nav = link.dataset.nav;
      updateAllNavStates(nav);
      navigateToView(nav);
    });
  });

  // Bottom nav links
  document.querySelectorAll('.bottom-nav__item[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const nav = link.dataset.nav;
      updateAllNavStates(nav);
      navigateToView(nav);
    });
  });


  // ------------------------------------------------------------------
  // 12.  DISCOVER FILTERS — toggle filter pills
  // ------------------------------------------------------------------
  document.querySelectorAll('.discover-filter').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.discover-filter').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Show/hide sections based on filter
      const filter = this.dataset.filter;
      const discoverView = document.getElementById('discoverView');
      if (!discoverView) return;

      const sections = discoverView.querySelectorAll('.discover-section');
      sections.forEach(sec => {
        const label = sec.getAttribute('aria-label') || '';
        if (filter === 'all') {
          sec.style.display = '';
        } else if (filter === 'recommended') {
          sec.style.display = label.includes('trainer') ? '' : 'none';
        } else if (filter === 'on-demand') {
          sec.style.display = label.includes('On-demand') ? '' : 'none';
        } else if (filter === 'live') {
          sec.style.display = label.includes('Live') ? '' : 'none';
        } else if (filter === 'blog') {
          sec.style.display = label.includes('Blog') ? '' : 'none';
        } else if (filter === 'audio' || filter === 'meditation') {
          sec.style.display = label.includes('Audio') || label.includes('meditation') ? '' : 'none';
        }
      });
    });
  });


  // ------------------------------------------------------------------
  // 13.  DISCOVER SEARCH — simple live search filtering cards
  // ------------------------------------------------------------------
  const discoverSearchInput = document.querySelector('.discover-search__input');
  if (discoverSearchInput) {
    discoverSearchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      const discoverView = document.getElementById('discoverView');
      if (!discoverView) return;

      // Search through all card titles
      discoverView.querySelectorAll('.discover-card, .discover-live-card, .discover-blog-card, .discover-audio-card').forEach(card => {
        const title = (card.querySelector('.discover-card__title, .discover-live-card__name, .discover-blog-card__title, .discover-audio-card__title') || {}).textContent || '';
        const trainer = (card.querySelector('.discover-card__trainer, .discover-live-card__trainer, .discover-blog-card__meta, .discover-audio-card__trainer') || {}).textContent || '';
        const match = query === '' || title.toLowerCase().includes(query) || trainer.toLowerCase().includes(query);
        card.style.display = match ? '' : 'none';
      });

      // Show/hide sections that have no visible cards
      discoverView.querySelectorAll('.discover-section').forEach(sec => {
        const visibleCards = sec.querySelectorAll('.discover-card:not([style*="display: none"]), .discover-live-card:not([style*="display: none"]), .discover-blog-card:not([style*="display: none"]), .discover-audio-card:not([style*="display: none"])');
        sec.style.display = (query === '' || visibleCards.length > 0) ? '' : 'none';
      });
    });
  }


  // ------------------------------------------------------------------
  // 14.  AUDIO PLAY BUTTONS — toggle play/pause
  // ------------------------------------------------------------------
  document.querySelectorAll('.discover-audio-card__play').forEach(btn => {
    btn.addEventListener('click', function () {
      const isPlaying = this.classList.toggle('playing');
      if (isPlaying) {
        this.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="4" width="3" height="12" rx="1" fill="currentColor"/><rect x="12" y="4" width="3" height="12" rx="1" fill="currentColor"/></svg>';
        this.style.background = 'var(--green-600)';
      } else {
        this.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4L16 10L6 16V4Z" fill="currentColor"/></svg>';
        this.style.background = '';
      }
    });
  });


  // ------------------------------------------------------------------
  // 15.  ADJUST CLASS MODAL — Micro check-in + educational moment
  // ------------------------------------------------------------------
  const switchModal = document.getElementById('switchClassModal');
  const switchModalClose = document.getElementById('switchModalClose');
  const switchConfirmBtn = document.getElementById('switchConfirmBtn');
  const switchKeepBtn = document.getElementById('switchKeepBtn');
  const switchReasons = document.getElementById('switchReasons');
  const switchResponse = document.getElementById('switchResponse');
  const switchResponseText = document.getElementById('switchResponseText');

  const switchResponses = {
    sore: "Got it — I'll suggest a gentler class that's easier on your body. Soreness is normal, and listening to your body is smart.",
    challenge: "Love the ambition! I'll find something that pushes you a bit more while keeping it safe and supportive.",
    'low-energy': "No worries — energy levels fluctuate. I'll pick something lighter that still counts as a great session.",
    variety: "Variety keeps things interesting! I'll show you something different that still fits your balance program.",
  };

  // Open modal when "Adjust class" is clicked
  document.querySelectorAll('.btn--switch-class').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (switchModal) {
        switchModal.classList.remove('hidden');
        // Reset state
        switchReasons.querySelectorAll('.modal__option').forEach(o => o.classList.remove('selected'));
        if (switchResponse) switchResponse.classList.add('hidden');
        if (switchConfirmBtn) switchConfirmBtn.disabled = true;
      }
    });
  });

  // Close modal
  function closeSwitchModal() {
    if (switchModal) switchModal.classList.add('hidden');
  }

  if (switchModalClose) switchModalClose.addEventListener('click', closeSwitchModal);
  if (switchKeepBtn) switchKeepBtn.addEventListener('click', closeSwitchModal);

  // Close on overlay click
  if (switchModal) {
    switchModal.addEventListener('click', (e) => {
      if (e.target === switchModal) closeSwitchModal();
    });
  }

  // Select a reason
  if (switchReasons) {
    switchReasons.querySelectorAll('.modal__option').forEach(opt => {
      opt.addEventListener('click', function () {
        switchReasons.querySelectorAll('.modal__option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');

        const reason = this.dataset.reason;
        if (switchResponseText && switchResponse) {
          switchResponseText.textContent = switchResponses[reason] || '';
          switchResponse.classList.remove('hidden');
          switchResponse.style.animation = 'none';
          void switchResponse.offsetHeight;
          switchResponse.style.animation = '';
        }

        if (switchConfirmBtn) switchConfirmBtn.disabled = false;
      });
    });
  }

  // Confirm switch
  if (switchConfirmBtn) {
    switchConfirmBtn.addEventListener('click', function () {
      this.textContent = '✓ Finding a new class…';
      this.style.background = '#16A34A';
      setTimeout(() => {
        closeSwitchModal();
        this.textContent = 'Show me another class';
        this.style.background = '';
        this.disabled = true;
      }, 1500);
    });
  }


  // ------------------------------------------------------------------
  // 16.  CHECK-IN MODAL — opened from simple entry point
  // ------------------------------------------------------------------
  const checkinModal = document.getElementById('checkinModal');
  const checkinModalClose = document.getElementById('checkinModalClose');
  const checkinSubmitBtn = document.getElementById('checkinSubmitBtn');
  const checkinSkipBtn = document.getElementById('checkinSkipBtn');
  const checkinEntryBtn = document.getElementById('checkinEntryBtn');

  function openCheckinModal() {
    if (checkinModal) checkinModal.classList.remove('hidden');
  }

  function closeCheckinModal() {
    if (checkinModal) checkinModal.classList.add('hidden');
  }

  // Entry point button
  if (checkinEntryBtn) {
    checkinEntryBtn.addEventListener('click', openCheckinModal);
  }

  // Notification page check-in action also opens check-in modal (handled above in section 4)

  // Close
  if (checkinModalClose) checkinModalClose.addEventListener('click', closeCheckinModal);
  if (checkinSkipBtn) checkinSkipBtn.addEventListener('click', closeCheckinModal);

  if (checkinModal) {
    checkinModal.addEventListener('click', (e) => {
      if (e.target === checkinModal) closeCheckinModal();
    });
  }

  // Submit
  if (checkinSubmitBtn) {
    checkinSubmitBtn.addEventListener('click', function () {
      this.textContent = '✓ Check-in submitted!';
      this.style.background = '#16A34A';
      setTimeout(() => {
        closeCheckinModal();
        this.textContent = 'Submit check-in';
        this.style.background = '';
        // Update the entry button to show completed state
        if (checkinEntryBtn) {
          checkinEntryBtn.querySelector('strong').textContent = 'Check-in complete ✓';
          checkinEntryBtn.querySelector('.checkin-entry__text span').textContent = 'Thanks! Your plan has been updated.';
          checkinEntryBtn.style.borderColor = '#22c55e';
          checkinEntryBtn.style.background = 'linear-gradient(135deg, #f0fdf4, white)';
          checkinEntryBtn.querySelector('.checkin-entry__icon').style.background = '#22c55e';
        }
      }, 1200);
    });
  }


  // ------------------------------------------------------------------
  // 17.  KEYBOARD ACCESSIBILITY — Escape closes dropdowns + modals
  // ------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileMenuOverlay && !mobileMenuOverlay.classList.contains('hidden')) {
        closeMobileMenu();
      }
      if (switchModal && !switchModal.classList.contains('hidden')) {
        closeSwitchModal();
      }
      if (checkinModal && !checkinModal.classList.contains('hidden')) {
        closeCheckinModal();
      }
      if (moodModal && !moodModal.classList.contains('hidden')) {
        closeMoodModal();
      }
    }
  });

})();
