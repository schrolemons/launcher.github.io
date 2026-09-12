---
title: Hexo-Butterfly 聊天界面魔改：DeepSeek 风格文字瞬间
tags:
  - hexo
  - butterfly
  - 魔改
abbrlink: 1a2b3c4d
date: 2026-06-05 22:00:00
---

本篇教程基于 Hexo 6.x & Butterfly 4.x，在参考 [meuicat 的聊天记录页教程](https://meuicat.com/posts/bf57cf47.html) 的基础上，完全重构为 **DeepSeek 网页版 AI 聊天风格**。

{% note primary flat %}

### 最终效果

- 左侧会话列表（类比 DeepSeek 的历史对话侧栏）
- 右侧聊天主区：用户消息蓝色气泡，AI 消息无框纯文字
- AI 消息支持可折叠的「思考模式」（已思考 X 秒 → 展开查看推理过程）
- 全屏浅色横幅背景、圆角容器、暗色模式全适配

{% endnote %}

---

## 一、创建数据

### 1.1 页面入口

新建 `source/records/index.md`（如已存在则保留原有的 `type: records` 即可）：

```markdown
---
title: 文字瞬间
date: 2024-01-01 00:00:00
type: records
top_img: false
aside: false
top_page: true
top_bg: https://picbed.sch-nie.com/SCHNIE/横幅.png
top_item: WeChet
top_title: 每刻の感动瞬间
top_tips: 记录 文字的力量
comments: false
---
```

### 1.2 对话数据

新建 `source/_data/records.yml`，这是全部对话内容的数据库。

**字段说明：**

| 字段                              | 说明                                                        |
| --------------------------------- | ----------------------------------------------------------- |
| `title`                         | 会话标题，显示在左侧栏                                      |
| `time`                          | 会话时间，显示在标题栏右侧                                  |
| `avatar`                        | 会话级默认头像（对方）                                      |
| `contents_list`                 | 对话消息数组                                                |
| `contents_list[].content`       | 消息正文，支持 YAML `|-` 多行，支持 `**粗体**` 和 `>列表项` 行内语法 |
| `contents_list[].avatar`        | **可选**。有此字段 = AI/对方消息；无此字段 = 用户消息 |
| `contents_list[].thinking`      | **可选**。AI 消息的思考过程，多行文本，同样支持 `**粗体**` 和 `>列表` |
| `contents_list[].thinking_time` | **可选**。思考耗时（整数秒）                          |

**示例：**

```yaml
- class_name: 文字瞬间
  records_list:
    - title: 与自己的对话
      time: 2026-06-05 14:30
      avatar: https://picbed.sch-nie.com/social/blog.png
      contents_list:
        # 用户消息（无 avatar 字段）
        - content: 今天天气真好，适合出去走走

        # AI 消息（有 avatar + thinking）
        - content: |-
            嗯，你说得对。最近几天一直阴雨绵绵，难得放晴。

            如果你打算出门的话，我有几个小建议：
            >去公园散散步
            >找一家喜欢的咖啡馆
            >带本书找个长椅

            **好好享受这个下午吧。**
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking: |-
            **用户表达了想出门的愿望，情绪积极。**
            需要给予肯定和鼓励，提供具体的户外活动建议。
          thinking_time: 3

        - content: 下午一起去公园吧
```

**完整数据文件：**

```yaml
- class_name: 文字瞬间
  records_list:
    - title: 与自己的对话
      time: 2026-06-05 14:30
      avatar: https://picbed.sch-nie.com/social/blog.png
      contents_list:
        - content: 今天天气真好，适合出去走走
        - content: |-
            嗯，你说得对。最近几天一直阴雨绵绵，难得放晴，确实应该趁机呼吸一下新鲜空气。

            如果你打算出门的话，我有几个小建议：

            去公园散散步，感受阳光洒在身上的温暖

            找一家喜欢的咖啡馆，坐在户外慢慢喝一杯

            带本书找个长椅，享受难得的宁静时光

            好好享受这个下午吧。
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking: |-
            用户表达了想出门的愿望，情绪积极。需要给予肯定和鼓励，而不是简单敷衍。

            可以从天气切入表达共情，然后提供具体的户外活动建议，让回复有实用价值。

            建议要具体：公园散步、咖啡馆、看书，覆盖不同类型的户外体验。
          thinking_time: 3
        - content: 下午一起去公园吧
        - content: |-
            好的，三点路口见。

            不过要提醒你一下，虽然现在阳光很好，但下午可能会有点晒。记得带瓶水，涂点防晒——这个季节的紫外线可不能小看。

            我随时都在，出发的时候告诉我一声就好。
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking: |-
            用户在邀请一起去公园。需要确认时间和地点，同时表示随时在线陪伴。

            另外要提醒防晒和补水——夏天下午的阳光不能忽视，这是贴心的细节。

            语气要温暖但不拖沓，给予出发的主动权给用户。
          thinking_time: 2

    - title: 深夜碎碎念
      time: 2026-06-04 01:15
      avatar: https://picbed.sch-nie.com/social/blog.png
      contents_list:
        - content: 又失眠了，躺在床上胡思乱想
        - content: |-
            我注意到你最近经常在这个时间发消息过来。失眠确实很难受，不只是身体上的疲惫，那种夜深人静时思绪纷飞的感觉更折磨人。

            你愿意说说在想什么吗？不用组织语言，想到什么说什么就好。有时候把脑子里的东西倒出来，反而更容易睡着。
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking: |-
            用户再次深夜发消息，这已经形成一个模式。不能简单安慰一句"早点睡"，而是要认真对待。

            首先承认睡眠问题的普遍性，让用户感到被理解。然后引导用户表达——失眠往往是因为有心事没说出来。

            用"倒出来"这个意象比"说出来"更贴切深夜的氛围。
          thinking_time: 4
        - content: |-
            在想未来的路该怎么走

            感觉站在一个十字路口，每条路都看不到尽头
        - content: |-
            这种感觉我很理解。站在十字路口的时候，最容易产生的其实是焦虑而不是方向。

            但我想说的是——顺其自然并不等于放任不管，而是你已经在认真思考了，这本身就是最重要的一步。真正迷失方向的人，是不会在深夜为方向而失眠的。

            未来的路不是一次选定的，而是走出来的。你可以在任何一个路口调整，也可以折返。这不是一张单程票。
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking: |-
            用户说出了深层的焦虑：对未来的迷茫。这是一个很常见但也很真诚的情绪表达。

            不要给空洞的建议或鸡汤。需要做的是：
            1. 先共情——站在十字路口的感觉确实很难
            2. 重新定义问题——焦虑不等于迷失，思考本身就是前进
            3. 提供一个新的视角——路是走出来的，不是选出来的

            最后用"单程票"的比喻收尾，避免说教感。
          thinking_time: 5
        - content: 嗯，你说得对。先不想了，睡了

    - title: 关于梦想
      time: 2026-05-28 20:00
      avatar: https://picbed.sch-nie.com/social/blog.png
      contents_list:
        - content: 有时候觉得自己离梦想越来越远了
        - content: |-
            我听到这句话的第一反应是——这恰恰说明你在成长。

            让我解释一下为什么：

            小时候我们觉得梦想是一颗糖果，拿到了就是成功。长大后才明白，梦想是个会自己变远的地平线。你觉得它远了，不是因为你退步了，而是你现在的眼界比从前高得多。

            你在用更高的标准要求自己，只是你自己还没意识到。
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking: |-
            用户表达了一种无力感——梦想看似越来越远。这是一个可以深入聊的话题。

            关键洞察：梦想变远不是退步的信号，而是成长的信号。小时候的梦想是简单可触达的（糖果），长大后的梦想是不断延伸的地平线。

            用两个比喻来支撑这个观点：糖果 → 地平线，让用户从另一个角度看待自己的焦虑。

            不要过度分析，点到为止，留空间给用户自己去感受。
          thinking_time: 4
        - content: 真的吗...
        - content: |-
            真的。回看一年前的你，有没有发现：

            您现在关注的问题比一年前更复杂、更深刻

            您对自己要求更高了，这说明您的认知在进步

            走得很慢不代表没有走，看不到终点不代表没有前进

            你已经在路上走了很远了。有时候我们太专注看远方，忘了低头看看脚下的里程。
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking_time: 3
        - content: 谢谢你，心里好受多了

    - title: 一首歌的感触
      time: 2026-05-20 22:10
      avatar: https://picbed.sch-nie.com/social/blog.png
      contents_list:
        - content: 刚才随机到一首老歌，一下子把回忆拉回来了
        - content: |-
            音乐和记忆之间有着非常奇妙的连接。一首歌往往能把我们精准地带回某个时刻、某个场景，甚至能唤起当时的气味和温度。

            是哪首歌呢？如果你愿意的话，可以分享给我。
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking: |-
            用户被一首老歌触动了回忆。这是一个很感性的时刻，回复要温柔且有共鸣。

            从音乐与记忆的科学/诗性连接切入，用"气味和温度"这个细节增加画面感。

            然后自然地邀请用户分享是什么歌——不要直接问是什么歌，而是给用户选择的空间（"如果你愿意的话"）。
          thinking_time: 2
        - content: 突然好想你
        - content: |-
            五月天啊。果然。

            他们的歌确实有种说不清的魔力——旋律一响起，就好像打开了某个尘封已久的抽屉。可能是高中课间的走廊，可能是某个夏天的傍晚，也可能是某次告别时不敢回头的瞬间。

            鼻子酸了就酸吧。有些情绪值得被好好对待。

            如果你想聊聊这首歌背后的故事，我在这里听着。
          avatar: https://picbed.sch-nie.com/social/blog.png
          thinking: |-
            用户说出了歌名"突然好想你"——五月天的经典曲目。这是一首关于思念和回忆的歌。

            需要表达对这首歌的理解和共鸣，但不是泛泛地说"我也喜欢"。可以从五月天音乐的普遍性切入——为什么他们的歌总能勾起回忆。

            然后用几个具体的场景（走廊、傍晚、告别）来具象化这种感受，让用户感到被理解。

            最后表达：情绪不需要被压抑，想聊就聊。
          thinking_time: 4
        - content: 是啊，听着听着鼻子就酸了
```

---

## 二、模板文件

### 2.1 路由注册

修改主题的 `layout/page.pug`，在 `when` 分支中添加 `records` 路由：

```diff
  when 'categories'
    include includes/page/categories.pug
+ when 'records'
+   include includes/page/records.pug
  default
    include includes/page/default-page.pug
```

### 2.2 核心模板

新建 `layout/includes/page/records.pug`（在 Butterfly 主题目录下，如 `node_modules/hexo-theme-butterfly/layout/includes/page/`）。

以下是完整的模板文件，包含 HTML 结构、JavaScript 内联逻辑和所有渲染代码：

```pug
#records_page
  .page-top-card(style='background-image: url(' + 'https://picbed.sch-nie.com/SCHNIE/横幅.png' + ');')
  //- Hamburger toggle (mobile)
  input#records-hamburger.records-hamburger-check(type="checkbox")
  label.records-overlay(for="records-hamburger")
  .records-layout
    - var allRecords = []
    each i in site.data.records
      each j in i.records_list
        - allRecords.push(j)

    //- Hidden radio buttons（纯 CSS 切换核心）
    each j, idx in allRecords
      input.records-radio(
        type="radio"
        name="records-tab"
        id="records-tab-" + idx
        checked=(idx === 0)
      )

    //- Left sidebar（左侧会话列表）
    nav.records-sidebar
      .records-sidebar-header
        img(src='https://picbed.sch-nie.com/social/blog.png')
        span SCHNIE
      .records-sidebar-list
        each j, idx in allRecords
          label.records-sidebar-item(for="records-tab-" + idx onclick="var h=document.getElementById('records-hamburger');if(h)h.checked=false")
            .records-sidebar-text= j.title

    //- Main chat area（右侧聊天区）
    .records-main
      each j, idx in allRecords
        .records-conv(id="conv-" + idx)
          .records-conv-header
            label.records-hamburger-btn(for="records-hamburger")
              span.records-hamburger-icon
              span.records-hamburger-icon
              span.records-hamburger-icon
            .records-conv-title= j.title
            .records-conv-subtitle
              span.records-subtitle-icon &#9889;
              span 快速模式
            .records-conv-time= j.time
          .records-conv-messages
            -
              var msgs = ''

              // HTML 转义函数，防止 XSS
              function esc(str) {
                return str
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
              }

              // 格式化单行：先转义 → **粗体** → > 列表项
              function fmtLine(raw) {
                var s = esc(raw.trim());
                if (!s) return '';

                // **粗体**
                s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

                // > 列表项
                if (/^&gt;/.test(s)) {
                  s = s.replace(/^&gt;\s*/, '');
                  return '<p class="records-list-item">' + s + '</p>';
                }
                return '<p>' + s + '</p>';
              }

              // 多段落拆分：\n → <p> 标签（经过 fmtLine 处理）
              function paras(str) {
                return str.split(/\n/)
                  .filter(function(p) { return p.trim() !== ''; })
                  .map(function(p) { return fmtLine(p.trim()); })
                  .join('');
              }

            // 逐条消息渲染
            each l in j.contents_list
              -
                var bubble = paras(l.content);
                if (!bubble) bubble = '<p>' + esc(l.content) + '</p>';

                // 思考模式：<details> 可折叠区块
                if (l.thinking && l.thinking.trim()) {
                  var thinkPars = paras(l.thinking);
                  var thinkTime = l.thinking_time || '...';
                  bubble = '<details class="records-thinking">'
                    + '<summary>已思考（用时 '
                    + '<span class="records-thinking-time">' + thinkTime + '</span>'
                    + ' 秒）<span class="records-thinking-arrow"></span></summary>'
                    + '<div class="records-thinking-content">'
                    +   '<div class="records-thinking-gutter">'
                    +     '<div class="records-thinking-dot"></div>'
                    +     '<div class="records-thinking-line"></div>'
                    +   '</div>'
                    +   '<div class="records-thinking-text">' + thinkPars + '</div>'
                    + '</div></details>'
                    + bubble;
                }

                // 有 avatar → AI 消息（对方）；无 avatar → 用户消息（自己）
                if (l.avatar && l.avatar.trim())
                  msgs += '<div class="records-msg records-ai">'
                    + '<img class="records-msg-avatar" src="' + esc(l.avatar) + '">'
                    + '<div class="records-msg-bubble">' + bubble + '</div></div>';
                else
                  msgs += '<div class="records-msg records-user">'
                    + '<div class="records-msg-bubble">' + bubble + '</div></div>';
            != msgs
```

**设计要点：**

- `esc()` 对所有用户数据做 HTML 转义，防止 XSS 注入
- `paras()` 将多行文本按 `\n` 分割为独立 `<p>` 标签，实现消息内多段落
- `thinking` 字段存在时，在消息前插入 `<details>` 折叠区块作为思考模式
- 没有 `avatar` 字段 = 用户自己发的消息（蓝色气泡、右对齐）；有 `avatar` = AI 回复（无气泡框、左对齐 + 圆形头像）
- 纯 CSS radio 切换标签页，`input:checked ~ .records-sidebar label` + `~ .records-main .records-conv` 联动

---

## 三、样式文件

新建 `source/css/records.css`，完整样式如下（含暗色模式 + 响应式）：

```css
/* ========================================
   SCHNIE 聊天 —— DeepSeek 风格界面
   ======================================== */

/* ---- 隐藏 radio ---- */
.records-radio {
  display: none;
}

/* ---- 页面容器 override ---- */
#content-inner:has(#records_page) {
  padding: 0 !important;
  max-width: 100% !important;
  background: transparent !important;
}
#page:has(#records_page) > .page-title {
  display: none;
}

/* ---- 横幅背景 ---- */
#records_page .page-top-card {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 100vh;
  z-index: -1;
  opacity: .06;
  background-size: cover;
  background-position: center;
  filter: blur(2px);
}

/* ========================================
   双栏容器 —— 四周留白，浮起圆角
   ======================================== */
.records-layout {
  display: flex;
  max-width: 1100px;
  height: calc(100vh - 60px - 36px);
  margin: 18px auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(0, 0, 0, .06);
}

/* ---- 左侧栏 ---- */
.records-sidebar {
  position: relative;
  width: 260px;
  min-width: 260px;
  background: #f7f7f8;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
}
/* 底部渐变遮罩：暗示下方还有更多话题 */
.records-sidebar::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 48px;
  background: linear-gradient(to bottom, transparent, #f7f7f8);
  pointer-events: none;
  z-index: 1;
}

.records-sidebar-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-bottom: 20px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.records-sidebar-list::-webkit-scrollbar {
  display: none;
}

.records-sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 14px;
  font-size: 1rem;
  font-weight: 700;
  color: #2b6cb0;
  letter-spacing: .02em;
}
.records-sidebar-header img {
  width: 28px; height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.records-sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  margin: 2px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: .9rem;
  color: #444;
  transition: background .15s, color .15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}
.records-sidebar-item:hover { background: #eaeaec; }
.records-sidebar-item:active { background: #dedee0; }

/* 选中态 */
#records-tab-0:checked ~ .records-sidebar label[for="records-tab-0"],
#records-tab-1:checked ~ .records-sidebar label[for="records-tab-1"],
#records-tab-2:checked ~ .records-sidebar label[for="records-tab-2"],
#records-tab-3:checked ~ .records-sidebar label[for="records-tab-3"],
#records-tab-4:checked ~ .records-sidebar label[for="records-tab-4"],
#records-tab-5:checked ~ .records-sidebar label[for="records-tab-5"],
#records-tab-6:checked ~ .records-sidebar label[for="records-tab-6"],
#records-tab-7:checked ~ .records-sidebar label[for="records-tab-7"],
#records-tab-8:checked ~ .records-sidebar label[for="records-tab-8"],
#records-tab-9:checked ~ .records-sidebar label[for="records-tab-9"],
#records-tab-10:checked ~ .records-sidebar label[for="records-tab-10"],
#records-tab-11:checked ~ .records-sidebar label[for="records-tab-11"],
#records-tab-12:checked ~ .records-sidebar label[for="records-tab-12"],
#records-tab-13:checked ~ .records-sidebar label[for="records-tab-13"],
#records-tab-14:checked ~ .records-sidebar label[for="records-tab-14"] {
  background: #e3e3e5;
  color: #222;
  font-weight: 500;
}

/* ========================================
   主内容区
   ======================================== */
.records-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 0;
}

.records-conv {
  display: none;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

#records-tab-0:checked ~ .records-main #conv-0,
#records-tab-1:checked ~ .records-main #conv-1,
#records-tab-2:checked ~ .records-main #conv-2,
#records-tab-3:checked ~ .records-main #conv-3,
#records-tab-4:checked ~ .records-main #conv-4,
#records-tab-5:checked ~ .records-main #conv-5,
#records-tab-6:checked ~ .records-main #conv-6,
#records-tab-7:checked ~ .records-main #conv-7,
#records-tab-8:checked ~ .records-main #conv-8,
#records-tab-9:checked ~ .records-main #conv-9,
#records-tab-10:checked ~ .records-main #conv-10,
#records-tab-11:checked ~ .records-main #conv-11,
#records-tab-12:checked ~ .records-main #conv-12,
#records-tab-13:checked ~ .records-main #conv-13,
#records-tab-14:checked ~ .records-main #conv-14 {
  display: flex;
}

/* ---- 标题栏（sticky 固定）---- */
.records-conv-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px 10px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.records-conv-title { font-size: 1.05rem; font-weight: 600; color: #222; }
.records-conv-subtitle {
  font-size: .78rem; color: #aaa;
  display: flex; align-items: center; gap: 4px;
}
.records-subtitle-icon { font-size: .75rem; color: #f0a500; }
.records-conv-time { font-size: .8rem; color: #aaa; margin-left: auto; }

/* ---- 消息区（不再独立滚动）---- */
.records-conv-messages {
  padding: 20px 0 40px;
  width: 100%;
}

/* ---- 消息行 ---- */
.records-msg {
  display: flex;
  align-items: flex-start;
  padding: 8px 5% 8px 3%;
  gap: 12px;
}

/* ---- AI 消息 ---- */
.records-ai { justify-content: flex-start; }
.records-ai .records-msg-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  object-fit: cover;
}
.records-ai .records-msg-bubble {
  max-width: 85%;
  background: transparent;
  padding: 4px 0;
}
.records-ai .records-msg-bubble p {
  color: #333;
  margin: 0;
  line-height: 1.72;
  font-size: .93rem;
  word-break: break-word;
  overflow-wrap: break-word;
}
.records-ai .records-msg-bubble p + p { margin-top: .85em; }

/* ---- 粗体 & 列表项（YAML 中 **text** 和 >text 语法）---- */
.records-ai .records-msg-bubble strong,
.records-user .records-msg-bubble strong,
.records-thinking-text strong {
  font-weight: 600;
  color: inherit;
}
.records-list-item {
  position: relative;
  padding-left: 1.2em !important;
  margin: 0 !important;
}
.records-list-item::before {
  content: '';
  position: absolute;
  left: 0; top: .58em;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #c0c0c0;
}
.records-ai .records-msg-bubble .records-list-item { color: #555; }
.records-user .records-msg-bubble .records-list-item { color: #2a3a5e; }
.records-thinking-text .records-list-item::before { background: #bbb; }

/* ---- 用户消息 ---- */
.records-user { justify-content: flex-end; }
.records-user .records-msg-bubble {
  max-width: 85%;
  background: #eaf1fb;
  border-radius: 14px 4px 14px 14px;
  padding: 10px 16px;
}
.records-user .records-msg-bubble p {
  color: #1a1a2e;
  margin: 0;
  line-height: 1.65;
  font-size: .93rem;
  word-break: break-word;
  overflow-wrap: break-word;
}
.records-user .records-msg-bubble p + p { margin-top: .6em; }

/* ---- 动画 ---- */
.records-msg { animation: msgIn .35s ease-out; }
@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.records-ai + .records-ai,
.records-user + .records-user { padding-top: 2px; }
.records-ai + .records-user,
.records-user + .records-ai { padding-top: 24px; }

/* ========================================
   思考模式 —— 可折叠灰色区块
   ======================================== */
.records-thinking {
  margin-bottom: 12px;
}

/* 去默认三角形 */
.records-thinking summary::-webkit-details-marker { display: none; }
.records-thinking summary::marker { display: none; content: ''; }
.records-thinking summary { list-style: none; }

.records-thinking summary {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 0 4px;
  font-size: .82rem;
  color: #999;
  user-select: none;
  outline: none;
  transition: color .2s;
}
.records-thinking summary:hover { color: #777; }

.records-thinking-time {
  color: #888;
}

/* 下拉箭头：折叠时 →，展开时 ↓ */
.records-thinking-arrow {
  display: inline-block;
  width: 14px; height: 14px;
  position: relative;
  margin-left: 2px;
  transition: transform .25s;
}
.records-thinking-arrow::after {
  content: '';
  position: absolute;
  top: 4px; left: 3px;
  width: 6px; height: 6px;
  border-right: 1.5px solid #bbb;
  border-bottom: 1.5px solid #bbb;
  transform: rotate(-45deg);
}
.records-thinking[open] > summary > .records-thinking-arrow {
  transform: rotate(90deg);
}

/* 思考内容 —— flex 两栏：gutter（点+线）+ 文本 */
.records-thinking-content {
  display: flex;
  margin-top: 6px;
  gap: 0;
}

/* 左侧固定栏：圆点 + 竖线 */
.records-thinking-gutter {
  width: 16px;
  min-width: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.records-thinking-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #c0c0c0;
  margin-top: 5px;
  flex-shrink: 0;
}

.records-thinking-line {
  width: 2px;
  background: #e0e0e0;
  margin-top: 4px;
  flex: 1;
  min-height: 8px;
}

/* 右侧文本区 */
.records-thinking-text {
  flex: 1;
  min-width: 0;
  padding-right: 4px;
}
.records-thinking-text p {
  font-size: .85rem !important;
  color: #999 !important;
  line-height: 1.65 !important;
  margin: 0 !important;
}
.records-thinking-text p + p { margin-top: .6em !important; }

/* ========================================
   暗色模式
   ======================================== */
[data-theme="dark"] #records_page .page-top-card { opacity: .04; }

[data-theme="dark"] .records-layout {
  box-shadow: 0 4px 32px rgba(0, 0, 0, .3);
}

[data-theme="dark"] .records-sidebar {
  background: #1a1a1e;
  border-right-color: #2a2a2e;
}
[data-theme="dark"] .records-sidebar::after {
  background: linear-gradient(to bottom, transparent, #1a1a1e);
}
[data-theme="dark"] .records-sidebar-header { color: #5b9bd5; }
[data-theme="dark"] .records-sidebar-item { color: #bbb; }
[data-theme="dark"] .records-sidebar-item:hover { background: #242428; }
[data-theme="dark"] .records-sidebar-item:active { background: #2a2a2e; }

[data-theme="dark"] #records-tab-0:checked ~ .records-sidebar label[for="records-tab-0"],
[data-theme="dark"] #records-tab-1:checked ~ .records-sidebar label[for="records-tab-1"],
[data-theme="dark"] #records-tab-2:checked ~ .records-sidebar label[for="records-tab-2"],
[data-theme="dark"] #records-tab-3:checked ~ .records-sidebar label[for="records-tab-3"],
[data-theme="dark"] #records-tab-4:checked ~ .records-sidebar label[for="records-tab-4"],
[data-theme="dark"] #records-tab-5:checked ~ .records-sidebar label[for="records-tab-5"],
[data-theme="dark"] #records-tab-6:checked ~ .records-sidebar label[for="records-tab-6"],
[data-theme="dark"] #records-tab-7:checked ~ .records-sidebar label[for="records-tab-7"],
[data-theme="dark"] #records-tab-8:checked ~ .records-sidebar label[for="records-tab-8"],
[data-theme="dark"] #records-tab-9:checked ~ .records-sidebar label[for="records-tab-9"],
[data-theme="dark"] #records-tab-10:checked ~ .records-sidebar label[for="records-tab-10"],
[data-theme="dark"] #records-tab-11:checked ~ .records-sidebar label[for="records-tab-11"],
[data-theme="dark"] #records-tab-12:checked ~ .records-sidebar label[for="records-tab-12"],
[data-theme="dark"] #records-tab-13:checked ~ .records-sidebar label[for="records-tab-13"],
[data-theme="dark"] #records-tab-14:checked ~ .records-sidebar label[for="records-tab-14"] {
  background: #2a2a2e; color: #eee;
}

[data-theme="dark"] .records-main { background: #212327; }

[data-theme="dark"] .records-conv-header { background: #1e1e20; border-color: #2a2a2c; }
[data-theme="dark"] .records-conv-title { color: #eee; }
[data-theme="dark"] .records-conv-subtitle,
[data-theme="dark"] .records-conv-time { color: #666; }
[data-theme="dark"] .records-subtitle-icon { color: #e0a800; }

[data-theme="dark"] .records-ai .records-msg-bubble p { color: #ddd; }
[data-theme="dark"] .records-ai .records-msg-bubble .records-list-item { color: #aaa; }
[data-theme="dark"] .records-user .records-msg-bubble { background: #1e3a5f; }
[data-theme="dark"] .records-user .records-msg-bubble p { color: #dce4f5; }
[data-theme="dark"] .records-user .records-msg-bubble .records-list-item { color: #aab8d4; }

[data-theme="dark"] .records-thinking-arrow::after { border-color: #666; }
[data-theme="dark"] .records-thinking-dot { background: #555; }
[data-theme="dark"] .records-thinking-line { background: #333; }
[data-theme="dark"] .records-list-item::before { background: #555; }
[data-theme="dark"] .records-hamburger-icon { background: #aaa; }
[data-theme="dark"] .records-thinking-text p { color: #777 !important; }

/* ========================================
   响应式
   ======================================== */

/* ---- 汉堡菜单（默认隐藏，移动端显示）---- */
.records-hamburger-check { display: none; }
.records-overlay { display: none; }
.records-hamburger-btn {
  display: none;
  flex-shrink: 0;
  width: 28px; height: 28px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 2px;
}

/* ---- 平板 / 小屏桌面 ---- */
@media screen and (max-width: 900px) {
  .records-layout {
    margin: 10px;
    height: calc(100vh - 60px - 20px);
  }
  .records-sidebar {
    width: 200px;
    min-width: 200px;
  }
}

/* ---- iPad / 竖屏平板 ---- */
@media screen and (max-width: 768px) {
  .records-layout {
    margin: 0;
    height: calc(100vh - 60px);
    border-radius: 0;
    box-shadow: none;
  }
  .records-sidebar {
    width: 170px;
    min-width: 170px;
  }
  .records-sidebar-header { padding: 16px 12px 10px; font-size: .9rem; }
  .records-sidebar-header img { width: 24px; height: 24px; }
  .records-sidebar-item { padding: 8px 12px; font-size: .82rem; margin: 1px 4px; }

  .records-conv-header {
    padding: 10px 14px 8px;
    flex-wrap: wrap;
    gap: 4px 8px;
  }
  .records-conv-title { font-size: .95rem; }
  .records-conv-time { font-size: .72rem; }

  .records-msg { padding: 6px 3% 6px 2%; gap: 8px; }
  .records-user .records-msg-bubble { max-width: 90%; padding: 8px 12px; }
  .records-ai .records-msg-avatar { width: 26px; height: 26px; margin-top: 0; }
  .records-ai .records-msg-bubble p,
  .records-user .records-msg-bubble p { font-size: .87rem; line-height: 1.6; }
  .records-ai .records-msg-bubble p + p { margin-top: .65em; }
  .records-user .records-msg-bubble p + p { margin-top: .45em; }

  .records-thinking-gutter { width: 14px; min-width: 14px; }
}

/* ---- 手机横屏 / 大屏手机（启用汉堡菜单）---- */
@media screen and (max-width: 600px) {
  /* ---- 汉堡按钮（内嵌在标题栏左侧）---- */
  .records-hamburger-btn {
    display: flex;
    width: 26px; height: 26px;
    gap: 4px;
    transition: background .2s, transform .2s;
  }
  .records-hamburger-btn:hover { background: rgba(0, 0, 0, .05); }
  .records-hamburger-btn:active { background: rgba(0, 0, 0, .1); transform: scale(.92); }
  .records-hamburger-icon {
    display: block;
    width: 16px; height: 2px;
    background: #555;
    border-radius: 1px;
    transform-origin: center;
    will-change: transform, opacity;
    transition: transform .35s cubic-bezier(.34, 1.56, .64, 1), opacity .2s ease;
  }
  /* 点击时三条线变形为 X */
  #records-hamburger:checked ~ .records-layout .records-hamburger-btn .records-hamburger-icon:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }
  #records-hamburger:checked ~ .records-layout .records-hamburger-btn .records-hamburger-icon:nth-child(2) {
    opacity: 0;
  }
  #records-hamburger:checked ~ .records-layout .records-hamburger-btn .records-hamburger-icon:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }

  /* ---- 遮罩 ---- */
  .records-overlay {
    display: block;
    visibility: hidden;
    opacity: 0;
    position: fixed;
    inset: 0;
    z-index: 90;
    background: rgba(0, 0, 0, .35);
    pointer-events: none;
    transition: opacity .35s cubic-bezier(.4, 0, .2, 1), visibility .35s;
  }
  #records-hamburger:checked ~ .records-overlay {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }

  /* ---- 侧栏变抽屉 ---- */
  .records-layout {
    position: relative;
  }
  .records-sidebar {
    position: fixed;
    top: 0; left: 0;
    height: 100dvh;
    width: 260px !important;
    min-width: 260px !important;
    z-index: 100;
    transform: translateX(-100%);
    will-change: transform;
    transition: transform .35s cubic-bezier(.4, 0, .2, 1);
    box-shadow: 0 0 24px rgba(0, 0, 0, .15);
    border-right: 1px solid #e5e5e5;
  }
  #records-hamburger:checked ~ .records-layout .records-sidebar {
    transform: translateX(0);
  }

  /* ---- 侧栏 header ---- */
  .records-sidebar-header {
    justify-content: flex-start;
    padding: 16px 14px 12px;
    font-size: 1rem;
  }
  .records-sidebar-header img { display: none; }

  /* ---- 侧栏列表项回正常宽 ---- */
  .records-sidebar-item {
    justify-content: flex-start;
    padding: 10px 14px;
    margin: 1px 6px;
    font-size: .85rem;
    border-radius: 6px;
  }
  .records-sidebar-text { display: block; }

  /* ---- 主内容区 ---- */
  .records-conv-header { padding: 10px 16px 8px; }
  .records-conv-subtitle { font-size: .72rem; }
  .records-msg { padding: 10px 7% 10px 6%; gap: 8px; }
  .records-user .records-msg-bubble { max-width: 80%; border-radius: 12px 4px 12px 12px; padding: 8px 12px; }
  .records-ai .records-msg-bubble p,
  .records-user .records-msg-bubble p { font-size: .85rem; line-height: 1.55; }

  .records-ai .records-msg-avatar { display: none; }

  .records-thinking summary { font-size: .76rem; }
  .records-thinking-text p { font-size: .78rem !important; }
}

/* ---- 手机竖屏（侧栏保持抽屉模式）---- */
@media screen and (max-width: 480px) {
  .records-layout { margin: 0; height: 100dvh; border-radius: 0; }

  .records-hamburger-btn {
    width: 24px; height: 24px;
    gap: 3px;
  }
  .records-hamburger-icon { width: 14px; }
  /* X 形变偏移适配 gap=3px */
  #records-hamburger:checked ~ .records-layout .records-hamburger-btn .records-hamburger-icon:nth-child(1) {
    transform: translateY(5px) rotate(45deg);
  }
  #records-hamburger:checked ~ .records-layout .records-hamburger-btn .records-hamburger-icon:nth-child(3) {
    transform: translateY(-5px) rotate(-45deg);
  }

  /* 侧栏高度撑满 */
  .records-sidebar {
    height: 100dvh;
    width: 260px !important;
    min-width: 260px !important;
  }

  .records-sidebar-header {
    padding: 14px 14px 10px;
    font-size: 1rem;
  }
  .records-sidebar-header img { display: none; }
  .records-sidebar-item {
    padding: 10px 14px;
    font-size: .85rem;
  }
  .records-sidebar-text { display: block; }

  .records-conv-header {
    padding: 10px 14px 8px;
    gap: 6px;
  }
  .records-conv-title { font-size: .9rem; }
  .records-conv-time { font-size: .7rem; }
  .records-conv-subtitle { font-size: .7rem; }

  .records-msg { padding: 12px 8% 12px 7%; gap: 6px; }
  .records-user .records-msg-bubble { max-width: 78%; padding: 8px 10px; border-radius: 10px 3px 10px 10px; }
  .records-ai .records-msg-avatar { display: none; }
  .records-ai .records-msg-bubble p,
  .records-user .records-msg-bubble p { font-size: .82rem; line-height: 1.5; }

  .records-ai + .records-user,
  .records-user + .records-ai { padding-top: 18px; }

  .records-thinking summary { font-size: .74rem; }
  .records-thinking-text p { font-size: .76rem !important; }
  .records-thinking-gutter { width: 12px; min-width: 12px; }
  .records-thinking-dot { width: 5px; height: 5px; }
  .records-thinking-line { width: 1.5px; }
}

/* ---- 超小屏手机 ---- */
@media screen and (max-width: 360px) {
  .records-sidebar {
    width: 240px !important;
    min-width: 240px !important;
  }
  .records-sidebar-header { font-size: .92rem; }
  .records-sidebar-header img { display: none; }
  .records-sidebar-item { padding: 9px 14px; font-size: .82rem; }
  .records-sidebar-text { display: block; }

  .records-hamburger-btn {
    width: 22px; height: 22px;
    gap: 3px;
  }
  .records-hamburger-icon { width: 13px; }
  /* X 形变偏移适配 gap=3px */
  #records-hamburger:checked ~ .records-layout .records-hamburger-btn .records-hamburger-icon:nth-child(1) {
    transform: translateY(5px) rotate(45deg);
  }
  #records-hamburger:checked ~ .records-layout .records-hamburger-btn .records-hamburger-icon:nth-child(3) {
    transform: translateY(-5px) rotate(-45deg);
  }

  .records-conv-header { padding: 8px 12px 6px; }
  .records-conv-title { font-size: .85rem; }
  .records-conv-time { font-size: .66rem; }

  .records-conv-messages { padding: 12px 0 30px; }
  .records-msg { padding: 8px 9% 8px 8%; gap: 4px; }
  .records-user .records-msg-bubble { max-width: 82%; padding: 6px 8px; border-radius: 8px 3px 8px 8px; }
  .records-ai .records-msg-avatar { display: none; }
  .records-ai .records-msg-bubble p,
  .records-user .records-msg-bubble p { font-size: .8rem; line-height: 1.48; }
  .records-ai .records-msg-bubble p + p { margin-top: .5em; }
  .records-user .records-msg-bubble p + p { margin-top: .3em; }

  .records-thinking summary { font-size: .72rem; }
  .records-thinking-text p { font-size: .74rem !important; }
  .records-thinking-gutter { width: 10px; min-width: 10px; }
}
```

---

## 四、配置引入

在 `_config.butterfly.yml` 的 `inject.head` 中引入 CSS：

```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/records.css">
```

**验证：**

```bash
hexo clean && hexo generate && hexo server
```

访问 `http://localhost:4000/records/` 查看效果。

---

{% note info flat %}

### 附录：完整文件清单

| 文件     | 路径                                                            |
| -------- | --------------------------------------------------------------- |
| 页面入口 | `source/records/index.md`                                     |
| 对话数据 | `source/_data/records.yml`                                    |
| Pug 模板 | `themes/butterfly/layout/includes/page/records.pug`           |
| 路由注册 | `themes/butterfly/layout/page.pug`（添加 `when 'records'`） |
| 样式文件 | `source/css/records.css`                                      |
| 主题注入 | `_config.butterfly.yml` → `inject.head`                    |

{% endnote %}
