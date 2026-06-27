# SEO总控指挥中心

这是 B9 Pakistan 五站 SEO 的总控台模板，结构按参考控制台重做，后续可扩展到上千个 SEO 资产。

## 本地打开

访问本地服务：

`http://127.0.0.1:8788/`

或直接打开：

`outputs/b9-traffic-cockpit/index.html`

## 数据刷新

运行：

`powershell -ExecutionPolicy Bypass -File tools/refresh-b9-traffic-cockpit.ps1`

刷新后会更新：

`outputs/b9-traffic-cockpit/data/cockpit-data.json`

## 当前模块

- 概览总览
- 网站管理
- SEO任务
- GSC资源
- Sitemap提交
- 收录监控
- 关键词分组
- SEO流量
- 竞品拆解
- 品牌隔离
- 内容与页面
- 爬虫监控
- 报表中心
- 任务工作流
- 设置中心

## 扩展方式

新增站点时，把每个站写入 `sites[]`，至少包含：

- `domain`
- `brand`
- `batch`
- `role`
- `positioning`
- `health`
- `risk`
- `gsc`
- `keywordFocus`

前端会自动按品牌、批次、状态、关键词进行筛选和汇总。

## 小伙伴站点对接

对接标准文件在：

`outputs/b9-traffic-cockpit/integration/`

推荐流程：

1. 单个站：每个站根目录放 `seo-manifest.json`。
2. 批量站：按 `bulk-sites-template.csv` 填写。
3. 上千/上万站：走 API + 数据库，不让前端一次加载全部明细。
4. 自动采集：运行 `tools/collect-seo-manifests.ps1`。
5. 合并总控：运行 `tools/refresh-b9-traffic-cockpit.ps1`。
6. 一键自动：运行 `tools/run-b9-cockpit-auto-refresh.ps1`。

核心文档：

- `INTEGRATION.md`
- `FIELD_DICTIONARY.md`
- `site-manifest-template.json`
- `bulk-sites-template.csv`
- `api-payload-example.json`
