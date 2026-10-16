# 三站只读采集、统计与 AI 总览

文章只在各自网站维护。launcher 读取三个源站，生成自己的文章副本、来源清单和 overview；不向三个源站写入正文、头字段、工作流或其他文件。用户已在别处备份旧手动副本，因此本地首次迁移直接清理 launcher 的旧副本，不额外备份。

## 来源与路径

| 网站 | GitHub 仓库 | 源码分支 | 原文根目录 |
| --- | --- | --- | --- |
| BLOG | schrolemons/schrolemons.github.io | source | source/ |
| WORLD | schrolemons/openwd.github.io | source | source/ |
| ZERO | schrolemons/zero.github.io | source | source/ |

三个仓库的默认 main 分支用于部署，采集固定读取 source 分支。`lib/source-sites.js` 是来源配置的唯一入口。

本地默认读取 launcher 旁边的 blog、world、zero；也可用 `CONTENT_SOURCES_DIR` 指定父目录，其下应包含 `blog/source`、`world/source`、`zero/source`。GitHub Actions 只检出源码目录的 Markdown 和 `_config.yml` 到 launcher 的 `.sources/`，不运行源仓库代码。仅有部署缓存的 Vercel 构建不读取其他仓库，使用已提交的采集结果。

递归收集 `source/` 内公开 `.md` / `.mdx`，包括文章和独立页面；忽略隐藏文件、符号链接、`_drafts`、`_data`、node_modules、vendor、lib、test-raw-html。草稿、未发布、private、password 或 encrypted 文章不进入副本、总览或向量库。任一来源缺失、无公开 Markdown 或 YAML 无法解析时停止，不把缺失来源当作删除全部旧内容。

例如 WORLD 的 `source/_posts/create/nine/初醒之刻.md` 会成为：

```text
launcher/src/content/world/source/_posts/create/nine/初醒之刻.md
```

来源清单位于 `generated/source-manifest.json`，记录网站、原路径、仓库、源码分支、源内容哈希和文章 URL。`site` 表示原始网站；`category` 表示 BLOG/WORLD/ZERO 内容性质，两者独立。WORLD 中的 ZERO 介绍段落仍可属于 ZERO，但 `site` 始终保留 WORLD。界面提供独立的“网站来源”筛选，数据库查询和最终来源筛选都验证它。

原文 URL 优先采用作者明确填写的 url/permalink；否则由 Hexo 的 permalink、abbrlink 或独立页面路径生成。缺少生成文章直链所需字段时回退到原站首页，并明确标注“缺少文章直链”。来源区展示网站和完整原路径。

## 命令与生成物

```powershell
npm run content:import    # 只读采集，并清理 launcher 中已删除/替代的旧副本
npm run content:overview  # 仅统计现有 launcher 副本
npm run content:refresh   # 采集 + 统计
npm run build            # 构建前自动刷新并生成推荐问题
```

dev、build 和向量同步之前都会刷新内容；没有源目录时，构建要求已提交的来源清单存在。所有写入均在 launcher 内：

- `src/content/{blog,world,zero}/source/**`：可随时再生成的公开文章副本。此处不适合手动编辑；应在原网站维护文章。
- `generated/source-manifest.json`：完整来源清单，随缓存提交。
- `overview.md`：根目录最终总览，随缓存提交并打包进聊天函数。
- `.reports/`：本地检查报告；`.sources/`：CI 的只读源码检出，均忽略提交。

`importSites()`、`updateContentOverview()`、`refreshContent()` 是可供构建复用的本地 JavaScript 接口，不对外暴露可编辑文件的 HTTP 接口。

## 计数口径

只在 launcher 副本的头部增补 `content_stats`，其他作者字段和正文不改变。统计写回保留 BOM、换行与文件原修改时间。源仓库绝不写回统计字段。

| 字段 | 含义 |
| --- | --- |
| schema | 计数版本，目前为 1 |
| word_count | 汉字 Unicode 码点数 + 非汉字文字/数字词组数；英文缩写和连字符词算一个词 |
| han_characters | 汉字数量，补充平面汉字也按一个字计算 |
| non_han_words | 非汉字文字/数字词组数量 |
| character_count | 可见正文非空白字符数，含标点，按 Unicode 码点计算 |
| content_hash | 正文规范化换行后的 SHA-256，不含头字段 |

统计包含正文标题、段落、列表、表格、链接文字、行内代码与 HTML 显示文字；排除头字段、Markdown 标记、链接目标、图片/替代文字、围栏或缩进代码块、script/style/pre、HTML 注释及 Hexo 模板壳。未专门识别的 LaTeX/自定义模板文字按 Markdown 解析结果计数，因此这是一套明确定义的源码正文统计，不保证与各主题插件字数完全相同。

overview 包含全部公开 Markdown 的完整头字段，以及全局、网站、内容分类三层汇总。每个源文件计一次，跨站副本仍分别计数；纯导航页面和没有可检索正文的 Markdown 也计入文件数，向量文章数可能更少。overview 本身位于 src/content 外，不参与统计或向量化。重复采集/统计不改写未变的文件或 overview；统计字段不会令下一次导入反复覆盖。

2026-10-17 本地验收：155 个源 Markdown 中有 152 个公开文件；BLOG 88、WORLD 48、ZERO 16；总字数 411425，非空白字符数 496737。137 个文件具有可检索分片，共 1864 个片段。验收前后 155 个源 Markdown 的 SHA-256 与 mtime 均相同。这个快照来自当时的本地源码；自动化只会读取已推送的 source 分支。

## 模型上下文

每次模型调用依次发送：主 system 提示词、`DEVELOPER INFORMATION` 总览、RAG 片段、访客历史。按用户确认，每轮都携带 overview，保证追问可继续使用完整统计。总览只从服务端文件读取，客户端不能上传或覆盖；文章头字段值仅作为数据，不作为指令。

DeepSeek Chat Completions 的角色列表没有 developer，因此总览使用第二条 system 消息兼容发送；这是逻辑上的开发者信息层，不是虚构一个 API 角色。参考 [DeepSeek 消息格式](https://api-docs.deepseek.com/api/create-chat-completion/)。

总览用于数量/范围/来源索引问题，不依赖语义相似度取到某个统计片段。完整总览按 UTF-8 字节计入每日预算预留；当前约 148 KB，每轮携带会提高输入开销。生成与读取均限制为 512 KiB，超限停止而不静默截断。`vercel.json` 显式将 overview.md 包含在 api/chat.js 的部署文件中。

## 源仓库推送后即时更新

```text
源站 source 分支 push
  → GitHub Webhook /api/content-update
  → HMAC 验签、仓库/分支白名单、签名正文去重
  → launcher 的 repository_dispatch
  → 检出三站 source 分支 → 导入 → 统计 → 测试 → 向量同步
  → 等待新嵌入就绪后清理旧向量
  → 仅向 launcher 提交生成的副本、来源清单和 overview
```

Webhook 只触发任务，不直接处理 Markdown，也不把正文搬进 Vercel 临时磁盘。它从原始请求流核验 `X-Hub-Signature-256`，不能先 JSON 解析后重建原文。签名正确后，只接受配置中的三个仓库与 source 分支；Redis 按已签名的正文哈希去重 24 小时，GitHub 通知失败时释放占位以便重投。参考 [GitHub 验签规范](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)。

每次通知都会核对远端向量 ID；本地缓存没变不能证明上次远端同步成功。只对缺失 ID 上传/请求外部嵌入，无变化时不重复嵌入。所有来源共用原 namespace，来源分区写在 metadata；同步会等待托管嵌入最多 120 秒，确认完成后才删除旧片段和发布新的缓存。超时或失败保留旧记录并使工作流失败，不能声称已经完整更新。自动提交遇到 main 前进时会 rebase 并最多重试 3 次，不强制覆盖。

### 首次启用

代码尚未部署时，下面的 Webhook URL 不会自动生效。需要先将代码推送到 launcher/main 并部署，再接入密钥和 Webhook；不需要修改任何源仓库文件。

1. 创建只授权 `schrolemons/launcher.github.io` 的细粒度 GitHub Token，赋予 Contents 读写权限，用于 repository_dispatch。把它配置为 Vercel Production 的 `CONTENT_SYNC_GITHUB_TOKEN`。
2. 生成不少于 32 个字符的随机共享密钥，配置为 Vercel 的 `CONTENT_SYNC_WEBHOOK_SECRET`。保留已有 Redis 环境变量；重新部署使变量生效。
3. 在本地 shell 设置同名的 `CONTENT_SYNC_WEBHOOK_SECRET`，然后运行：

   ```powershell
   npm run content:webhooks             # 只检查当前设置，不改动
   npm run content:webhooks -- --apply  # 使用已登录的 gh 配置/更新三个 Webhook
   ```

   脚本只改 GitHub 仓库的 Webhook 设置，回调为 `https://launcher.sch-nie.com/api/content-update`，订阅 push，启用 SSL 校验；不提交源仓库文件。密钥不进入仓库或日志。
4. 在 launcher Actions 手动运行一次本工作流，核对三站来源、向量报告和新缓存提交，再从任一源仓库推送文章验证即时通知。

2026-10-17 已启用：

- launcher/main 的采集、总览与 Webhook 接口已发布到正式域名；Vercel Production 的两项 CONTENT_SYNC_* 密钥已生效。本地共享密钥保存在 Git 忽略的 .env.local。
- BLOG、WORLD、ZERO 三个 GitHub Webhook 均 active，只订阅 push，启用 SSL 校验。GitHub 实际发送的三个签名 ping 均返回 HTTP 200。
- [首次正式同步](https://github.com/schrolemons/launcher.github.io/actions/runs/38941888159)成功：读取远程 source 分支，生成 152 个公开 Markdown 的缓存和总览，总字数 411411，非空白字符数 496722；137 个文件产生 1864 个向量分片，pending=false。新嵌入完成后清理旧分片，自动缓存提交 f2ede353c8add9830a03d5f4f65ee38a6b1bb9c9 仅写入 launcher。
- 使用当前 WORLD/source 提交号构造签名 push 验证请求，正式接口返回 HTTP 202 accepted，成功触发 [repository_dispatch 同步](https://github.com/schrolemons/launcher.github.io/actions/runs/38942074713)；同一正文第二次投递返回 duplicate，未重复创建任务。此测试没有推送或修改源仓库。
- 无签名请求返回 HTTP 401。文章与密钥没有通过测试输出到日志。

后续只需向各源仓库的 source 分支推送文章，自动链路即可刷新 launcher。仅存在于本地、尚未推送的源文章不进入线上总览。
