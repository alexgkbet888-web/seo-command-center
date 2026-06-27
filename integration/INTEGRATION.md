# SEO总控指挥中心 - 多团队站点对接标准

目标：其他小伙伴制作的站点，不再手工一个个录入，而是统一交付标准数据，总后台自动采集、合并、监控。

## 推荐对接方式

### 方式 1：单站 Manifest

适合每个站由不同小伙伴维护。

每个站点根目录放一个文件：

`/seo-manifest.json`

上线后总控台采集：

`https://example.com/seo-manifest.json`

优点：每个站自己带身份信息、关键词、站点定位，适合长期维护。

### 方式 2：批量 CSV

适合一天批量交付几十到几百个站。

小伙伴按模板填写：

`bulk-sites-template.csv`

然后放到：

`outputs/b9-traffic-cockpit/integration/incoming/`

总控刷新脚本批量导入。

### 方式 3：API / 数据库

适合 1000 到 10000+ 站。

架构：

站点/团队 -> API Collector -> Database -> Aggregation Jobs -> Dashboard

推荐数据层：

- Cloudflare D1 / Supabase / PostgreSQL：存站点、关键词、任务、GSC、排名、巡检结果。
- Cloudflare Workers / Vercel Functions：接收站点上报和跑轻量 API。
- GitHub Actions / Windows 定时任务：每天跑竞品、GSC、索引、技术巡检。

上万站不建议前端一次加载全部明细。总控台默认只加载汇总和分页数据。

## 必填字段

- `domain`：域名，不带 http。
- `brand`：品牌组，例如 B9 Pakistan。
- `market`：目标市场，例如 Pakistan。
- `language`：内容语言，例如 en-PK。
- `batch`：批次，例如 P1、P2、2026-06-26-A。
- `owner`：负责人。
- `repoUrl`：代码仓库。
- `siteType`：站点类型，例如 authority、download、apk、payment、support、blog。
- `positioning`：站点定位。
- `registerTarget`：注册链接。
- `primaryKeywords`：主关键词。
- `secondaryKeywords`：长尾词。
- `competitors`：竞品 URL。
- `sitemapUrl`：sitemap 地址。
- `robotsUrl`：robots 地址。
- `status`：active、paused、blocked。

## 总控台每日自动检查

每个站接入后，总控应自动检查：

- HTTP 200 / 301 / 404 / 5xx。
- H5 自适应基础检查。
- Register Now CTA 是否存在，是否指向正确链接。
- 是否误出现 login、lottery 等风险方向。
- title、description、H1、canonical、schema。
- robots.txt、sitemap.xml、feed.xml。
- GSC：点击、展现、CTR、平均排名、查询词、页面。
- 排名：Google 查询词排名页数和位置，不能编造。
- 内容更新：最近更新时间、文章数量、重复度、内链入口。
- 竞品差距：标题、页面类型、内容深度、FAQ、速度、外链/曝光。

## 万站级数据分层

不要把所有数据都塞到一个前端 JSON。

推荐分三层：

1. `summary.json`：总览 KPI，所有站聚合。
2. `sites-page-N.json`：站点列表分页，每页 200 到 500 个。
3. `site-detail/{domain}.json`：单站详情、关键词、GSC、巡检记录。

这样 10000 个站也能打开快。

## 小伙伴交付规则

每个新站交付时必须提供：

- 域名
- 仓库地址
- 站点类型
- 目标市场
- 主关键词和长尾词
- 竞品 URL
- 注册按钮目标 URL
- 是否已部署
- 是否已加入 GSC
- sitemap 地址

缺少这些字段，总控可以先接入，但标记为 `blocked` 或 `needs-info`。

## 自动采集执行流程

### A. 采集来源登记

把每个新站的 manifest 地址写入：

`outputs/b9-traffic-cockpit/integration/manifest-sources.csv`

字段：

- `domain`
- `manifestUrl`
- `enabled`
- `owner`
- `batch`
- `brand`
- `note`

只有 `enabled=true` 的站会被自动抓取。

### B. 批量 CSV 导入

把小伙伴交付的批量表放到：

`outputs/b9-traffic-cockpit/integration/incoming/`

文件格式参考：

`bulk-sites-template.csv`

### C. 执行采集

运行：

`powershell -ExecutionPolicy Bypass -File tools/collect-seo-manifests.ps1`

输出：

- `integration/collected/manifests.json`
- `integration/collected/site-profiles.json`
- `integration/collected/collect-report.json`

### D. 合并进总控

运行：

`powershell -ExecutionPolicy Bypass -File tools/refresh-b9-traffic-cockpit.ps1`

刷新后总控读取：

`outputs/b9-traffic-cockpit/data/cockpit-data.json`

### 一键自动采集并刷新

推荐每天定时任务直接运行：

`powershell -ExecutionPolicy Bypass -File tools/run-b9-cockpit-auto-refresh.ps1`

这个脚本会自动执行：

1. `collect-seo-manifests.ps1`
2. `refresh-b9-traffic-cockpit.ps1`
3. JSON 输出校验

### E. 每天自动任务建议

建议每日顺序：

1. 09:00 `collect-seo-manifests.ps1`
2. 09:10 技术巡检 HTTP / CTA / sitemap / robots
3. 10:30 GSC 和排名数据合并
4. 12:00 内容更新计划生成
5. 18:30 `refresh-b9-traffic-cockpit.ps1` 生成总控数据
