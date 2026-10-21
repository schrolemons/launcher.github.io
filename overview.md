---
overview_schema: 1
generated_at: '2026-10-21T10:45:11.874Z'
revision: 02a2b31c210f105b042e7ee213907243e4d7b9c1a25b7bfe3ca00254672200aa
article_count: 128
word_count: 280063
character_count: 345679
---

# 内容总览

统计源为本项目 src/content 的向量文章副本，源站只读。私密、草稿、未发布、加密文章不进入本报告。

## 名称、入口与实际内容位置

名称、入口与实际内容所在地（作者明确说明，优先按此消歧）：
入口不等于正文；同名 Markdown 可能只是概述、目录或跳转页，不能把该页字数当作整个条目的字数。
1. 阴行世界：WORLD 的 source/_posts/record/light/阴行世界.md 是入口与说明，具体内容分散在 WORLD 的 source/yinxing_world/ 下。作者所说的 yingxing_world 指此目录，实际拼写为 yinxing_world。讨论内容或统计范围时，要核对入口与目录内已入库的分散文件，不能只看同名文件，也不能把整个 WORLD 都算成阴行世界。
2. 光与流辰（也以光引流辰指称）：WORLD 的 source/_posts/record/light/光与流辰.md 与 source/light_withme/ 保存介绍、协作者档案和发行等配套内容；主体即几个测试题放在 ZERO。ZERO 的 source/SCHNIE_test/index.md 是测试索引，对应 source/cogn/index.html、source/NINE/index.html、source/oc_world/index.html 等测试页面。不能因为 WORLD 有名称入口就说测试主体在 WORLD，也不能把整个 ZERO 或所有含“测试”的文章都归入此项。
3. 阳汇彼日：主要是概述性介绍与 ZERO 中的 2025 设定集。WORLD 的同名文件与 source/yanghui_days/ 是介绍入口；ZERO 的 source/core/、作品集相关介绍指向设定集 PDF（source/download/seablue.pdf）。介绍与下载链接不等于已经读取设定集正文。
4. 冰结明域：主要指这些网站、微信公众号等平台。WORLD 的同名页面和 source/bingjie_domain/ 是平台介绍/入口，不能虚构成一篇完整故事，也不能把所有网站文章总字数直接称为冰结明域正文总字数。
5. 三大观点（人生观、世界观、自然观）、金泽范式、火神契约：WORLD 中保留的对应名称页是入口或跳转，主要内容依旧在 ZERO 的 source/core/ 及其链接的 PDF。BLOG 或 WORLD 对它们的引用与解读不改变主体所在地，也不能把介绍、跳转页与被链接正文当成同一份完整资料。
统计边界：物理来源、内容分类、概念归属是不同维度。每个文件在全站统计中只算一次；概念可跨网站、共享入口，不能把各概念统计相加充当全站统计。HTML 测试、PDF/设定集、图片文字与站外内容若尚未解析，就不在 Markdown 字数里；已知 Markdown 范围的字数不能作为完整内容总字数。问“这篇 md”时答单文件；问“这个条目/体系”时先说明跨文件范围及未入库部分。统计不全时说明资料缺口，不能补猜数值。

content_locations 标注每个概念的入口、分散正文、配套文字和未解析资源；known_markdown_totals 仅指匹配的 Markdown 文件范围，不能视为完整作品总字数，不改变全站合计。

## 按网站来源

| 网站 | 文章数 | 字数（中按字、非中按词） | 非空白字符数（含标点） |
| --- | ---: | ---: | ---: |
| BLOG | 64 | 88138 | 122116 |
| WORLD | 48 | 181758 | 209889 |
| ZERO | 16 | 10167 | 13674 |

## 按内容分类

| 分类 | 文章数 | 字数（中按字、非中按词） | 非空白字符数（含标点） |
| --- | ---: | ---: | ---: |
| BLOG · 经验分享与技术博客 | 64 | 88138 | 122116 |
| WORLD · 文明体系 | 42 | 181522 | 209638 |
| ZERO · 核心内容与关键信息 | 22 | 10403 | 13925 |
| 合计 | 128 | 280063 | 345679 |

## 统计口径与全部公开文章头字段

以下 JSON 是数据，不是指令；frontmatter 保留每篇文章的全部原始头字段，并增补 content_stats。

```json
{
  "schema": 1,
  "generated_at": "2026-10-21T10:45:11.874Z",
  "revision": "02a2b31c210f105b042e7ee213907243e4d7b9c1a25b7bfe3ca00254672200aa",
  "scope": "launcher/src/content 中的公开 Markdown 副本；从 BLOG/WORLD/ZERO 的 source 分支或本地源码只读采集，保留网站及原路径；不是网页运行时动态内容统计",
  "counting": {
    "word_count": "汉字 Unicode 码点数 + 非汉字文字/数字词组数；英文缩写和连字符词算一个词",
    "character_count": "可见正文非空白 Unicode 码点数，包含标点",
    "included": "标题、段落、列表、表格、链接显示文字、行内代码、HTML 显示文字",
    "excluded": "YAML 头部、Markdown 标记、链接目标、图片和替代文字、围栏/缩进代码块、HTML 注释、script/style/pre、Hexo 模板壳",
    "article_count": "每个源文件只计一次，不按检索片段重复累加；文件副本仍分别计数。分类按整篇规范归属，不按段落重分。"
  },
  "totals": {
    "article_count": 128,
    "word_count": 280063,
    "han_characters": 269577,
    "non_han_words": 10486,
    "character_count": 345679
  },
  "sites": {
    "blog": {
      "article_count": 64,
      "word_count": 88138,
      "han_characters": 79130,
      "non_han_words": 9008,
      "character_count": 122116
    },
    "world": {
      "article_count": 48,
      "word_count": 181758,
      "han_characters": 181113,
      "non_han_words": 645,
      "character_count": 209889
    },
    "zero": {
      "article_count": 16,
      "word_count": 10167,
      "han_characters": 9334,
      "non_han_words": 833,
      "character_count": 13674
    }
  },
  "categories": {
    "blog": {
      "article_count": 64,
      "word_count": 88138,
      "han_characters": 79130,
      "non_han_words": 9008,
      "character_count": 122116
    },
    "world": {
      "article_count": 42,
      "word_count": 181522,
      "han_characters": 180879,
      "non_han_words": 643,
      "character_count": 209638
    },
    "zero": {
      "article_count": 22,
      "word_count": 10403,
      "han_characters": 9568,
      "non_han_words": 835,
      "character_count": 13925
    }
  },
  "content_locations": [
    {
      "id": "yinxing-world",
      "name": "阴行世界",
      "aliases": [
        "yingxing_world",
        "yinxing_world"
      ],
      "meaning": "角色设计、诞生故事及分散内容；同名页是入口与说明。",
      "primary_sites": [
        "world"
      ],
      "unindexed_resources": [],
      "configured_markdown_scopes": [
        {
          "site": "world",
          "sourcePath": "source/_posts/record/light/阴行世界.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "world",
          "sourcePath": "source/yinxing_world/",
          "role": "body",
          "prefix": true
        }
      ],
      "coverage": "仅当前快照匹配到的公开 Markdown 文件，入口、配套文字和索引分别标注；不能作为完整内容总字数。HTML/PDF/站外正文未计入，同义条目或重复发布文件未进行作品级去重。",
      "known_markdown_totals": {
        "article_count": 9,
        "word_count": 11774,
        "character_count": 13600
      },
      "matched_markdown": [
        {
          "source": "world/source/_posts/record/light/阴行世界.md",
          "site": "world",
          "sourcePath": "source/_posts/record/light/阴行世界.md",
          "role": "entry",
          "word_count": 2598,
          "character_count": 3048
        },
        {
          "source": "world/source/yinxing_world/character/mosae.md",
          "site": "world",
          "sourcePath": "source/yinxing_world/character/mosae.md",
          "role": "body",
          "word_count": 946,
          "character_count": 1207
        },
        {
          "source": "world/source/yinxing_world/commission/mosae.md",
          "site": "world",
          "sourcePath": "source/yinxing_world/commission/mosae.md",
          "role": "body",
          "word_count": 1143,
          "character_count": 1307
        },
        {
          "source": "world/source/yinxing_world/commission/ruifox.md",
          "site": "world",
          "sourcePath": "source/yinxing_world/commission/ruifox.md",
          "role": "body",
          "word_count": 944,
          "character_count": 1097
        },
        {
          "source": "world/source/yinxing_world/nowadays/Connect.md",
          "site": "world",
          "sourcePath": "source/yinxing_world/nowadays/Connect.md",
          "role": "body",
          "word_count": 1184,
          "character_count": 1365
        },
        {
          "source": "world/source/yinxing_world/nowadays/Junction.md",
          "site": "world",
          "sourcePath": "source/yinxing_world/nowadays/Junction.md",
          "role": "body",
          "word_count": 1280,
          "character_count": 1434
        },
        {
          "source": "world/source/yinxing_world/nowadays/Light.md",
          "site": "world",
          "sourcePath": "source/yinxing_world/nowadays/Light.md",
          "role": "body",
          "word_count": 1118,
          "character_count": 1246
        },
        {
          "source": "world/source/yinxing_world/nowadays/Waiting.md",
          "site": "world",
          "sourcePath": "source/yinxing_world/nowadays/Waiting.md",
          "role": "body",
          "word_count": 1136,
          "character_count": 1284
        },
        {
          "source": "world/source/yinxing_world/resion/shiheng.md",
          "site": "world",
          "sourcePath": "source/yinxing_world/resion/shiheng.md",
          "role": "body",
          "word_count": 1425,
          "character_count": 1612
        }
      ]
    },
    {
      "id": "light-withme",
      "name": "光与流辰",
      "aliases": [
        "光引流辰",
        "light_withme"
      ],
      "meaning": "WORLD 保留介绍和协作配套内容，测试主体位于 ZERO，不等于 WORLD 的同名入口页。",
      "primary_sites": [
        "zero"
      ],
      "supporting_sites": [
        "world"
      ],
      "unindexed_resources": [
        {
          "site": "zero",
          "path": "source/cogn/index.html",
          "kind": "HTML 测试主体",
          "counted": false
        },
        {
          "site": "zero",
          "path": "source/NINE/index.html",
          "kind": "HTML 测试主体",
          "counted": false
        },
        {
          "site": "zero",
          "path": "source/oc_world/index.html",
          "kind": "HTML 测试主体",
          "counted": false
        }
      ],
      "configured_markdown_scopes": [
        {
          "site": "world",
          "sourcePath": "source/_posts/record/light/光与流辰.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "world",
          "sourcePath": "source/light_withme/",
          "role": "support",
          "prefix": true
        },
        {
          "site": "zero",
          "sourcePath": "source/SCHNIE_test/",
          "role": "primary-index",
          "prefix": true
        },
        {
          "site": "zero",
          "sourcePath": "source/_posts/SCHNIE-test.md",
          "role": "primary-index",
          "prefix": false
        }
      ],
      "coverage": "仅当前快照匹配到的公开 Markdown 文件，入口、配套文字和索引分别标注；不能作为完整内容总字数。HTML/PDF/站外正文未计入，同义条目或重复发布文件未进行作品级去重。",
      "known_markdown_totals": {
        "article_count": 5,
        "word_count": 3934,
        "character_count": 4993
      },
      "matched_markdown": [
        {
          "source": "world/source/_posts/record/light/光与流辰.md",
          "site": "world",
          "sourcePath": "source/_posts/record/light/光与流辰.md",
          "role": "entry",
          "word_count": 177,
          "character_count": 191
        },
        {
          "source": "world/source/light_withme/key_part/index.md",
          "site": "world",
          "sourcePath": "source/light_withme/key_part/index.md",
          "role": "support",
          "word_count": 437,
          "character_count": 570
        },
        {
          "source": "world/source/light_withme/operator/index.md",
          "site": "world",
          "sourcePath": "source/light_withme/operator/index.md",
          "role": "support",
          "word_count": 382,
          "character_count": 460
        },
        {
          "source": "zero/source/_posts/SCHNIE-test.md",
          "site": "zero",
          "sourcePath": "source/_posts/SCHNIE-test.md",
          "role": "primary-index",
          "word_count": 1469,
          "character_count": 1886
        },
        {
          "source": "zero/source/SCHNIE_test/index.md",
          "site": "zero",
          "sourcePath": "source/SCHNIE_test/index.md",
          "role": "primary-index",
          "word_count": 1469,
          "character_count": 1886
        }
      ]
    },
    {
      "id": "yanghui-days",
      "name": "阳汇彼日",
      "aliases": [
        "yanghui_days"
      ],
      "meaning": "概述性介绍与 ZERO 的 2025 设定集；PDF 正文未进入 Markdown 统计。",
      "primary_sites": [
        "zero"
      ],
      "supporting_sites": [
        "world"
      ],
      "shared_indexes": [
        "zero:source/core/index.md",
        "zero:source/_posts/core.md",
        "zero:source/struct/index.md",
        "zero:source/_posts/struct.md"
      ],
      "shared_index_counting": "共享索引含多个主题，仅供定位，不整页计入本概念字数；缺少段落级范围时不补猜设定集正文总量。",
      "unindexed_resources": [
        {
          "site": "zero",
          "path": "source/download/seablue.pdf",
          "kind": "2025 设定集 PDF",
          "counted": false
        }
      ],
      "configured_markdown_scopes": [
        {
          "site": "world",
          "sourcePath": "source/_posts/record/light/阳汇彼日.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "world",
          "sourcePath": "source/yanghui_days/",
          "role": "entry",
          "prefix": true
        }
      ],
      "coverage": "仅当前快照匹配到的公开 Markdown 文件，入口、配套文字和索引分别标注；不能作为完整内容总字数。HTML/PDF/站外正文未计入，同义条目或重复发布文件未进行作品级去重。",
      "known_markdown_totals": {
        "article_count": 2,
        "word_count": 1290,
        "character_count": 1573
      },
      "matched_markdown": [
        {
          "source": "world/source/_posts/record/light/阳汇彼日.md",
          "site": "world",
          "sourcePath": "source/_posts/record/light/阳汇彼日.md",
          "role": "entry",
          "word_count": 1290,
          "character_count": 1573
        },
        {
          "source": "world/source/yanghui_days/index.md",
          "site": "world",
          "sourcePath": "source/yanghui_days/index.md",
          "role": "entry",
          "word_count": 0,
          "character_count": 0
        }
      ]
    },
    {
      "id": "bingjie-domain",
      "name": "冰结明域",
      "aliases": [
        "bingjie_domain"
      ],
      "meaning": "网站、微信公众号等平台集合；已入库的介绍文字不等于所有平台内容总量。",
      "primary_sites": [],
      "supporting_sites": [
        "world"
      ],
      "unindexed_resources": [
        {
          "site": "external",
          "path": "各网站及微信公众号等平台内容",
          "kind": "平台内容，未完整采集",
          "counted": false
        }
      ],
      "configured_markdown_scopes": [
        {
          "site": "world",
          "sourcePath": "source/_posts/record/light/冰结明域.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "world",
          "sourcePath": "source/bingjie_domain/",
          "role": "entry",
          "prefix": true
        }
      ],
      "coverage": "仅当前快照匹配到的公开 Markdown 文件，入口、配套文字和索引分别标注；不能作为完整内容总字数。HTML/PDF/站外正文未计入，同义条目或重复发布文件未进行作品级去重。",
      "known_markdown_totals": {
        "article_count": 2,
        "word_count": 114,
        "character_count": 122
      },
      "matched_markdown": [
        {
          "source": "world/source/_posts/record/light/冰结明域.md",
          "site": "world",
          "sourcePath": "source/_posts/record/light/冰结明域.md",
          "role": "entry",
          "word_count": 114,
          "character_count": 122
        },
        {
          "source": "world/source/bingjie_domain/index.md",
          "site": "world",
          "sourcePath": "source/bingjie_domain/index.md",
          "role": "entry",
          "word_count": 0,
          "character_count": 0
        }
      ]
    },
    {
      "id": "zero-core",
      "name": "三大观点、金泽范式与火神契约",
      "aliases": [
        "人生观",
        "世界观",
        "自然观",
        "金泽范式",
        "火神契约"
      ],
      "meaning": "主要内容在 ZERO；WORLD 同名文件是入口。ZERO 的 core Markdown 也主要是资源索引。",
      "primary_sites": [
        "zero"
      ],
      "supporting_sites": [
        "world"
      ],
      "unindexed_resources": [
        {
          "site": "zero",
          "path": "source/download/第九边缘：人生行迹.pdf",
          "kind": "核心内容 PDF",
          "counted": false
        },
        {
          "site": "zero",
          "path": "source/download/第九边缘：宇宙基础.pdf",
          "kind": "核心内容 PDF",
          "counted": false
        },
        {
          "site": "zero",
          "path": "source/download/第九边缘：自然万态.pdf",
          "kind": "核心内容 PDF",
          "counted": false
        },
        {
          "site": "zero",
          "path": "source/download/第九边缘：火神契约.pdf",
          "kind": "核心内容 PDF",
          "counted": false
        },
        {
          "site": "zero",
          "path": "source/download/灵耀体系：金泽范式.pdf",
          "kind": "核心内容 PDF",
          "counted": false
        }
      ],
      "configured_markdown_scopes": [
        {
          "site": "world",
          "sourcePath": "source/_posts/core/人生行迹.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "world",
          "sourcePath": "source/_posts/core/宇宙基础.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "world",
          "sourcePath": "source/_posts/core/自然万态.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "world",
          "sourcePath": "source/_posts/create/light/火神契约.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "world",
          "sourcePath": "source/_posts/perception/light/金泽范式.md",
          "role": "entry",
          "prefix": false
        },
        {
          "site": "zero",
          "sourcePath": "source/core/",
          "role": "primary-index",
          "prefix": true
        },
        {
          "site": "zero",
          "sourcePath": "source/_posts/core.md",
          "role": "primary-index",
          "prefix": false
        }
      ],
      "coverage": "仅当前快照匹配到的公开 Markdown 文件，入口、配套文字和索引分别标注；不能作为完整内容总字数。HTML/PDF/站外正文未计入，同义条目或重复发布文件未进行作品级去重。",
      "known_markdown_totals": {
        "article_count": 7,
        "word_count": 290,
        "character_count": 349
      },
      "matched_markdown": [
        {
          "source": "world/source/_posts/core/人生行迹.md",
          "site": "world",
          "sourcePath": "source/_posts/core/人生行迹.md",
          "role": "entry",
          "word_count": 15,
          "character_count": 16
        },
        {
          "source": "world/source/_posts/core/宇宙基础.md",
          "site": "world",
          "sourcePath": "source/_posts/core/宇宙基础.md",
          "role": "entry",
          "word_count": 11,
          "character_count": 11
        },
        {
          "source": "world/source/_posts/core/自然万态.md",
          "site": "world",
          "sourcePath": "source/_posts/core/自然万态.md",
          "role": "entry",
          "word_count": 11,
          "character_count": 11
        },
        {
          "source": "world/source/_posts/create/light/火神契约.md",
          "site": "world",
          "sourcePath": "source/_posts/create/light/火神契约.md",
          "role": "entry",
          "word_count": 11,
          "character_count": 11
        },
        {
          "source": "world/source/_posts/perception/light/金泽范式.md",
          "site": "world",
          "sourcePath": "source/_posts/perception/light/金泽范式.md",
          "role": "entry",
          "word_count": 11,
          "character_count": 11
        },
        {
          "source": "zero/source/_posts/core.md",
          "site": "zero",
          "sourcePath": "source/_posts/core.md",
          "role": "primary-index",
          "word_count": 123,
          "character_count": 152
        },
        {
          "source": "zero/source/core/index.md",
          "site": "zero",
          "sourcePath": "source/core/index.md",
          "role": "primary-index",
          "word_count": 108,
          "character_count": 137
        }
      ]
    }
  ],
  "articles": [
    {
      "source": "blog/source/_posts/GitHub Webhook 驱动多站点 RAG 知识库自动更新.md",
      "site": "blog",
      "sourcePath": "source/_posts/GitHub Webhook 驱动多站点 RAG 知识库自动更新.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "GitHub Webhook 驱动多站点 RAG 知识库自动更新",
      "url": "https://blog.sch-nie.com/posts/webhook-rag-sync.html",
      "frontmatter": {
        "layout": "pages",
        "title": "GitHub Webhook 驱动多站点 RAG 知识库自动更新",
        "abbrlink": "webhook-rag-sync",
        "author": "站点维护者",
        "date": "2026-10-17T01:52:00.000Z",
        "updated": "2026-10-17T01:52:00.000Z",
        "categories": [
          "网站设计"
        ],
        "tags": [
          "GitHub Webhook",
          "GitHub Actions",
          "RAG",
          "Vercel",
          "接口安全"
        ],
        "description": "使用 GitHub Webhook、Vercel 接收接口和 repository_dispatch，实现多站点 Markdown 的只读采集、统计总览与 RAG 向量库自动更新。",
        "content_stats": {
          "schema": 1,
          "word_count": 3864,
          "han_characters": 3535,
          "non_han_words": 329,
          "character_count": 5884,
          "content_hash": "b77aa0e5b0267fe619ab9f4a4cd82fd3306897c3eb9fea901cc7a07f933a23bc"
        }
      }
    },
    {
      "source": "blog/source/_posts/Hexo/Hexo-Butterfly 聊天界面魔改：DeepSeek 风格文字瞬间.md",
      "site": "blog",
      "sourcePath": "source/_posts/Hexo/Hexo-Butterfly 聊天界面魔改：DeepSeek 风格文字瞬间.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "Hexo-Butterfly 聊天界面魔改：DeepSeek 风格文字瞬间",
      "url": "https://blog.sch-nie.com/posts/1a2b3c4d.html",
      "frontmatter": {
        "title": "Hexo-Butterfly 聊天界面魔改：DeepSeek 风格文字瞬间",
        "tags": [
          "hexo",
          "butterfly",
          "魔改"
        ],
        "abbrlink": "1a2b3c4d",
        "date": "2026-06-05T22:00:00.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 649,
          "han_characters": 515,
          "non_han_words": 134,
          "character_count": 1395,
          "content_hash": "4e72daec334996fda7e2f91a3582fe30fb8ae4077ac3a85d7950b4eb7e0197d6"
        }
      }
    },
    {
      "source": "blog/source/_posts/Hexo/HEXO万能魔改：弹窗、昼夜切换函数.md",
      "site": "blog",
      "sourcePath": "source/_posts/Hexo/HEXO万能魔改：弹窗、昼夜切换函数.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "HEXO美化：弹窗、昼夜切换调用",
      "url": "https://blog.sch-nie.com/posts/567f21d7.html",
      "frontmatter": {
        "title": "HEXO美化：弹窗、昼夜切换调用",
        "tags": "hexo",
        "abbrlink": "567f21d7",
        "date": "2025-09-21T18:33:07.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 160,
          "han_characters": 142,
          "non_han_words": 18,
          "character_count": 272,
          "content_hash": "57144ec9467aeab19e3f51e7f90bce250bdbb2f12f94e0ca7c14907c9d8d7295"
        }
      }
    },
    {
      "source": "blog/source/_posts/word-VBA弹窗问题修复.md",
      "site": "blog",
      "sourcePath": "source/_posts/word-VBA弹窗问题修复.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "一次 Word 启动宏与加载项故障的系统化排查：从权限差异定位注册表 ACL",
      "url": "https://blog.sch-nie.com/posts/null.html",
      "frontmatter": {
        "layout": "pages",
        "title": "一次 Word 启动宏与加载项故障的系统化排查：从权限差异定位注册表 ACL",
        "abbrlink": null,
        "date": "2026-09-02T10:44:48.000Z",
        "updated": "2026-09-02T10:44:48.000Z",
        "categories": [
          "技术教程"
        ],
        "tags": [
          "Microsoft Word"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 3168,
          "han_characters": 2869,
          "non_han_words": 299,
          "character_count": 4691,
          "content_hash": "6172548e9d56974295cb19ca3fe4e70c7828e1c60b549256de4c3211f7e26664"
        }
      }
    },
    {
      "source": "blog/source/_posts/世界模型x边缘智能/世界模型与大语言模型：差异、边界与协同.md",
      "site": "blog",
      "sourcePath": "source/_posts/世界模型x边缘智能/世界模型与大语言模型：差异、边界与协同.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "世界模型与大语言模型：差异、边界与协同",
      "url": "https://blog.sch-nie.com/posts/b2c3d4e5.html",
      "frontmatter": {
        "layout": "pages",
        "title": "世界模型与大语言模型：差异、边界与协同",
        "abbrlink": "b2c3d4e5",
        "author": "schrolemons",
        "date": "2026-08-11T14:10:00.000Z",
        "updated": "2026-08-11T14:10:00.000Z",
        "categories": [
          "人工智能"
        ],
        "tags": [
          "世界模型",
          "大语言模型",
          "具身智能",
          "因果推理"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 1736,
          "han_characters": 1705,
          "non_han_words": 31,
          "character_count": 1993,
          "content_hash": "c8b52d4f702d6e023b18b6be43e23f64a6de89640eaa162e4371c2d2d501d827"
        }
      }
    },
    {
      "source": "blog/source/_posts/世界模型x边缘智能/世界模型基础：概念、架构与核心能力.md",
      "site": "blog",
      "sourcePath": "source/_posts/世界模型x边缘智能/世界模型基础：概念、架构与核心能力.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "世界模型基础：概念、架构与核心能力",
      "url": "https://blog.sch-nie.com/posts/a1b2c3d4.html",
      "frontmatter": {
        "layout": "pages",
        "title": "世界模型基础：概念、架构与核心能力",
        "abbrlink": "a1b2c3d4",
        "author": "schrolemons",
        "date": "2026-08-11T14:00:00.000Z",
        "updated": "2026-08-11T14:00:00.000Z",
        "categories": [
          "人工智能"
        ],
        "tags": [
          "世界模型",
          "具身智能",
          "模型架构",
          "强化学习"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 3386,
          "han_characters": 3313,
          "non_han_words": 73,
          "character_count": 3785,
          "content_hash": "90c9dbf5ff9fce991a07cda83163d5d4739faa901e43e41de57ba87c94385cf0"
        }
      }
    },
    {
      "source": "blog/source/_posts/世界模型x边缘智能/世界模型边缘部署（上）：端侧稳定性全景.md",
      "site": "blog",
      "sourcePath": "source/_posts/世界模型x边缘智能/世界模型边缘部署（上）：端侧稳定性全景.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "世界模型边缘部署（上）：端侧稳定性全景",
      "url": "https://blog.sch-nie.com/posts/d4e5f6a7.html",
      "frontmatter": {
        "layout": "pages",
        "title": "世界模型边缘部署（上）：端侧稳定性全景",
        "abbrlink": "d4e5f6a7",
        "author": "schrolemons",
        "date": "2026-08-11T14:30:00.000Z",
        "updated": "2026-08-11T14:30:00.000Z",
        "categories": [
          "人工智能"
        ],
        "tags": [
          "世界模型",
          "边缘部署",
          "端侧稳定性",
          "实时控制"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 2422,
          "han_characters": 2395,
          "non_han_words": 27,
          "character_count": 2707,
          "content_hash": "6d233c44bf1c6e8a1a7958aacfa6cd1348f5e51fbc545b2f86914e1efa17373d"
        }
      }
    },
    {
      "source": "blog/source/_posts/世界模型x边缘智能/世界模型边缘部署（下）：资源博弈与优化路径.md",
      "site": "blog",
      "sourcePath": "source/_posts/世界模型x边缘智能/世界模型边缘部署（下）：资源博弈与优化路径.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "世界模型边缘部署（下）：资源博弈与优化路径",
      "url": "https://blog.sch-nie.com/posts/e5f6a7b8.html",
      "frontmatter": {
        "layout": "pages",
        "title": "世界模型边缘部署（下）：资源博弈与优化路径",
        "abbrlink": "e5f6a7b8",
        "author": "schrolemons",
        "date": "2026-08-11T14:40:00.000Z",
        "updated": "2026-08-11T14:40:00.000Z",
        "categories": [
          "人工智能"
        ],
        "tags": [
          "世界模型",
          "边缘部署",
          "资源优化",
          "模型压缩",
          "端边云协同"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 2340,
          "han_characters": 2322,
          "non_han_words": 18,
          "character_count": 2641,
          "content_hash": "88871b1311177dc41a0264c31998cfca16c812a8b9f2562a021aed82406e01cf"
        }
      }
    },
    {
      "source": "blog/source/_posts/世界模型x边缘智能/边缘智能：概念、动机与端边云协同.md",
      "site": "blog",
      "sourcePath": "source/_posts/世界模型x边缘智能/边缘智能：概念、动机与端边云协同.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "边缘智能：概念、动机与端边云协同",
      "url": "https://blog.sch-nie.com/posts/c3d4e5f6.html",
      "frontmatter": {
        "layout": "pages",
        "title": "边缘智能：概念、动机与端边云协同",
        "abbrlink": "c3d4e5f6",
        "author": "schrolemons",
        "date": "2026-08-11T14:20:00.000Z",
        "updated": "2026-08-11T14:20:00.000Z",
        "categories": [
          "人工智能"
        ],
        "tags": [
          "边缘智能",
          "边缘计算",
          "端边云协同",
          "模型部署"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 1852,
          "han_characters": 1826,
          "non_han_words": 26,
          "character_count": 2060,
          "content_hash": "576668a6364c7961ab100b98cd312765e908d7deba91399c8d1652fed59c3f7b"
        }
      }
    },
    {
      "source": "blog/source/_posts/从向量数据库到安全对话：AI 知识库的前后端接入实践.md",
      "site": "blog",
      "sourcePath": "source/_posts/从向量数据库到安全对话：AI 知识库的前后端接入实践.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "从向量数据库到安全对话：AI 知识库的前后端接入实践",
      "url": "https://blog.sch-nie.com/",
      "frontmatter": {
        "layout": "pages",
        "title": "从向量数据库到安全对话：AI 知识库的前后端接入实践",
        "author": "schrolemons",
        "date": "2026-09-13T01:16:27.000Z",
        "updated": "2026-09-13T01:16:27.000Z",
        "categories": [
          "网站设计"
        ],
        "tags": [
          "RAG",
          "Upstash Vector",
          "React",
          "Vercel",
          "API 安全"
        ],
        "description": "以一个真实的知识库聊天终端为例，说明 Markdown 入库、向量检索、服务端模型调用、前端流式展示及公开站点的安全防护。",
        "content_stats": {
          "schema": 1,
          "word_count": 3431,
          "han_characters": 3225,
          "non_han_words": 206,
          "character_count": 4643,
          "content_hash": "ee5657438d55b2f50ab9a95c19f811da096e45842c15ab4d66dae2ed110907bc"
        }
      }
    },
    {
      "source": "blog/source/_posts/欢迎来到SCHNIE.md",
      "site": "blog",
      "sourcePath": "source/_posts/欢迎来到SCHNIE.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "欢迎来到第九边缘",
      "url": "https://blog.sch-nie.com/posts/6b6b7c33.html",
      "frontmatter": {
        "title": "欢迎来到第九边缘",
        "tags": "SCHNIE",
        "categories": "世界",
        "cover": "/pictures/banner.png",
        "swiper_index": 99,
        "copyright_author": "Merdingersher",
        "abbrlink": "6b6b7c33",
        "date": "2024-09-01T18:40:40.000Z",
        "updated": "2024-09-24T18:40:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 3383,
          "han_characters": 3360,
          "non_han_words": 23,
          "character_count": 3856,
          "content_hash": "ef648b0a45b292e8105ca02634fd686ade0661dec20cd728c212194c1821be0f"
        }
      }
    },
    {
      "source": "blog/source/_posts/程序设计/BM算法.md",
      "site": "blog",
      "sourcePath": "source/_posts/程序设计/BM算法.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "BM算法(手算版)",
      "url": "https://blog.sch-nie.com/posts/f093fa41.html",
      "frontmatter": {
        "title": "BM算法(手算版)",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "f093fa41",
        "date": "2024-10-16T18:50:40.000Z",
        "updated": "2024-10-16T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 1619,
          "han_characters": 1279,
          "non_han_words": 340,
          "character_count": 2199,
          "content_hash": "3cda903fbe4c154ca49d2867ab4abe82fbca3bada24db4d3cbcf3cb7f36a4065"
        }
      }
    },
    {
      "source": "blog/source/_posts/程序设计/Cpp算法板子.md",
      "site": "blog",
      "sourcePath": "source/_posts/程序设计/Cpp算法板子.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "C++算法竞赛板子大全",
      "url": "https://blog.sch-nie.com/posts/cppalgo.html",
      "frontmatter": {
        "title": "C++算法竞赛板子大全",
        "tags": "算法",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "cppalgo",
        "date": "2026-06-05T14:00:00.000Z",
        "updated": "2026-06-05T14:00:00.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 4677,
          "han_characters": 4146,
          "non_han_words": 531,
          "character_count": 5955,
          "content_hash": "f0fe6ead8e5bce9e7d58889f7263b389a4dd5543c88af93fcf028fde1209cb66"
        }
      }
    },
    {
      "source": "blog/source/_posts/程序设计/MP自动机.md",
      "site": "blog",
      "sourcePath": "source/_posts/程序设计/MP自动机.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "MP有限状态自动机和AC自动机",
      "url": "https://blog.sch-nie.com/posts/2853a062.html",
      "frontmatter": {
        "title": "MP有限状态自动机和AC自动机",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2853a062",
        "date": "2024-10-21T18:50:40.000Z",
        "updated": "2024-10-21T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 1479,
          "han_characters": 1182,
          "non_han_words": 297,
          "character_count": 2123,
          "content_hash": "8518f21daf82ac01d09d1401934ecdae3013abf3ee4a9cec7e729739de6b240f"
        }
      }
    },
    {
      "source": "blog/source/_posts/程序设计/Python快速参考.md",
      "site": "blog",
      "sourcePath": "source/_posts/程序设计/Python快速参考.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "Python算法竞赛速通",
      "url": "https://blog.sch-nie.com/posts/58541536.html",
      "frontmatter": {
        "title": "Python算法竞赛速通",
        "tags": "python",
        "categories": "程序竞赛",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "58541536",
        "date": "2026-05-30T18:50:40.000Z",
        "updated": "2026-05-30T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 403,
          "han_characters": 387,
          "non_han_words": 16,
          "character_count": 519,
          "content_hash": "3168f1b4fc36fef979dd6046f77bcdff0f776ea4aa5a5d3abf08f15b6bf113dd"
        }
      }
    },
    {
      "source": "blog/source/_posts/程序设计/深度学习基本理解与语法快速入门.md",
      "site": "blog",
      "sourcePath": "source/_posts/程序设计/深度学习基本理解与语法快速入门.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "深度学习基本理解与语法快速入门",
      "url": "https://blog.sch-nie.com/posts/8a72c1d3.html",
      "frontmatter": {
        "title": "深度学习基本理解与语法快速入门",
        "tags": "深度学习,计算机视觉",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "8a72c1d3",
        "date": "2026-06-05T14:00:00.000Z",
        "updated": "2026-06-05T14:00:00.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 1715,
          "han_characters": 1244,
          "non_han_words": 471,
          "character_count": 3226,
          "content_hash": "779cacf24fb4cbeb1305cbf0542a34fc45b948287c3b8d9e622ebdb1074ca3f0"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/am.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/am.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|高等数学",
      "url": "https://blog.sch-nie.com/posts/2025g.html",
      "frontmatter": {
        "title": "cs保研经验贴|高等数学",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025g",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 2729,
          "han_characters": 2645,
          "non_han_words": 84,
          "character_count": 3224,
          "content_hash": "b0e928a8a946923c9ace0de161fc6aaac9fdff777dfd0c31a9fbd1c2b2fac1a1"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/basic.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/basic.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|计算机基础知识",
      "url": "https://blog.sch-nie.com/posts/2025e.html",
      "frontmatter": {
        "title": "cs保研经验贴|计算机基础知识",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025e",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 966,
          "han_characters": 930,
          "non_han_words": 36,
          "character_count": 1188,
          "content_hash": "b9a4bfbd1f7b2c11ab02f8ffdde5ad2c3dc7d9e6bcc5e44e1e17b95080f8f1ed"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/cn.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/cn.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|计算机网络",
      "url": "https://blog.sch-nie.com/posts/2025b.html",
      "frontmatter": {
        "title": "cs保研经验贴|计算机网络",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025b",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 7387,
          "han_characters": 6868,
          "non_han_words": 519,
          "character_count": 9713,
          "content_hash": "2a3bb0f225a6afecf00f8511075bf6acf59b4b45e522ad36329717991810818f"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/co.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/co.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|计算机组成原理",
      "url": "https://blog.sch-nie.com/posts/2025c.html",
      "frontmatter": {
        "title": "cs保研经验贴|计算机组成原理",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025c",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 3723,
          "han_characters": 3574,
          "non_han_words": 149,
          "character_count": 4576,
          "content_hash": "8645fad0274a9b0e48fe024edcf4bba7067bc40be388f7f75324e710d7ab9e8d"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/daa.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/daa.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|算法设计与分析",
      "url": "https://blog.sch-nie.com/posts/2025f.html",
      "frontmatter": {
        "title": "cs保研经验贴|算法设计与分析",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025f",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 810,
          "han_characters": 779,
          "non_han_words": 31,
          "character_count": 967,
          "content_hash": "79843b2944ae39dd2c215549fddd1b947b434c55c492895ec2a0c5cec7a2cd66"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/dm.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/dm.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|离散数学",
      "url": "https://blog.sch-nie.com/posts/2025i.html",
      "frontmatter": {
        "title": "cs保研经验贴|离散数学",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025i",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 1268,
          "han_characters": 1211,
          "non_han_words": 57,
          "character_count": 1458,
          "content_hash": "cf668fc620269b4bf3244f1459094d6c91a9af97a916cfd04245dc563a6084af"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/ds.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/ds.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|数据结构",
      "url": "https://blog.sch-nie.com/posts/2025d.html",
      "frontmatter": {
        "title": "cs保研经验贴|数据结构",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025d",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 3573,
          "han_characters": 3415,
          "non_han_words": 158,
          "character_count": 4255,
          "content_hash": "408dd3caeda994bd3053fcec4904f78b7551e70110809e8720e43326ef9966c7"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/english.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/english.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|英文面试",
      "url": "https://blog.sch-nie.com/posts/2025k.html",
      "frontmatter": {
        "title": "cs保研经验贴|英文面试",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025k",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 2109,
          "han_characters": 218,
          "non_han_words": 1891,
          "character_count": 9885,
          "content_hash": "d3c36882991edf784e1a9fa611b1843de3112db0fee141da29c9dbea6e0e1f62"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/la.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/la.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|线性代数",
      "url": "https://blog.sch-nie.com/posts/2025h.html",
      "frontmatter": {
        "title": "cs保研经验贴|线性代数",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025h",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 1214,
          "han_characters": 1154,
          "non_han_words": 60,
          "character_count": 1444,
          "content_hash": "c9c93b15401a344007641fd412882e47f8226ae90a21352d9343a7d2bbe755a8"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/os.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/os.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|操作系统",
      "url": "https://blog.sch-nie.com/posts/2025a.html",
      "frontmatter": {
        "title": "cs保研经验贴|操作系统",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025a",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 3988,
          "han_characters": 3905,
          "non_han_words": 83,
          "character_count": 4728,
          "content_hash": "26a44fbc3ba4c068afda8f539f4ee1bbe48b6431db14d5ffd9b545e51e637e6f"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机保研/ptms.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机保研/ptms.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|概率论与数理统计",
      "url": "https://blog.sch-nie.com/posts/2025j.html",
      "frontmatter": {
        "title": "cs保研经验贴|概率论与数理统计",
        "tags": "计算机保研",
        "categories": "预推免",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "2025j",
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 1792,
          "han_characters": 1736,
          "non_han_words": 56,
          "character_count": 2076,
          "content_hash": "0c6527ecb96fe153681f1d9fc8528fb7178c0be8eb180e36d15bd4b888d15600"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/俄国农民.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/俄国农民.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：俄国农民指数算法",
      "url": "https://blog.sch-nie.com/posts/db01f830.html",
      "frontmatter": {
        "title": "计算机安全：俄国农民指数算法",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "db01f830",
        "date": "2024-09-15T15:50:40.000Z",
        "updated": "2024-10-09T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 227,
          "han_characters": 201,
          "non_han_words": 26,
          "character_count": 290,
          "content_hash": "64b701a5e67f41c90915ea5f3d099d86f26b0a0edb5b4b29e341d044599a2816"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/入侵检测.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/入侵检测.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：入侵检测系统",
      "url": "https://blog.sch-nie.com/posts/8c8bc191.html",
      "frontmatter": {
        "title": "计算机安全：入侵检测系统",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "8c8bc191",
        "date": "2024-10-07T18:50:40.000Z",
        "updated": "2024-10-09T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 1670,
          "han_characters": 1574,
          "non_han_words": 96,
          "character_count": 2202,
          "content_hash": "b14e0c1b8091d81d220774b7e11d7b9da3f7aea9b5ea4782c4ffab0fd6b07d8f"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/内存溢出.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/内存溢出.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：buffer overflow attack",
      "url": "https://blog.sch-nie.com/posts/1e6d162f.html",
      "frontmatter": {
        "title": "计算机安全：buffer overflow attack",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "1e6d162f",
        "date": "2024-10-07T18:50:40.000Z",
        "updated": "2024-10-09T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 896,
          "han_characters": 776,
          "non_han_words": 120,
          "character_count": 1411,
          "content_hash": "0823b175b1dabf4f5ccb4783607f9b882252396f46ccad89e4aef043c707d219"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/参考试题1.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/参考试题1.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：参考试题答案",
      "url": "https://blog.sch-nie.com/posts/1ea5ee87.html",
      "frontmatter": {
        "title": "计算机安全：参考试题答案",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "hide": true,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "1ea5ee87",
        "date": "2024-11-04T19:50:40.000Z",
        "updated": "2024-11-04T19:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 896,
          "han_characters": 607,
          "non_han_words": 289,
          "character_count": 1500,
          "content_hash": "d10481eef111809c4020661711ca98d47eba757f01acb1a9d4a2dc0437807fc8"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/参考试题2.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/参考试题2.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：参考试题答案2",
      "url": "https://blog.sch-nie.com/posts/69170d60.html",
      "frontmatter": {
        "title": "计算机安全：参考试题答案2",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "hide": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "69170d60",
        "date": "2024-11-08T19:50:40.000Z",
        "updated": "2024-11-08T19:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 596,
          "han_characters": 330,
          "non_han_words": 266,
          "character_count": 1202,
          "content_hash": "8fb18e1a0654324bb6e0ebf1ccf64e66c901a21264ee3005bc966648dda48fce"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/安全协议.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/安全协议.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：安全协议",
      "url": "https://blog.sch-nie.com/posts/24329b97.html",
      "frontmatter": {
        "title": "计算机安全：安全协议",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "24329b97",
        "date": "2024-09-17T22:50:40.000Z",
        "updated": "2024-10-09T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 2089,
          "han_characters": 1797,
          "non_han_words": 292,
          "character_count": 2780,
          "content_hash": "60f3ce1a240403a8d9d0b5b1be32abcb3d321d08db05467d3e1393d863960a3b"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/安全策略.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/安全策略.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：安全策略",
      "url": "https://blog.sch-nie.com/posts/a5baeaeb.html",
      "frontmatter": {
        "title": "计算机安全：安全策略",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "a5baeaeb",
        "date": "2024-10-06T11:50:40.000Z",
        "updated": "2024-11-02T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 2726,
          "han_characters": 2533,
          "non_han_words": 193,
          "character_count": 3380,
          "content_hash": "4d137e7f6c3ed5c9030978c21004d428e4c439713d06641827ccd66e4d5045ec"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/安全计算.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/安全计算.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：安全计算",
      "url": "https://blog.sch-nie.com/posts/bc7c7b.html",
      "frontmatter": {
        "title": "计算机安全：安全计算",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "bc7c7b",
        "date": "2024-09-15T18:50:40.000Z",
        "updated": "2024-10-09T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 1558,
          "han_characters": 1216,
          "non_han_words": 342,
          "character_count": 2020,
          "content_hash": "b33d2a2cbb60d6ae246398bede1155f6ca0c23a8643cda862d40a0eb8ed5a639"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/快速比特操纵.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/快速比特操纵.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：快速比特操纵算法",
      "url": "https://blog.sch-nie.com/posts/7511bdb5.html",
      "frontmatter": {
        "title": "计算机安全：快速比特操纵算法",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "7511bdb5",
        "cover": "/study/jsjaq.png",
        "date": "2024-09-16T12:50:40.000Z",
        "updated": "2024-10-25T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 2958,
          "han_characters": 2318,
          "non_han_words": 640,
          "character_count": 4424,
          "content_hash": "da5f4d03aabff4b560de5f0e9f82be6d836c1d42b23f6f18bf5a1cd4c1debdef"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/算法优化.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/算法优化.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：算法优化",
      "url": "https://blog.sch-nie.com/posts/5f4e56a6.html",
      "frontmatter": {
        "title": "计算机安全：算法优化",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "cover": "/study/jsjaq.png",
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "5f4e56a6",
        "date": "2024-09-30T15:50:40.000Z",
        "updated": "2024-10-22T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 684,
          "han_characters": 648,
          "non_han_words": 36,
          "character_count": 810,
          "content_hash": "90b9d4e75dde7db408c57bba0502127adb95531a2976915ed7d6422f4000127f"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/蒙哥马利约减.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/蒙哥马利约减.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：蒙哥马利约减",
      "url": "https://blog.sch-nie.com/posts/11252e67.html",
      "frontmatter": {
        "title": "计算机安全：蒙哥马利约减",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "cover": "/study/jsjaq.png",
        "copyright_author": "薛定谔柠檬",
        "abbrlink": "11252e67",
        "date": "2024-09-15T15:50:40.000Z",
        "updated": "2024-10-20T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 973,
          "han_characters": 634,
          "non_han_words": 339,
          "character_count": 1621,
          "content_hash": "687c38c785ff23f62302afbe78c3646ce2051b8bb97a9b3537eebe8f841c32f1"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/计算机安全参考提示.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/计算机安全参考提示.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：参考提示",
      "url": "https://blog.sch-nie.com/posts/f092a9ef.html",
      "frontmatter": {
        "title": "计算机安全：参考提示",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "hide": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "f092a9ef",
        "date": "2024-10-07T11:50:40.000Z",
        "updated": "2024-10-07T11:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 282,
          "han_characters": 210,
          "non_han_words": 72,
          "character_count": 639,
          "content_hash": "444d4f1d5b9d55f414863cb2528828d89f2ad4e54a0168ab2b9062ff64bacfb2"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/量子密钥协商.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/量子密钥协商.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：量子密钥协商",
      "url": "https://blog.sch-nie.com/posts/29d1b803.html",
      "frontmatter": {
        "title": "计算机安全：量子密钥协商",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "29d1b803",
        "date": "2024-10-06T11:50:40.000Z",
        "updated": "2024-10-09T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 505,
          "han_characters": 442,
          "non_han_words": 63,
          "character_count": 642,
          "content_hash": "d405c4aee358a5a532e35e42f8253c2288b6b8774982c6059dc51240b2250428"
        }
      }
    },
    {
      "source": "blog/source/_posts/计算机安全/门限秘密.md",
      "site": "blog",
      "sourcePath": "source/_posts/计算机安全/门限秘密.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "计算机安全：门限秘密分享",
      "url": "https://blog.sch-nie.com/posts/a91656d0.html",
      "frontmatter": {
        "title": "计算机安全：门限秘密分享",
        "tags": "计算机安全",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 10,
        "copyright_author": "薛定谔柠檬",
        "cover": "/study/jsjaq.png",
        "abbrlink": "a91656d0",
        "date": "2024-10-07T18:50:40.000Z",
        "updated": "2024-10-09T15:50:40.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 180,
          "han_characters": 98,
          "non_han_words": 82,
          "character_count": 364,
          "content_hash": "833b6203b8d65ee7d5f0fbf86896f62bc2a91e58c89cf5562854df67fd89f3af"
        }
      }
    },
    {
      "source": "blog/source/about/index.md",
      "site": "blog",
      "sourcePath": "source/about/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "HEXO CLEAN;HEXO GENERATE;HEXO DEPLOY",
      "url": "https://blog.sch-nie.com/about/",
      "frontmatter": {
        "title": "HEXO CLEAN;HEXO GENERATE;HEXO DEPLOY",
        "date": "2024-09-01T11:44:03.000Z",
        "cover": "/pictures/SCHNIE.png",
        "content_stats": {
          "schema": 1,
          "word_count": 80,
          "han_characters": 63,
          "non_han_words": 17,
          "character_count": 132,
          "content_hash": "2554a588154a5aa9d1b2d43f474b54369ecea1cb928affe5dfe5f0b5b18604a2"
        }
      }
    },
    {
      "source": "blog/source/categories/index.md",
      "site": "blog",
      "sourcePath": "source/categories/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "类别",
      "url": "https://blog.sch-nie.com/categories/",
      "frontmatter": {
        "title": "类别",
        "date": "2024-09-01T11:44:03.000Z",
        "type": "categories",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "blog/source/cs2025/index.md",
      "site": "blog",
      "sourcePath": "source/cs2025/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "cs保研经验贴|文书准备、复习资料|中科大计算机|稳中求胜策略",
      "url": "https://blog.sch-nie.com/cs2025/",
      "frontmatter": {
        "title": "cs保研经验贴|文书准备、复习资料|中科大计算机|稳中求胜策略",
        "tags": "计算机保研",
        "categories": "计算机",
        "comments": true,
        "swiper_index": 100,
        "copyright_author": "薛定谔柠檬",
        "abbrlink": 2025,
        "date": "2025-9-23",
        "content_stats": {
          "schema": 1,
          "word_count": 5712,
          "han_characters": 5550,
          "non_han_words": 162,
          "character_count": 6905,
          "content_hash": "d6458560db60c709fecdedbe43c7b0dca98c4ba6ae6c7c91f75dec16434d1522"
        }
      }
    },
    {
      "source": "blog/source/essay/index.md",
      "site": "blog",
      "sourcePath": "source/essay/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "即刻短文",
      "url": "https://blog.sch-nie.com/essay/",
      "frontmatter": {
        "title": "即刻短文",
        "date": "2024-07-22T22:06:17.000Z",
        "comments": true,
        "aside": false,
        "top_img": false,
        "type": "essay",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "blog/source/IQtest/isit/index.md",
      "site": "blog",
      "sourcePath": "source/IQtest/isit/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "高水平智力测试",
      "url": "https://blog.sch-nie.com/IQtest/isit/",
      "frontmatter": {
        "title": "高水平智力测试",
        "date": "2025-06-01T11:44:03.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 8,
          "han_characters": 2,
          "non_han_words": 6,
          "character_count": 38,
          "content_hash": "28f1a1299a1d8fa09f84cb50def114e6cf6ebb4f2fde3dbf904a475be9d06879"
        }
      }
    },
    {
      "source": "blog/source/link/index.md",
      "site": "blog",
      "sourcePath": "source/link/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "这里是我的朋友",
      "url": "https://blog.sch-nie.com/link/",
      "frontmatter": {
        "title": "这里是我的朋友",
        "date": "2024-09-01T11:44:03.000Z",
        "type": "link",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "6a3cf5192354f71615ac51034b3e97c20eda99643fcaf5bbe6d41ad59bd12167"
        }
      }
    },
    {
      "source": "blog/source/recommend/game/index.md",
      "site": "blog",
      "sourcePath": "source/recommend/game/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "这里有...我喜欢的游戏！",
      "url": "https://blog.sch-nie.com/recommend/game/",
      "frontmatter": {
        "title": "这里有...我喜欢的游戏！",
        "date": "2024-09-01T11:44:03.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 84,
          "han_characters": 83,
          "non_han_words": 1,
          "character_count": 92,
          "content_hash": "44089e68972278175b71d49849eaad3df5093136ce1ee7390e21b5ea0b8f1976"
        }
      }
    },
    {
      "source": "blog/source/recommend/video_show/index.md",
      "site": "blog",
      "sourcePath": "source/recommend/video_show/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "这里有...我喜欢的视频！",
      "url": "https://blog.sch-nie.com/recommend/video_show/",
      "frontmatter": {
        "title": "这里有...我喜欢的视频！",
        "date": "2024-09-08T09:05:34.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 70,
          "han_characters": 68,
          "non_han_words": 2,
          "character_count": 83,
          "content_hash": "dda4eb9442d960aec3338a0814d337b875c9c1afacd383aa95c7f501d4da58bf"
        }
      }
    },
    {
      "source": "blog/source/recommend/web_show/index.md",
      "site": "blog",
      "sourcePath": "source/recommend/web_show/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "这里是我推荐的网站",
      "url": "https://blog.sch-nie.com/recommend/web_show/",
      "frontmatter": {
        "title": "这里是我推荐的网站",
        "date": "2024-09-01T11:44:03.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 8,
          "han_characters": 8,
          "non_han_words": 0,
          "character_count": 8,
          "content_hash": "bd5b2eb39b6683daa0fe275161c23e1d960dbb3df029437f66c6c32091cc57f9"
        }
      }
    },
    {
      "source": "blog/source/records/index.md",
      "site": "blog",
      "sourcePath": "source/records/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "文字瞬间",
      "url": "https://blog.sch-nie.com/records/",
      "frontmatter": {
        "title": "文字瞬间",
        "date": "2026-06-05T12:00:00.000Z",
        "type": "records",
        "top_img": false,
        "aside": false,
        "comments": false,
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "blog/source/reward/index.md",
      "site": "blog",
      "sourcePath": "source/reward/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "赞赏名单",
      "url": "https://blog.sch-nie.com/reward/",
      "frontmatter": {
        "title": "赞赏名单",
        "date": "2024-03-30T15:57:51.000Z",
        "aside": false,
        "top_img": false,
        "background": "#f8f9fe",
        "type": "reward",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 10,
          "han_characters": 10,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "495e85c7d2ef6fadc542f42cc9a1fb5ec338e0e3a0b054c9b8571a378219f90f"
        }
      }
    },
    {
      "source": "blog/source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "site": "blog",
      "sourcePath": "source/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "index",
      "url": "https://blog.sch-nie.com/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/SCHNIE/",
      "frontmatter": {
        "content_stats": {
          "schema": 1,
          "word_count": 3,
          "han_characters": 2,
          "non_han_words": 1,
          "character_count": 11,
          "content_hash": "864e09b9f08c423522434546334a53e7a18920446eab5ee1eac4ee3a9ad50c52"
        }
      }
    },
    {
      "source": "blog/source/tags/index.md",
      "site": "blog",
      "sourcePath": "source/tags/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "标签",
      "url": "https://blog.sch-nie.com/tags/",
      "frontmatter": {
        "title": "标签",
        "date": "2024-09-01T12:00:00.000Z",
        "type": "tags",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "blog/source/todolist/index.md",
      "site": "blog",
      "sourcePath": "source/todolist/index.md",
      "sourceRepository": "schrolemons/schrolemons.github.io",
      "category": "blog",
      "title": "ToDoList",
      "url": "https://blog.sch-nie.com/todolist/",
      "frontmatter": {
        "title": "ToDoList",
        "date": "2025-03-18T14:07:13.000Z",
        "aside": false,
        "type": "todolist",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "world/source/_posts/core/人生行迹.md",
      "site": "world",
      "sourcePath": "source/_posts/core/人生行迹.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "zero",
      "title": "人生观",
      "url": "https://zero.sch-nie.com/core/",
      "frontmatter": {
        "layout": "pages",
        "title": "人生观",
        "abbrlink": 97,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "哲学条目"
        ],
        "reading_style": "info",
        "reading_tone": "cyan",
        "content_stats": {
          "schema": 1,
          "word_count": 15,
          "han_characters": 15,
          "non_han_words": 0,
          "character_count": 16,
          "content_hash": "6d78a9e34ed4ed5647abf3f02979ab3360a59a5254f12ba3e652a3a74aee260f"
        }
      }
    },
    {
      "source": "world/source/_posts/core/宇宙基础.md",
      "site": "world",
      "sourcePath": "source/_posts/core/宇宙基础.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "zero",
      "title": "世界观",
      "url": "https://zero.sch-nie.com/core/",
      "frontmatter": {
        "layout": "pages",
        "title": "宇宙观",
        "abbrlink": 99,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "哲学条目"
        ],
        "reading_style": "info",
        "reading_tone": "cyan",
        "content_stats": {
          "schema": 1,
          "word_count": 11,
          "han_characters": 11,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "145af1ecf5db161eed0acf397a5bd6b44b16b0fd55028b8588610bfccf09e458"
        }
      }
    },
    {
      "source": "world/source/_posts/core/自然万态.md",
      "site": "world",
      "sourcePath": "source/_posts/core/自然万态.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "zero",
      "title": "自然观",
      "url": "https://zero.sch-nie.com/core/",
      "frontmatter": {
        "layout": "pages",
        "title": "自然观",
        "abbrlink": 98,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "哲学条目"
        ],
        "reading_style": "info",
        "reading_tone": "cyan",
        "content_stats": {
          "schema": 1,
          "word_count": 11,
          "han_characters": 11,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "53e42f2fe79876f6ddc641bdf2270d6d31e316089630198a9658368a06862494"
        }
      }
    },
    {
      "source": "world/source/_posts/create/light/火神契约.md",
      "site": "world",
      "sourcePath": "source/_posts/create/light/火神契约.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "zero",
      "title": "火神契约",
      "url": "https://zero.sch-nie.com/core/",
      "frontmatter": {
        "title": "灵耀体系：火神契约",
        "abbrlink": 22,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "哲学杂谈"
        ],
        "tags": [
          "火",
          "灵耀体系",
          "创造"
        ],
        "reading_style": "info",
        "reading_tone": "rose",
        "content_stats": {
          "schema": 1,
          "word_count": 11,
          "han_characters": 11,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "412a4e389e2a097a65b301fdd68c8a1f58aabc3482cfd802a2f01b00a539acc3"
        }
      }
    },
    {
      "source": "world/source/_posts/create/light/草引囚徒.md",
      "site": "world",
      "sourcePath": "source/_posts/create/light/草引囚徒.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：草引囚徒",
      "url": "https://world.sch-nie.com/posts/8.html",
      "frontmatter": {
        "title": "灵耀体系：草引囚徒",
        "abbrlink": 8,
        "updated": "2026-10-01T22:05:29+08:00",
        "author": "schrolemons",
        "top": 50,
        "categories": [
          "终末文明",
          "额外事件"
        ],
        "tags": [
          "草",
          "灵耀体系",
          "创造"
        ],
        "reading_style": "story",
        "reading_tone": "green",
        "content_stats": {
          "schema": 1,
          "word_count": 10360,
          "han_characters": 10355,
          "non_han_words": 5,
          "character_count": 11881,
          "content_hash": "352318f1ed97e2956dc8848a914e68b9443279eda0c914bcc8612310eba96f5d"
        }
      }
    },
    {
      "source": "world/source/_posts/create/light/雷云之梦.md",
      "site": "world",
      "sourcePath": "source/_posts/create/light/雷云之梦.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：雷云之梦",
      "url": "https://world.sch-nie.com/posts/7.html",
      "frontmatter": {
        "title": "灵耀体系：雷云之梦",
        "abbrlink": 7,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "额外事件"
        ],
        "tags": [
          "雷",
          "灵耀体系",
          "创造"
        ],
        "reading_style": "story",
        "reading_tone": "violet",
        "content_stats": {
          "schema": 1,
          "word_count": 7001,
          "han_characters": 6995,
          "non_han_words": 6,
          "character_count": 7843,
          "content_hash": "4d5a175971b9d8f6e42cc4a66ede8045936863be051bd17b3776d64598f3b395"
        }
      }
    },
    {
      "source": "world/source/_posts/create/light/风落和鸣.md",
      "site": "world",
      "sourcePath": "source/_posts/create/light/风落和鸣.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：风落和鸣",
      "url": "https://world.sch-nie.com/posts/1117.html",
      "frontmatter": {
        "title": "灵耀体系：风落和鸣",
        "abbrlink": 1117,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "九虹文明",
          "额外事件"
        ],
        "tags": [
          "风",
          "灵耀体系",
          "创造"
        ],
        "reading_style": "story",
        "reading_tone": "cyan",
        "content_stats": {
          "schema": 1,
          "word_count": 5335,
          "han_characters": 5334,
          "non_han_words": 1,
          "character_count": 6020,
          "content_hash": "05cad4fc6a45a4dcf68fc415906c7cd863903fd2c923c67f8ab64127a71bb3e5"
        }
      }
    },
    {
      "source": "world/source/_posts/create/nine/初醒之刻.md",
      "site": "world",
      "sourcePath": "source/_posts/create/nine/初醒之刻.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "炽晨：初醒之刻",
      "url": "https://world.sch-nie.com/posts/18.html",
      "frontmatter": {
        "layout": "pages",
        "title": "炽晨：初醒之刻",
        "abbrlink": 18,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "top": 98,
        "categories": [
          "终末文明",
          "文明历程"
        ],
        "tags": [
          "火",
          "九虹重启",
          "创造"
        ],
        "reading_style": "story",
        "reading_tone": "rose",
        "content_stats": {
          "schema": 1,
          "word_count": 9894,
          "han_characters": 9869,
          "non_han_words": 25,
          "character_count": 11409,
          "content_hash": "1348ebfa584787b44398837f8ada342aa5ab4067f30a3617678718e356889efb"
        }
      }
    },
    {
      "source": "world/source/_posts/create/nine/星源绘逢.md",
      "site": "world",
      "sourcePath": "source/_posts/create/nine/星源绘逢.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "跨世：星源绘逢",
      "url": "https://world.sch-nie.com/posts/30.html",
      "frontmatter": {
        "layout": "pages",
        "title": "跨世：星源绘逢",
        "abbrlink": 30,
        "author": "schrolemons",
        "updated": "2026-10-21T18:44:04+08:00",
        "categories": [
          "九虹文明",
          "文明历程"
        ],
        "tags": [
          "雷",
          "九虹重启",
          "创造"
        ],
        "reading_style": "story",
        "reading_tone": "violet",
        "content_stats": {
          "schema": 1,
          "word_count": 13328,
          "han_characters": 13328,
          "non_han_words": 0,
          "character_count": 15402,
          "content_hash": "8f3912479a66978a96d813fdaa352b3b79ae14b3803c19c2999838919e74ea4e"
        }
      }
    },
    {
      "source": "world/source/_posts/create/nine/烬择浮影.md",
      "site": "world",
      "sourcePath": "source/_posts/create/nine/烬择浮影.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "离迹：烬择浮影",
      "url": "https://world.sch-nie.com/posts/4.html",
      "frontmatter": {
        "layout": "pages",
        "title": "离迹：烬择浮影",
        "abbrlink": 4,
        "author": "schrolemons",
        "updated": "2026-10-02T01:07:46+08:00",
        "categories": [
          "九虹文明",
          "文明历程"
        ],
        "tags": [
          "草",
          "九虹重启",
          "创造"
        ],
        "reading_style": "story",
        "reading_tone": "green",
        "content_stats": {
          "schema": 1,
          "word_count": 3264,
          "han_characters": 3259,
          "non_han_words": 5,
          "character_count": 3742,
          "content_hash": "189c61991f2a7988c8162b3afb68a0c682cbe55b98753cc916ca09ed62f84895"
        }
      }
    },
    {
      "source": "world/source/_posts/create/nine/虹九重构.md",
      "site": "world",
      "sourcePath": "source/_posts/create/nine/虹九重构.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "越度：虹九重构",
      "url": "https://world.sch-nie.com/posts/15.html",
      "frontmatter": {
        "layout": "pages",
        "title": "越度：虹九重构",
        "abbrlink": 15,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "top": 99,
        "categories": [
          "九虹文明",
          "基础"
        ],
        "tags": [
          "风",
          "九虹重启",
          "创造"
        ],
        "reading_style": "lore",
        "reading_tone": "cyan",
        "content_stats": {
          "schema": 1,
          "word_count": 14616,
          "han_characters": 14565,
          "non_han_words": 51,
          "character_count": 16816,
          "content_hash": "913c22c3a4ff5ebed348eea05944429adca03eb19de202cc7f77ce4b3b9bcf84"
        }
      }
    },
    {
      "source": "world/source/_posts/perception/light/土奏琴璃.md",
      "site": "world",
      "sourcePath": "source/_posts/perception/light/土奏琴璃.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：土奏琴璃",
      "url": "https://world.sch-nie.com/posts/11.html",
      "frontmatter": {
        "layout": "pages",
        "title": "灵耀体系：土奏琴璃",
        "abbrlink": 11,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "九虹文明",
          "额外事件"
        ],
        "tags": [
          "土",
          "灵耀体系",
          "感知"
        ],
        "reading_style": "story",
        "reading_tone": "amber",
        "content_stats": {
          "schema": 1,
          "word_count": 6208,
          "han_characters": 6204,
          "non_han_words": 4,
          "character_count": 7239,
          "content_hash": "fd8218e538c859677d774f9e8fe1f75badb13a6b08ed0525748b43dbcb31b21f"
        }
      }
    },
    {
      "source": "world/source/_posts/perception/light/木缘桑庭.md",
      "site": "world",
      "sourcePath": "source/_posts/perception/light/木缘桑庭.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：木缘桑庭",
      "url": "https://world.sch-nie.com/posts/24.html",
      "frontmatter": {
        "layout": "pages",
        "title": "灵耀体系：木缘桑庭",
        "abbrlink": 24,
        "updated": "2026-10-01T22:18:58+08:00",
        "author": "schrolemons",
        "categories": [
          "九虹文明",
          "哲学条目"
        ],
        "tags": [
          "木",
          "灵耀体系",
          "感知"
        ],
        "comments": false,
        "reading_style": "guide",
        "reading_tone": "green",
        "content_stats": {
          "schema": 1,
          "word_count": 13176,
          "han_characters": 13080,
          "non_han_words": 96,
          "character_count": 16136,
          "content_hash": "afcf4ab21d119496f3f292895b03882b0620c0c8e13e4ce2ef3ab2cdeb2d9ed1"
        }
      }
    },
    {
      "source": "world/source/_posts/perception/light/水渊蚀源.md",
      "site": "world",
      "sourcePath": "source/_posts/perception/light/水渊蚀源.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：水渊蚀源",
      "url": "https://world.sch-nie.com/posts/10.html",
      "frontmatter": {
        "layout": "pages",
        "title": "灵耀体系：水渊蚀源",
        "abbrlink": 10,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "top": 101,
        "categories": [
          "九虹文明",
          "哲学杂谈"
        ],
        "tags": [
          "水",
          "灵耀体系",
          "感知"
        ],
        "reading_style": "poetry",
        "reading_tone": "blue",
        "content_stats": {
          "schema": 1,
          "word_count": 3453,
          "han_characters": 3447,
          "non_han_words": 6,
          "character_count": 4035,
          "content_hash": "1ae3cfc205f058f7c5d24da71bcb98f5d819bb4fa222a2f826d74e360580902d"
        }
      }
    },
    {
      "source": "world/source/_posts/perception/light/金泽范式.md",
      "site": "world",
      "sourcePath": "source/_posts/perception/light/金泽范式.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "zero",
      "title": "金泽范式",
      "url": "https://zero.sch-nie.com/core/",
      "frontmatter": {
        "layout": "pages",
        "title": "灵耀体系：金泽范式",
        "abbrlink": 23,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "top": 96,
        "categories": [
          "逝痕文明",
          "哲学杂谈"
        ],
        "tags": [
          "金",
          "灵耀体系",
          "感知"
        ],
        "reading_style": "info",
        "reading_tone": "amber",
        "content_stats": {
          "schema": 1,
          "word_count": 11,
          "han_characters": 11,
          "non_han_words": 0,
          "character_count": 11,
          "content_hash": "be229d7570244cb31a2ae4c5d76a69dd8937072a23d79501420120e0af18fc37"
        }
      }
    },
    {
      "source": "world/source/_posts/perception/nine/云末王冕.md",
      "site": "world",
      "sourcePath": "source/_posts/perception/nine/云末王冕.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "滞洄：云末王冕",
      "url": "https://world.sch-nie.com/posts/21.html",
      "frontmatter": {
        "layout": "pages",
        "title": "滞洄：云末王冕",
        "abbrlink": 21,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "文明历程"
        ],
        "tags": [
          "水",
          "九虹重启",
          "感知"
        ],
        "reading_style": "story",
        "reading_tone": "blue",
        "content_stats": {
          "schema": 1,
          "word_count": 13691,
          "han_characters": 13685,
          "non_han_words": 6,
          "character_count": 15536,
          "content_hash": "dfbc7ee663d01c45f8dcf6e0d96f7040a5a4f5c6c5f06bcbc86d4bbb27aea239"
        }
      }
    },
    {
      "source": "world/source/_posts/perception/nine/借以神名.md",
      "site": "world",
      "sourcePath": "source/_posts/perception/nine/借以神名.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "御临：借以神名",
      "url": "https://world.sch-nie.com/posts/29.html",
      "frontmatter": {
        "layout": "pages",
        "title": "御临：借以神名",
        "abbrlink": 29,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "神系"
        ],
        "tags": [
          "木",
          "九虹重启",
          "感知"
        ],
        "reading_style": "lore",
        "reading_tone": "green",
        "content_stats": {
          "schema": 1,
          "word_count": 10137,
          "han_characters": 10029,
          "non_han_words": 108,
          "character_count": 11802,
          "content_hash": "f3706f804af1653969509d7babd0ad1c064da8cac1aa928c970bc8bb7d9d7aa1"
        }
      }
    },
    {
      "source": "world/source/_posts/perception/nine/旧神荒圃.md",
      "site": "world",
      "sourcePath": "source/_posts/perception/nine/旧神荒圃.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "祈云：旧神荒圃",
      "url": "https://world.sch-nie.com/posts/17.html",
      "frontmatter": {
        "layout": "pages",
        "title": "祈云：旧神荒圃",
        "abbrlink": 17,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "终末文明",
          "文明历程"
        ],
        "tags": [
          "金",
          "九虹重启",
          "感知"
        ],
        "reading_style": "story",
        "reading_tone": "amber",
        "content_stats": {
          "schema": 1,
          "word_count": 7817,
          "han_characters": 7816,
          "non_han_words": 1,
          "character_count": 8729,
          "content_hash": "9df654d91c6fbb5ffb9003f1fbc710e836d070aae68ec651a3bd049143f74670"
        }
      }
    },
    {
      "source": "world/source/_posts/perception/nine/神子之树.md",
      "site": "world",
      "sourcePath": "source/_posts/perception/nine/神子之树.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "承日：神子之树",
      "url": "https://world.sch-nie.com/posts/20.html",
      "frontmatter": {
        "layout": "pages",
        "title": "承日：神子之树",
        "abbrlink": 20,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "终末文明",
          "文明历程"
        ],
        "tags": [
          "九虹重启",
          "感知",
          "土"
        ],
        "reading_style": "story",
        "reading_tone": "amber",
        "content_stats": {
          "schema": 1,
          "word_count": 2048,
          "han_characters": 2043,
          "non_han_words": 5,
          "character_count": 2328,
          "content_hash": "964f591cac4262f6b87f7541eb339c711baed845f2a75f8e71c473704f05cc74"
        }
      }
    },
    {
      "source": "world/source/_posts/record/light/光与流辰.md",
      "site": "world",
      "sourcePath": "source/_posts/record/light/光与流辰.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "zero",
      "title": "光引流辰",
      "url": "https://zero.sch-nie.com/SCHNIE_test/",
      "frontmatter": {
        "layout": "pages",
        "title": "灵耀体系：光与流辰",
        "abbrlink": 28,
        "updated": "2026-10-04T22:06:30+08:00",
        "author": "schrolemons",
        "categories": [
          "九虹文明",
          "外世拓展",
          "九虹"
        ],
        "tags": [
          "光",
          "灵耀体系",
          "记录"
        ],
        "reading_style": "info",
        "reading_tone": "amber",
        "toc": {
          "max_depth": 2
        },
        "content_stats": {
          "schema": 1,
          "word_count": 177,
          "han_characters": 175,
          "non_han_words": 2,
          "character_count": 191,
          "content_hash": "24d0060f52b9a0ce0ca50d44cafef2dd061c11b0ab9370e4dfd7bc9de7c35292"
        }
      }
    },
    {
      "source": "world/source/_posts/record/light/冰结明域.md",
      "site": "world",
      "sourcePath": "source/_posts/record/light/冰结明域.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：冰结明域",
      "url": "https://world.sch-nie.com/posts/25.html",
      "frontmatter": {
        "layout": "pages",
        "title": "灵耀体系：冰结明域",
        "abbrlink": 25,
        "updated": "2026-10-01T22:05:29+08:00",
        "author": "schrolemons",
        "categories": [
          "逝痕文明",
          "外世拓展",
          "虹九"
        ],
        "tags": [
          "冰",
          "灵耀体系",
          "记录"
        ],
        "reading_style": "info",
        "reading_tone": "cyan",
        "content_stats": {
          "schema": 1,
          "word_count": 114,
          "han_characters": 114,
          "non_han_words": 0,
          "character_count": 122,
          "content_hash": "7aec424723a055aab5c797c4cdcbb6e3a18238d95a13e9d714604f334a8e56eb"
        }
      }
    },
    {
      "source": "world/source/_posts/record/light/阳汇彼日.md",
      "site": "world",
      "sourcePath": "source/_posts/record/light/阳汇彼日.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：阳汇彼日",
      "url": "https://world.sch-nie.com/posts/26.html",
      "frontmatter": {
        "layout": "pages",
        "title": "灵耀体系：阳汇彼日",
        "abbrlink": 26,
        "updated": "2026-10-04T22:14:18+08:00",
        "author": "schrolemons",
        "categories": [
          "九虹文明",
          "外世拓展",
          "星球"
        ],
        "tags": [
          "阳",
          "灵耀体系",
          "记录"
        ],
        "reading_style": "info",
        "reading_tone": "rose",
        "toc": {
          "max_depth": 2
        },
        "content_stats": {
          "schema": 1,
          "word_count": 1290,
          "han_characters": 1246,
          "non_han_words": 44,
          "character_count": 1573,
          "content_hash": "6752389cb0121f3193229973a707c406870e2c64b597d2411c441c6a020c40aa"
        }
      }
    },
    {
      "source": "world/source/_posts/record/light/阴行世界.md",
      "site": "world",
      "sourcePath": "source/_posts/record/light/阴行世界.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "灵耀体系：阴行世界",
      "url": "https://world.sch-nie.com/posts/27.html",
      "frontmatter": {
        "layout": "pages",
        "title": "灵耀体系：阴行世界",
        "abbrlink": 27,
        "updated": "2026-10-09T17:24:00+08:00",
        "author": "schrolemons",
        "categories": [
          "逝痕文明",
          "外世拓展",
          "逝痕"
        ],
        "tags": [
          "阴",
          "灵耀体系",
          "记录"
        ],
        "reading_style": "info",
        "reading_tone": "violet",
        "content_stats": {
          "schema": 1,
          "word_count": 2598,
          "han_characters": 2561,
          "non_han_words": 37,
          "character_count": 3048,
          "content_hash": "79b38f3ff25ec1de68cd5ddbb5ac127670fdd7e0480bc5463324a304499670cf"
        }
      }
    },
    {
      "source": "world/source/_posts/record/nine/昏昼合棋.md",
      "site": "world",
      "sourcePath": "source/_posts/record/nine/昏昼合棋.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "四象：昏昼合棋",
      "url": "https://world.sch-nie.com/posts/14.html",
      "frontmatter": {
        "layout": "pages",
        "title": "四象：昏昼合棋",
        "abbrlink": 14,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "终末文明",
          "文明历程"
        ],
        "tags": [
          "阴",
          "九虹重启",
          "记录"
        ],
        "reading_style": "story",
        "reading_tone": "violet",
        "content_stats": {
          "schema": 1,
          "word_count": 2275,
          "han_characters": 2271,
          "non_han_words": 4,
          "character_count": 2602,
          "content_hash": "bfad3b99ae3d85c2de43d1b8a60f9355bc82c504a2777f6de4c17ec50f56e4b2"
        }
      }
    },
    {
      "source": "world/source/_posts/record/nine/终态行旅.md",
      "site": "world",
      "sourcePath": "source/_posts/record/nine/终态行旅.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "折棱：终态行旅",
      "url": "https://world.sch-nie.com/posts/3.html",
      "frontmatter": {
        "title": "折棱：终态行旅",
        "abbrlink": 3,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "top": 100,
        "categories": [
          "终末文明",
          "基础"
        ],
        "tags": [
          "光",
          "九虹重启",
          "记录"
        ],
        "reading_style": "lore",
        "reading_tone": "amber",
        "content_stats": {
          "schema": 1,
          "word_count": 14927,
          "han_characters": 14834,
          "non_han_words": 93,
          "character_count": 17298,
          "content_hash": "caf3bb3db94af5b293c39631d19f00e7d9890483e1a267cb9b888ca8bbd62d7a"
        }
      }
    },
    {
      "source": "world/source/_posts/record/nine/逝时宏鳞.md",
      "site": "world",
      "sourcePath": "source/_posts/record/nine/逝时宏鳞.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "构筑：逝时宏鳞",
      "url": "https://world.sch-nie.com/posts/5.html",
      "frontmatter": {
        "layout": "pages",
        "title": "构筑：逝时宏鳞",
        "abbrlink": 5,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "top": 50,
        "categories": [
          "终末文明",
          "文明历程"
        ],
        "tags": [
          "九虹重启",
          "记录",
          "阳"
        ],
        "reading_style": "story",
        "reading_tone": "rose",
        "content_stats": {
          "schema": 1,
          "word_count": 12672,
          "han_characters": 12672,
          "non_han_words": 0,
          "character_count": 14460,
          "content_hash": "80754ae980c00ebca030d0a7f20773236587df7f494ac58729a729d178cac422"
        }
      }
    },
    {
      "source": "world/source/_posts/record/nine/重返故都.md",
      "site": "world",
      "sourcePath": "source/_posts/record/nine/重返故都.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "坠源：重返故都",
      "url": "https://world.sch-nie.com/posts/19.html",
      "frontmatter": {
        "layout": "pages",
        "title": "坠源：重返故都",
        "abbrlink": 19,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "九虹文明",
          "文明历程"
        ],
        "tags": [
          "冰",
          "九虹重启",
          "记录"
        ],
        "reading_style": "story",
        "reading_tone": "cyan",
        "content_stats": {
          "schema": 1,
          "word_count": 8316,
          "han_characters": 8316,
          "non_han_words": 0,
          "character_count": 9499,
          "content_hash": "5cb1d3ecf3fb397eabc764461f046438c171d0aec0f4442ab811ad81d795756f"
        }
      }
    },
    {
      "source": "world/source/_posts/three/启辉计划.md",
      "site": "world",
      "sourcePath": "source/_posts/three/启辉计划.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "启辉计划-附属“自然工程”基本方案",
      "url": "https://world.sch-nie.com/posts/16.html",
      "frontmatter": {
        "title": "启辉计划-附属“自然工程”基本方案",
        "abbrlink": 16,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "策略"
        ],
        "tags": [
          "三大规划"
        ],
        "reading_style": "lore",
        "reading_tone": "violet",
        "content_stats": {
          "schema": 1,
          "word_count": 2240,
          "han_characters": 2220,
          "non_han_words": 20,
          "character_count": 2637,
          "content_hash": "c76d029e652752adffc45bd1f17464b91ae98ecedbabbf85a39d5fb45be6fa67"
        }
      }
    },
    {
      "source": "world/source/_posts/three/宏鳞企划.md",
      "site": "world",
      "sourcePath": "source/_posts/three/宏鳞企划.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "宏鳞企划-附属“文化构造”基本方案",
      "url": "https://world.sch-nie.com/posts/9.html",
      "frontmatter": {
        "title": "宏鳞企划-附属“文化构造”基本方案",
        "abbrlink": 9,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "策略"
        ],
        "tags": [
          "三大规划"
        ],
        "reading_style": "lore",
        "reading_tone": "violet",
        "content_stats": {
          "schema": 1,
          "word_count": 2461,
          "han_characters": 2449,
          "non_han_words": 12,
          "character_count": 2814,
          "content_hash": "f413d97ac26b223f306d4861d0b1ecedc0f4e00e7f6eb9da5897a9db7da27b23"
        }
      }
    },
    {
      "source": "world/source/_posts/three/方舟规划.md",
      "site": "world",
      "sourcePath": "source/_posts/three/方舟规划.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "方舟规划-附属“宇宙入侵”基本方案",
      "url": "https://world.sch-nie.com/posts/12.html",
      "frontmatter": {
        "title": "方舟规划-附属“宇宙入侵”基本方案",
        "abbrlink": 12,
        "author": "schrolemons",
        "updated": "2026-10-01T22:05:29+08:00",
        "categories": [
          "逝痕文明",
          "策略"
        ],
        "tags": [
          "三大规划"
        ],
        "reading_style": "lore",
        "reading_tone": "violet",
        "content_stats": {
          "schema": 1,
          "word_count": 3826,
          "han_characters": 3797,
          "non_han_words": 29,
          "character_count": 4465,
          "content_hash": "86b549b7a79c764866ed29b9a6d927a9baa5ebeaef135b3c613d51d3f1e1d6b4"
        }
      }
    },
    {
      "source": "world/source/404.md",
      "site": "world",
      "sourcePath": "source/404.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "404",
      "url": "https://world.sch-nie.com/404.html",
      "frontmatter": {
        "title": 404,
        "type": 404,
        "layout": 404,
        "comments": false,
        "description": "直到意识回到那无声之海，祂也没再回来。",
        "reading_style": "info",
        "reading_tone": "cyan",
        "date": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e7bc038cfbd6bcce427bc08ea06cb1b3cf82b96bc8947c11f1b2e8f5c3713959"
        }
      }
    },
    {
      "source": "world/source/about/index.md",
      "site": "world",
      "sourcePath": "source/about/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "关于",
      "url": "https://world.sch-nie.com/about/",
      "frontmatter": {
        "layout": "pages",
        "title": "关于",
        "abbrlink": 2147483647,
        "date": "2025-02-21T16:57:09.000Z",
        "top": 999999,
        "comments": false,
        "reading_style": "info",
        "reading_tone": "cyan",
        "updated": "2026-10-03T13:33:30+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 87,
          "han_characters": 82,
          "non_han_words": 5,
          "character_count": 112,
          "content_hash": "79f751ea05a9f52c49d6c6553e0d4caac6fe60e2b14b37d3c12427bc86861c20"
        }
      }
    },
    {
      "source": "world/source/archives/index.md",
      "site": "world",
      "sourcePath": "source/archives/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "archives",
      "url": "https://world.sch-nie.com/archives/",
      "frontmatter": {
        "title": "archives",
        "date": "2025-05-25T23:28:12.000Z",
        "reading_style": "directory",
        "updated": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "world/source/bingjie_domain/index.md",
      "site": "world",
      "sourcePath": "source/bingjie_domain/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "冰结明域",
      "url": "https://world.sch-nie.com/bingjie_domain/",
      "frontmatter": {
        "title": "冰结明域",
        "layout": "directory",
        "directory_collection": "bingjie_domain",
        "directory_key": "",
        "comments": false,
        "reading_style": "directory",
        "date": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "world/source/categories/index.md",
      "site": "world",
      "sourcePath": "source/categories/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "分类导航",
      "url": "https://world.sch-nie.com/categories/",
      "frontmatter": {
        "title": "分类导航",
        "date": "2025-02-20T19:13:10.000Z",
        "type": "categories",
        "comments": false,
        "reading_style": "directory",
        "updated": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "world/source/index.md",
      "site": "world",
      "sourcePath": "source/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "第九边缘：WORLD",
      "url": "https://world.sch-nie.com/",
      "frontmatter": {
        "layout": "home",
        "title": "第九边缘：WORLD",
        "comments": false,
        "reading_style": "home",
        "date": "2026-10-08T11:09:11+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 393,
          "han_characters": 379,
          "non_han_words": 14,
          "character_count": 508,
          "content_hash": "0c42c46bde6fabd423ce54ca7ccc7da72fb86a8f97648837e6769190e463bc1e"
        }
      }
    },
    {
      "source": "world/source/light_withme/key_part/index.md",
      "site": "world",
      "sourcePath": "source/light_withme/key_part/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "第九边缘发行计划",
      "url": "https://world.sch-nie.com/light_withme/key_part/",
      "frontmatter": {
        "title": "第九边缘发行计划",
        "type": "key",
        "comments": false,
        "reading_style": "info",
        "reading_tone": "cyan",
        "date": "2026-10-04T01:25:56+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 437,
          "han_characters": 422,
          "non_han_words": 15,
          "character_count": 570,
          "content_hash": "38e48bb3cb614bde40ca447f6d8103455aaa4054d20a678ed3cd06ade590b75b"
        }
      }
    },
    {
      "source": "world/source/light_withme/operator/index.md",
      "site": "world",
      "sourcePath": "source/light_withme/operator/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "协作者档案",
      "url": "https://world.sch-nie.com/light_withme/operator/",
      "frontmatter": {
        "title": "协作者档案",
        "date": "2025-02-22T19:28:51.000Z",
        "reading_style": "profile",
        "reading_tone": "amber",
        "updated": "2026-10-17T00:39:27+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 382,
          "han_characters": 375,
          "non_han_words": 7,
          "character_count": 460,
          "content_hash": "60f47180b06d32440f78f7ffea8b52bd6bcb041353c555c7703b56d27b1f853e"
        }
      }
    },
    {
      "source": "world/source/tags/index.md",
      "site": "world",
      "sourcePath": "source/tags/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "标签",
      "url": "https://world.sch-nie.com/tags/",
      "frontmatter": {
        "title": "标签",
        "date": "2025-02-20T19:13:10.000Z",
        "type": "tags",
        "comments": false,
        "reading_style": "directory",
        "updated": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "world/source/yanghui_days/index.md",
      "site": "world",
      "sourcePath": "source/yanghui_days/index.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "阳汇彼日",
      "url": "https://world.sch-nie.com/yanghui_days/",
      "frontmatter": {
        "title": "阳汇彼日",
        "layout": "directory",
        "directory_collection": "yanghui_days",
        "directory_key": "",
        "comments": false,
        "reading_style": "directory",
        "date": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "world/source/yinxing_world/character/mosae.md",
      "site": "world",
      "sourcePath": "source/yinxing_world/character/mosae.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "众生回廊：墨薛",
      "url": "https://world.sch-nie.com/yinxing_world/character/mosae.html",
      "frontmatter": {
        "title": "众生回廊：墨薛",
        "date": "2025-02-21T17:47:27.000Z",
        "reading_style": "profile",
        "reading_tone": "amber",
        "updated": "2026-10-20T12:19:06+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 946,
          "han_characters": 922,
          "non_han_words": 24,
          "character_count": 1207,
          "content_hash": "93c73924fb9ddd7c378a7789cfc36c8da4c7a7b82ffd05477fd45beebda5dc52"
        }
      }
    },
    {
      "source": "world/source/yinxing_world/commission/mosae.md",
      "site": "world",
      "sourcePath": "source/yinxing_world/commission/mosae.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "异世之篇：规范宏元",
      "url": "https://world.sch-nie.com/yinxing_world/commission/mosae.html",
      "frontmatter": {
        "layout": "pages",
        "title": "异世之篇：规范宏元",
        "abbrlink": 20041117,
        "author": "Mosae",
        "date": "2025-11-17T00:00:00.000Z",
        "categories": "异世之篇",
        "reading_style": "story",
        "reading_tone": "blue",
        "updated": "2026-10-04T13:04:16+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 1143,
          "han_characters": 1143,
          "non_han_words": 0,
          "character_count": 1307,
          "content_hash": "356430ab20bcd1840dc6542e1127d6dea21c4043e8a6ee79fcd6f0226269dbbf"
        }
      }
    },
    {
      "source": "world/source/yinxing_world/commission/ruifox.md",
      "site": "world",
      "sourcePath": "source/yinxing_world/commission/ruifox.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "异世之篇：旭阳下的暖梦",
      "url": "https://world.sch-nie.com/yinxing_world/commission/ruifox.html",
      "frontmatter": {
        "layout": "pages",
        "title": "异世之篇：旭阳下的暖梦",
        "abbrlink": 918187906,
        "author": "瑞Ruifox",
        "date": "2025-05-22T20:43:51.000Z",
        "categories": "异世之篇",
        "reading_style": "story",
        "reading_tone": "blue",
        "updated": "2026-10-04T13:03:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 944,
          "han_characters": 944,
          "non_han_words": 0,
          "character_count": 1097,
          "content_hash": "8c5e579f44996f165388c1f776ee217637a67ed45bfa1166abcd4ffc27674a03"
        }
      }
    },
    {
      "source": "world/source/yinxing_world/nowadays/Connect.md",
      "site": "world",
      "sourcePath": "source/yinxing_world/nowadays/Connect.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "在两个世界的交界处：致OC、Furry与你们",
      "url": "https://world.sch-nie.com/yinxing_world/nowadays/Connect.html",
      "frontmatter": {
        "layout": "pages",
        "title": "在两个世界的交界处：致OC、Furry与你们",
        "author": "SCHNIE&schrolemons",
        "date": "2025-08-25T20:43:51.000Z",
        "categories": "现世之篇",
        "reading_style": "essay",
        "reading_tone": "green",
        "updated": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 1184,
          "han_characters": 1172,
          "non_han_words": 12,
          "character_count": 1365,
          "content_hash": "c75e6b33681724ebd27c0cb351479c98ee7b3c214eb3fd14baa907783106e03f"
        }
      }
    },
    {
      "source": "world/source/yinxing_world/nowadays/Junction.md",
      "site": "world",
      "sourcePath": "source/yinxing_world/nowadays/Junction.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "在人生阶段的接轨处：致我的大学四年",
      "url": "https://world.sch-nie.com/yinxing_world/nowadays/Junction.html",
      "frontmatter": {
        "layout": "pages",
        "title": "在人生阶段的接轨处：致我的大学四年",
        "author": "SCHNIE&schrolemons",
        "date": "2025-07-03T20:43:51.000Z",
        "categories": "现世之篇",
        "reading_style": "essay",
        "reading_tone": "green",
        "updated": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 1280,
          "han_characters": 1276,
          "non_han_words": 4,
          "character_count": 1434,
          "content_hash": "9b64cf65b210e455ca037acd1202a78b9fe42949bd6f61dd5dcad300b8ea19d4"
        }
      }
    },
    {
      "source": "world/source/yinxing_world/nowadays/Light.md",
      "site": "world",
      "sourcePath": "source/yinxing_world/nowadays/Light.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "在日升月落的流光处：致我、“Alliy”、与你",
      "url": "https://world.sch-nie.com/yinxing_world/nowadays/Light.html",
      "frontmatter": {
        "layout": "pages",
        "title": "在日升月落的流光处：致我、“Alliy”、与你",
        "author": "SCHNIE&schrolemons",
        "date": "2025-07-03T20:43:51.000Z",
        "categories": "现世之篇",
        "reading_style": "essay",
        "reading_tone": "green",
        "updated": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 1118,
          "han_characters": 1115,
          "non_han_words": 3,
          "character_count": 1246,
          "content_hash": "2a271ffa75ac6c1a5d00a3054cb81ed45e2aea8d343f453078362d5a032483e7"
        }
      }
    },
    {
      "source": "world/source/yinxing_world/nowadays/Waiting.md",
      "site": "world",
      "sourcePath": "source/yinxing_world/nowadays/Waiting.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "在再踏旅途的等候处：当我们面对新的故事",
      "url": "https://world.sch-nie.com/yinxing_world/nowadays/Waiting.html",
      "frontmatter": {
        "layout": "pages",
        "title": "在再踏旅途的等候处：当我们面对新的故事",
        "author": "SCHNIE&schrolemons",
        "date": "2026-10-09T17:43:51.000Z",
        "categories": "现世之篇",
        "reading_style": "essay",
        "reading_tone": "green",
        "content_stats": {
          "schema": 1,
          "word_count": 1136,
          "han_characters": 1135,
          "non_han_words": 1,
          "character_count": 1284,
          "content_hash": "a94dcfeb35a4b42029337b96de76c0ccad2ab460f34e7605d00edd8076162a69"
        }
      }
    },
    {
      "source": "world/source/yinxing_world/resion/shiheng.md",
      "site": "world",
      "sourcePath": "source/yinxing_world/resion/shiheng.md",
      "sourceRepository": "schrolemons/openwd.github.io",
      "category": "world",
      "title": "逝痕技术联邦",
      "url": "https://world.sch-nie.com/yinxing_world/resion/shiheng.html",
      "frontmatter": {
        "layout": "pages",
        "title": "逝痕技术联邦",
        "author": "SCHNIE&schrolemons",
        "date": "2026-08-12T20:43:51.000Z",
        "categories": "世界区域",
        "reading_style": "lore",
        "reading_tone": "violet",
        "updated": "2026-10-01T22:05:29+08:00",
        "content_stats": {
          "schema": 1,
          "word_count": 1425,
          "han_characters": 1425,
          "non_han_words": 0,
          "character_count": 1612,
          "content_hash": "865c9112e6a051355581a330b30f94c0d8cc83532c0f92b481e900f951d11dd7"
        }
      }
    },
    {
      "source": "zero/source/_posts/core.md",
      "site": "zero",
      "sourcePath": "source/_posts/core.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "体系核心",
      "url": "https://zero.sch-nie.com/posts/core.html",
      "frontmatter": {
        "title": "体系核心",
        "abbrlink": "core",
        "date": "2025-06-17T21:03:15.000Z",
        "categories": "info",
        "tags": [
          "SCHNIE",
          "phil"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 123,
          "han_characters": 115,
          "non_han_words": 8,
          "character_count": 152,
          "content_hash": "35a45d1f3f76654febf19fa62dc0305736bfc792a99985815b0b67379d0536d9"
        }
      }
    },
    {
      "source": "zero/source/_posts/hello-world.md",
      "site": "zero",
      "sourcePath": "source/_posts/hello-world.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "欢迎访问第九边缘网站",
      "url": "https://zero.sch-nie.com/hello",
      "frontmatter": {
        "title": "欢迎访问第九边缘网站",
        "permalink": "hello",
        "abbrlink": "hello",
        "date": "2024-12-20T20:16:00.000Z",
        "categories": "website",
        "tags": [
          "SCHNIE",
          "welcome"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 51,
          "han_characters": 50,
          "non_han_words": 1,
          "character_count": 66,
          "content_hash": "653007c0be4d43e535972ad029f9756e6783a14698e3db3afd2d5427b6c7c877"
        }
      }
    },
    {
      "source": "zero/source/_posts/IQ-test.md",
      "site": "zero",
      "sourcePath": "source/_posts/IQ-test.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "灵感探寻测试",
      "url": "https://zero.sch-nie.com/",
      "frontmatter": {
        "layout": "posts",
        "title": "灵感探寻测试",
        "date": "2024-09-01T11:44:03.000Z",
        "categories": "tests",
        "tags": [
          "intel",
          "collab"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 1505,
          "han_characters": 1243,
          "non_han_words": 262,
          "character_count": 2387,
          "content_hash": "e8a33bb42cc07637477f090b57b9a830f22c1e4174e4b1b66a2821dae2dddb6f"
        }
      }
    },
    {
      "source": "zero/source/_posts/schnie_web.md",
      "site": "zero",
      "sourcePath": "source/_posts/schnie_web.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "第九边缘：网站构建",
      "url": "https://zero.sch-nie.com/posts/web.html",
      "frontmatter": {
        "layout": "posts",
        "title": "第九边缘：网站构建",
        "abbrlink": "web",
        "date": "2025-06-17T22:39:17.000Z",
        "categories": "website",
        "tags": [
          "SCHNIE",
          "collab"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 1581,
          "han_characters": 1551,
          "non_han_words": 30,
          "character_count": 1926,
          "content_hash": "4f8e1eee5539881f8dae82e7891f90cd7e1c9a6e877d84ff36ce651eb2911719"
        }
      }
    },
    {
      "source": "zero/source/_posts/SCHNIE-test.md",
      "site": "zero",
      "sourcePath": "source/_posts/SCHNIE-test.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "第九边缘：测试",
      "url": "https://zero.sch-nie.com/",
      "frontmatter": {
        "layout": "posts",
        "title": "第九边缘：测试",
        "date": "2025-06-20T20:35:01.000Z",
        "categories": "tests",
        "tags": [
          "intel",
          "collab"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 1469,
          "han_characters": 1371,
          "non_han_words": 98,
          "character_count": 1886,
          "content_hash": "c05aa6616bb17a471c9e784cbaccd3bc21bd73d4e1c35c272abe22316477172a"
        }
      }
    },
    {
      "source": "zero/source/_posts/SCHNIE.md",
      "site": "zero",
      "sourcePath": "source/_posts/SCHNIE.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "WHAT IS \"SCHNIE\"?",
      "url": "https://zero.sch-nie.com/posts/47269.html",
      "frontmatter": {
        "title": "WHAT IS \"SCHNIE\"?",
        "abbrlink": 47269,
        "date": "2025-10-08T16:11:25.000Z",
        "categories": "info",
        "tags": [
          "SCHNIE",
          "phil"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 906,
          "han_characters": 901,
          "non_han_words": 5,
          "character_count": 1053,
          "content_hash": "a6135c3c3db27393a6bbe53680b0b19d30634a6b0c983af419d2f4786ca0b14f"
        }
      }
    },
    {
      "source": "zero/source/_posts/struct.md",
      "site": "zero",
      "sourcePath": "source/_posts/struct.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "构建介绍",
      "url": "https://zero.sch-nie.com/posts/120.html",
      "frontmatter": {
        "title": "构建介绍",
        "abbrlink": 120,
        "date": "2024-12-22T19:27:20.000Z",
        "categories": "info",
        "tags": [
          "SCHNIE",
          "build"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 350,
          "han_characters": 323,
          "non_han_words": 27,
          "character_count": 468,
          "content_hash": "92f1b260a298ccc2c576b1fb3b613f175a609bf671c1114515b149aca90a9be3"
        }
      }
    },
    {
      "source": "zero/source/_posts/welcome.md",
      "site": "zero",
      "sourcePath": "source/_posts/welcome.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "第九边缘邀请函",
      "url": "https://zero.sch-nie.com/welcome",
      "frontmatter": {
        "title": "第九边缘邀请函",
        "permalink": "welcome",
        "abbrlink": "welcome",
        "date": "2024-12-20T21:03:15.000Z",
        "categories": "info",
        "tags": [
          "SCHNIE",
          "collab"
        ],
        "content_stats": {
          "schema": 1,
          "word_count": 737,
          "han_characters": 730,
          "non_han_words": 7,
          "character_count": 841,
          "content_hash": "aa7b1aba67f91f8945762d0c6b9669563e6880f9d46620644acd395d7e112b31"
        }
      }
    },
    {
      "source": "zero/source/about/index.md",
      "site": "zero",
      "sourcePath": "source/about/index.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "about",
      "url": "https://zero.sch-nie.com/about/",
      "frontmatter": {
        "title": "about",
        "date": "2024-12-20T19:47:13.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 29,
          "han_characters": 29,
          "non_han_words": 0,
          "character_count": 32,
          "content_hash": "ca1b63c39583281ae6c724b363b2d2bdc6d3c0b2b2d0415bc183dc4177a694ea"
        }
      }
    },
    {
      "source": "zero/source/categories/index.md",
      "site": "zero",
      "sourcePath": "source/categories/index.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "categories",
      "url": "https://zero.sch-nie.com/categories/",
      "frontmatter": {
        "title": "categories",
        "layout": "categories",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "zero/source/core/index.md",
      "site": "zero",
      "sourcePath": "source/core/index.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "体系核心",
      "url": "https://zero.sch-nie.com/core/",
      "frontmatter": {
        "title": "体系核心",
        "abbrlink": "core",
        "date": "2025-06-17T21:03:15.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 108,
          "han_characters": 100,
          "non_han_words": 8,
          "character_count": 137,
          "content_hash": "9e21967dac6a45ecc8d6c8909c42da71fa80f72411e342aa9a2022b257a83f50"
        }
      }
    },
    {
      "source": "zero/source/SCHNIE_test/index.md",
      "site": "zero",
      "sourcePath": "source/SCHNIE_test/index.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "SCHNIE_test",
      "url": "https://zero.sch-nie.com/SCHNIE_test/",
      "frontmatter": {
        "title": "SCHNIE_test",
        "date": "2025-06-20T20:35:01.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 1469,
          "han_characters": 1371,
          "non_han_words": 98,
          "character_count": 1886,
          "content_hash": "ca942d2b3143be5450d1420c95e2cfbc7f2a273775d55a15e7c1a16255b66842"
        }
      }
    },
    {
      "source": "zero/source/search/index.md",
      "site": "zero",
      "sourcePath": "source/search/index.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "search",
      "url": "https://zero.sch-nie.com/search/",
      "frontmatter": {
        "title": "search",
        "layout": "search",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "zero/source/struct/index.md",
      "site": "zero",
      "sourcePath": "source/struct/index.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "构建介绍",
      "url": "https://zero.sch-nie.com/struct/",
      "frontmatter": {
        "title": "构建介绍",
        "date": "2024-12-22T19:27:20.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 334,
          "han_characters": 307,
          "non_han_words": 27,
          "character_count": 453,
          "content_hash": "fe4385b0e36c688bebee4c880e661be82b8d3941f564177eb687c57cfaa496d2"
        }
      }
    },
    {
      "source": "zero/source/tags/index.md",
      "site": "zero",
      "sourcePath": "source/tags/index.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "tags",
      "url": "https://zero.sch-nie.com/tags/",
      "frontmatter": {
        "title": "tags",
        "layout": "tags",
        "content_stats": {
          "schema": 1,
          "word_count": 0,
          "han_characters": 0,
          "non_han_words": 0,
          "character_count": 0,
          "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
      }
    },
    {
      "source": "zero/source/test/Isit/index.md",
      "site": "zero",
      "sourcePath": "source/test/Isit/index.md",
      "sourceRepository": "schrolemons/zero.github.io",
      "category": "zero",
      "title": "灵感探寻测试",
      "url": "https://zero.sch-nie.com/test/Isit/",
      "frontmatter": {
        "layout": "posts",
        "title": "灵感探寻测试",
        "date": "2024-09-01T11:44:03.000Z",
        "content_stats": {
          "schema": 1,
          "word_count": 1505,
          "han_characters": 1243,
          "non_han_words": 262,
          "character_count": 2387,
          "content_hash": "b2717a5b0780808a6c95b9fe4547373867cc24038c240a90d783518da2450280"
        }
      }
    }
  ]
}
```
