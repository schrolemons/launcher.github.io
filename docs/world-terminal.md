# 世界终端：配置与维护

## 使用现有的一个数据库

保留当前 Dense 索引，嵌入模型和服务通过环境变量接入。**无需创建第二个数据库，无需升级套餐。** `launcher-v2` 是这个库里面的 namespace（分区），三类内容共享它，使用 `category` 元数据筛选。ARK 与 WORLD 是同一世界档案的不同呈现入口，不是第四个内容分类。原默认分区的 598 条记录不会被脚本删除；容量预检会把它们算进去。

重要：数据库存储的 Free 套餐不等同于外部嵌入服务免费。默认 `upstash-data` 模式直接使用索引创建时配置的托管嵌入能力，不需要在 GitHub Actions 中填写模型变量。只有索引没有托管嵌入能力时，才改用 `external` 模式，把文本发送到你配置的兼容嵌入端点；模型名、端点、密钥和维度都由环境变量决定。不要把 `query({data})` 用在未配置托管嵌入的 Dense 索引上。

若更换嵌入模型或端点，必须重新嵌入整套文章；不同模型的向量不能混用。脚本会把嵌入身份写进 metadata 和记录 ID，在同一个 namespace 内生成新版本，并在新向量完成后清理旧版本。本次代码不会自动重建数据库，也不会自动切换套餐。

参考：[Upstash 内置嵌入](https://upstash.com/docs/vector/features/embeddingmodels)、[Upstash Vector 定价](https://upstash.com/pricing/vector)。

## 放置文章与元数据

当前以三站源码只读采集为准，不需要手动搬文章。使用 `npm run content:refresh` 从 BLOG/WORLD/ZERO 生成 launcher 自己的副本，并在构建/向量同步前自动刷新。网站与原始路径记录在 `generated/source-manifest.json`；只有 launcher 副本增加统计头字段，源仓库文件不变。推送通知、字数口径、overview 和首次启用步骤见 [三站内容流水线](content-pipeline.md)。下表表示采集缓存中的内容分类默认值，而非要求手工维护副本。

| 文件夹 | 内容分类 |
| --- | --- |
| `src/content/posts/**` | WORLD：文明体系（兼容现有文章） |
| `src/content/world/**` | WORLD：文明体系 |
| `src/content/blog/**` | BLOG：经验分享与技术博客 |
| `src/content/zero/**` | ZERO：核心内容与关键信息 |

递归读取任意层级的 `.md` 和 `.mdx`。可以把原来的整棵文章目录直接放进去，例如 `src/content/blog/_posts/Hexo/教程.md` 或 `src/content/world/core/create/设定.md`，不需要把 Markdown 逐个提到分类目录顶层。内部文件夹只负责整理文件，文章分类始终取 `src/content` 下的第一层目录；相对路径会保留在元数据和记录 ID 中，避免不同子目录的同名文件互相覆盖。隐藏文件、符号链接，以及 `draft: true`、`private: true`、`published: false` 的文章会被忽略。不要同时在 posts 和 world 放同一篇的副本；直接移动后，下次成功同步会清理旧路径对应片段。缺少标题时使用文件名。

支持的 frontmatter 示例（URL 请填写实际文章直链）：

```yaml
title: 终末阵列
author: schrolemons
date: 2026-08-01
updated: 2026-08-25
categories: [终末文明, 基础]
tags: [文明, 机械造物]
aliases: [终末系统]
category: world # 可按内容性质覆盖文件夹默认分类：blog / world / zero
description: 这里填写原文已有的简介。
# url: https://world.sch-nie.com/实际文章路径
```

通常只读取 frontmatter 的 `url` 字段。只要提供合法的 HTTPS `url`，就原样写入每个分片的 `metadata.url`，回答来源和文章按钮都跳转到这个地址；没有提供或 URL 不安全时，统一回退到 `https://launcher.sch-nie.com/`，来源按钮标明“终端入口（未提供文章直链）”。文章类型标签直接保留 Markdown 的 `categories` 数组；`category` 仍只表示 BLOG / WORLD / ZERO 三个内容性质分区。

六项固定归属使用 [content-classification.js](../lib/content-classification.js) 统一判断：金泽范式、火神契约、光引流辰、人生观、世界观、自然观属于 ZERO。它们的旧 WORLD 跳转文件和《木缘桑庭》中的对应介绍分片都会规范为 ZERO 标题与 ZERO 链接；《木缘桑庭》本体及其中其他条目仍按各自分类处理。

切分方法：优先按 Markdown 的 1–6 级标题建立章节，保留标题路径；章节内按段落聚合，超长段落优先在句尾分割，单个超长单元再按长度兜底。短词条保留，代码围栏里的 `#` 不当成标题。每个嵌入文本带内容分类、文章标题、章节、分类/标签/别名；不是仅嵌入孤立正文。单条不超过 1500 字符。Hexo 标签壳、HTML 注释和脚本被清除，正文保留。

Metadata 保存以下实际信息，并有长度上限：

| 用途 | 字段 |
| --- | --- |
| 身份与版本 | `schema`, `pipelineVersion`, `retrievalMode`, `category`, `categoryName`, `articleId`, `source` |
| 来源 | `title`, `slug`, `abbrlink`, `url`, `urlKind`, `author`, `publishedAt`, `updatedAt`（日期规范为 ISO） |
| 语义与主题 | `categories`, `tags`, `aliases`, `description`, `language`, `format` |
| 章节结构 | `headingPath`, `section`, `entry`, `sectionIndex`, `sectionCount`, `relatedSections` |
| 可恢复上下文 | `text`, `summary`, `summaryMethod`, `chunkIndex`, `chunkCount`, `previousId`, `nextId` |
| 校验与规模 | `articleHash`, `contentHash`, `hash`, `articleCharacters`, `sectionCharacters`, `characterCount` |

`summary` 是原简介或原文开头摘录，不是模型生成摘要。检索使用 category/site/schema/mode 过滤；标题、词条、别名的字面命中可微调排序；同一词条被拆开时用 previousId/nextId 补取相邻片段；畅聊/讲解/考据模式分别最多返回 4/6/10 个来源、同篇最多 3 片、正文合计不超过 6000 字符。作者、更新日期、网站与完整原路径、内容分类、摘要和正文提供给模型，来源在前端可展开。相关度代码默认值为 0.35，`.env.example` 示例为 0.45，可通过 CHAT_MIN_SCORE 配置；这些是检索阈值，不是准确率。

## 设置环境变量

把 `.env.example` 中的变量填入 Vercel 项目设置的 Environment Variables。令牌只存服务端。GitHub 仓库 Settings → Secrets and variables → Actions：

- Secrets：`UPSTASH_VECTOR_REST_URL`、`UPSTASH_VECTOR_REST_TOKEN`（同步需读写令牌）。
- Variables：默认 `VECTOR_EMBEDDING_MODE=upstash-data`，不需要模型变量。若改用 `external`，再填写 `VECTOR_EMBEDDING_MODEL`（你选择的模型标识）、`VECTOR_EMBEDDING_DIMENSION`（现有 Dense 维度）和 `VECTOR_EMBEDDING_URL`（兼容端点）。
- Secrets：`VECTOR_EMBEDDING_API_KEY`（若端点需要）；旧的 `OPENAI_API_KEY` 仍可作为兼容回退。Vercel 同时需要 `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN`、`DEEPSEEK_API_KEY`。
- API 的 `UPSTASH_VECTOR_NAMESPACE` 必须与 workflow 的 `launcher-v2` 相同。API 可使用只读 Vector token。
- `CHAT_ALLOWED_ORIGINS` 填实际 launcher 的完整来源地址，以逗号分隔；默认已包含 `launcher.sch-nie.com`、sch-nie、ark、blog、world、zero 域名，预览域名需要明确加入。

`astro dev` / 静态预览只运行页面，不托管根目录的 Vercel `/api/chat`。本地看到“暂时无法连接”并不表示线上接口已验证。要联调真实接口，请在已配置环境变量的 Vercel 环境或 Vercel 本地开发环境测试。GitHub Pages 等纯静态托管不能独立运行此接口。

## 同步与用量

先运行无凭据、无网络的预检：`pnpm sync:vector:check`。报告写入 `.reports/vector-sync.json`，含 metadata 示例。正式同步命令是 `pnpm sync:vector`，会消耗数据库更新及其自动嵌入服务的额度；请确认控制台配置后再执行。

工作流监听三类内容目录、兼容 posts、同步代码及依赖锁文件；在 main 推送时运行，也可手动运行。同一仓库的同步串行执行。默认 `upstash-data` 模式直接上传原文；若切换为 `external`，则按 64 条分批调用配置端点后上传。上传成功且待嵌入数为 0 后才删除本分区旧片段。远端仍在处理时保留旧片段，下次重跑收尾；失败可重跑。不要同时从本地和 CI 运行同步。

根据用户截图设置上限：98,000 条记录、700 MB 估算存储、单次同步 14,000 次保守估算操作、35 GB 估算新增传输量。这些是 70% 保护阈值，**不是目标填充量**。检查当前全库占用与新增记录峰值；储存估算含向量、正文、元数据和余量。报告的存储/带宽是估算，不能替代 Dashboard；同步操作预算是单次运行上限，不是账户累计用量监控。其他应用和多次同步共享的日/月额度仍以控制台为准。免费套餐是否阻止超额收费也以账号实际设置为准。

按文章内容哈希和路径生成稳定 ID：没变的文章不重新上传；变动文章重新分片并在安全阶段清理旧版本；无需每次全量重嵌入。Windows 与 Linux 的换行及日期均规范化，避免在 CI 中重复上传。

对话默认保护：每次提问 1200 字符、历史最多 9 条且总计 6000 字符、输出最多 1200 tokens；每 IP 6 次/分钟、60 次/日；全站每日最多 300 次，另受 300 万保守预留 tokens 上限约束（通常更早触发）。预留按 UTF-8 字节上界估计，失败和取消不返还；不是实际账单或精确 token 统计。通过 `CHAT_DAILY_REQUESTS`、`CHAT_DAILY_TOKEN_BUDGET` 可降低预算。限流超时、Redis/Vector 故障、配置缺失时停止转发。请求总时限 25 秒，关闭或停止对话会取消生成。

输入角色和模式为白名单，禁止客户端自定义 system。输入校验不再用敏感词正则拒绝内容；原规则会把“如何识别勒索软件”“怎么防止别人盗取密码”等防御性问题，以及历史中的类似提问一并拦截。内容判断改由模型结合上下文完成，系统提示词明确允许文学、学术、历史、新闻和防御性讨论，仍限制实质帮助实施现实伤害等内容。模型判断**不等于全面语义审核**，也不能保证上游服务完全不误拒；开放访问若遭到持续滥用，应再启用平台的机器人防护/人工验证。Origin 校验不是身份认证；普通爬虫不会因浏览消耗模型额度，恶意主动 POST 则由服务端预算兜底。

### 区分内容拒答和访问拦截

| 层级 | 当前策略 | 如何辨认 |
| --- | --- | --- |
| 内容判断 | 无本站关键词硬拦截；模型按上下文判断，可回答安全部分 | 正常生成的回答中出现拒绝语句；可能来自提示词或上游模型 |
| 输入校验 | JSON、角色顺序、分类/模式、长度、请求 UUID 和模型设置校验 | HTTP 400，`INPUT_INVALID`，提示具体字段问题 |
| 来源与代理 | 限制请求 Origin，自定义模型端点只接受默认或明确配置的 HTTPS 主机 | `ORIGIN_REJECTED`，或输入校验提示模型主机不被允许 |
| 真人验证 | 配置 `TURNSTILE_SECRET_KEY` 后验证令牌、`chat` 动作与主机名 | `TURNSTILE_REQUIRED` / `TURNSTILE_REJECTED`，或前端“安全验证”阶段报错 |
| 频率与预算 | IP 及配置后签名会话均限制 6 次/分钟、60 次/日；全站预算见上文 | HTTP 429，说明次数上限或今日预算耗尽 |
| 去重与并发 | 同一请求 ID 在 120 秒内不能重放；同一 IP 同时只允许一个回答流，锁最长 40 秒 | `REQUEST_REPLAYED` / `CHAT_CONCURRENT` |
| 依赖与时限 | Redis、向量检索失败时停止转发；服务端请求总时限 25 秒 | HTTP 503 / 流错误，按 `phase` 和 `requestId` 排查 |

上述数值是代码默认值，生产部署的环境变量、平台防护和上游模型规则需另行核对。本站没有独立的输出审核服务；不能把模型中的拒答语句直接认定为本站 HTTP 拦截。全站字数等问题缺少统计数据时，应说明能力缺口，不应以“安全策略”拒绝。

### 2026-10-17 线上配置核查

通过已登录的 Vercel CLI 核实项目 `launcher` 对应 `launcher.sch-nie.com`。以下为检查时的配置快照，之后应重新读取，不能当作永久配置：

- Vercel Firewall 已开启；Attack Challenge Mode 关闭；没有自定义 IP 封禁。
- Bot Protection 开启但动作为 `log`，只记录；AI Bots 和 OWASP 管理规则集未启用。
- 唯一自定义规则 `Protect Chat API`：精确匹配路径 `/api/chat`，按 IP 固定窗口限流，60 秒最多 10 次；没有限制 HTTP 方法，因此不能等同于 10 次成功对话。未发现待发布草稿。
- 生产环境存在 `PUBLIC_TURNSTILE_SITE_KEY`、`TURNSTILE_SECRET_KEY` 和 `CHAT_SESSION_SECRET`；在线前端包含 Turnstile 运行代码与公开站点密钥。一次不携带令牌的普通 POST 返回 `403 TURNSTILE_REQUIRED`，证明应用真人验证正在生效；该测试没有调用模型，不能证明真实浏览器验证成功或失败。
- 当前 DNS 的 CNAME 指向 Vercel，抽查页面与接口响应均为 Vercel；这不能代替读取 Cloudflare 账户里的 WAF/Turnstile 配置。
- 当前套餐无法通过 Firewall overview 读取流量与告警明细；Cloudflare 控制台浏览器连接不可用，因此尚未核实其允许域名、控件模式或某次用户请求的拦截原因。此次核查没有修改线上防火墙、环境变量或部署。

放宽时先定位返回层：Vercel 平台限流与应用每 IP 6 次/分钟是两套限制，只提高平台 10 次/分钟的阈值不能解除应用限制；`TURNSTILE_REQUIRED` / `TURNSTILE_REJECTED` 则需要检查验证流程和域名配置。Cloudflare 官方说明见 [域名管理](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/) 和 [客户端错误码](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/)。

## 推荐问题和界面

`predev/prebuild` 先刷新内容缓存和根目录 overview，再从文章标题离线生成 `src/launcher/generated/chat-suggestions.json`，不请求任何模型。点击推荐仅填入输入框，主动发送才请求接口。打开页面/聊天层不调用 API。

桌面入口位于顶部；手机入口位于项目卡片前。对话使用原生模态框、背景模糊、键盘焦点约束、Escape 关闭、来源展开、失败重试和停止生成。顶部状态栏显示当前对话占最大上下文窗口的百分比，具体来源数量保留在回答下方的折叠区。聊天打开期间暂停桌面媒体，关闭后恢复此前状态。切换内容分类或模式会开启新对话。聊天仅保存在组件内存，刷新清除，不写浏览器永久存储。
