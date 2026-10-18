---
layout: pages
title: GitHub Webhook 驱动多站点 RAG 知识库自动更新
abbrlink: webhook-rag-sync
author: 站点维护者
date: 2026-10-17 01:52:00
updated: 2026-10-17 01:52:00
categories:
  - 网站设计
tags:
  - GitHub Webhook
  - GitHub Actions
  - RAG
  - Vercel
  - 接口安全
description: 使用 GitHub Webhook、Vercel 接收接口和 repository_dispatch，实现多站点 Markdown 的只读采集、统计总览与 RAG 向量库自动更新。
content_stats:
  schema: 1
  word_count: 3864
  han_characters: 3535
  non_han_words: 329
  character_count: 5884
  content_hash: b77aa0e5b0267fe619ab9f4a4cd82fd3306897c3eb9fea901cc7a07f933a23bc
---

多个网站分别维护 Markdown 时，可以通过 GitHub Webhook 将内容变更通知给知识库项目，再由 GitHub Actions 完成采集、统计和向量同步。源仓库保留原有目录与头字段，知识库项目统一维护生成物。

本文使用虚构的 `example-owner`、`site-a`、`site-b`、`site-c`、`knowledge-hub` 和 `https://knowledge.example.com` 演示配置。仓库名、域名和目录均为示例，不含真实账号、地址、密钥、部署标识或本机路径。

<!--more-->

{% note primary flat %}
## 一、系统架构与职责
{% endnote %}

```text
三个源站仓库：source 分支发生 push
    ↓ GitHub Webhook，发送带 HMAC 签名的 HTTP POST
Vercel：POST /api/content-update
    ↓ 验签 → 仓库与分支白名单 → Redis 去重
GitHub API：向 knowledge-hub 创建 repository_dispatch
    ↓
knowledge-hub 的 GitHub Actions
    ↓ 只读检出三个源站的 source 分支
    ↓ 导入 Markdown，保留网站与原始文件夹路径
    ↓ 在知识库副本中统计，生成 overview.md
    ↓ 同步向量，等待新嵌入就绪
    ↓ 清理旧向量，将生成物提交到 knowledge-hub
Vercel：部署新的知识库缓存与总览
```

Webhook 接口只接收通知和触发任务。文件采集、Markdown 解析、统计与向量更新全部放在 Actions 中执行，避免占用接收接口的短生命周期。

各组件的职责如下：

| 组件 | 职责 | 持久化的数据 |
| --- | --- | --- |
| 源站仓库 | 维护原始 Markdown | 作者正文、头字段、目录结构 |
| GitHub Webhook | 通知源仓库发生事件 | 配置与投递记录 |
| Vercel 接收接口 | 验证通知并调用 GitHub API | 不保存文章文件 |
| Redis | 保存短期去重标记 | 已验签正文的哈希与过期时间 |
| GitHub Actions | 只读采集、统计、向量同步 | 生成物与受控报告 |
| 知识库仓库 | 保存可部署的文章副本和总览 | 网站分区、路径、来源元数据 |

通俗地说，Webhook 是“更新通知”，接收接口负责验明通知身份，Actions 则负责实际搬运和整理内容。源仓库是文章的维护入口，知识库副本可以重新生成。

Cloudflare 可以承担域名、代理或边缘防护；本方案的通知由 GitHub 发送，接收代码运行在 Vercel，不要求额外部署 Cloudflare Worker。

{% note primary flat %}
## 二、明确仓库、分支与目录约定
{% endnote %}

先固定来源配置，避免接收接口根据任意请求参数读取未知仓库：

```js
export const SOURCE_SITES = [
  { id: 'site-a', repository: 'example-owner/site-a', branch: 'source' },
  { id: 'site-b', repository: 'example-owner/site-b', branch: 'source' },
  { id: 'site-c', repository: 'example-owner/site-c', branch: 'source' },
];

export const TARGET_REPOSITORY = 'example-owner/knowledge-hub';
```

示例约定源站的 Markdown 位于 `source/`，源码分支为 `source`；知识库的默认分支为 `main`。实际项目应以真正维护文章的分支为准，静态网页部署分支未必包含原始 Markdown。

采集结果保留网站和路径两层信息：

```text
源文件：site-b / source/_posts/tutorial/webhook.md
副本：knowledge-hub / src/content/site-b/source/_posts/tutorial/webhook.md
```

头字段中的作者信息不应被当成可信指令；文件夹路径用于表达栏目与层次，`site` 字段则用于来源筛选。两者需要独立保存。

{% note primary flat %}
## 三、权限与凭据配置
{% endnote %}

本方案有两种不同用途的凭据：

| 环境变量 | 用途 | 使用位置 |
| --- | --- | --- |
| `CONTENT_SYNC_GITHUB_TOKEN` | 调用目标仓库的 dispatch API | Vercel 服务端 |
| `CONTENT_SYNC_WEBHOOK_SECRET` | 计算和验证 Webhook 签名 | 源仓库 Webhook 设置、Vercel 服务端、本地管理脚本 |
| `UPSTASH_REDIS_REST_URL` | 连接去重存储 | Vercel 服务端 |
| `UPSTASH_REDIS_REST_TOKEN` | 访问去重存储 | Vercel 服务端 |

GitHub Token 是调用 GitHub API 的授权凭据；Webhook Secret 是双方共享的签名密钥。二者不能互相替代，也不应使用相同值。

{% note info flat %}
### 3.1 创建目标仓库专用 Token
{% endnote %}

在 GitHub 创建细粒度 Personal Access Token：

1. 仓库访问范围只选择 `example-owner/knowledge-hub`。
2. Repository permissions 中授予 **Contents: Read and write**。
3. 设置合适的有效期，并安排到期前轮换。
4. 将 Token 保存为 Vercel Production 的 `CONTENT_SYNC_GITHUB_TOKEN`。

GitHub 的 [repository dispatch API](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event) 要求细粒度 Token 具有目标仓库的 Contents 写权限。这个 Token 用于接收接口通知知识库，不需要获得源仓库的内容写权限。

注册源仓库 Webhook 时，操作者还需要相应的 Webhook 管理权限；这属于配置阶段的授权，与运行时 dispatch Token 分开管理。

{% note info flat %}
### 3.2 生成随机共享密钥
{% endnote %}

先在知识库项目的 `.gitignore` 中忽略本地密钥文件：

```gitignore
.env.local
```

将以下内容保存为 `scripts/create-webhook-secret.mjs`，再执行 `node scripts/create-webhook-secret.mjs`。示例使用 Node.js 22，生成 32 字节随机数据，以 64 个十六进制字符保存；不会打印密钥值，也不会覆盖已经存在的配置项。

```js
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';

const file = '.env.local';
const key = 'CONTENT_SYNC_WEBHOOK_SECRET';
const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';

if (/^\s*(?:export\s+)?CONTENT_SYNC_WEBHOOK_SECRET\s*=/m.test(previous)) {
  throw new Error('密钥配置项已存在，请按轮换流程处理');
}

const secret = randomBytes(32).toString('hex');
const separator = previous && !previous.endsWith('\n') ? '\n' : '';
fs.writeFileSync(file, `${previous}${separator}${key}=${secret}\n`, {
  mode: 0o600,
});
console.log('共享密钥已保存到 .env.local');
```

`0o600` 表达 POSIX 系统的文件权限意图；Windows 还应依靠账户目录的 ACL 保护文件。Git 忽略规则只防止正常提交，不等同于文件加密。

在本地编辑器中打开文件，将值填入 Vercel Production 的同名 Secret 变量。之后给各源仓库设置 Webhook 时，也使用这一共享密钥。使用相同密钥适合由同一主体管理的少量仓库；需要独立撤销某个来源时，可以为每个源仓库配置单独的密钥。

依据 [Vercel 环境变量说明](https://vercel.com/docs/environment-variables)，变量变更只应用于后续部署。保存变量后必须重新部署，旧部署不会自动获得新值。

{% note warning flat %}
运行时密钥仅放在服务端环境变量中。不要添加 `PUBLIC_` 前缀，不要写进文章、客户端脚本、提交记录或命令行参数，也不要把完整环境变量文件作为 CI Artifact 上传。
{% endnote %}

{% note primary flat %}
## 四、接收接口：原始正文验签与事件过滤
{% endnote %}

GitHub 使用共享密钥和请求原始正文计算 HMAC-SHA256，通过 `X-Hub-Signature-256` 请求头发送结果。接收端使用相同算法重新计算，并以常量时间比较结果。具体规则见 [GitHub Webhook 签名验证](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)。

签名针对实际传输的字节。**先读取原始请求流并验签，再解析 JSON。** 对解析后的对象执行 `JSON.stringify()`，可能改变空格、键顺序或编码形式，不能作为原始正文的替代品。

下面是 Vercel Node.js 风格的核心接收接口，使用 `@upstash/redis`。保存位置为知识库项目的 `api/content-update.js`；项目需要支持 ES Modules。

```js
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Redis } from '@upstash/redis';

const sourceRepos = new Map([
  ['example-owner/site-a', 'source'],
  ['example-owner/site-b', 'source'],
  ['example-owner/site-c', 'source'],
]);
const targetRepo = 'example-owner/knowledge-hub';
let redis;
const getRedis = () => (redis ||= Redis.fromEnv());

async function readRaw(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += Buffer.byteLength(chunk);
    if (bytes > 2 * 1024 * 1024) throw new Error('Payload too large');
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST required' });
  }

  const secret = process.env.CONTENT_SYNC_WEBHOOK_SECRET || '';
  const token = process.env.CONTENT_SYNC_GITHUB_TOKEN || '';
  if (secret.length < 32 || !token) {
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  let key = '';
  let reserved = false;
  try {
    const raw = await readRaw(req);
    const supplied = String(req.headers['x-hub-signature-256'] || '');
    const expected = 'sha256=' + createHmac('sha256', secret)
      .update(raw).digest('hex');

    if (!/^sha256=[a-f0-9]{64}$/.test(supplied) ||
        !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(raw.toString('utf8'));
    const repo = payload.repository?.full_name;
    const branch = sourceRepos.get(repo);
    if (!branch) return res.status(403).json({ error: 'Unknown source' });

    const event = req.headers['x-github-event'];
    if (event === 'ping') return res.status(200).json({ ok: true });
    if (event !== 'push' || payload.ref !== `refs/heads/${branch}` ||
        payload.deleted) {
      return res.status(202).json({ ignored: true });
    }

    key = 'content-sync:webhook:' + createHash('sha256')
      .update(raw).digest('hex');
    reserved = (await getRedis().set(key, 'pending', {
      nx: true,
      ex: 86400,
    })) === 'OK';
    if (!reserved) return res.status(202).json({ duplicate: true });

    const response = await fetch(
      `https://api.github.com/repos/${targetRepo}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'source-content-updated',
          client_payload: {
            repository: repo,
            commit: String(payload.after || '').slice(0, 64),
          },
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) throw new Error('Dispatch failed');
    return res.status(202).json({ accepted: true });
  } catch {
    if (reserved) await getRedis().del(key).catch(() => {});
    return res.status(502).json({ error: 'Scheduling failed' });
  }
}

export const config = { maxDuration: 10 };
```

这段代码要求部署平台保留可读取的原始请求流；若使用会自动消费请求体的中间件，应先调整接入方式，不能仅删除签名校验。实际验证必须包含 GitHub 发出的签名 `ping`。

仓库、源码分支、目标仓库都由服务端固定配置。通知中的提交号仅作为事件信息，示例工作流会读取各源站指定分支的最新版本，不会执行通知中提供的任意代码或检出任意仓库。

{% note primary flat %}
## 五、Redis 去重与失败处理
{% endnote %}

一次通知可能因为重复投递或人工重投而到达多次。去重键采用已经验签的原始正文 SHA-256，配合 Redis 的原子操作 `SET key pending NX EX 86400`：

1. 第一次请求成功占位，接收接口调用 dispatch API。
2. 相同正文再次到达，返回 `202 duplicate`，不再创建任务。
3. dispatch 失败时删除占位，返回错误，允许后续重投。
4. 占位保留 24 小时后过期，限制 Redis 的长期占用。

`X-GitHub-Delivery` 可用于排查投递，但它不属于 HMAC 覆盖的正文。仅把这个请求头作为去重依据，无法阻止持有同一份已签名正文的人通过修改请求头绕过去重。

这里的去重提供的是有效期内的重复抑制，不是严格的“恰好执行一次”。网络超时可能发生在 GitHub 已接收 dispatch 之后，因此同步任务本身也必须可重复运行。Actions 后续失败时，需要重跑工作流；接收接口返回 `202` 只表示调度请求被接收，不表示文章已经全部更新。

{% note primary flat %}
## 六、配置目标仓库的 GitHub Actions
{% endnote %}

知识库默认分支上需要存在监听文件，例如 `.github/workflows/sync-content.yml`。根据 [GitHub Actions 事件规则](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#repository_dispatch)，`repository_dispatch` 触发的工作流文件必须存在于默认分支，事件名也必须与接口发送的 `event_type` 一致。

下面展示任务连接方式。`content:refresh`、`sync:vector` 和 `generate-chat-suggestions.js` 表示知识库项目已经实现的采集、同步和推荐脚本；这份 YAML 不包含它们的具体实现。示例适用于三个公开源仓库；私有源仓库需要额外配置具备对应内容只读权限的凭据。

{% raw %}
```yaml
name: Refresh RAG Content

on:
  workflow_dispatch:
  repository_dispatch:
    types: [source-content-updated]

permissions:
  contents: write

concurrency:
  group: knowledge-content-sync
  cancel-in-progress: false

jobs:
  sync:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      CONTENT_SOURCES_DIR: ${{ github.workspace }}/.sources
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main

      - uses: actions/checkout@v4
        with:
          repository: example-owner/site-a
          ref: source
          path: .sources/site-a
          persist-credentials: false

      - uses: actions/checkout@v4
        with:
          repository: example-owner/site-b
          ref: source
          path: .sources/site-b
          persist-credentials: false

      - uses: actions/checkout@v4
        with:
          repository: example-owner/site-c
          ref: source
          path: .sources/site-c
          persist-credentials: false

      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm content:refresh
      - run: node scripts/generate-chat-suggestions.js
      - run: pnpm test
      - run: pnpm sync:vector:check

      - name: Sync vectors
        env:
          UPSTASH_VECTOR_REST_URL: ${{ secrets.UPSTASH_VECTOR_REST_URL }}
          UPSTASH_VECTOR_REST_TOKEN: ${{ secrets.UPSTASH_VECTOR_REST_TOKEN }}
          UPSTASH_VECTOR_NAMESPACE: knowledge-content
        run: pnpm sync:vector

      - name: Commit generated files
        run: |
          node -e "if(require('./.reports/vector-sync.json').pending)throw new Error('Vectors are not ready')"
          git config user.name 'github-actions[bot]'
          git config user.email 'automation@example.com'
          git add -- src/content generated/source-manifest.json overview.md src/launcher/generated/chat-suggestions.json
          if ! git diff --cached --quiet; then
            git commit -m 'chore: refresh generated content'
            git push origin HEAD:main
          fi
```
{% endraw %}

采集器需要将 `site-a`、`site-b`、`site-c` 映射到对应检出目录，并与来源元数据保持一致。`knowledge-content` 是示例 namespace；同步脚本的允许列表、在线查询和 CI 必须使用同一个专用分区，不能直接套用另一个项目的名称。

`contents: write` 用于知识库的生成物提交，不会让示例中的只读采集操作向源站提交文章。实际写入范围仍应限制为知识库的副本、来源清单、总览和必要的推荐数据，不使用 `git add .`。

`concurrency` 将本工作流串行执行，避免同时更新同一向量分区。若存在其他人工提交，推送可能因分支前进而失败；可在生产脚本中加入有限次数的 fetch、rebase 和重试，遇到冲突则停止，不能强推覆盖。GitHub 的并发组也不应被当作永久事件队列，因此每次任务应重建所有指定来源的当前状态，而不是只依赖单个通知的增量信息。

{% note primary flat %}
## 七、采集、统计与向量发布规则
{% endnote %}

源站只读采集应遵守以下规则：

- 只收集允许目录中的公开 `.md`、`.mdx`，排除草稿、私密、加密、未发布内容和依赖目录。
- 保留 `site`、原文件夹路径、来源仓库、分支、原文 URL 与内容哈希。
- 不改写源站文件；只在知识库副本中添加统计字段。
- 任一来源缺失或解析失败时中止，不把读取失败解释成“所有文章都已删除”。
- 只有确认目标路径位于知识库的生成目录内，才执行旧副本清理。

总览放在知识库根目录 `overview.md`，包含每篇公开文章的头字段、网站汇总和整体统计。将总览放在待向量化目录之外，可以避免统计和索引把总览自身再算一次。

向量更新按下列顺序执行：

```text
读取目标分区已有 ID
    ↓ 与期望记录比较
只上传缺失记录
    ↓
等待新的嵌入完成
    ↓ pending = false
删除不再使用的旧记录
    ↓
提交新的文章缓存和 overview
```

缓存未变化不能证明远端数据库已经同步成功，因此每次任务仍要核对远端 ID。无变化时保留已有向量，避免重复调用嵌入服务；新嵌入未就绪时保留旧记录，并让任务失败，供之后重跑。

“先新增、后删除”降低了更新过程中的内容缺失风险，但不构成数据库与 Git 部署之间的跨系统事务。要求严格版本切换的系统，可以增加版本化 namespace，并在完整发布后切换在线查询指向。

{% note primary flat %}
## 八、注册源仓库 Webhook
{% endnote %}

先把接收接口部署到正式域名，确认环境变量已经在新部署中生效，再到三个源仓库的 **Settings → Webhooks → Add webhook** 分别配置：

| 设置项 | 示例值 |
| --- | --- |
| Payload URL | `https://knowledge.example.com/api/content-update` |
| Content type | `application/json` |
| Secret | 前面生成的共享密钥 |
| SSL verification | 启用 |
| Events | 只订阅 `push` |
| Active | 启用 |

创建后，GitHub 会发送 `ping`。接收接口应在验签和来源白名单检查后返回 `200`，而不调用向量库或创建同步任务。

对于已实现批量管理脚本的项目，可以从被忽略的本地环境文件加载密钥：

```powershell
# 前提：脚本已经实现，并使用登录后的 gh 管理 Webhook。
# 不带 --apply 只检查配置；带 --apply 才创建或更新。
node --env-file=.env.local scripts/configure-source-webhooks.js
node --env-file=.env.local scripts/configure-source-webhooks.js --apply
```

管理脚本应按回调 URL 查找已有 Hook，再决定创建或更新，避免重复注册；调用 API 时把包含 Secret 的 JSON 经标准输入传入，不把密钥拼进命令行参数，也不输出完整 API 响应。

配置 Webhook 修改的是 GitHub 仓库设置，不需要向三个源仓库增加工作流文件或改写文章头字段。

如果域名经过 Cloudflare 或其他边缘网关，应确认该回调路径允许 GitHub 的服务端 POST，并检查限流或挑战规则。Webhook 无法完成供访客浏览器使用的 Turnstile 交互；该入口依靠服务端 HMAC、来源白名单和请求限制保护。调整规则时应限定回调路径，保留站点其他入口原有的保护措施。

{% note primary flat %}
## 九、分层验证与排错
{% endnote %}

验证时分别检查 HTTP 接口、任务调度和最终生成物：

| 检查项 | 预期结果 | 能证明的范围 |
| --- | --- | --- |
| GET 接收地址 | `405` | 路由存在并限制方法 |
| 无签名 POST | `401` | 不接受未认证正文 |
| GitHub 发出的签名 ping | `200` | 实际投递可达，双方密钥一致 |
| 白名单 source 分支签名 push | `202 accepted` | GitHub dispatch 请求成功 |
| 同一正文重复发送 | `202 duplicate` | 有效期内重复抑制生效 |
| 其他分支或删除分支事件 | `202 ignored` | 不执行无关同步 |
| Actions 工作流成功 | 各处理步骤成功 | 采集、统计和向量同步执行完毕 |
| 同步报告 | `pending=false` | 新嵌入已就绪 |
| 再次运行无变化的任务 | `additions=0` | 不重复上传相同记录 |
| 新缓存完成部署 | 正式页面与 API 可访问 | 最新生成物已进入服务版本 |

其中 `accepted`、`duplicate` 等响应体是本文接收接口的约定，不是 GitHub 对所有 Webhook 的统一定义。排错时可以在源仓库的 Recent deliveries 查看投递状态，并在目标仓库的 Actions 查看运行结果。

常见问题对应的检查位置如下：

- **返回 503**：检查 Production 的两个 `CONTENT_SYNC_*` 变量是否存在，以及当前部署是否在配置变量之后创建。
- **返回 401**：核对共享密钥、签名头及原始正文读取方式，检查中间件是否消费或改写了正文。
- **返回 403**：核对 `repository.full_name` 是否命中服务端来源白名单。
- **返回 502**：检查 Redis 可用性，以及 GitHub Token 的目标仓库范围、Contents 权限和有效期。
- **返回 accepted 却没有任务**：检查工作流文件是否在默认分支、`types` 是否匹配 `event_type`，以及 Actions 是否可运行。
- **任务成功但文章没更新**：检查是否推送到了采集分支、源文章是否被公开性规则过滤，以及生成缓存是否已提交并完成部署。

GitHub 不会自动重投失败的 Webhook，应通过 Recent deliveries 的重投功能或自己的重投机制补发，见 [GitHub 失败投递处理说明](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries)。日志优先记录阶段、状态码和计数，不打印 Secret、Token、Authorization 请求头或完整文章正文。

{% note primary flat %}
## 十、配置速查
{% endnote %}

| 顺序 | 操作 | 完成标志 |
| --- | --- | --- |
| 1 | 固定来源仓库、源码分支和目录映射 | 可以只读导入全部指定来源 |
| 2 | 创建目标仓库专用 Token | 仅授权目标仓库 Contents 读写 |
| 3 | 生成共享密钥并配置 Redis | 本地文件忽略提交，服务端变量齐全 |
| 4 | 部署接收接口与目标工作流 | 正式回调可达，默认分支存在工作流 |
| 5 | 给各源仓库注册 push Webhook | GitHub 签名 ping 返回 200 |
| 6 | 手动运行一次完整同步 | 总览、向量报告、缓存提交均正确 |
| 7 | 验证签名 push 与重复投递 | 调度成功，重复正文不重复创建任务 |
| 8 | 检查最终部署 | 在线服务使用新的知识库生成物 |

这套配置完成后，文章只需在源站仓库维护。向约定的源码分支推送更新，就会触发知识库的采集、统计、向量同步和后续部署。
