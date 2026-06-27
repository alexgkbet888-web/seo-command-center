const AUTO_REFRESH_MS = 60000;
const SETTINGS_KEY = "seo_command_center_settings_v1";

const state = {
  data: null,
  route: "overview",
  settings: loadSettings(),
  autoTimer: null,
};

const ROUTES = {
  overview: { title: "SEO指挥中心", cards: "all" },
  "site-table": { title: "网站管理", cards: ["site-table", "reports", "settings"] },
  "seo-progress": { title: "SEO任务", cards: ["seo-progress", "seo-tasks", "actions"] },
  gsc: { title: "GSC资源", cards: ["gsc", "reports", "settings", "site-table"] },
  sitemap: { title: "Sitemap提交", cards: ["sitemap", "settings", "site-table"] },
  indexing: { title: "收录监控", cards: ["indexing", "pages", "site-table"] },
  keywords: { title: "关键词分组", cards: ["keywords", "isolation", "site-table"] },
  "seo-traffic": { title: "SEO流量", cards: ["seo-traffic", "keywords", "reports"] },
  pages: { title: "内容与页面", cards: ["pages", "site-table"] },
  crawler: { title: "爬虫监控", cards: ["crawler", "pages", "reports"] },
  isolation: { title: "品牌隔离", cards: ["isolation", "site-table"] },
  reports: { title: "报表中心", cards: ["reports", "crawler", "pages"] },
  actions: { title: "任务与工作流", cards: ["actions", "seo-tasks", "reports"] },
  settings: { title: "设置中心", cards: ["settings", "reports"] },
};

const $ = (selector) => document.querySelector(selector);
const els = {
  pageTitle: $("#page-title"),
  navOverview: $("#nav-overview"),
  navSites: $("#nav-sites"),
  navActions: $("#nav-actions"),
  navGsc: $("#nav-gsc"),
  navSitemap: $("#nav-sitemap"),
  navIndexing: $("#nav-indexing"),
  navKeywords: $("#nav-keywords"),
  navSeoTraffic: $("#nav-seo-traffic"),
  navPages: $("#nav-pages"),
  navCrawler: $("#nav-crawler"),
  navIsolation: $("#nav-isolation"),
  navReports: $("#nav-reports"),
  navWorkflow: $("#nav-workflow"),
  navSettings: $("#nav-settings"),
  refreshBtn: $("#refresh-btn"),
  refreshBottom: $("#refresh-bottom"),
  autoRefresh: $("#auto-refresh"),
  lastRefresh: $("#last-refresh"),
  routerLiveState: $("#router-live-state"),
  gscApiState: $("#gsc-api-state"),
  dateRange: $("#date-range"),
  batchFilter: $("#batch-filter"),
  brandFilter: $("#brand-filter"),
  statusFilter: $("#status-filter"),
  searchInput: $("#search-input"),
  seoSort: $("#seo-sort"),
  seoSearch: $("#seo-search"),
  kpiSites: $("#kpi-sites"),
  kpiBatches: $("#kpi-batches"),
  kpiOnline: $("#kpi-online"),
  kpiHealthRate: $("#kpi-health-rate"),
  kpiIssues: $("#kpi-issues"),
  kpiIssueRate: $("#kpi-issue-rate"),
  kpiRouterRequests: $("#kpi-router-requests"),
  kpiRouterNote: $("#kpi-router-note"),
  p1Label: $("#p1-label"),
  p1Seo: $("#p1-seo"),
  p1Total: $("#p1-total"),
  p1Rate: $("#p1-rate"),
  p1Meter: $("#p1-meter"),
  p1Checks: $("#p1-checks"),
  p2Label: $("#p2-label"),
  p2Seo: $("#p2-seo"),
  p2Total: $("#p2-total"),
  p2Rate: $("#p2-rate"),
  p2Meter: $("#p2-meter"),
  p2Checks: $("#p2-checks"),
  gscRing: $("#gsc-ring"),
  gscRingValue: $("#gsc-ring-value"),
  gscRingRate: $("#gsc-ring-rate"),
  gscRingLabel: $("#gsc-ring-label"),
  gscRingNote: $("#gsc-ring-note"),
  sitemapRing: $("#sitemap-ring"),
  sitemapRingValue: $("#sitemap-ring-value"),
  sitemapRingRate: $("#sitemap-ring-rate"),
  sitemapRingNote: $("#sitemap-ring-note"),
  funnelPending: $("#funnel-pending"),
  funnelCrawled: $("#funnel-crawled"),
  funnelIndexed: $("#funnel-indexed"),
  funnelValid: $("#funnel-valid"),
  funnelPendingRate: $("#funnel-pending-rate"),
  funnelCrawledRate: $("#funnel-crawled-rate"),
  funnelIndexedRate: $("#funnel-indexed-rate"),
  funnelValidRate: $("#funnel-valid-rate"),
  indexRate: $("#index-rate"),
  keywordList: $("#keyword-list"),
  brandAudit: $("#brand-audit"),
  taskFlow: $("#task-flow"),
  taskRate: $("#task-rate"),
  routerSource: $("#router-source"),
  routerChart: $("#router-chart"),
  routerBreakdown: $("#router-breakdown"),
  pageStatus: $("#page-status"),
  actionList: $("#action-list"),
  siteStatusTable: $("#site-status-table"),
  siteStatusTotal: $("#site-status-total"),
  siteTableCount: $("#site-table-count"),
  dataGeneratedAt: $("#data-generated-at"),
  apiSyncState: $("#api-sync-state"),
  apiStatusList: $("#api-status-list"),
  localSettingsList: $("#local-settings-list"),
  sourceStatusList: $("#source-status-list"),
  seoTrafficSummary: $("#seo-traffic-summary"),
  seoTrafficTable: $("#seo-traffic-table"),
};

function loadSettings() {
  try {
    return {
      refreshMs: AUTO_REFRESH_MS,
      defaultRoute: "overview",
      issueRateThreshold: 20,
      overviewRows: 8,
      ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")),
    };
  } catch {
    return { refreshMs: AUTO_REFRESH_MS, defaultRoute: "overview", issueRateThreshold: 20, overviewRows: 8 };
  }
}

function saveSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function routeFromHash() {
  const route = window.location.hash.replace("#", "") || state.settings.defaultRoute || "overview";
  return ROUTES[route] ? route : "overview";
}

function applyRoute(route = routeFromHash()) {
  state.route = route;
  const config = ROUTES[route] || ROUTES.overview;
  els.pageTitle.textContent = config.title;
  document.body.classList.toggle("module-mode", config.cards !== "all");
  document.querySelectorAll(".workspace .card").forEach((card) => {
    const show = config.cards === "all" || config.cards.includes(card.id);
    card.classList.toggle("route-hidden", !show);
  });
  document.querySelectorAll(".side-nav a").forEach((item) => {
    item.classList.toggle("active", item.getAttribute("href") === `#${route}`);
  });
  if (route !== "overview") window.scrollTo({ top: 0, behavior: "smooth" });
  if (state.data) {
    renderKeywords(state.data);
    renderBrandAudit(state.data);
    renderSiteTable();
    renderSeoTraffic(state.data);
  }
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function num(value) {
  return new Intl.NumberFormat("zh-CN").format(Math.round(Number(value) || 0));
}

function pct(part, total) {
  if (!Number(total)) return "0%";
  return `${((Number(part) / Number(total)) * 100).toFixed(1).replace(".0", "")}%`;
}

function shortDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

function ratio(part, total) {
  return total ? Number(part) / Number(total) : 0;
}

function countIssues(statuses = {}) {
  return Object.entries(statuses)
    .filter(([code]) => Number(code) >= 400)
    .reduce((sum, [, count]) => sum + Number(count || 0), 0);
}

function setRing(el, value) {
  if (!el) return;
  el.style.setProperty("--ring", `${Math.max(0, Math.min(1, value)) * 100}%`);
  el.style.setProperty("--p", `${Math.max(0, Math.min(1, value)) * 360}deg`);
}

function groupBy(items, key) {
  const map = new Map();
  for (const item of items || []) {
    const name = item[key] || "未分组";
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(item);
  }
  return map;
}

function statusLabel(code) {
  return {
    200: "正常页面",
    204: "图标兜底",
    304: "缓存命中",
    404: "未找到",
    405: "方法不允许",
    429: "请求过多",
    500: "服务错误",
    502: "项目配置错误",
    522: "上游超时",
  }[Number(code)] || `${code} 状态`;
}

function renderFilters(data) {
  const brands = [...new Set((data.sites || []).map((site) => site.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  els.brandFilter.innerHTML = ['<option value="all">全部品牌</option>', ...brands.map((brand) => `<option value="${esc(brand)}">${esc(brand)}</option>`)].join("");
  els.navSites.textContent = num(data.kpis.totalSites);
  els.navActions.textContent = num(data.actionQueue?.length || 0);
  els.navGsc.textContent = `${num(data.kpis.gscComplete)}/${num(data.kpis.totalSites)}`;
  els.navSitemap.textContent = `${num(data.kpis.sitemapComplete)}/${num(data.kpis.totalSites)}`;
  els.navIndexing.textContent = pct(Math.min(data.kpis.gscComplete, data.kpis.sitemapComplete), data.kpis.totalSites);
  els.navKeywords.textContent = num(brands.length);
  els.navSeoTraffic.textContent = num(data.dataFreshness?.gscSearchAnalytics?.syncedSites || 0);
  els.navPages.textContent = "实时";
  els.navCrawler.textContent = "接入";
  els.navIsolation.textContent = pct(data.kpis.healthy, data.kpis.totalSites);
  els.navReports.textContent = num(data.apiIntegrations?.length || 0);
  els.navWorkflow.textContent = num(data.actionQueue?.length || 0);
  els.navSettings.textContent = num(Object.keys(data.gscSubmission?.sourceStats || {}).length);
  els.dateRange.value = `${shortDateTime(data.meta?.generatedAt)} 更新`;
}

function renderOverview(data) {
  const k = data.kpis;
  els.kpiSites.textContent = num(k.totalSites);
  els.kpiBatches.textContent = `P1: ${num(k.p1Sites)}  P2: ${num(k.p2Sites)}`;
  els.kpiOnline.textContent = num(k.healthy);
  els.kpiHealthRate.textContent = pct(k.healthy, k.totalSites);
  els.siteTableCount.textContent = `(${num(k.totalSites)}站)`;
}

function renderProgress(data) {
  const p1 = data.seoProgress?.p1 || { sites: 0, seoDeployed: 0 };
  const p2 = data.seoProgress?.p2 || { sites: 0, seoDeployed: 0 };
  const p1Rate = ratio(p1.seoDeployed, p1.sites);
  const p2Rate = ratio(p2.seoDeployed, p2.sites);
  els.p1Label.textContent = `(${num(p1.sites)}站)`;
  els.p1Seo.textContent = num(p1.seoDeployed);
  els.p1Total.textContent = num(p1.sites);
  els.p1Rate.textContent = pct(p1.seoDeployed, p1.sites);
  els.p1Meter.value = Math.round(p1Rate * 100);
  els.p2Label.textContent = `(${num(p2.sites)}站)`;
  els.p2Seo.textContent = num(p2.seoDeployed);
  els.p2Total.textContent = num(p2.sites);
  els.p2Rate.textContent = pct(p2.seoDeployed, p2.sites);
  els.p2Meter.value = Math.round(p2Rate * 100);
  els.p1Checks.innerHTML = ["内容更新", "Meta优化", "Schema结构化", "排名观察"]
    .map((label) => `<li><i></i><strong>${esc(label)}</strong><span>${num(p1.seoDeployed)} / ${num(p1.sites)}</span></li>`).join("");
  els.p2Checks.innerHTML = ["内容更新", "Meta优化", "Schema结构化", "排名观察"]
    .map((label) => `<li><i></i><strong>${esc(label)}</strong><span>${num(p2.seoDeployed)} / ${num(p2.sites)}</span></li>`).join("");

  const gsc = data.gscSubmission || {};
  const gscDone = Number(gsc.gscComplete ?? data.kpis.gscComplete ?? 0);
  const sitemapDone = Number(gsc.sitemapComplete ?? data.kpis.sitemapComplete ?? 0);
  const gscRate = ratio(gscDone, data.kpis.totalSites);
  const sitemapRate = ratio(sitemapDone, data.kpis.totalSites);
  els.gscRingValue.textContent = `${num(gscDone)} / ${num(data.kpis.totalSites)}`;
  els.gscRingRate.textContent = pct(gscDone, data.kpis.totalSites);
  setRing(els.gscRing, gscRate);
  els.gscRingLabel.textContent = "已验证";
  els.gscRingNote.textContent = `P1 ${num(gsc.p1?.gscComplete || 0)}/${num(gsc.p1?.sites || 0)} · P2 ${num(gsc.p2?.gscComplete || 0)}/${num(gsc.p2?.sites || 0)}`;
  els.sitemapRingValue.textContent = `${num(sitemapDone)} / ${num(data.kpis.totalSites)}`;
  els.sitemapRingRate.textContent = pct(sitemapDone, data.kpis.totalSites);
  setRing(els.sitemapRing, sitemapRate);
  els.sitemapRingNote.textContent = `P1 ${num(gsc.p1?.sitemapComplete || 0)}/${num(gsc.p1?.sites || 0)} · P2 ${num(gsc.p2?.sitemapComplete || 0)}/${num(gsc.p2?.sites || 0)}`;

  const searchDataSites = Number(gsc.searchDataSites || 0);
  const hasSearchSnapshot = data.dataFreshness?.gscSearchAnalytics?.label !== "not_read";
  els.funnelPending.textContent = num(data.kpis.totalSites);
  els.funnelCrawled.textContent = num(gscDone);
  els.funnelIndexed.textContent = num(sitemapDone);
  els.funnelValid.textContent = hasSearchSnapshot ? num(searchDataSites) : "待同步";
  els.funnelPendingRate.textContent = "100%";
  els.funnelCrawledRate.textContent = pct(gscDone, data.kpis.totalSites);
  els.funnelIndexedRate.textContent = pct(sitemapDone, data.kpis.totalSites);
  els.funnelValidRate.textContent = hasSearchSnapshot ? pct(searchDataSites, data.kpis.totalSites) : "-";
  els.indexRate.textContent = pct(Math.min(gscDone, sitemapDone), data.kpis.totalSites);
}

function renderKeywords(data) {
  const hasSearchData = (data.topBrands || []).some((item) => Number(item.impressions) > 0 || Number(item.clicks) > 0);
  const rows = (state.route === "overview" ? data.topBrands.slice(0, Number(state.settings.overviewRows || 8)) : data.topBrands)
    .map((item) => {
      const impressions = hasSearchData ? num(item.impressions || 0) : "待接";
      const clicks = hasSearchData ? num(item.clicks || 0) : "待接";
      return `<div class="keyword-row"><strong>${esc(item.name)}</strong><span>${num(item.sites || 0)}</span><span>${impressions}</span><span>${clicks}</span></div>`;
    });
  els.keywordList.innerHTML = `<div class="keyword-row"><span>主题</span><span>站点</span><span>展示</span><span>点击</span></div>${rows.join("")}`;
}

function renderBrandAudit(data) {
  const rows = (state.route === "overview" ? data.topBrands.slice(0, Number(state.settings.overviewRows || 8)) : data.topBrands)
    .map((item, index) => {
      const score = Math.round(Number(item.okRate || 0) * 100);
      const issues = Number(item.issue || 0);
      return `<tr>
        <td>${index < 3 ? "P1" : "P2"} - ${esc(item.name)}</td>
        <td>0</td>
        <td class="${issues ? "warn" : "good"}">${issues ? "需复查" : "正常"}</td>
        <td>低</td>
        <td>${score}%</td>
        <td><span class="pass-pill">${issues ? "复查" : "通过"}</span></td>
      </tr>`;
    });
  els.brandAudit.innerHTML = rows.join("");
}

function renderSeoTraffic(data) {
  const query = (els.seoSearch?.value || "").trim().toLowerCase();
  const sort = els.seoSort?.value || "impressions";
  const syncedDomains = new Set((data.gscSearchAnalytics?.sites || []).map((site) => site.domain));
  const errorDomains = new Set((data.gscSearchAnalytics?.errors || []).map((site) => site.domain));
  const allRows = (data.sites || []).map((site) => {
    const status = site.gscSearchSynced || syncedDomains.has(site.domain)
      ? "已同步"
      : errorDomains.has(site.domain)
        ? "权限待处理"
        : "待同步";
    return { ...site, status };
  });
  let rows = allRows.filter((site) => !query || `${site.domain} ${site.brand}`.toLowerCase().includes(query));
  rows = rows.sort((a, b) => {
    if (sort === "clicks") return Number(b.clicks || 0) - Number(a.clicks || 0) || a.domain.localeCompare(b.domain);
    if (sort === "position") return (Number(a.avgPosition || 999) || 999) - (Number(b.avgPosition || 999) || 999);
    return Number(b.impressions || 0) - Number(a.impressions || 0) || a.domain.localeCompare(b.domain);
  });
  const synced = allRows.filter((site) => site.status === "已同步").length;
  const permission = allRows.filter((site) => site.status === "权限待处理").length;
  const clicks = allRows.reduce((sum, site) => sum + Number(site.clicks || 0), 0);
  const impressions = allRows.reduce((sum, site) => sum + Number(site.impressions || 0), 0);
  const avgPosition = data.gscSearchAnalytics?.totals?.avgPosition || 0;
  const range = data.gscSearchAnalytics?.range;
  const rangeText = range?.startDate && range?.endDate ? `${range.startDate} ~ ${range.endDate}` : "GSC快照";
  els.seoTrafficSummary.innerHTML = `
    <div class="summary-main"><span>今日SEO总表</span><strong>${num(impressions)}</strong><small>总流量/展现 · ${esc(rangeText)}</small></div>
    <div><span>今日总点击</span><strong>${num(clicks)}</strong><small>GSC clicks</small></div>
    <div><span>今日CTR</span><strong>${pct(clicks, impressions)}</strong><small>点击 / 展现</small></div>
    <div><span>平均排名</span><strong>${avgPosition ? Number(avgPosition).toFixed(1) : "-"}</strong><small>GSC position</small></div>
    <div><span>已同步站点</span><strong>${num(synced)}</strong><small>${num(permission)} 站权限待处理</small></div>
  `;
  els.seoTrafficTable.innerHTML = rows.map((site) => `
    <tr>
      <td>${esc(site.domain)}</td>
      <td>${esc(site.brand)}</td>
      <td>${esc(site.scope)}</td>
      <td>${num(site.clicks)}</td>
      <td>${num(site.impressions)}</td>
      <td>${pct(site.clicks, site.impressions)}</td>
      <td>${site.avgPosition ? Number(site.avgPosition).toFixed(1) : "-"}</td>
      <td class="${site.status === "权限待处理" ? "warn" : site.status === "已同步" ? "good" : ""}">${esc(site.status)}</td>
    </tr>
  `).join("");
}

function renderTasks(data) {
  const done = data.kpis.seoDeployed;
  const total = data.kpis.totalSites;
  const gsc = data.kpis.gscComplete;
  const sitemap = data.kpis.sitemapComplete;
  const rankState = data.dataFreshness?.gscSearchAnalytics?.label !== "not_read" ? "已同步" : "待同步";
  const tasks = [
    ["内容更新", `${done}/${total}`],
    ["Meta优化", `${done}/${total}`],
    ["Schema结构化", `${done}/${total}`],
    ["Sitemap提交", `${sitemap}/${total}`],
    ["GSC检测", `${gsc}/${total}`],
    ["排名观察", rankState],
  ];
  els.taskFlow.innerHTML = tasks.map(([label, value]) => `<div class="task-node"><b>✓</b><span>${esc(label)}</span><small>${esc(value)}</small></div>`).join("");
  els.taskRate.textContent = `${pct(done, total)} 完成`;
}

function renderApiStatus(data) {
  const statusText = { connected: "已接入", warning: "部分接入", pending: "待接" };
  const statusClass = { connected: "good", warning: "warn", pending: "warn" };
  const integrations = data.apiIntegrations || [];
  const gscSearch = integrations.find((item) => item.key === "gsc-search");
  els.gscApiState.textContent = gscSearch?.status === "connected" ? "已接" : gscSearch?.status === "warning" ? "部分" : "待同步";
  els.gscApiState.className = gscSearch?.status === "connected" ? "" : "warn";
  els.dataGeneratedAt.textContent = `数据生成 ${shortDateTime(data.meta?.generatedAt)}`;
  els.apiSyncState.textContent = `${num(data.kpis.gscComplete)}/${num(data.kpis.totalSites)} GSC`;
  els.apiStatusList.innerHTML = integrations.map((item) => `
    <div class="api-row">
      <span class="api-dot ${esc(item.status)}"></span>
      <strong>${esc(item.name)}</strong>
      <b class="${statusClass[item.status] || "warn"}">${esc(statusText[item.status] || item.status)}</b>
      <small>${esc(item.value)}</small>
    </div>
  `).join("");
  const sourceRows = Object.entries(data.gscSubmission?.sourceStats || {}).map(([key, item]) => ({
    name: key,
    value: `${num(item.complete)}/${num(item.domains)} GSC · ${num(item.sitemapComplete)}/${num(item.domains)} Sitemap`,
    source: item.source,
    time: item.generatedAt,
  }));
  els.sourceStatusList.innerHTML = sourceRows.map((item) => `
    <div class="source-row">
      <strong>${esc(item.name)}</strong>
      <span>${esc(item.value)}</span>
      <small>${esc(item.source)} · ${shortDateTime(item.time)}</small>
    </div>
  `).join("");
  renderSettingsControls();
}

function renderSettingsControls() {
  els.localSettingsList.innerHTML = `
    <label class="setting-row"><span>自动刷新频率</span><select id="setting-refresh"><option value="0">关闭</option><option value="30000">30秒</option><option value="60000">60秒</option><option value="120000">120秒</option></select></label>
    <label class="setting-row"><span>默认进入页面</span><select id="setting-default-route">${Object.entries(ROUTES).map(([key, route]) => `<option value="${esc(key)}">${esc(route.title)}</option>`).join("")}</select></label>
    <label class="setting-row"><span>异常请求阈值</span><input id="setting-issue-rate" type="number" min="0" max="100" step="1"></label>
    <label class="setting-row"><span>概览品牌行数</span><select id="setting-overview-rows"><option value="8">8行</option><option value="12">12行</option><option value="50">全部品牌</option></select></label>
    <div class="setting-actions"><button id="export-json" type="button">导出JSON</button><button id="export-csv" type="button">导出CSV</button><button id="reset-settings" type="button">恢复默认</button></div>
  `;
  $("#setting-refresh").value = String(state.settings.refreshMs ?? AUTO_REFRESH_MS);
  $("#setting-default-route").value = state.settings.defaultRoute || "overview";
  $("#setting-issue-rate").value = String(state.settings.issueRateThreshold || 20);
  $("#setting-overview-rows").value = String(state.settings.overviewRows || 8);
}

function domainIssues(router) {
  if (!router?.topDomains) return 0;
  return router.topDomains.filter((domain) => countIssues(domain.statuses) > 0).length;
}

function renderRouter(router) {
  const requests = Number(router?.totals?.requests || 0);
  const statuses = router?.totals?.statuses || {};
  const issueRequests = countIssues(statuses);
  els.kpiRouterRequests.textContent = num(requests);
  els.kpiRouterNote.textContent = router?.generatedAt ? `实时 ${shortDateTime(router.generatedAt)}` : "本地快照";
  els.kpiIssues.textContent = num(issueRequests);
  els.kpiIssueRate.textContent = issueRequests ? `${pct(issueRequests, requests)} 请求级异常` : "0% 请求级异常";
  els.routerLiveState.textContent = router?.ok ? "正常" : "待接";
  els.navCrawler.textContent = num(requests);
  els.routerSource.textContent = router?.generatedAt ? `实时 ${shortDateTime(router.generatedAt)}` : "本地快照";
  els.lastRefresh.textContent = `最后检查：${shortDateTime(state.data?.meta?.generatedAt)}`;
  const daily = normalizeDaily(router?.daily, requests);
  els.routerChart.innerHTML = renderRouterSvg(daily);
  const statusRows = Object.entries(statuses).sort(([a], [b]) => Number(a) - Number(b))
    .map(([code, count]) => `<div><span>${esc(statusLabel(code))}</span><strong>${num(count)}</strong><small>${pct(count, requests)}</small></div>`).join("");
  els.routerBreakdown.innerHTML = `
    <div><span>总请求量</span><strong>${num(requests)}</strong><small>Router 实时</small></div>
    <div><span>请求异常</span><strong>${num(issueRequests)}</strong><small>${pct(issueRequests, requests)}</small></div>
    ${statusRows || '<div><span>状态码</span><strong>0</strong><small>暂无请求</small></div>'}
  `;
  renderPageStatus(router);
}

function normalizeDaily(daily, fallbackRequests) {
  const today = new Date();
  const byDate = new Map((daily || []).map((item) => [item.date, item]));
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - offset));
    const key = date.toISOString().slice(0, 10);
    const item = byDate.get(key);
    return {
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      requests: Number(item?.requests || (offset === 6 && !daily?.length ? fallbackRequests : 0)),
      ok: Number(item?.statuses?.["200"] || 0),
      errors: countIssues(item?.statuses || {}),
    };
  });
}

function svgPoints(values, max, width, height, padX, padY) {
  const step = (width - padX * 2) / Math.max(1, values.length - 1);
  return values.map((value, index) => {
    const x = padX + index * step;
    const y = height - padY - (Number(value || 0) / max) * (height - padY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function renderRouterSvg(daily) {
  const width = 420;
  const height = 158;
  const padX = 34;
  const padY = 20;
  const totalSeries = daily.map((item) => item.requests);
  const okSeries = daily.map((item) => item.ok);
  const errSeries = daily.map((item) => item.errors);
  const max = Math.max(1, ...totalSeries, ...okSeries, ...errSeries);
  const grid = [0, .25, .5, .75, 1].map((r) => {
    const y = height - padY - r * (height - padY * 2);
    return `<line x1="${padX}" y1="${y.toFixed(1)}" x2="${width - 10}" y2="${y.toFixed(1)}"></line>`;
  }).join("");
  const labels = daily.map((item, index) => {
    const step = (width - padX * 2) / Math.max(1, daily.length - 1);
    const x = padX + index * step;
    return `<text x="${x.toFixed(1)}" y="${height - 3}" text-anchor="middle">${esc(item.label)}</text>`;
  }).join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Router 7天活动折线图">
      <g class="chart-grid">${grid}</g>
      <g class="axis-labels"><text x="4" y="24">${num(max)}</text><text x="4" y="${height - padY}">0</text>${labels}</g>
      <polyline class="line total" points="${svgPoints(totalSeries, max, width, height, padX, padY)}"></polyline>
      <polyline class="line ok" points="${svgPoints(okSeries, max, width, height, padX, padY)}"></polyline>
      <polyline class="line err" points="${svgPoints(errSeries, max, width, height, padX, padY)}"></polyline>
    </svg>
  `;
}

function renderPageStatus(router) {
  const requests = Number(router?.totals?.requests || 0);
  const statuses = router?.totals?.statuses || {};
  const rows = [
    ["200 正常", statuses["200"] || 0, "真实页面/资源可访问", "good", "继续观察"],
    ["204 图标兜底", statuses["204"] || 0, "默认图标请求已兜底", "good", "不计入异常"],
    ["304 缓存命中", statuses["304"] || 0, "浏览器/边缘缓存", "good", "正常"],
    ["404 未找到", statuses["404"] || 0, "旧数据未记录路径", statuses["404"] ? "bad" : "", "等待新埋点"],
    ["405 方法不允许", statuses["405"] || 0, "多为非GET探测或上游拒绝的方法", statuses["405"] ? "warn" : "", "继续记录方法来源"],
    ["429 请求过多", statuses["429"] || 0, "限流/风控", statuses["429"] ? "warn" : "", statuses["429"] ? "需要降速" : "无"],
    ["522 超时", statuses["522"] || 0, "上游超时", statuses["522"] ? "bad" : "", statuses["522"] ? "查Pages/Worker" : "无"],
  ];
  els.pageStatus.innerHTML = rows.map(([label, count, note, tone, action]) => `
    <tr>
      <td class="${tone}">${esc(label)}</td>
      <td>${num(count)}</td>
      <td>${pct(count, requests)}</td>
      <td>${esc(note)}</td>
      <td>${esc(action)}</td>
    </tr>
  `).join("");
}

function renderActions(data) {
  els.actionList.innerHTML = (data.actionQueue || []).map((item) => `
    <div class="action-row">
      <span>${esc(item.title)}（${esc(item.owner)}）</span>
      <b>${item.level === "high" ? "高优先级" : "中优先级"}</b>
    </div>
  `).join("");
}

function filteredSites() {
  if (!state.data) return [];
  const batch = els.batchFilter.value;
  const brand = els.brandFilter.value;
  const status = els.statusFilter.value;
  const query = els.searchInput.value.trim().toLowerCase();
  return state.data.sites.filter((site) => {
    if (batch !== "all" && site.scope !== batch) return false;
    if (brand !== "all" && site.brand !== brand) return false;
    if (status !== "all" && site.health !== status) return false;
    return !query || `${site.domain} ${site.brand} ${site.pagesProject}`.toLowerCase().includes(query);
  });
}

function renderSiteTable() {
  const sites = filteredSites();
  const groups = [...groupBy(sites, "brand").entries()]
    .map(([brand, items]) => {
      const ok = items.filter((site) => site.health === "ok").length;
      const gsc = items.filter((site) => site.gsc === "complete").length;
      const sitemap = items.filter((site) => site.sitemapSubmitted || /已|submitted/.test(site.sitemapStatus || "")).length;
      const indexed = items.filter((site) => /提交|收录|已|signal/i.test(site.indexStatus || "")).length;
      return { brand, items, ok, gsc, sitemap, indexed };
    })
    .sort((a, b) => b.items.length - a.items.length || a.brand.localeCompare(b.brand))
    .slice(0, state.route === "overview" ? Number(state.settings.overviewRows || 8) : undefined);
  els.siteStatusTable.innerHTML = groups.map((group) => {
    const p1 = group.items.filter((site) => site.scope === "P1").length;
    const p2 = group.items.filter((site) => site.scope === "P2").length;
    const issue = group.items.length - group.ok;
    return `
      <tr>
        <td>${esc(group.brand)}</td>
        <td>${p1 && p2 ? "P1/P2" : p1 ? "P1" : "P2"}</td>
        <td>${num(group.items.length)}</td>
        <td class="good">${num(group.ok)}</td>
        <td>${num(group.ok)}</td>
        <td class="${issue ? "warn" : ""}">${num(issue)}</td>
        <td>0</td>
        <td>0</td>
        <td>${num(group.gsc)}/${num(group.items.length)}</td>
        <td>${num(group.sitemap)}/${num(group.items.length)}</td>
        <td>${num(group.indexed)}/${num(group.items.length)}</td>
        <td>${pct(group.ok, group.items.length)}</td>
      </tr>
    `;
  }).join("");
  const total = sites.length;
  const ok = sites.filter((site) => site.health === "ok").length;
  const gsc = sites.filter((site) => site.gsc === "complete").length;
  const sitemap = sites.filter((site) => site.sitemapSubmitted || /已|submitted/.test(site.sitemapStatus || "")).length;
  const indexed = sites.filter((site) => /提交|收录|已|signal/i.test(site.indexStatus || "")).length;
  els.siteStatusTotal.innerHTML = `<tr><td colspan="2">合计</td><td>${num(total)}</td><td>${num(ok)}</td><td>${num(ok)}</td><td>${num(total - ok)}</td><td>0</td><td>0</td><td>${num(gsc)}/${num(total)}</td><td>${num(sitemap)}/${num(total)}</td><td>${num(indexed)}/${num(total)}</td><td>${pct(ok, total)}</td></tr>`;
}

function restartAutoRefresh() {
  if (state.autoTimer) clearInterval(state.autoTimer);
  state.autoTimer = null;
  const ms = Number(state.settings.refreshMs || 0);
  els.autoRefresh.checked = ms > 0;
  if (ms > 0) state.autoTimer = setInterval(loadData, ms);
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportSitesCsv() {
  const headers = ["brand", "scope", "sites", "gsc", "sitemap", "coverage"];
  const rows = [...groupBy(state.data.sites, "brand").entries()].map(([brand, items]) => {
    const gsc = items.filter((site) => site.gsc === "complete").length;
    const sitemap = items.filter((site) => site.sitemapSubmitted || /已|submitted/.test(site.sitemapStatus || "")).length;
    return [brand, [...new Set(items.map((site) => site.scope))].join("/"), items.length, gsc, sitemap, pct(Math.min(gsc, sitemap), items.length)];
  });
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadText("seo-command-center-site-status.csv", csv, "text/csv");
}

function renderStatic(data) {
  renderFilters(data);
  renderOverview(data);
  renderProgress(data);
  renderKeywords(data);
  renderBrandAudit(data);
  renderTasks(data);
  renderApiStatus(data);
  renderSeoTraffic(data);
  renderActions(data);
  renderSiteTable();
  renderRouter(data.router || null);
}

async function loadData() {
  const response = await fetch(`./data/data.json?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`data/data.json ${response.status}`);
  state.data = await response.json();
  renderStatic(state.data);
  applyRoute();
}

function setupEvents() {
  [els.batchFilter, els.brandFilter, els.statusFilter, els.searchInput].forEach((input) => {
    input.addEventListener("input", renderSiteTable);
    input.addEventListener("change", renderSiteTable);
  });
  [els.seoSort, els.seoSearch].forEach((input) => {
    input?.addEventListener("input", () => renderSeoTraffic(state.data));
    input?.addEventListener("change", () => renderSeoTraffic(state.data));
  });
  els.refreshBtn.addEventListener("click", loadData);
  els.refreshBottom.addEventListener("click", () => { location.hash = "#reports"; });
  els.autoRefresh.addEventListener("change", () => {
    saveSettings({ refreshMs: els.autoRefresh.checked ? AUTO_REFRESH_MS : 0 });
    restartAutoRefresh();
  });
  restartAutoRefresh();
  els.localSettingsList.addEventListener("change", (event) => {
    if (event.target.id === "setting-refresh") {
      saveSettings({ refreshMs: Number(event.target.value) });
      restartAutoRefresh();
    }
    if (event.target.id === "setting-default-route") saveSettings({ defaultRoute: event.target.value });
    if (event.target.id === "setting-issue-rate") saveSettings({ issueRateThreshold: Number(event.target.value) });
    if (event.target.id === "setting-overview-rows") {
      saveSettings({ overviewRows: Number(event.target.value) });
      renderKeywords(state.data);
      renderBrandAudit(state.data);
      renderSiteTable();
    }
  });
  els.localSettingsList.addEventListener("click", (event) => {
    if (event.target.id === "export-json") downloadText("seo-command-center-data.json", JSON.stringify(state.data, null, 2), "application/json");
    if (event.target.id === "export-csv") exportSitesCsv();
    if (event.target.id === "reset-settings") {
      localStorage.removeItem(SETTINGS_KEY);
      state.settings = loadSettings();
      renderSettingsControls();
      restartAutoRefresh();
      renderStatic(state.data);
      applyRoute();
    }
  });
  document.querySelectorAll(".side-nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const route = link.getAttribute("href")?.replace("#", "") || "overview";
      if (ROUTES[route]) {
        event.preventDefault();
        if (window.location.hash !== `#${route}`) window.location.hash = route;
        else applyRoute(route);
      }
    });
  });
  window.addEventListener("hashchange", () => applyRoute());
}

setupEvents();
loadData().catch((error) => {
  console.error(error);
  els.lastRefresh.textContent = "驾驶室数据加载失败";
});
