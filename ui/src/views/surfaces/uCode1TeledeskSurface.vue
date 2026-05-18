<template>
  <div class="teledesk-surface">
    <!-- Loading State -->
    <div v-if="status === 'loading'" class="teledesk-loading">
      <pre class="teledesk-logo">
╔══════════════════════════════════════╗
║                                      ║
║    ██╗   ██╗ ██████╗ ██████╗ ██████╗ ║
║    ██║   ██║██╔════╝██╔════╝██╔═══██╗║
║    ██║   ██║██║     ██║     ██║   ██║║
║    ██║   ██║██║     ██║     ██║   ██║║
║    ╚██████╔╝╚██████╗╚██████╗╚██████╔╝║
║     ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝ ║
║                                      ║
║         ████████╗███████╗            ║
║         ╚══██╔══╝██╔════╝            ║
║            ██║   █████╗              ║
║            ██║   ██╔══╝              ║
║            ██║   ███████╗            ║
║            ╚═╝   ╚══════╝            ║
║                                      ║
║   ███████╗██╗     ███████╗██████╗    ║
║   ██╔════╝██║     ██╔════╝██╔══██╗   ║
║   █████╗  ██║     █████╗  ██║  ██║   ║
║   ██╔══╝  ██║     ██╔══╝  ██║  ██║   ║
║   ███████╗███████╗███████╗██████╔╝   ║
║   ╚══════╝╚══════╝╚══════╝╚═════╝    ║
║                                      ║
╚══════════════════════════════════════╝
      </pre>
      <div class="teledesk-loading-text">INITIALIZING CEETEX CONTAINER...</div>
    </div>

    <!-- Error/Disconnected State -->
    <div v-else-if="status === 'disconnected'" class="teledesk-error">
      <div class="teledesk-error-icon">📺</div>
      <div class="teledesk-error-text">NO SIGNAL</div>
      <div class="teledesk-error-desc">CEETEX container not running. Run: docker start ceetex</div>
      <button class="teledesk-retry-btn" @click="connect">RETRY</button>
    </div>

    <!-- Teletext Surface -->
    <div v-else class="teledesk-active">
      <!-- Status Bar -->
      <div class="teledesk-status-bar">
        <span class="teledesk-status-channel">Ceefax</span>
        <span class="teledesk-status-page">PAGE {{ currentPage.toString().padStart(3, '0') }}</span>
        <span class="teledesk-status-time">{{ currentTime }}</span>
      </div>

      <!-- Teletext Content (40x24 grid) -->
      <div class="teledesk-content" ref="contentRef">
        <div
          v-for="(line, rowIdx) in renderedLines"
          :key="rowIdx"
          class="teledesk-line"
          :class="{ 'teledesk-line-selected': rowIdx === cursorRow && activeView === 'articles' }"
        >
          <span
            v-for="(char, colIdx) in line"
            :key="colIdx"
            class="teledesk-char"
            :class="charClass(char, rowIdx)"
          >{{ char === ' ' ? '\u00A0' : char }}</span>
        </div>
      </div>

      <!-- Footer Navigation -->
      <div class="teledesk-footer">
        <span class="footer-btn" @click="prevPage">← PREV</span>
        <span class="footer-btn" @click="gotoPage(100)">P100 INDEX</span>
        <span class="footer-btn" @click="nextPage">→ NEXT</span>
        <span class="footer-btn" @click="openArticle">O OPEN</span>
      </div>

      <!-- Page Number Input -->
      <div v-if="showPageInput" class="teledesk-page-input">
        <span class="page-input-label">PAGE:</span>
        <input
          ref="pageInputRef"
          v-model="pageInputBuffer"
          type="text"
          maxlength="3"
          class="page-input-field"
          @keydown.enter="submitPage"
          @keydown.escape="showPageInput = false"
          @blur="submitPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

// ─── State ──────────────────────────────────────────────────────
const status = ref<'loading' | 'connected' | 'disconnected'>('loading');
const currentPage = ref(100);
const currentTime = ref('');
const showPageInput = ref(false);
const pageInputBuffer = ref('');
const pageInputRef = ref<HTMLInputElement | null>(null);
const contentRef = ref<HTMLDivElement | null>(null);
const cursorRow = ref(0);
const activeView = ref<'index' | 'articles'>('index');
const selectedArticleIndex = ref(-1);

// ─── Teletext Pages (simulated RSS feeds) ───────────────────────
interface TeletextPage {
  title: string;
  url?: string;
  feeds?: { title: string; link: string }[];
}

const pages = ref<Record<number, TeletextPage>>({
  100: { title: 'INDEX' },
  101: { title: 'BBC NEWS', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  102: { title: 'TECH', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  103: { title: 'SCIENCE', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml' },
  104: { title: 'SPORT', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
  200: { title: 'HACKER NEWS', url: 'https://news.ycombinator.com/rss' },
  201: { title: 'DEV TO', url: 'https://dev.to/feed' },
  300: { title: 'WEATHER', url: '' },
  500: { title: 'uDos STATUS' },
});

// Simulated article content for each page
const articleCache = ref<Record<number, { title: string; link: string }[]>>({});

// ─── Rendered Lines (40x24 grid) ────────────────────────────────
const renderedLines = computed(() => {
  if (currentPage.value === 100) return renderIndex();
  const page = pages.value[currentPage.value];
  if (!page) return renderError(currentPage.value);
  if (page.title === 'uDos STATUS') return renderStatus();
  if (page.title === 'WEATHER') return renderWeather();
  return renderArticles(page);
});

// ─── Render Functions ───────────────────────────────────────────
function renderIndex(): string[][] {
  const grid: string[][] = Array.from({ length: 24 }, () => Array(40).fill(' '));

  // Row 0: Top border
  setLine(grid, 0, '╔══════════════════════════════════════╗');

  // Row 1-6: Teletext-style uCode1 banner
  setLine(grid, 1, '║                                      ║');
  setLine(grid, 2, '║    ██╗   ██╗ ██████╗ ██████╗ ██████╗ ║');
  setLine(grid, 3, '║    ██║   ██║██╔════╝██╔════╝██╔═══██╗║');
  setLine(grid, 4, '║    ██║   ██║██║     ██║     ██║   ██║║');
  setLine(grid, 5, '║    ██║   ██║██║     ██║     ██║   ██║║');
  setLine(grid, 6, '║    ╚██████╔╝╚██████╗╚██████╗╚██████╔╝║');

  // Row 7: Separator
  setLine(grid, 7, '║     ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝ ║');

  // Row 8: Blank
  setLine(grid, 8, '║                                      ║');

  // Row 9: Subtitle
  setLine(grid, 9, '║' + centerText('C E E F A X   T E L E D E S K', 36) + '║');

  // Row 10: Blank
  setLine(grid, 10, '║                                      ║');

  // Row 11: Bottom border
  setLine(grid, 11, '╚══════════════════════════════════════╝');

  // Row 12: Blank
  setLine(grid, 12, '');

  // Row 13: Subtitle
  setLine(grid, 13, centerText('PAGE 100  INDEX', 40));

  // Row 14: Blank
  setLine(grid, 14, '');

  // Rows 15+: Page listings
  let y = 15;
  const sortedPages = Object.entries(pages.value).sort(([a], [b]) => Number(a) - Number(b));
  for (const [code, page] of sortedPages) {
    if (y >= 22) break;
    const codeStr = code.padStart(3, '0');
    const title = page.title.padEnd(30);
    setLine(grid, y, `${codeStr}  ${title}`);
    y++;
  }

  // Row 23: Footer
  setLine(grid, 23, '═'.repeat(40));

  return grid;
}

function renderArticles(page: TeletextPage): string[][] {
  const grid: string[][] = Array.from({ length: 24 }, () => Array(40).fill(' '));

  // Header
  setLine(grid, 0, '═'.repeat(40));
  setLine(grid, 1, '║' + centerText(page.title, 38) + '║');
  setLine(grid, 2, '═'.repeat(40));
  setLine(grid, 3, '');

  // Articles
  const articles = articleCache.value[currentPage.value] || [];
  let y = 4;
  for (let i = 0; i < Math.min(articles.length, 12); i++) {
    const num = (i + 1).toString().padStart(2, ' ');
    const title = articles[i].title.slice(0, 33);
    setLine(grid, y, `${num}. ${title}`);
    y++;
  }

  if (articles.length === 0) {
    setLine(grid, 4, centerText('No articles loaded', 40));
    setLine(grid, 5, centerText('Press R to refresh', 40));
  }

  // Footer
  setLine(grid, 21, '');
  setLine(grid, 22, '═'.repeat(40));
  setLine(grid, 23, 'Press O to open  |  R Refresh  |  ← Back');

  return grid;
}

function renderError(pageNum: number): string[][] {
  const grid: string[][] = Array.from({ length: 24 }, () => Array(40).fill(' '));
  setLine(grid, 8, centerText('╔══════════════════════════════════════╗', 40));
  setLine(grid, 9, centerText('║' + centerText('PAGE ' + pageNum.toString().padStart(3, '0') + ' NOT FOUND', 36) + '║', 40));
  setLine(grid, 10, centerText('║' + centerText('', 36) + '║', 40));
  setLine(grid, 11, centerText('║' + centerText('Press 100 to return to index', 36) + '║', 40));
  setLine(grid, 12, centerText('╚══════════════════════════════════════╝', 40));
  return grid;
}

function renderStatus(): string[][] {
  const grid: string[][] = Array.from({ length: 24 }, () => Array(40).fill(' '));
  setLine(grid, 0, '═'.repeat(40));
  setLine(grid, 1, '║' + centerText('uDos STATUS', 38) + '║');
  setLine(grid, 2, '═'.repeat(40));
  setLine(grid, 3, '');
  setLine(grid, 4, '  System:     ONLINE');
  setLine(grid, 5, '  Container:  ceetex');
  setLine(grid, 6, '  Pages:      ' + Object.keys(pages.value).length);
  setLine(grid, 7, '  Version:    1.0.0');
  setLine(grid, 8, '  Font:       Teletext50');
  setLine(grid, 9, '  Grid:       40x24');
  setLine(grid, 10, '');
  setLine(grid, 11, '  Press 100 for Index');
  setLine(grid, 23, '═'.repeat(40));
  return grid;
}

function renderWeather(): string[][] {
  const grid: string[][] = Array.from({ length: 24 }, () => Array(40).fill(' '));
  setLine(grid, 0, '═'.repeat(40));
  setLine(grid, 1, '║' + centerText('WEATHER', 38) + '║');
  setLine(grid, 2, '═'.repeat(40));
  setLine(grid, 3, '');
  setLine(grid, 4, centerText('☀️  Sunny  24°C', 40));
  setLine(grid, 5, centerText('Brisbane, Australia', 40));
  setLine(grid, 6, '');
  setLine(grid, 7, '  Mon   ☀️  26°C');
  setLine(grid, 8, '  Tue   ⛅  24°C');
  setLine(grid, 9, '  Wed   🌧️  22°C');
  setLine(grid, 10, '  Thu   ☀️  25°C');
  setLine(grid, 11, '  Fri   ☀️  27°C');
  setLine(grid, 23, '═'.repeat(40));
  return grid;
}

// ─── Helpers ────────────────────────────────────────────────────
function setLine(grid: string[][], row: number, text: string) {
  for (let i = 0; i < Math.min(text.length, 40); i++) {
    grid[row][i] = text[i];
  }
}

function centerText(text: string, width: number): string {
  const padding = Math.max(0, width - text.length);
  const left = Math.floor(padding / 2);
  const right = padding - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

function charClass(char: string, rowIdx: number): Record<string, boolean> {
  return {
    'teledesk-box': '═║╔╗╚╝╠╣╦╩╬'.includes(char),
    'teledesk-flash': char === '★',
    'teledesk-double-height': char === '█' && rowIdx < 2,
  };
}

// ─── Navigation ─────────────────────────────────────────────────
function gotoPage(pageNum: number) {
  if (pageNum >= 100 && pageNum <= 999) {
    currentPage.value = pageNum;
    cursorRow.value = 0;
    activeView.value = 'index';
    selectedArticleIndex.value = -1;
    // Simulate fetching articles for RSS pages
    if (pages.value[pageNum]?.url) {
      fetchArticles(pageNum);
    }
  }
}

function prevPage() {
  if (currentPage.value > 100) {
    gotoPage(currentPage.value - 1);
  }
}

function nextPage() {
  if (currentPage.value < 999) {
    gotoPage(currentPage.value + 1);
  }
}

function openArticle() {
  const articles = articleCache.value[currentPage.value] || [];
  if (selectedArticleIndex.value >= 0 && selectedArticleIndex.value < articles.length) {
    const article = articles[selectedArticleIndex.value];
    window.open(article.link, '_blank');
  }
}

function submitPage() {
  const num = parseInt(pageInputBuffer.value, 10);
  if (!isNaN(num) && num >= 100 && num <= 999) {
    gotoPage(num);
  }
  showPageInput.value = false;
  pageInputBuffer.value = '';
}

// ─── Simulated RSS Fetching ─────────────────────────────────────
function fetchArticles(pageNum: number) {
  const page = pages.value[pageNum];
  if (!page?.url) return;

  // Simulate fetching with mock data
  const mockArticles: { title: string; link: string }[] = [];
  const topics: Record<string, string[]> = {
    'https://feeds.bbci.co.uk/news/rss.xml': [
      'Global Summit Addresses Climate Crisis',
      'New Technology Breakthrough in Quantum Computing',
      'Markets Rally on Economic Optimism',
      'Scientists Discover New Species in Deep Ocean',
      'Education Reform Bill Passes Parliament',
      'Olympic Committee Announces Host City for 2032',
      'Breakthrough in Renewable Energy Storage',
      'Space Agency Reveals Plans for Mars Mission',
      'Healthcare Innovation Reduces Waiting Times',
      'International Trade Agreement Reached',
    ],
    'https://feeds.bbci.co.uk/news/technology/rss.xml': [
      'AI Model Achieves Human-Level Reasoning',
      'New Programming Language Gains Popularity',
      'Open Source Community Releases Major Update',
      'Cybersecurity Threats on the Rise',
      'WebAssembly Expands Beyond the Browser',
      'Rust Adoption Continues to Grow',
      'Edge Computing Transforms IoT Landscape',
      'Blockchain Technology Finds New Applications',
    ],
    'https://news.ycombinator.com/rss': [
      'Show HN: A New Terminal Emulator Written in Rust',
      'Ask HN: What are you working on?',
      'The Future of Web Development',
      'Why SQLite is Taking Over the World',
      'Building a Better Mouse Trap',
      'Lessons from 40 Years of Software Engineering',
      'A Deep Dive into Linux Kernel Development',
      'The Rise of Functional Programming',
    ],
    'https://dev.to/feed': [
      'How to Build a CLI Tool in Rust',
      'Understanding Vue 3 Composition API',
      'CSS Grid vs Flexbox: When to Use Which',
      'Introduction to WebAssembly',
      'Building Real-time Apps with WebSockets',
      'TypeScript Best Practices in 2026',
      'Microservices Architecture Patterns',
      'Testing Strategies for Modern Web Apps',
    ],
  };

  const mockData = topics[page.url] || [
    'Article One: Breaking News Story',
    'Article Two: In-Depth Analysis',
    'Article Three: Expert Opinion',
    'Article Four: Industry Update',
    'Article Five: Community Spotlight',
  ];

  for (let i = 0; i < mockData.length; i++) {
    mockArticles.push({
      title: mockData[i],
      link: `https://example.com/article/${pageNum}-${i}`,
    });
  }

  articleCache.value[pageNum] = mockArticles;
}

// ─── Connection Simulation ──────────────────────────────────────
function connect() {
  status.value = 'loading';
  setTimeout(() => {
    status.value = 'connected';
    fetchArticles(100);
    // Fetch some initial pages
    [101, 102, 200, 201].forEach(p => fetchArticles(p));
  }, 1500);
}

// ─── Keyboard Navigation ────────────────────────────────────────
function handleKeyDown(e: KeyboardEvent) {
  if (status.value !== 'connected') return;

  // Number keys for page input
  if (/^[0-9]$/.test(e.key)) {
    if (!showPageInput) {
      showPageInput.value = true;
      pageInputBuffer.value = e.key;
      nextTick(() => pageInputRef.value?.focus());
    }
    e.preventDefault();
    return;
  }

  // Navigation keys
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      prevPage();
      break;
    case 'ArrowRight':
      e.preventDefault();
      nextPage();
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (activeView.value === 'articles' && selectedArticleIndex.value > 0) {
        selectedArticleIndex.value--;
        cursorRow.value = 4 + selectedArticleIndex.value;
      }
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (activeView.value === 'articles') {
        const articles = articleCache.value[currentPage.value] || [];
        if (selectedArticleIndex.value < articles.length - 1) {
          selectedArticleIndex.value++;
          cursorRow.value = 4 + selectedArticleIndex.value;
        }
      }
      break;
    case 'o':
    case 'O':
      e.preventDefault();
      openArticle();
      break;
    case 'r':
    case 'R':
      e.preventDefault();
      fetchArticles(currentPage.value);
      break;
    case 'Enter':
      e.preventDefault();
      if (showPageInput) submitPage();
      break;
    case 'Escape':
      showPageInput.value = false;
      pageInputBuffer.value = '';
      break;
  }
}

// ─── Clock ──────────────────────────────────────────────────────
let clockInterval: ReturnType<typeof setInterval> | null = null;

function updateClock() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Lifecycle ──────────────────────────────────────────────────
onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 10000);
  connect();
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  if (clockInterval) clearInterval(clockInterval);
});
</script>

<style scoped>
/* ─── Root Surface ────────────────────────────────────────────── */
.teledesk-surface {
  background: #000000;
  color: #ffffff;
  font-family: 'Teletext50', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.2;
  letter-spacing: 0;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
}

/* ─── Active Teletext Display ─────────────────────────────────── */
.teledesk-active {
  width: 800px;
  max-width: 95vw;
  height: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #000;
}

/* ─── Status Bar ──────────────────────────────────────────────── */
.teledesk-status-bar {
  background: #000;
  color: #ffff00;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ffff00;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.teledesk-status-channel {
  color: #ffff00;
}

.teledesk-status-page {
  color: #00ff00;
}

.teledesk-status-time {
  color: #00ffff;
}

/* ─── Content Area (40x24 grid) ───────────────────────────────── */
.teledesk-content {
  flex: 1;
  margin: 0;
  padding: 8px;
  background: #000;
  color: #fff;
  font-family: 'Teletext50', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.2;
  white-space: pre;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.teledesk-line {
  display: flex;
  height: 20px;
  white-space: pre;
  font-size: 16px;
  line-height: 20px;
}

.teledesk-line-selected {
  background: #ffff00;
  color: #000000;
}

.teledesk-char {
  display: inline-block;
  width: 10px;
  text-align: center;
}

/* ─── Teletext Styling ────────────────────────────────────────── */
.teledesk-box {
  color: #00ffff;
}

.teledesk-flash {
  animation: teledesk-flash 0.5s step-end infinite;
}

@keyframes teledesk-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.teledesk-double-height {
  font-size: 32px;
  line-height: 1;
  display: inline-block;
}

/* ─── Footer Navigation ───────────────────────────────────────── */
.teledesk-footer {
  background: #000;
  color: #00ff00;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #00ff00;
  font-size: 12px;
  flex-shrink: 0;
}

.footer-btn {
  cursor: pointer;
  padding: 2px 6px;
  transition: background 0.15s;
}

.footer-btn:hover {
  background: #003300;
}

/* ─── Page Number Input ───────────────────────────────────────── */
.teledesk-page-input {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  border: 2px solid #ffff00;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
}

.page-input-label {
  color: #ffff00;
  font-weight: bold;
  font-size: 14px;
}

.page-input-field {
  background: #000;
  color: #00ff00;
  border: 1px solid #333;
  padding: 2px 4px;
  width: 50px;
  font-family: 'Teletext50', monospace;
  font-size: 14px;
  text-align: center;
  outline: none;
}

.page-input-field:focus {
  border-color: #ffff00;
}

/* ─── Loading State ───────────────────────────────────────────── */
.teledesk-loading {
  background: #000;
  color: #fff;
  width: 800px;
  max-width: 95vw;
  height: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Teletext50', monospace;
}

.teledesk-loading-spinner {
  font-size: 48px;
  animation: spin 1s step-end infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.teledesk-loading-text {
  font-size: 16px;
  color: #ffff00;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ─── Error State ─────────────────────────────────────────────── */
.teledesk-error {
  background: #000;
  color: #ff0000;
  width: 800px;
  max-width: 95vw;
  height: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Teletext50', monospace;
  text-align: center;
}

.teledesk-error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.teledesk-error-text {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ff0000;
}

.teledesk-error-desc {
  color: #ffff00;
  font-size: 12px;
  margin-bottom: 20px;
}

.teledesk-retry-btn {
  background: #333;
  color: #00ff00;
  border: 1px solid #00ff00;
  padding: 8px 24px;
  font-family: 'Teletext50', monospace;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.teledesk-retry-btn:hover {
  background: #003300;
}

/* ─── Scrollbar ───────────────────────────────────────────────── */
.teledesk-content::-webkit-scrollbar {
  width: 6px;
}

.teledesk-content::-webkit-scrollbar-track {
  background: #111;
}

.teledesk-content::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 3px;
}
</style>
