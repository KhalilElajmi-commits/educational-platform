/**
 * PROJECT KIDS — Priority-Based Image Preloading System
 * 
 * Centralized Loading Manager with strict priority queue, preemption,
 * controlled concurrency, deduplication, and visual readiness decoding.
 */

(function(window) {
  'use strict';

  // ── 1. PRIORITY DEFINITIONS (Section 7) ─────────────────────────────
  const Priority = {
    USER_POPUP: 1,                 // User-selected journey popup (highest)
    USER_ACTIVITY_1: 2,            // First activity of selected journey
    USER_ACTIVITY_NEXT: 2.5,       // User advancing within active journey
    CURRENT_JOURNEY_REMAINING: 3,  // Remaining activities of selected journey
    BACKGROUND_POPUPS: 4,          // Remaining journey introductory popups
    BACKGROUND_ACTIVITY_1: 5       // First activities of other journeys
  };

  // ── 2. ASSET REGISTRY FOR ALL 8 JOURNEYS ────────────────────────────
  const JOURNEY_INTRO_POPUPS = {
    1: { src: 'journe 1/first pop up', fallback: 'journe 1/first pop up.png' },
    2: { src: 'journe 2/pop for journe 2.png', fallback: 'journe 2/pop for journe 2.png' },
    3: { src: 'JOURNE 3/pop for jouene 3.png', fallback: 'JOURNE 3/pop for jouene 3.png' },
    4: { src: 'journe 4/popup of journe 4.png', fallback: 'journe 4/popup of journe 4.png' },
    5: { src: 'journe 5/first popup.png', fallback: 'journe 5/first popup.png' },
    6: { src: 'journe 6/first popup.png', fallback: 'journe 6/first popup.png' },
    7: { src: 'journe 7/first pop up.png', fallback: 'journe 7/first pop up.png' },
    8: { src: 'journe 8/FIRST POPUP.png', fallback: 'journe 8/FIRST POPUP.png' }
  };

  const JOURNEY_EXERCISE_BGS = {
    1: 'journe 1/backbround of journe 1.png',
    2: 'journe 2/background journe 2_upscayl_2x_upscayl-standard-4x.png',
    3: 'JOURNE 3/BACKGROUND JOURNE 3_upscayl_2x_upscayl-standard-4x.png',
    4: 'journe 4/background journe 4_upscayl_2x_upscayl-standard-4x.png',
    5: 'journe 5/6d654db3-5144-4e84-89a8-d4c21ae26d3e_upscayl_2x_upscayl-standard-4x.png',
    6: 'journe 6/background  journe 6_upscayl_2x_upscayl-standard-4x.png',
    7: 'journe 7/background.png',
    8: 'journe 8/BACKGROUND.png'
  };

  const JOURNEY_ACTIVITIES = {
    1: [
      'journe 1/1.png',
      'journe 1/2.png',
      'journe 1/3.png',
      'journe 1/4.png',
      'journe 1/5.png',
      'journe 1/6.png',
      'journe 1/end journe 1.png'
    ],
    2: [
      'journe 2/1.png',
      'journe 2/2.png',
      'journe 2/3.png',
      'journe 2/4.png',
      'journe 2/5.png',
      'journe 2/end journe 2.png'
    ],
    3: [
      'JOURNE 3/1.png',
      'JOURNE 3/2.png',
      'JOURNE 3/3.png',
      'JOURNE 3/4.png',
      'JOURNE 3/5.png',
      'JOURNE 3/end journe 3.png'
    ],
    4: [
      'journe 4/1.png',
      'journe 4/2.png',
      'journe 4/3.png',
      'journe 4/4.png',
      'journe 4/5.png',
      'journe 4/end pop up.png'
    ],
    5: [
      'journe 5/2.png',
      'journe 5/3.png',
      'journe 5/4.png',
      'journe 5/5.png',
      'journe 5/end popup.png'
    ],
    6: [
      'journe 6/1.png',
      'journe 6/2.png',
      'journe 6/3.png',
      'journe 6/4.png',
      'journe 6/5.png',
      'journe 6/7.png',
      'journe 6/6.png',
      'journe 6/popup end.png'
    ],
    7: [
      'journe 7/1.png',
      'journe 7/end pop up.png'
    ],
    8: [
      'journe 8/1.png',
      'journe 8/2.png',
      'journe 8/3.png',
      'journe 8/4.png',
      'journe 8/5.png',
      'journe 8/last popup.png'
    ]
  };

  const COMMON_ACTIVITY_BUTTONS = [
    'journe 1/valider.png',
    'journe 1/continuer.png',
    'journe 1/back botten.png',
    'journe 1/home botten.png',
    'contiuer/bien joue.png',
    'contiuer/excellent.png',
    'contiuer/parfait.png',
    'contiuer/super.png'
  ];

  // ── 3. CENTRALIZED IMAGE CACHE & DEDUPLICATION ──────────────────────
  const loadedAssets = new Map();
  const inflightPromises = new Map();
  const failedAssets = new Set();

  const stats = {
    cacheHits: 0,
    networkLoads: 0,
    duplicateRequestsPrevented: 0,
    preemptions: 0,
    popupsReady: 0,
    activitiesReady: 0,
    errors: 0
  };

  const eventLog = [];
  function logEvent(type, detail) {
    const entry = { time: Math.round(performance.now()), type, detail };
    eventLog.push(entry);
    if (eventLog.length > 1000) eventLog.shift();
  }

  function normalizeKey(src) {
    if (!src || typeof src !== 'string') return '';
    return src.split('?')[0].trim();
  }

  function resolveOptimizedSrc(src) {
    if (typeof window.getOptimizedAsset === 'function') {
      return window.getOptimizedAsset(src);
    }
    if (window.OPTIMIZED_ASSET_MAP && window.OPTIMIZED_ASSET_MAP[src]) {
      return window.OPTIMIZED_ASSET_MAP[src];
    }
    return src;
  }

  /**
   * Load and decode a single image with instant WebP/PNG fallback handling.
   * Returns a Promise that resolves when the image is fully decoded.
   */
  function loadImage(rawSrc, rawFallbackSrc) {
    const key = normalizeKey(rawSrc);
    if (!key) return Promise.resolve(null);
    const fallbackKey = normalizeKey(rawFallbackSrc || rawSrc);

    // 1. Cache hit: already loaded & decoded
    if (loadedAssets.has(key)) {
      stats.cacheHits++;
      return Promise.resolve(loadedAssets.get(key));
    }
    if (loadedAssets.has(fallbackKey)) {
      stats.cacheHits++;
      return Promise.resolve(loadedAssets.get(fallbackKey));
    }

    // 2. Deduplication: already in-flight
    if (inflightPromises.has(key)) {
      stats.duplicateRequestsPrevented++;
      return inflightPromises.get(key);
    }
    if (inflightPromises.has(fallbackKey)) {
      stats.duplicateRequestsPrevented++;
      return inflightPromises.get(fallbackKey);
    }

    // 3. Start network fetch & decode
    stats.networkLoads++;
    logEvent('IMAGE_FETCH_START', { key, fallbackKey });

    const promise = new Promise((resolve) => {
      const optSrc = resolveOptimizedSrc(key);
      const fallbackSrc = fallbackKey;

      const img = new Image();
      let hasTriedFallback = false;

      const finishSuccess = () => {
        loadedAssets.set(key, img);
        loadedAssets.set(fallbackKey, img);
        if (optSrc !== key) loadedAssets.set(optSrc, img);
        inflightPromises.delete(key);
        inflightPromises.delete(fallbackKey);
        logEvent('IMAGE_DECODED', { key, src: img.src });
        resolve(img);
      };

      const tryDecode = () => {
        if ('decode' in img) {
          img.decode().then(finishSuccess).catch((err) => {
            console.warn(`[ImagePreloadManager] decode error on ${img.src}:`, err);
            handleError();
          });
        } else {
          finishSuccess();
        }
      };

      const handleError = () => {
        if (!hasTriedFallback && img.src !== fallbackSrc && fallbackSrc !== optSrc) {
          hasTriedFallback = true;
          logEvent('IMAGE_FALLBACK_TRIGGERED', { key, fallbackSrc });
          img.src = fallbackSrc;
          if (img.complete) {
            tryDecode();
          }
        } else {
          stats.errors++;
          failedAssets.add(key);
          inflightPromises.delete(key);
          inflightPromises.delete(fallbackKey);
          logEvent('IMAGE_LOAD_FAILED', { key });
          resolve(null); // Resolve safely to avoid hanging the queue
        }
      };

      img.onload = tryDecode;
      img.onerror = handleError;
      img.src = optSrc;

      if (img.complete) {
        tryDecode();
      }
    });

    inflightPromises.set(key, promise);
    inflightPromises.set(fallbackKey, promise);
    return promise;
  }

  function loadGroup(images) {
    if (!images || images.length === 0) return Promise.resolve();
    return Promise.all(images.map(item => {
      if (typeof item === 'string') return loadImage(item, item);
      return loadImage(item.src, item.fallback || item.src);
    }));
  }

  // ── 4. TASK DEFINITION & PRIORITY QUEUE ─────────────────────────────
  class PreloadTask {
    constructor(id, type, priority, journeyId, activityIndex, images) {
      this.id = id;
      this.type = type; // 'popup' | 'activity'
      this.priority = priority;
      this.journeyId = journeyId;
      this.activityIndex = activityIndex; // 0..N for activity, -1 for popup
      this.images = images;
      this.status = 'queued'; // 'queued' | 'running' | 'completed'
      
      this._resolve = null;
      this._reject = null;
      this.promise = new Promise((res, rej) => {
        this._resolve = res;
        this._reject = rej;
      });
    }

    execute() {
      if (this.status === 'completed') {
        return Promise.resolve();
      }
      if (this.status === 'running') {
        return this.promise;
      }
      this.status = 'running';
      logEvent('TASK_EXECUTE_START', { id: this.id, priority: this.priority });
      loadGroup(this.images).then(() => {
        this.status = 'completed';
        logEvent('TASK_EXECUTE_COMPLETE', { id: this.id, priority: this.priority });
        if (this._resolve) this._resolve();
      }).catch((err) => {
        console.warn(`[ImagePreloadManager] Task ${this.id} error:`, err);
        this.status = 'completed';
        if (this._resolve) this._resolve();
      });
      return this.promise;
    }
  }

  // ── 5. CENTRALIZED LOADING MANAGER ─────────────────────────────────
  class CentralLoadingManager {
    constructor() {
      this.taskRegistry = new Map(); // id -> PreloadTask
      this.queue = [];              // Array of PreloadTask sorted by priority ascending
      this.activeBackgroundJob = null;
      this.isBackgroundPaused = false;
      this.mapReady = false;
      this.activeJourneyId = null;
      this.completedPopups = new Set();
      this.completedActivities = new Set(); // "j{id}_a{idx}"
    }

    _sortQueue() {
      this.queue.sort((a, b) => a.priority - b.priority);
    }

    getOrCreatePopupTask(journeyId, priority) {
      const id = `popup_${journeyId}`;
      if (this.taskRegistry.has(id)) {
        const task = this.taskRegistry.get(id);
        if (priority !== undefined && priority < task.priority) {
          task.priority = priority;
          this._sortQueue();
        }
        return task;
      }
      const popupCfg = JOURNEY_INTRO_POPUPS[journeyId];
      const images = popupCfg ? [popupCfg] : [];
      const task = new PreloadTask(id, 'popup', priority || Priority.BACKGROUND_POPUPS, journeyId, -1, images);
      task.promise.then(() => {
        this.completedPopups.add(journeyId);
        stats.popupsReady++;
        this._checkAllPopupsPrepared();
      });
      this.taskRegistry.set(id, task);
      this.queue.push(task);
      this._sortQueue();
      return task;
    }

    getOrCreateActivityTask(journeyId, activityIndex, priority) {
      const id = `activity_${journeyId}_${activityIndex}`;
      if (this.taskRegistry.has(id)) {
        const task = this.taskRegistry.get(id);
        if (priority !== undefined && priority < task.priority) {
          task.priority = priority;
          this._sortQueue();
        }
        return task;
      }

      const images = [];
      // Activity 1 (index 0) includes journey's exercise background + common buttons
      if (activityIndex === 0) {
        if (JOURNEY_EXERCISE_BGS[journeyId]) {
          images.push(JOURNEY_EXERCISE_BGS[journeyId]);
        }
        COMMON_ACTIVITY_BUTTONS.forEach(b => images.push(b));
      }

      // Main activity screen image
      const actList = JOURNEY_ACTIVITIES[journeyId];
      if (actList && actList[activityIndex]) {
        images.push(actList[activityIndex]);
      }

      const task = new PreloadTask(id, 'activity', priority || Priority.BACKGROUND_ACTIVITY_1, journeyId, activityIndex, images);
      task.promise.then(() => {
        this.completedActivities.add(`j${journeyId}_a${activityIndex}`);
        stats.activitiesReady++;
      });
      this.taskRegistry.set(id, task);
      this.queue.push(task);
      this._sortQueue();
      return task;
    }

    isPopupReady(journeyId) {
      const id = `popup_${journeyId}`;
      const task = this.taskRegistry.get(id);
      return task ? task.status === 'completed' : false;
    }

    isActivityReady(journeyId, activityIndex) {
      const id = `activity_${journeyId}_${activityIndex}`;
      const task = this.taskRegistry.get(id);
      return task ? task.status === 'completed' : false;
    }

    /**
     * Requirement 2 & 3: User clicked a journey.
     * Immediately interrupts/pauses background tasks and gives highest priority (1)
     * to this journey's introductory popup.
     */
    prioritizePopup(journeyId) {
      logEvent('USER_SELECT_POPUP', { journeyId });
      this.pauseBackground();
      stats.preemptions++;

      const task = this.getOrCreatePopupTask(journeyId, Priority.USER_POPUP);
      
      // Also prepare Priority 2 (First activity of this selected journey)
      // so it begins loading immediately while the student views the popup!
      this.getOrCreateActivityTask(journeyId, 0, Priority.USER_ACTIVITY_1);

      if (task.status === 'completed') {
        stats.cacheHits += (task.images ? task.images.length : 1);
        this.resumeBackground();
        return Promise.resolve();
      }

      // Execute urgently
      return task.execute().then(() => {
        this.resumeBackground();
      });
    }

    /**
     * Requirement 4: When user presses "Commencer".
     * Immediately prioritizes the first activity of the selected journey.
     */
    prioritizeActivity(journeyId, activityIndex) {
      logEvent('USER_COMMENCER_ACTIVITY', { journeyId, activityIndex });
      this.pauseBackground();

      const priority = activityIndex === 0 ? Priority.USER_ACTIVITY_1 : Priority.USER_ACTIVITY_NEXT;
      const task = this.getOrCreateActivityTask(journeyId, activityIndex, priority);

      if (task.status === 'completed') {
        stats.cacheHits += (task.images ? task.images.length : 1);
        this.resumeBackground();
        return Promise.resolve();
      }

      return task.execute().then(() => {
        this.resumeBackground();
      });
    }

    ensurePopupReady(journeyId) {
      return this.prioritizePopup(journeyId);
    }

    ensureActivityReady(journeyId, activityIndex) {
      return this.prioritizeActivity(journeyId, activityIndex);
    }

    loadImage(src, fallback) {
      return loadImage(src, fallback);
    }

    /**
     * Requirement 5: While the student is using the selected journey.
     * After Activity 1 is revealed, sequentially preload remaining activities (Activity 2, 3, 4...).
     */
    onJourneyActivityStarted(journeyId, activityIndex) {
      this.activeJourneyId = journeyId;
      logEvent('JOURNEY_ACTIVITY_STARTED', { journeyId, activityIndex });

      const actList = JOURNEY_ACTIVITIES[journeyId] || [];
      // Queue subsequent activities of this journey in sequence
      for (let i = activityIndex + 1; i < actList.length; i++) {
        this.getOrCreateActivityTask(journeyId, i, Priority.CURRENT_JOURNEY_REMAINING);
      }

      // Resume background runner to process them sequentially
      this.resumeBackground();
    }

    /**
     * Requirement 2: When the main journey-selection page is ready.
     * Identify most recently opened/completed journey.
     * Give that journey's intro popup first background priority, then remaining popups sequentially.
     */
    onMapReady() {
      if (this.mapReady) {
        this.resumeBackground();
        return;
      }
      this.mapReady = true;
      logEvent('MAP_READY', {});

      const recentJourney = this.getMostRecentlyOpenedJourney();
      logEvent('MOST_RECENT_JOURNEY_IDENTIFIED', { journeyId: recentJourney });

      // First priority background: most recently opened journey popup
      this.getOrCreatePopupTask(recentJourney, Priority.BACKGROUND_POPUPS);

      // Remaining journeys sequentially
      for (let j = 1; j <= 8; j++) {
        if (j !== recentJourney) {
          this.getOrCreatePopupTask(j, Priority.BACKGROUND_POPUPS);
        }
      }

      this._sortQueue();
      this.processQueue();
    }

    getMostRecentlyOpenedJourney() {
      try {
        if (window.MapSystem && window.MapSystem.state) {
          const state = window.MapSystem.state;
          if (Array.isArray(state.introducedLevels) && state.introducedLevels.length > 0) {
            for (let i = state.introducedLevels.length - 1; i >= 0; i--) {
              const lvl = state.introducedLevels[i];
              if (lvl >= 1 && lvl <= 8) return lvl;
            }
          }
          if (state.unlockedLevel) {
            return Math.min(Math.max(Number(state.unlockedLevel) || 1, 1), 8);
          }
        }
        const saved = localStorage.getItem('tunisiaMapProgress');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.introducedLevels) && parsed.introducedLevels.length > 0) {
            for (let i = parsed.introducedLevels.length - 1; i >= 0; i--) {
              const lvl = parsed.introducedLevels[i];
              if (lvl >= 1 && lvl <= 8) return lvl;
            }
          }
          if (parsed.unlockedLevel) {
            return Math.min(Math.max(Number(parsed.unlockedLevel) || 1, 1), 8);
          }
        }
      } catch (e) {
        console.warn('[ImagePreloadManager] Error determining recent journey:', e);
      }
      return 1;
    }

    /**
     * Requirement 6: Once all eight journey introductory popups are ready,
     * begin preloading the first activity of each journey sequentially.
     */
    _checkAllPopupsPrepared() {
      if (this.completedPopups.size >= 8) {
        logEvent('ALL_POPUPS_PREPARED', {});
        for (let j = 1; j <= 8; j++) {
          this.getOrCreateActivityTask(j, 0, Priority.BACKGROUND_ACTIVITY_1);
        }
        this._sortQueue();
      }
    }

    pauseBackground() {
      this.isBackgroundPaused = true;
      logEvent('BACKGROUND_PAUSED', {});
    }

    resumeBackground() {
      this.isBackgroundPaused = false;
      logEvent('BACKGROUND_RESUMED', {});
      this.processQueue();
    }

    /**
     * Controlled Concurrency Runner (concurrency = 1 for background tasks).
     * Processes queue items in strict priority order.
     */
    processQueue() {
      if (this.isBackgroundPaused) return;
      if (this.activeBackgroundJob) return;

      // Filter out completed tasks
      this.queue = this.queue.filter(t => t.status !== 'completed');
      if (this.queue.length === 0) return;

      // Pick highest priority task
      const nextTask = this.queue[0];
      if (!nextTask || nextTask.status === 'running') return;

      this.activeBackgroundJob = nextTask;
      nextTask.execute().then(() => {
        this.activeBackgroundJob = null;
        if (!this.isBackgroundPaused) {
          this.processQueue();
        }
      }).catch((err) => {
        console.warn('[ImagePreloadManager] Task error:', err);
        this.activeBackgroundJob = null;
        if (!this.isBackgroundPaused) {
          this.processQueue();
        }
      });
    }

    /**
     * Seamless Integration Hooks for MapSystem and ExerciseSystem
     */
    hookMapSystem(mapSystem) {
      if (!mapSystem || mapSystem._preloadHooked) return;
      mapSystem._preloadHooked = true;

      const self = this;

      const origInit = mapSystem.init;
      mapSystem.init = function() {
        const res = origInit.apply(this, arguments);
        self.onMapReady();
        return res;
      };

      const origHandleLevelClick = mapSystem.handleLevelClick;
      let pendingSelectedLevel = null;

      mapSystem.handleLevelClick = function(levelId) {
        if (!this.isLevelUnlocked(levelId)) {
          return;
        }

        if (levelId >= 1 && levelId <= 8) {
          pendingSelectedLevel = levelId;
          const isReady = self.isPopupReady(levelId);
          const p = self.prioritizePopup(levelId);
          if (isReady) {
            return origHandleLevelClick.call(this, levelId);
          }
          p.then(() => {
            if (pendingSelectedLevel === levelId) {
              origHandleLevelClick.call(this, levelId);
            }
          });
        } else {
          return origHandleLevelClick.call(this, levelId);
        }
      };
    }

    hookExerciseSystem(exerciseSystem) {
      if (!exerciseSystem || exerciseSystem._preloadHooked) return;
      exerciseSystem._preloadHooked = true;

      const self = this;

      const origOpen = exerciseSystem.open;
      exerciseSystem.open = function(levelId) {
        const doOpen = () => {
          origOpen.call(this, levelId);
          if (levelId >= 1 && levelId <= 8) {
            self.onJourneyActivityStarted(levelId, 0);
          }
        };

        if (levelId >= 1 && levelId <= 8) {
          if (self.isActivityReady(levelId, 0)) {
            doOpen();
          } else {
            self.prioritizeActivity(levelId, 0).then(doOpen);
          }
        } else {
          doOpen();
        }
      };

      const origClose = exerciseSystem.close;
      exerciseSystem.close = function() {
        const res = origClose.apply(this, arguments);
        self.activeJourneyId = null;
        self.resumeBackground();
        return res;
      };

      for (let lvl = 1; lvl <= 8; lvl++) {
        const methodName = `loadJourney${lvl}Activity`;
        const origMethod = exerciseSystem[methodName];
        if (typeof origMethod === 'function') {
          exerciseSystem[methodName] = function() {
            const idx = this.currentExIndex || 0;
            if (self.isActivityReady(lvl, idx)) {
              return origMethod.apply(this, arguments);
            } else {
              self.ensureActivityReady(lvl, idx).then(() => {
                origMethod.apply(this, arguments);
              });
            }
          };
        }
      }
    }

    getStatus() {
      return {
        mapReady: this.mapReady,
        isBackgroundPaused: this.isBackgroundPaused,
        activeBackgroundJob: this.activeBackgroundJob ? this.activeBackgroundJob.id : null,
        activeJourneyId: this.activeJourneyId,
        completedPopups: Array.from(this.completedPopups).sort((a,b) => a-b),
        completedActivities: Array.from(this.completedActivities).sort(),
        queueLength: this.queue.length,
        pendingTasks: this.queue.map(t => ({ id: t.id, priority: t.priority, status: t.status })),
        stats: Object.assign({}, stats),
        cacheSize: loadedAssets.size,
        inflightCount: inflightPromises.size,
        failedCount: failedAssets.size
      };
    }

    getEventLog() {
      return eventLog.slice();
    }
  }

  // ── 6. INSTANTIATION & GLOBAL EXPOSURE ──────────────────────────────
  const preloadManager = new CentralLoadingManager();
  window.ImagePreloadManager = preloadManager;
  window.ImagePreloadPriority = Priority;

  // Seamless hook for window.setOptimizedImgSrc to record cache hits and deduplicate
  if (typeof window.setOptimizedImgSrc === 'function') {
    const origSetOptimizedImgSrc = window.setOptimizedImgSrc;
    window.setOptimizedImgSrc = function(imgEl, src, fallbackSrc) {
      loadImage(src, fallbackSrc);
      return origSetOptimizedImgSrc(imgEl, src, fallbackSrc);
    };
  }

  console.log('🚀 [Project Kids] Priority-Based Image Preloading System Initialized.');

})(typeof window !== 'undefined' ? window : globalThis);
