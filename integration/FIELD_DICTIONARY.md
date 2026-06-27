# 总后台字段字典

## 站点身份

| 字段 | 必填 | 说明 |
|---|---:|---|
| domain | 是 | 域名，不带协议，例如 example.com |
| brand | 是 | 品牌组，例如 B9 Pakistan |
| market | 是 | 目标国家/市场，例如 Pakistan |
| language | 是 | 页面语言，例如 en-PK |
| batch | 是 | 批次，例如 P1 或 2026-06-26-A |
| owner | 是 | 负责人 |
| repoUrl | 建议 | GitHub 仓库 |
| deployUrl | 是 | 线上地址 |
| siteType | 是 | authority / download / apk / payment / support / blog |
| positioning | 是 | 站点定位 |
| status | 是 | active / paused / blocked / needs-info |

## SEO关键词

| 字段 | 必填 | 说明 |
|---|---:|---|
| primaryKeywords | 是 | 主关键词，多个用数组或 `|` 分隔 |
| secondaryKeywords | 是 | 长尾词，多个用数组或 `|` 分隔 |
| competitors | 是 | 竞品 URL 列表 |

## 技术SEO

| 字段 | 必填 | 说明 |
|---|---:|---|
| registerTarget | 是 | 首页和核心 CTA 跳转链接 |
| sitemapUrl | 是 | sitemap.xml |
| robotsUrl | 是 | robots.txt |
| feedUrl | 建议 | feed.xml |
| canonicalRoot | 建议 | 首选域名 |
| hasH5Responsive | 是 | 是否移动端自适应 |
| hasRegisterCta | 是 | 是否有注册按钮 |
| hasLoginLink | 是 | 是否出现登录链接 |
| hasLotteryDirection | 是 | 是否出现彩票方向 |

## GSC和排名

| 字段 | 必填 | 说明 |
|---|---:|---|
| gscProperty | 建议 | GSC 属性，例如 sc-domain:example.com |
| gscConnected | 是 | 是否已验证权限 |
| clicks | 自动 | GSC 点击 |
| impressions | 自动 | GSC 展现 |
| ctr | 自动 | CTR |
| averageRank | 自动 | 平均排名 |
| queries | 自动 | 主要查询词 |

## 内容计划

| 字段 | 必填 | 说明 |
|---|---:|---|
| homepageAngle | 建议 | 首页定位角度 |
| clusters | 建议 | 内容栏目，如 download、apk、payment |
| weeklyUpdateTarget | 建议 | 每周更新篇数 |
