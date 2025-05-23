/**
 * E-ink MagSafe Display Controller
 * Optimized for static e-ink display with minimal user interaction
 */

// Configuration object for easy adjustments
const CONFIG = {
  // Timing settings
  refreshInterval: 120000,        // Widget refresh interval (2 minutes)
  timeUpdateInterval: 60000,      // Clock update interval (1 minute)

  // E-ink display settings
  eink: {
    refreshStages: [
      {
        contrast: '140%',    // Strong flash to reset pixels
        brightness: '100%',
        sepia: '10%',
        duration: 150
      },
      {
        contrast: '70%',     // Dark phase
        brightness: '90%',
        sepia: '10%',
        duration: 200
      },
      {
        contrast: '100%',    // Final image
        brightness: '100%',
        sepia: '10%',
        duration: 150
      }
    ]
  },

  // Visual indicators
  indicators: {
    enabled: true,                // Show page indicators
    activeColor: '#444',          // Active indicator color (Currently unused in JS, likely CSS)
    inactiveColor: '#bbb'         // Inactive indicator color (Currently unused in JS, likely CSS)
  },

  // Widget data sources
  weatherData: {
    conditions: [
        { temp: { min: 85, max: 100 }, description: 'Heat wave today', icon: '<i class="fas fa-sun"></i>' },
        { temp: { min: 75, max: 84 }, description: 'Warm and sunny', icon: '<i class="fas fa-sun"></i>' },
        { temp: { min: 65, max: 74 }, description: 'Pleasant weather', icon: '<i class="fas fa-cloud-sun"></i>' },
        { temp: { min: 55, max: 64 }, description: 'Cool and breezy', icon: '<i class="fas fa-cloud"></i>' },
        { temp: { min: 32, max: 54 }, description: 'Cold today', icon: '<i class="fas fa-snowflake"></i>' },
        { temp: { min: -10, max: 31 }, description: 'Freezing weather', icon: '<i class="fas fa-icicles"></i>' }
    ],
    precipitation: [
        { chance: 90, description: 'Heavy rain expected', icon: '<i class="fas fa-cloud-showers-heavy"></i>' },
        { chance: 70, description: 'Rain likely today', icon: '<i class="fas fa-cloud-rain"></i>' },
        { chance: 50, description: 'Chance of rain', icon: '<i class="fas fa-cloud"></i>' },
        { chance: 30, description: 'Slight chance of rain', icon: '<i class="fas fa-cloud-sun"></i>' },
        { chance: 10, description: 'Clear skies ahead', icon: '<i class="fas fa-sun"></i>' }
    ],
    locations: ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Tel Aviv'],
    tempRange: { min: 30, max: 95 },
    tomorrow: {
        conditions: [
            { temp: { min: 85, max: 100 }, description: 'Hot', icon: '<i class="fas fa-sun"></i>' },
            { temp: { min: 75, max: 84 }, description: 'Sunny', icon: '<i class="fas fa-sun"></i>' },
            { temp: { min: 65, max: 74 }, description: 'Pleasant', icon: '<i class="fas fa-cloud-sun"></i>' },
            { temp: { min: 55, max: 64 }, description: 'Cool', icon: '<i class="fas fa-cloud"></i>' },
            { temp: { min: 32, max: 54 }, description: 'Cold', icon: '<i class="fas fa-snowflake"></i>' },
            { temp: { min: -10, max: 31 }, description: 'Freezing', icon: '<i class="fas fa-icicles"></i>' }
        ]
    }
  },

  // This seems redundant as CONFIG.mediaPlayer.tracks is used for the media player.
  // If it serves another purpose, it should be documented or used. Otherwise, consider removing.
  // mediaItems: [
  //   { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', cover: 'midnight_city.jpeg' },
  //   { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', cover: 'starboy.jpg' },
  //   { title: 'Another Sky', artist: 'Novo Amor', album: 'Birthplace', cover: 'novoamor.webp' },
  //   { title: 'Circles', artist: 'Post Malone', album: 'Hollywood\'s Bleeding', cover: 'circles.jpg' },
  //   { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', cover: 'blinding_lights.jpg' }
  // ],

  // This array of strings is not directly used; updateNotifications generates its own.
  // If it's for reference or future use, it's fine. Otherwise, consider removing.
  // notifications: [
  //   'New message from John',
  //   'Meeting in 30 minutes',
  //   'Remember to drink water',
  //   'Package delivered',
  //   'Software update available',
  //   'Calendar: Dentist appointment tomorrow',
  //   'Low battery on AirPods',
  //   'Weather alert: Rain expected',
  //   'New email from work',
  //   'Reminder: Call mom'
  // ],

  // Widget titles for accessibility and indicators
  widgetTitles: [
    'Weather & Calendar',
    'Notifications',
    'Media Player',
    'Productivity'
  ],
  widgets: [
    { id: 'combined', title: 'Weather & Calendar', icon: '<i class="fas fa-calendar-alt"></i>' },
    { id: 'notifications', title: 'Notifications', icon: '<i class="fas fa-bell"></i>' },
    { id: 'media', title: 'Media Player', icon: '<i class="fas fa-music"></i>' },
    { id: 'productivity', title: 'Productivity', icon: '<i class="fas fa-brain"></i>' }
  ],

  priorities: {
    high: {
      label: 'High Priority',
      color: '#e25a3d'
    },
    medium: {
      label: 'Medium Priority',
      color: '#e2b23d'
    },
    low: {
      label: 'Low Priority',
      color: '#3d8fe2'
    }
  },
  mediaPlayer: {
    currentTrack: 0,
    isPlaying: false,
    tracks: [
      {
        title: 'Midnight City',
        artist: 'M83',
        album: 'Hurry Up, We\'re Dreaming',
        cover: 'midnight_city.jpeg'
      },
      {
        title: 'Starboy',
        artist: 'The Weeknd',
        album: 'Starboy',
        cover: 'starboy.jpg'
      },
      {
        title: 'Another Sky',
        artist: 'Novo Amor',
        album: 'Birthplace',
        cover: 'novoamor.webp'
      }
    ]
  },
  pomodoro: {
    workDuration: 25 * 60, // 25 minutes in seconds
    shortBreakDuration: 5 * 60, // 5 minutes in seconds
    longBreakDuration: 15 * 60, // 15 minutes in seconds
    sessionsBeforeLongBreak: 4,
    currentSessionType: 'work', // 'work', 'shortBreak', 'longBreak'
    sessionsCompleted: 0,
    timerId: null, // Will store setInterval ID
    remainingTime: 25 * 60,
    isRunning: false
    // startTime: 0 // Removed as it was unused
  },
  mindfulnessPrompts: [
    "Take three deep breaths, focusing on the sensation of air.",
    "Notice five things you can see around you right now.",
    "Listen for three distinct sounds in your environment.",
    "Gently stretch your neck and shoulders.",
    "Close your eyes for a moment and just be present.",
    "Think of one thing you are grateful for today.",
    "Sip some water and feel it refresh you.",
    "Briefly step away from your screen and look at something distant.",
    "Wiggle your toes and fingers.",
    "Recall a pleasant memory for a moment."
  ],
  currentMindfulnessPromptIndex: 0
};

// Store element references and state
const elements = {};
const state = {
  isRefreshing: false,
  batteryLevel: 0,
  currentView: 0,
  lastRefreshTime: 0,
  rotationTimer: null // This was declared but not used. If there's no rotation timer logic, consider removing.
  // rotationPaused: false, // Removed as unused
  // rotationPauseTimeout: null // Removed as unused
};

/**
 * Initialize the application
 */
function initApp() {
  try {
    cacheElements();
    createScreenReaderAnnouncer(); // Create announcer element early
    updateTime(); // Initial time update
    updateStatusBar(); // Initial status bar update (includes battery)
    updateAllWidgets();
    initializeView();
    setUpTimers();
    setUpInteractions();
    setupRotationEffect(); // Initialize 3D rotation
    createPageIndicators(); // Create initial page indicators
    updatePageIndicators(); // Update indicators for the initial view
    initPomodoro();
    initMindfulness();
    createNotificationSummary(); // Initialize notification summary overlay
  } catch (error) {
    console.error("Error initializing app:", error);
    if (elements.content) {
      elements.content.innerHTML = '<p class="error-message">Error loading. Please try again later.</p>';
    }
  }
}

/**
 * Set up 3D rotation effect based on mouse position
 */
function setupRotationEffect() {
  const iphoneMock = document.querySelector('.iphone-mock');
  if (!iphoneMock) return;

  const initialRotateX = 10;
  const initialRotateY = 5;

  document.addEventListener('mousemove', (e) => {
    if (state.isRefreshing) return;

    const rect = iphoneMock.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) / (window.innerWidth / 2);
    const distanceY = (e.clientY - centerY) / (window.innerHeight / 2);

    const rotateX = initialRotateX - (distanceY * 1.5);
    const rotateY = initialRotateY + (distanceX * 1.5);
    const translateZ = Math.min(Math.abs(distanceX) * 0.5, 0.5);

    const isHovering =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    iphoneMock.style.transition = isHovering ? 'transform 0.2s ease-out' : 'transform 0.7s ease-out';

    if (isHovering) {
      iphoneMock.style.transform = `
        perspective(1200px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateZ(${translateZ}px)
        scale(1.005)
      `;
    } else {
      iphoneMock.style.transform = `
        perspective(1200px)
        rotateX(${initialRotateX + (rotateX - initialRotateX) * 0.2}deg)
        rotateY(${initialRotateY + (rotateY - initialRotateY) * 0.2}deg)
        translateZ(0)
        scale(1)
      `;
    }
  });

  document.addEventListener('mouseleave', () => {
    iphoneMock.style.transition = 'transform 0.5s ease-out';
    iphoneMock.style.transform = `
      perspective(1200px)
      rotateX(${initialRotateX}deg)
      rotateY(${initialRotateY}deg)
      translateZ(0)
      scale(1)
    `;
  });
}

/**
 * Cache frequently accessed DOM elements
 */
function cacheElements() {
  elements.display = document.querySelector('.epaper-display');
  elements.content = document.querySelector('.content');
  elements.screenContent = document.querySelector('.screen-content');

  elements.timeEl = document.querySelector('.time');
  elements.batteryStatus = document.querySelector('.battery-status');
  // For status bar notifications (ensure these selectors match your HTML)
  elements.notificationDot = document.querySelector('.status-bar .notification-dot'); // Example selector
  elements.notificationCountText = document.querySelector('.status-bar .notification-count-text'); // Example selector


  elements.widgets = document.querySelectorAll('.widget');
  elements.widgetArray = Array.from(elements.widgets);

  // Weather widget elements
  elements.weatherIcon = document.querySelector('.weather .icon'); // Main icon for current weather
  elements.weatherTemp = document.querySelector('.weather .temp');
  elements.weatherDesc = document.querySelector('.weather .description'); // Main description for current weather
  elements.weatherLocation = document.querySelector('.weather .location');
  elements.weatherHighLow = document.querySelector('.weather .high-low');
  elements.weatherTomorrowPreview = document.querySelector('.weather .tomorrow-preview');
  if (elements.weatherTomorrowPreview) { // Cache sub-elements if parent exists
    elements.weatherTomorrowForecast = elements.weatherTomorrowPreview.querySelector('.forecast');
    elements.weatherTomorrowIcon = elements.weatherTomorrowPreview.querySelector('.icon');
  }


  // Calendar elements
  elements.calendarWeekday = document.querySelector('.calendar .weekday');
  elements.calendarDay = document.querySelector('.calendar .day');
  elements.calendarMonth = document.querySelector('.calendar .month');
  elements.calendarEvents = document.querySelector('.calendar .events');


  elements.pomodoroTime = document.querySelector('.pomodoro-time');
  elements.pomodoroSessionType = document.querySelector('.pomodoro-session-type');
  elements.pomodoroStartBtn = document.querySelector('.pomodoro-start');
  elements.pomodoroPauseBtn = document.querySelector('.pomodoro-pause');
  elements.pomodoroResetBtn = document.querySelector('.pomodoro-reset');
  elements.pomodoroSessionsCompleted = document.querySelector('.pomodoro-sessions-completed');

  elements.mindfulnessPromptText = document.querySelector('.mindfulness-prompt-text');
  elements.newPromptButton = document.querySelector('.mindfulness-new-prompt-btn');
}

/**
 * Create page indicators with icons instead of dots
 */
function createPageIndicators() {
  if (!CONFIG.indicators.enabled || !elements.screenContent) return;

  const indicatorContainer = document.createElement('div');
  indicatorContainer.className = 'page-indicators';
  indicatorContainer.setAttribute('aria-hidden', 'true');

  CONFIG.widgets.forEach((widget, index) => {
    const indicator = document.createElement('div');
    indicator.className = 'page-indicator';
    if (index === state.currentView) {
      indicator.classList.add('active');
    }
    indicator.setAttribute('data-index', index);
    indicator.innerHTML = widget.icon;

    indicator.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToView(index);
      simulateEinkRefresh();
    });

    indicatorContainer.appendChild(indicator);
  });

  elements.screenContent.appendChild(indicatorContainer);
  elements.pageIndicators = indicatorContainer;
  updateNotificationBadge(indicatorContainer); // Initial badge update
}

/**
 * Update notification badge on the notification icon in page indicators
 */
function updateNotificationBadge(container) {
  if (!container) return;

  const notificationWidgetConfig = CONFIG.widgets.find(w => w.id === 'notifications');
  if (!notificationWidgetConfig) return;

  const notificationIndex = CONFIG.widgets.indexOf(notificationWidgetConfig);
  const notificationIndicator = container.querySelector(`[data-index="${notificationIndex}"]`);
  if (!notificationIndicator) return;

  // Get notification count from the widget header itself for accuracy
  const notificationsWidget = document.querySelector('.widget.notifications'); // Assuming widget has class 'notifications'
  const notificationsCountEl = notificationsWidget ? notificationsWidget.querySelector('.notifications-count') : null;
  const count = notificationsCountEl ? parseInt(notificationsCountEl.textContent, 10) : 0;


  let badge = notificationIndicator.querySelector('.notification-badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'notification-badge';
      notificationIndicator.style.position = 'relative'; // Ensure badge can be positioned
      notificationIndicator.appendChild(badge);
    }
    badge.textContent = count;
  } else {
    if (badge) {
      badge.remove();
    }
  }
}

/**
 * Update page indicators to reflect current view
 */
function updatePageIndicators() {
  const indicators = elements.pageIndicators?.querySelectorAll('.page-indicator');
  if (!indicators) return;

  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === state.currentView);
  });
  updateNotificationBadge(elements.pageIndicators);
}

/**
 * Create notification summary in a simple and informative way
 */
function createNotificationSummary() {
  if (!elements.screenContent) return;

  const overlay = document.createElement('div');
  overlay.className = 'notification-overlay';
  overlay.style.display = 'none'; // Initially hidden
  elements.screenContent.appendChild(overlay);
  elements.notificationOverlay = overlay;

  const summaryContainer = document.createElement('div');
  summaryContainer.className = 'notification-summary';
  summaryContainer.style.display = 'none'; // Initially hidden
  elements.screenContent.appendChild(summaryContainer);
  elements.notificationSummary = summaryContainer;

  // No need to call updateNotificationSummary here, it will be called when notifications are updated.
}

/**
 * Update notification summary content with improved accessibility
 */
function updateNotificationSummary() {
  if (!elements.notificationSummary || !elements.notificationOverlay) return;

  const importantNotifications = (state.importantNotifications || []).filter(notificationText => {
    const lowerNotification = notificationText.toLowerCase();
    const importantKeywords = ['meeting', 'reminder', 'alert', 'battery low', 'message from', 'call', 'deadline', 'urgent', 'emergency'];
    const nonCriticalKeywords = ['update available', 'app store', 'new version', 'subscription', 'newsletter'];
    return importantKeywords.some(keyword => lowerNotification.includes(keyword)) &&
           !nonCriticalKeywords.some(keyword => lowerNotification.includes(keyword));
  });

  const importantCount = importantNotifications.length;

  if (importantCount > 0) {
    elements.notificationOverlay.style.display = 'block';
    elements.notificationSummary.style.display = 'block';

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const notificationsToShow = importantNotifications.slice(0, 3);
    const remainingCount = importantNotifications.length - notificationsToShow.length;

    elements.notificationSummary.innerHTML = `
      <div class="notification-summary-content" role="region" aria-label="Important notifications">
        <div class="notification-summary-title">
          <span class="notification-icon" aria-hidden="true"><i class="fas fa-exclamation-triangle"></i></span>
          <div class="notification-title-content">
            <span class="notification-count">${importantCount} Important</span>
            <span class="notification-subtitle">Notifications</span>
          </div>
          <span class="notification-time">${timeStr}</span>
        </div>
        <div class="notification-list">
          ${notificationsToShow.map(notification => `<div class="notification-item">${notification}</div>`).join('')}
          ${remainingCount > 0 ? `<span class="more-notifications">+${remainingCount} more notifications</span>` : ''}
        </div>
      </div>
      <div class="notification-actions" role="group" aria-label="Notification actions">
        <button class="notification-view" aria-label="View all notifications">View All</button>
        <button class="notification-dismiss" aria-label="Dismiss notification">Dismiss</button>
      </div>
    `;

    const dismissButton = elements.notificationSummary.querySelector('.notification-dismiss');
    const viewButton = elements.notificationSummary.querySelector('.notification-view');
    const content = elements.notificationSummary.querySelector('.notification-summary-content');

    dismissButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.notificationOverlay.style.display = 'none';
      elements.notificationSummary.style.display = 'none';
      announceToScreenReader('Notification dismissed');
      simulateEinkRefresh();
    });

    viewButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      const notificationWidgetConfig = CONFIG.widgets.find(w => w.id === 'notifications');
      if (notificationWidgetConfig) {
        const notificationIndex = CONFIG.widgets.indexOf(notificationWidgetConfig);
        elements.notificationOverlay.style.display = 'none';
        elements.notificationSummary.style.display = 'none';
        navigateToView(notificationIndex);
        announceToScreenReader('Viewing all notifications');
        simulateEinkRefresh();
      }
    });

    content?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = content.classList.toggle('expanded');
      announceToScreenReader(isExpanded ? 'Notification expanded' : 'Notification collapsed');
      simulateEinkRefresh();
    });
  } else {
    elements.notificationOverlay.style.display = 'none';
    elements.notificationSummary.style.display = 'none';
  }
}

/**
 * Announce messages to screen readers
 */
function announceToScreenReader(message) {
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = message;
  }
}

/**
 * Update notification indicators in the status bar
 */
function updateStatusBarNotifications() {
  // Ensure elements.notificationDot and elements.notificationCountText are valid selectors
  // matching your HTML structure for the status bar.
  if (!elements.notificationDot || !elements.notificationCountText) return;

  const importantCount = (state.importantNotifications || []).filter(notificationText => {
    const lowerNotification = notificationText.toLowerCase();
    const importantKeywords = ['meeting', 'reminder', 'alert', 'battery low', 'message from', 'call', 'deadline', 'urgent', 'emergency'];
    const nonCriticalKeywords = ['update available', 'app store', 'new version', 'subscription', 'newsletter'];
    return importantKeywords.some(keyword => lowerNotification.includes(keyword)) &&
           !nonCriticalKeywords.some(keyword => lowerNotification.includes(keyword));
  }).length;


  elements.notificationDot.classList.toggle('active', importantCount > 0);
  elements.notificationCountText.textContent = importantCount > 0 ? importantCount : '';
}

/**
 * Update notifications widget
 */
function updateNotifications() {
  const notificationWidget = document.querySelector('.widget.notifications'); // Target specific widget
  if (!notificationWidget) return;
  const notificationList = notificationWidget.querySelector('.notification-list');
  if (!notificationList) return;

  const notificationTypes = [ /* ... your notificationTypes array ... */ ];
    // (Using the existing notificationTypes array from your script)
    const existingNotificationTypes = [
        { type: 'email', icon: '<i class="fas fa-envelope"></i>', category: 'Messages', texts: ['Email from Alex: Project update', 'Sarah sent you a document', 'New newsletter from Medium'] },
        { type: 'message', icon: '<i class="fas fa-comment"></i>', category: 'Messages', texts: ['John: Are we still meeting today?', 'Emma: Check out this link', 'David sent a photo'] },
        { type: 'calendar', icon: '<i class="fas fa-calendar-alt"></i>', category: 'Reminders', texts: ['Meeting with design team at 2PM', 'Dentist appointment tomorrow at 10AM', 'Project deadline on Friday'] },
        { type: 'reminder', icon: '<i class="fas fa-clock"></i>', category: 'Reminders', texts: ['Take medication', 'Call mom', 'Submit expense report'] },
        { type: 'package', icon: '<i class="fas fa-box"></i>', category: 'Updates', texts: ['Amazon package delivered', 'Your order has shipped', 'Package arriving tomorrow'] },
        { type: 'update', icon: '<i class="fas fa-sync"></i>', category: 'Updates', texts: ['iOS 17.5 is available to install', 'App Store: 12 updates available', 'MacOS update required'] },
        { type: 'weather', icon: '<i class="fas fa-cloud-sun-rain"></i>', category: 'Alerts', texts: ['Rain expected this afternoon', 'Temperature dropping tonight', 'High winds advisory for your area'] },
        { type: 'battery', icon: '<i class="fas fa-battery-quarter"></i>', category: 'Alerts', texts: ['AirPods at 15% battery', 'iPhone battery at 20%', 'Apple Watch needs charging'] }
    ];


  const count = Math.floor(Math.random() * 3) + 4; // 4-6 notifications
  const generatedNotifications = [];

  for (let i = 0; i < count; i++) {
    const typeIndex = Math.floor(Math.random() * existingNotificationTypes.length);
    const notificationType = existingNotificationTypes[typeIndex];
    const textIndex = Math.floor(Math.random() * notificationType.texts.length);
    const text = notificationType.texts[textIndex];
    const minutes = Math.floor(Math.random() * 60) + 1;
    const timeText = minutes === 1 ? '1m ago' : `${minutes}m ago`;

    generatedNotifications.push({
      text,
      time: timeText,
      icon: notificationType.icon,
      type: notificationType.type,
      category: notificationType.category
    });
  }

  const notificationsCountHeader = notificationWidget.querySelector('.notifications-count');
  if (notificationsCountHeader) {
    notificationsCountHeader.textContent = generatedNotifications.length.toString().padStart(2, '0');
  }

  const categories = {};
  generatedNotifications.forEach(notification => {
    if (!categories[notification.category]) categories[notification.category] = [];
    categories[notification.category].push(notification);
  });

  let notificationsHTML = '';
  Object.keys(categories).forEach(category => {
    notificationsHTML += `
      <div class="notification-category">
        <span class="category-label">${category}</span>
        ${categories[category].map(notification => `
          <div class="notification-item">
            <div class="notification-icon">${notification.icon}</div>
            <div class="notification-content">
              <span class="notification-text">${notification.text}</span>
              <span class="notification-time">${notification.time}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  });

  notificationList.innerHTML = notificationsHTML;

  // Store raw text of some notifications for the summary popup
  state.importantNotifications = generatedNotifications
    .slice(0, Math.min(generatedNotifications.length, 5)) // Take up to 5, or fewer if less are generated
    .map(notification => notification.text);


  updateNotificationSummary(); // Update the popup
  updateNotificationBadge(elements.pageIndicators); // Update badge on page indicator
  updateStatusBarNotifications(); // Update status bar indicators
}


/**
 * Initialize the view to show the first widget
 */
function initializeView() {
  elements.widgetArray.forEach(widget => widget.style.display = 'none');
  if (elements.widgetArray.length > 0) {
    elements.widgetArray[0].style.display = 'flex';
    state.currentView = 0;
  }
  updatePageIndicators();
}

/**
 * Set up timers for regular updates
 */
function setUpTimers() {
  updateStatusBar(); // Initial call
  setInterval(updateStatusBar, CONFIG.timeUpdateInterval);

  setInterval(() => {
    if (state.isRefreshing) return;

    // const now = Date.now(); // Not strictly needed if the condition below is removed
    // if (now - state.lastRefreshTime < CONFIG.refreshInterval / 2) return; // Removed for clarity

    updateRandomWidget();
    simulateEinkRefresh();
    state.lastRefreshTime = Date.now(); // Update last refresh time
  }, CONFIG.refreshInterval);
}

/**
 * Set up minimal interaction handlers
 */
function setUpInteractions() {
  if (elements.display) {
    let touchStartX = 0;
    elements.display.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    elements.display.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      if (Math.abs(deltaX) > 50) { // Swipe threshold
        if (deltaX > 0) showPreviousView();
        else showNextView();
        simulateEinkRefresh();
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    let refreshNeeded = false;
    switch (e.key) {
      case 'r': case 'R':
        e.preventDefault();
        updateAllWidgets();
        refreshNeeded = true;
        break;
      case 'ArrowRight':
        e.preventDefault();
        showNextView();
        refreshNeeded = true;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        showPreviousView();
        refreshNeeded = true;
        break;
      case '1': case '2': case '3': case '4': case '5':
        const index = parseInt(e.key) - 1;
        if (index >= 0 && index < elements.widgetArray.length) {
          navigateToView(index);
          refreshNeeded = true;
        }
        break;
    }
    if (refreshNeeded) simulateEinkRefresh();
  });
}

/**
 * Navigate directly to a specific view
 */
function navigateToView(index) {
  if (!elements.widgetArray || index < 0 || index >= elements.widgetArray.length) return;

  elements.widgetArray.forEach(widget => widget.style.display = 'none');
  state.currentView = index;
  elements.widgetArray[state.currentView].style.display = 'flex';
  updatePageIndicators();
  announceViewChange();
}

/**
 * Announce the current view for screen readers
 */
function announceViewChange() {
  const titles = CONFIG.widgetTitles;
  if (titles && titles[state.currentView]) {
    announceToScreenReader(`Showing ${titles[state.currentView]}`);
  }
}

/**
 * Create a screen reader announcer element
 */
function createScreenReaderAnnouncer() {
  let announcer = document.getElementById('sr-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.style.position = 'absolute';
    announcer.style.left = '-9999px'; // Visually hidden
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }
  return announcer;
}

/**
 * Show the next view in the rotation
 */
function showNextView() {
  if (!elements.widgetArray || elements.widgetArray.length === 0) return;
  navigateToView((state.currentView + 1) % elements.widgetArray.length);
}

/**
 * Show the previous view in the rotation
 */
function showPreviousView() {
  if (!elements.widgetArray || elements.widgetArray.length === 0) return;
  navigateToView((state.currentView - 1 + elements.widgetArray.length) % elements.widgetArray.length);
}

/**
 * Update a random widget to simulate real-world data changes
 */
function updateRandomWidget() {
  const updatableWidgets = ['combined', 'notifications', 'media']; // IDs of widgets that can be randomly updated
  const widgetIdToUpdate = updatableWidgets[Math.floor(Math.random() * updatableWidgets.length)];

  switch (widgetIdToUpdate) {
    case 'combined':
      updateWeather();
      updateCalendar();
      break;
    case 'notifications':
      updateNotifications();
      break;
    case 'media':
      updateMedia(); // Update with current track, or could be random new track
      break;
  }
}

/**
 * Update all widgets with fresh data
 */
function updateAllWidgets() {
  updateTime(); // Ensures status bar time is fresh
  updateWeather();
  updateCalendar();
  updateNotifications();
  updateMedia();
  // Potentially update Pomodoro display if it's part of a widget being directly updated
  // For now, Pomodoro updates are self-contained or triggered by its controls.
}

/**
 * Update the time display in the status bar
 */
function updateTime() {
  if (elements.timeEl) { // Combined into updateStatusBar
      updateStatusBar();
  }
}

/**
 * Simulate e-ink display refresh with realistic stages
 */
function simulateEinkRefresh() {
  if (!elements.display || state.isRefreshing) return;

  state.isRefreshing = true;
  elements.display.style.transition = 'filter 0.3s'; // Adjust transition time if needed

  const stages = CONFIG.eink.refreshStages;
  if (!stages || stages.length === 0) {
    state.isRefreshing = false;
    return;
  }

  let currentStageIndex = 0;

  function applyStage(stageIndex) {
    if (stageIndex < stages.length) {
      const stage = stages[stageIndex];
      elements.display.style.filter = `grayscale(100%) contrast(${stage.contrast}) brightness(${stage.brightness}) sepia(${stage.sepia})`;
      setTimeout(() => applyStage(stageIndex + 1), stage.duration);
    } else {
      // After all animation stages, apply the final configured resting state (last stage properties)
      const finalStage = stages[stages.length - 1];
       elements.display.style.filter = `grayscale(100%) contrast(${finalStage.contrast}) brightness(${finalStage.brightness}) sepia(${finalStage.sepia})`;
      // Or a specific "settled" look if desired, e.g.:
      // elements.display.style.filter = `grayscale(100%) contrast(110%) brightness(90%) sepia(10%)`;
      state.isRefreshing = false;
    }
  }
  applyStage(currentStageIndex);
}

/**
 * Update weather widget with simulated data
 */
function updateWeather() {
  // Using cached elements: elements.weatherTemp, elements.weatherDesc, elements.weatherIcon, etc.
  if (!elements.weatherTemp || !elements.weatherDesc || !elements.weatherIcon || !elements.weatherLocation || !elements.weatherHighLow) return;

  const { conditions, precipitation, locations, tempRange } = CONFIG.weatherData;
  const temp = Math.floor(Math.random() * (tempRange.max - tempRange.min + 1) + tempRange.min);
  const locationIndex = Math.floor(Math.random() * locations.length);

  const condition = conditions.find(c => temp >= c.temp.min && temp <= c.temp.max) || conditions[0];
  const precip = precipitation[Math.floor(Math.random() * precipitation.length)];
  const weatherInfo = Math.random() > 0.5 ? condition : precip;

  const highTemp = Math.min(temp + Math.floor(Math.random() * 8) + 2, tempRange.max);
  const lowTemp = Math.max(temp - Math.floor(Math.random() * 8) - 2, tempRange.min);

  elements.weatherTemp.textContent = `${temp}°`;
  elements.weatherDesc.textContent = weatherInfo.description;
  elements.weatherIcon.innerHTML = weatherInfo.icon;
  elements.weatherLocation.textContent = locations[locationIndex];
  elements.weatherHighLow.textContent = `High ${highTemp}° • Low ${lowTemp}°`;

  // Update tomorrow's forecast using cached elements
  if (elements.weatherTomorrowPreview && elements.weatherTomorrowForecast && elements.weatherTomorrowIcon) {
    const tempDiff = Math.floor(Math.random() * 15) - 7;
    const tomorrowTemp = Math.min(Math.max(temp + tempDiff, tempRange.min), tempRange.max);
    const tomorrowCondition = CONFIG.weatherData.tomorrow.conditions.find(
        c => tomorrowTemp >= c.temp.min && tomorrowTemp <= c.temp.max
    ) || CONFIG.weatherData.tomorrow.conditions[0];

    elements.weatherTomorrowForecast.textContent = `${tomorrowTemp}° • ${tomorrowCondition.description}`;
    elements.weatherTomorrowIcon.innerHTML = tomorrowCondition.icon;
  }
}

/**
 * Update calendar widget with current date and events
 */
function updateCalendar() {
  if (!elements.calendarWeekday || !elements.calendarDay || !elements.calendarMonth || !elements.calendarEvents) return;

  const now = new Date();
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  elements.calendarWeekday.textContent = weekdays[now.getDay()];
  elements.calendarDay.textContent = now.getDate();
  elements.calendarMonth.textContent = now.toLocaleString('default', { month: 'short' }).toUpperCase();
  updateCalendarEvents(now);
}

/**
 * Update calendar events based on time of day
 */
function updateCalendarEvents(date) { // date parameter is actually not used to filter events yet
  if (!elements.calendarEvents) return;

  // const hour = date.getHours(); // Available if needed for time-based event filtering
  const sampleEvents = {
    morning: [
      { time: '09:00', text: 'Team Standup', priority: 'high' },
      { time: '11:30', text: 'Client Meeting', priority: 'medium' }
    ],
    afternoon: [
      { time: '14:30', text: 'Project Review', priority: 'medium' },
      { time: '16:00', text: 'Team Coffee', priority: 'low' }
    ]
  };

  const generateEventHTML = (events, category) => `
    <div class="event-category">
      <span class="category-label">${category}</span>
      ${events.map(event => `
        <div class="event priority-${event.priority}">
          <div class="priority-indicator" style="background-color: ${CONFIG.priorities[event.priority]?.color || '#ccc'};"></div>
          <span class="time">${event.time}</span>
          <span class="text">${event.text}</span>
        </div>
      `).join('')}
    </div>
  `;
  elements.calendarEvents.innerHTML = `
    ${generateEventHTML(sampleEvents.morning, 'Morning')}
    ${generateEventHTML(sampleEvents.afternoon, 'Afternoon')}
  `;
}

/**
 * Update media widget
 */
function updateMedia(direction = 'none') {
  const mediaWidget = document.querySelector('.widget.media'); // Target specific media widget
  if (!mediaWidget) return;

  let { currentTrack, tracks, isPlaying } = CONFIG.mediaPlayer;

  if (direction === 'next') {
    currentTrack = (currentTrack + 1) % tracks.length;
  } else if (direction === 'prev') {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  }
  CONFIG.mediaPlayer.currentTrack = currentTrack;
  const track = tracks[currentTrack];

  if (!track) { // Should not happen if tracks array is not empty
      mediaWidget.innerHTML = '<p>No track selected.</p>';
      return;
  }

  mediaWidget.innerHTML = `
    <div class="media-content">
      <img src="${track.cover}" alt="${track.title} album cover" class="album-cover">
      <div class="track-info">
        <h2 class="track-title">${track.title}</h2>
        <span class="text">${track.artist}</span>
      </div>
      <div class="controls">
        <button class="prev" aria-label="Previous track"><i class="fas fa-step-backward"></i></button>
        <button class="play ${isPlaying ? 'playing' : ''}" aria-label="${isPlaying ? 'Pause' : 'Play'}">
          <i class="fas fa-${isPlaying ? 'pause' : 'play'}"></i>
        </button>
        <button class="next" aria-label="Next track"><i class="fas fa-step-forward"></i></button>
      </div>
    </div>
  `;
  setupMediaControls(mediaWidget); // Pass mediaWidget to scope controls
}

/**
 * Set up media control button functionality
 */
function setupMediaControls(mediaWidgetInstance) { // Takes the specific media widget instance
  if (!mediaWidgetInstance) return;

  const playButton = mediaWidgetInstance.querySelector('.play');
  const prevButton = mediaWidgetInstance.querySelector('.prev');
  const nextButton = mediaWidgetInstance.querySelector('.next');

  playButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    CONFIG.mediaPlayer.isPlaying = !CONFIG.mediaPlayer.isPlaying;
    playButton.classList.toggle('playing', CONFIG.mediaPlayer.isPlaying);
    playButton.innerHTML = `<i class="fas fa-${CONFIG.mediaPlayer.isPlaying ? 'pause' : 'play'}"></i>`;
    playButton.setAttribute('aria-label', CONFIG.mediaPlayer.isPlaying ? 'Pause' : 'Play');
    simulateEinkRefresh();
  });

  prevButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    updateMedia('prev');
    simulateEinkRefresh();
  });

  nextButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    updateMedia('next');
    simulateEinkRefresh();
  });
}


/**
 * Update the status bar with time and battery information
 */
function updateStatusBar() {
  if (elements.timeEl) {
    const now = new Date();
    elements.timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  if (elements.batteryStatus) {
    if (!state.batteryLevel || Math.random() < 0.1) { // Update battery level occasionally
      state.batteryLevel = Math.floor(Math.random() * 81) + 20; // 20-100%
    }
    const isCharging = Math.random() > 0.7; // Simulate charging status

    let batteryIconClass = 'fas fa-battery-full';
    if (isCharging) batteryIconClass = 'fas fa-bolt';
    else if (state.batteryLevel <= 20) batteryIconClass = 'fas fa-battery-empty';
    else if (state.batteryLevel <= 50) batteryIconClass = 'fas fa-battery-half';

    elements.batteryStatus.innerHTML = `
      <span class="battery-icon"><i class="${batteryIconClass}"></i></span>
      <span class="battery-level">${state.batteryLevel}%</span>
    `;
    elements.batteryStatus.classList.toggle('low-battery', state.batteryLevel <= 20 && !isCharging);
    elements.batteryStatus.classList.toggle('charging', isCharging);
  }
  updateStatusBarNotifications(); // Also update notification indicators in status bar
}

// Initialize app when DOM content is loaded
document.addEventListener('DOMContentLoaded', initApp);

/**
 * ===================================================================================
 * POMODORO TIMER LOGIC
 * ===================================================================================
 */

function initPomodoro() {
  if (!elements.pomodoroStartBtn || !elements.pomodoroPauseBtn || !elements.pomodoroResetBtn) {
    console.warn('Pomodoro elements not found. Skipping Pomodoro initialization.');
    return;
  }
  console.log('Initializing Pomodoro timer...');

  if (CONFIG.pomodoro.timerId) {
    clearInterval(CONFIG.pomodoro.timerId);
    CONFIG.pomodoro.timerId = null;
  }

  CONFIG.pomodoro.isRunning = false;
  CONFIG.pomodoro.remainingTime = CONFIG.pomodoro.workDuration;
  CONFIG.pomodoro.currentSessionType = 'work';
  CONFIG.pomodoro.sessionsCompleted = 0;

  console.log('Initial Pomodoro time value for display:', CONFIG.pomodoro.remainingTime);

  // Ensure listeners are clean before adding
  elements.pomodoroStartBtn.removeEventListener('click', startPomodoro);
  elements.pomodoroPauseBtn.removeEventListener('click', pausePomodoro);
  elements.pomodoroResetBtn.removeEventListener('click', resetPomodoro);

  elements.pomodoroStartBtn.addEventListener('click', startPomodoro);
  elements.pomodoroPauseBtn.addEventListener('click', pausePomodoro);
  elements.pomodoroResetBtn.addEventListener('click', resetPomodoro);

  elements.pomodoroStartBtn.style.display = 'inline-flex';
  elements.pomodoroPauseBtn.style.display = 'none';

  updatePomodoroDisplay();
  // simulateEinkRefresh(); // Refreshing on init might be too much if part of a larger init refresh.
                           // Consider if this specific refresh is needed or if main initApp refresh is enough.
}

function startPomodoro() {
  if (CONFIG.pomodoro.isRunning) return;
  console.log("Attempting to start Pomodoro timer...");

  // If session ended and user clicks start for the new session type.
  // remainingTime should already be set by handlePomodoroSessionEnd.
  // This check is more for an unexpected state or resuming a paused timer that was at 0.
  if (CONFIG.pomodoro.remainingTime <= 0) {
      if (CONFIG.pomodoro.currentSessionType === 'work') {
          CONFIG.pomodoro.remainingTime = CONFIG.pomodoro.workDuration;
      } else if (CONFIG.pomodoro.currentSessionType === 'shortBreak') {
          CONFIG.pomodoro.remainingTime = CONFIG.pomodoro.shortBreakDuration;
      } else if (CONFIG.pomodoro.currentSessionType === 'longBreak') {
          CONFIG.pomodoro.remainingTime = CONFIG.pomodoro.longBreakDuration;
      }
  }


  if (CONFIG.pomodoro.timerId) { // Clear any existing stray timer
    clearInterval(CONFIG.pomodoro.timerId);
  }

  CONFIG.pomodoro.isRunning = true;
  elements.pomodoroStartBtn.style.display = 'none';
  elements.pomodoroPauseBtn.style.display = 'inline-flex';

  const pomodoroTimer = document.querySelector('.pomodoro-timer');
  if (pomodoroTimer) pomodoroTimer.classList.add('running');

  console.log("Pomodoro timer started. Remaining time:", CONFIG.pomodoro.remainingTime);

  const pomodoroWidget = document.querySelector('.widget.productivity .pomodoro-timer');
  if (pomodoroWidget) pomodoroWidget.classList.add('running');

  updatePomodoroDisplay(); // Update display immediately
  simulateEinkRefresh();   // Refresh e-ink to show running state

  CONFIG.pomodoro.timerId = setInterval(() => {
    if (!CONFIG.pomodoro.isRunning) { // Double check, in case pause was called without clearing interval
      console.log("Timer tick while paused - interval should have been cleared.");
      clearInterval(CONFIG.pomodoro.timerId);
      CONFIG.pomodoro.timerId = null;
      return;
    }

    CONFIG.pomodoro.remainingTime--;
    // console.log("Timer tick! Remaining time:", CONFIG.pomodoro.remainingTime); // Can be verbose

    if (CONFIG.pomodoro.remainingTime < 0) { // Should be caught by <= 0, but as safeguard
        console.log("Timer reached zero or negative, ending session.");
        CONFIG.pomodoro.remainingTime = 0; // Correct to 0 before handling end
        handlePomodoroSessionEnd();
        return; // Exit interval callback
    }
    
    // Only update display and refresh e-ink every 15 seconds to accommodate low refresh rate
    if (CONFIG.pomodoro.remainingTime % 15 === 0 || CONFIG.pomodoro.remainingTime === 0) {
      updatePomodoroDisplay();
      simulateEinkRefresh();
      console.log("Refreshing e-ink display for Pomodoro timer every 15s");
    }

    if (CONFIG.pomodoro.remainingTime === 0) {
        console.log("Timer reached exactly zero, ending session.");
        handlePomodoroSessionEnd(); // This will clear the interval
        // No return here, as handlePomodoroSessionEnd clears the interval.
        // However, the interval callback will still finish its current execution.
    }
  }, 1000);
}

function pausePomodoro() {
  if (!CONFIG.pomodoro.isRunning) return;
  CONFIG.pomodoro.isRunning = false;
  console.log("Pausing Pomodoro timer. Remaining time:", CONFIG.pomodoro.remainingTime);

  if (CONFIG.pomodoro.timerId) {
    clearInterval(CONFIG.pomodoro.timerId);
    CONFIG.pomodoro.timerId = null;
  }

  elements.pomodoroStartBtn.style.display = 'inline-flex';
  elements.pomodoroPauseBtn.style.display = 'none';

  const pomodoroTimer = document.querySelector('.pomodoro-timer');
  if (pomodoroTimer) pomodoroTimer.classList.remove('running');

  updatePomodoroDisplay(); // Reflect paused state

  const pomodoroWidget = document.querySelector('.widget.productivity .pomodoro-timer'); // Be more specific
  if (pomodoroWidget) pomodoroWidget.classList.remove('running');

  announceToScreenReader('Pomodoro timer paused.');
  simulateEinkRefresh();
}

function resetPomodoro() {
  console.log("Resetting Pomodoro timer.");
  CONFIG.pomodoro.isRunning = false;
  if (CONFIG.pomodoro.timerId) {
    clearInterval(CONFIG.pomodoro.timerId);
    CONFIG.pomodoro.timerId = null;
  }

  CONFIG.pomodoro.currentSessionType = 'work';
  CONFIG.pomodoro.remainingTime = CONFIG.pomodoro.workDuration;
  CONFIG.pomodoro.sessionsCompleted = 0; // Reset sessions completed count

  elements.pomodoroStartBtn.style.display = 'inline-flex';
  elements.pomodoroPauseBtn.style.display = 'none';

  const pomodoroTimer = document.querySelector('.pomodoro-timer');
  if (pomodoroTimer) pomodoroTimer.classList.remove('running');

  updatePomodoroDisplay();

  const pomodoroWidget = document.querySelector('.widget.productivity .pomodoro-timer');
  if (pomodoroWidget) pomodoroWidget.classList.remove('running');

  announceToScreenReader('Pomodoro timer reset.');
  simulateEinkRefresh();
}

function handlePomodoroSessionEnd() {
  console.log(`${CONFIG.pomodoro.currentSessionType} session ended.`);
  CONFIG.pomodoro.isRunning = false; // Ensure it's marked as not running
  if (CONFIG.pomodoro.timerId) {
    clearInterval(CONFIG.pomodoro.timerId);
    CONFIG.pomodoro.timerId = null;
  }

  announceToScreenReader(`${CONFIG.pomodoro.currentSessionType} session ended.`);

  if (CONFIG.pomodoro.currentSessionType === 'work') {
    CONFIG.pomodoro.sessionsCompleted++;
    if (CONFIG.pomodoro.sessionsCompleted % CONFIG.pomodoro.sessionsBeforeLongBreak === 0) {
      CONFIG.pomodoro.currentSessionType = 'longBreak';
      CONFIG.pomodoro.remainingTime = CONFIG.pomodoro.longBreakDuration;
    } else {
      CONFIG.pomodoro.currentSessionType = 'shortBreak';
      CONFIG.pomodoro.remainingTime = CONFIG.pomodoro.shortBreakDuration;
    }
  } else { // End of a break
    CONFIG.pomodoro.currentSessionType = 'work';
    CONFIG.pomodoro.remainingTime = CONFIG.pomodoro.workDuration;
  }

  updatePomodoroDisplay();
  elements.pomodoroStartBtn.style.display = 'inline-flex'; // Show start button for next session
  elements.pomodoroPauseBtn.style.display = 'none';

  const pomodoroTimer = document.querySelector('.pomodoro-timer');
  if (pomodoroTimer) pomodoroTimer.classList.remove('running');


  // Announce next step clearly
  let nextStepMessage = '';
  if (CONFIG.pomodoro.currentSessionType === 'work') {
    nextStepMessage = 'Break finished. Time for a work session. Press Start when ready.';
  } else if (CONFIG.pomodoro.currentSessionType === 'shortBreak') {
    nextStepMessage = 'Work session finished. Time for a short break. Press Start when ready.';
  } else if (CONFIG.pomodoro.currentSessionType === 'longBreak') {
    nextStepMessage = 'Work session finished. Time for a long break. Press Start when ready.';
  }
  announceToScreenReader(nextStepMessage);
  simulateEinkRefresh(); // Refresh display for new session state
}


function updatePomodoroDisplay() {
  if (!elements.pomodoroTime || !elements.pomodoroSessionType || !elements.pomodoroSessionsCompleted) {
    console.warn('Pomodoro display elements not found during updatePomodoroDisplay.');
    return;
  }
  // console.log(`Updating pomodoro display: ${CONFIG.pomodoro.remainingTime}s, Running: ${CONFIG.pomodoro.isRunning}`);

  const minutes = Math.floor(CONFIG.pomodoro.remainingTime / 60);
  const seconds = CONFIG.pomodoro.remainingTime % 60;
  elements.pomodoroTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const stateLabel = CONFIG.pomodoro.isRunning ? "[ACTIVE]" : (CONFIG.pomodoro.remainingTime === getCurrentSessionTotalDuration() ? "[READY]" : "[PAUSED]");
  const formattedSessionType = CONFIG.pomodoro.currentSessionType.replace(/([A-Z])/g, ' $1').trim(); // e.g. "shortBreak" -> "short Break"
  elements.pomodoroSessionType.textContent = `${formattedSessionType.charAt(0).toUpperCase() + formattedSessionType.slice(1)} ${stateLabel}`;
  elements.pomodoroSessionsCompleted.textContent = CONFIG.pomodoro.sessionsCompleted;

  const pomodoroTimer = document.querySelector('.pomodoro-timer');
  if (pomodoroTimer) {
    pomodoroTimer.classList.toggle('running', CONFIG.pomodoro.isRunning);
  }
  updatePomodoroProgressIndicator();
}


function updatePomodoroProgressIndicator() {
  const productivityWidget = document.querySelector('.widget.productivity');
  if (!productivityWidget) return;
  const progressContainer = productivityWidget.querySelector('.pomodoro-progress-indicator');
  if (!progressContainer) return;

  const totalDuration = getCurrentSessionTotalDuration();
  if (totalDuration <= 0) { // Avoid division by zero
      progressContainer.textContent = '[□□□□□□□□□□]'; // Empty bar
      progressContainer.setAttribute('aria-valuenow', '0');
      progressContainer.setAttribute('aria-valuetext', '0% complete');
      return;
  }

  const elapsedTime = totalDuration - CONFIG.pomodoro.remainingTime;
  const percentComplete = Math.max(0, Math.min(100, (elapsedTime / totalDuration) * 100));

  const progressBarWidth = 10;
  const filledPositions = Math.floor((percentComplete / 100) * progressBarWidth);
  let progressText = '[';
  for (let i = 0; i < progressBarWidth; i++) {
    progressText += i < filledPositions ? '■' : '□';
  }
  progressText += ']';

  progressContainer.textContent = progressText;
  progressContainer.setAttribute('aria-valuenow', String(Math.round(percentComplete)));
  progressContainer.setAttribute('aria-valuetext', `${Math.round(percentComplete)}% complete`);
}

function getCurrentSessionTotalDuration() {
  switch (CONFIG.pomodoro.currentSessionType) {
    case 'work': return CONFIG.pomodoro.workDuration;
    case 'shortBreak': return CONFIG.pomodoro.shortBreakDuration;
    case 'longBreak': return CONFIG.pomodoro.longBreakDuration;
    default: return 0;
  }
}

/**
 * ===================================================================================
 * MINDFULNESS MOMENT LOGIC
 * ===================================================================================
 */
function initMindfulness() {
  if (!elements.newPromptButton || !elements.mindfulnessPromptText) {
    console.warn('Mindfulness elements not found. Skipping initialization.');
    return;
  }
  elements.newPromptButton.addEventListener('click', () => showNewMindfulnessPrompt(true)); // Announce on button click
  showNewMindfulnessPrompt(false); // Don't announce on initial load
}

function showNewMindfulnessPrompt(announce = true) {
  if (!elements.mindfulnessPromptText || !CONFIG.mindfulnessPrompts || CONFIG.mindfulnessPrompts.length === 0) {
    if(elements.mindfulnessPromptText) elements.mindfulnessPromptText.textContent = 'No mindfulness prompts available.';
    return;
  }

  let newPromptIndex = CONFIG.currentMindfulnessPromptIndex;
  if (CONFIG.mindfulnessPrompts.length > 1) {
    do {
      newPromptIndex = Math.floor(Math.random() * CONFIG.mindfulnessPrompts.length);
    } while (newPromptIndex === CONFIG.currentMindfulnessPromptIndex);
  } else if (CONFIG.mindfulnessPrompts.length === 1) {
    newPromptIndex = 0; // Only one prompt
  }

  CONFIG.currentMindfulnessPromptIndex = newPromptIndex;
  const newPrompt = CONFIG.mindfulnessPrompts[newPromptIndex];
  elements.mindfulnessPromptText.textContent = newPrompt;

  if (announce) {
    announceToScreenReader(`New mindfulness prompt: ${newPrompt}`);
    simulateEinkRefresh();
  }
}

// Optional: Keep the debug timer if you're still actively debugging Pomodoro.
// Otherwise, it can be commented out or removed for a "production" version.
function debugPomodoroTimer() {
  if (CONFIG.pomodoro.isRunning) {
    // console.log(`POMODORO DEBUG (is Running: ${CONFIG.pomodoro.isRunning}): ${CONFIG.pomodoro.remainingTime}s left in ${CONFIG.pomodoro.currentSessionType}. Timer ID: ${CONFIG.pomodoro.timerId}`);
  } else {
    // console.log(`POMODORO DEBUG (is Paused/Stopped): ${CONFIG.pomodoro.remainingTime}s left in ${CONFIG.pomodoro.currentSessionType}. Timer ID: ${CONFIG.pomodoro.timerId}`);
  }
  setTimeout(debugPomodoroTimer, 5000); // Check every 5 seconds
}
// setTimeout(debugPomodoroTimer, 2000); // Start the debug monitor