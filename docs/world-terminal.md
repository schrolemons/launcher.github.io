# 世界终端：配置与维护

## 使用现有的一个数据库

保留当前 Dense 索引，嵌入模型和服务通过环境变量接入。**无需创建第二个数据库，无需升级套餐。** `launcher-v2` 是这个库里面的 namespace（分区），三类内容共享它，使用 `category` 元数据筛选。ARK 与 WORLD 是同一世界档案的不同呈现入口，不是第四个内容分类。原默认分区的 598 条记录不会被脚本删除；容量预检会把它们算进去。

重要：数据库存储的 Free 套餐不等同于外部嵌入服务免费。默认 `upstash-data` 模式直接使用索引创建时配置的托管嵌入能力，不需要在 GitHub Actions 中填写模型变量。只有索引没有托管嵌入能力时，才改用 `external` 模式，把文本发送到你配置的兼容嵌入端点；模型名、端点、密钥和维度都由环境变量决定。不要把 `query({data})` 用在未配置托管嵌入的 Dense 索引上。

若更换嵌入模型或端点，必须重新嵌入整套文章；不同模型的向量不能混用。脚本会把嵌入身份写进 metadata 和记录 ID，在同一个 namespace 内生成新版本，并在新向量完成后清理旧版本。本次代码不会自动重建数据库，也不会自动切换套餐。

参考：[Upstash 内置嵌入](https://upstash.com/docs/vector/features/embeddingmodels)、[Upstash Vector 定价](https://upstash.com/pricing/vector)。

## 放置文章与元数据

| 文件夹 | 内容分类 |
| --- | --- |
| `src/content/posts/**` | WORLD：文明体系（兼容现有文章） |
| `src/content/world/**` | WORLD：文明体系 |
| `src/content/blog/**` | BLOG：经验分享与技术博客 |
| `src/content/zero/**` | ZERO：核心内容与关键信息 |

递归读取 `.md` 和 `.mdx`，忽略隐藏文件、符号链接，以及 `draft: true`、`private: true`、`published: false` 的文章。不要同时在 posts 和 world 放同一篇的副本；直接移动后，下次成功同步会清理旧路径对应片段。缺少标题时使用文件名。

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

只读取 frontmatter 的 `url` 字段。只要提供合法的 HTTPS `url`，就原样写入每个分片的 `metadata.url`，回答来源和文章按钮都跳转到这个地址；没有提供或 URL 不安全时，统一回退到 `https://launcher.sch-nie.com/`，来源按钮标明“终端入口（未提供文章直链）”。文章类型标签直接保留 Markdown 的 `categories` 数组；`category` 仍只表示 BLOG / WORLD / ZERO 三个内容性质分区。

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

`summary` 是原简介或原文开头摘录，不是模型生成摘要。检索使用 category/schema/mode 过滤；标题、词条、别名的字面命中可微调排序；同一词条被拆开时用 previousId/nextId 补取相邻片段；最多返回 6 个来源、同篇最多 3 片、正文合计不超过 6000 字符。作者、更新日期、内容分类、摘要和正文提供给模型，来源在前端可展开。相关度阈值 0.45 是待真实问题评估的起点，不是“准确率 45%”。

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

输入角色和模式为白名单，禁止客户端自定义 system。明确危害操作先用轻量规则拦截，再由系统提示词约束模型。此组合**不等于全面语义审核**，不能保证识别所有绕写、隐语或模型输出；开放访问若遭到持续滥用，应再启用平台的机器人防护/人工验证。Origin 校验不是身份认证；普通爬虫不会因浏览消耗模型额度，恶意主动 POST 则由服务端预算兜底。

## 推荐问题和界面

`predev/prebuild` 从文章标题离线生成 `src/launcher/generated/chat-suggestions.json`，不请求任何模型；前端每 8.5 秒轮播，减少动态效果偏好下不轮播。点击推荐仅填入输入框，主动发送才请求接口。打开页面/聊天层不调用 API。

桌面入口位于顶部；手机入口位于项目卡片前。对话使用原生模态框、背景模糊、键盘焦点约束、Escape 关闭、来源展开、失败重试和停止生成。顶部状态栏显示当前对话占最大上下文窗口的百分比，具体来源数量保留在回答下方的折叠区。聊天打开期间暂停桌面媒体，关闭后恢复此前状态。切换内容分类或模式会开启新对话。聊天仅保存在组件内存，刷新清除，不写浏览器永久存储。
