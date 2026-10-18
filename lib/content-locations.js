// Author-confirmed scope; source repositories and frontmatter remain untouched.
export const CONTENT_LOCATION_RULES = `名称、入口与实际内容所在地（作者明确说明，优先按此消歧）：
入口不等于正文；同名 Markdown 可能只是概述、目录或跳转页，不能把该页字数当作整个条目的字数。
1. 阴行世界：WORLD 的 source/_posts/record/light/阴行世界.md 是入口与说明，具体内容分散在 WORLD 的 source/yinxing_world/ 下。作者所说的 yingxing_world 指此目录，实际拼写为 yinxing_world。讨论内容或统计范围时，要核对入口与目录内已入库的分散文件，不能只看同名文件，也不能把整个 WORLD 都算成阴行世界。
2. 光与流辰（也以光引流辰指称）：WORLD 的 source/_posts/record/light/光与流辰.md 与 source/light_withme/ 保存介绍、协作者档案和发行等配套内容；主体即几个测试题放在 ZERO。ZERO 的 source/SCHNIE_test/index.md 是测试索引，对应 source/cogn/index.html、source/NINE/index.html、source/oc_world/index.html 等测试页面。不能因为 WORLD 有名称入口就说测试主体在 WORLD，也不能把整个 ZERO 或所有含“测试”的文章都归入此项。
3. 阳汇彼日：主要是概述性介绍与 ZERO 中的 2025 设定集。WORLD 的同名文件与 source/yanghui_days/ 是介绍入口；ZERO 的 source/core/、作品集相关介绍指向设定集 PDF（source/download/seablue.pdf）。介绍与下载链接不等于已经读取设定集正文。
4. 冰结明域：主要指这些网站、微信公众号等平台。WORLD 的同名页面和 source/bingjie_domain/ 是平台介绍/入口，不能虚构成一篇完整故事，也不能把所有网站文章总字数直接称为冰结明域正文总字数。
5. 三大观点（人生观、世界观、自然观）、金泽范式、火神契约：WORLD 中保留的对应名称页是入口或跳转，主要内容依旧在 ZERO 的 source/core/ 及其链接的 PDF。BLOG 或 WORLD 对它们的引用与解读不改变主体所在地，也不能把介绍、跳转页与被链接正文当成同一份完整资料。
统计边界：物理来源、内容分类、概念归属是不同维度。每个文件在全站统计中只算一次；概念可跨网站、共享入口，不能把各概念统计相加充当全站统计。HTML 测试、PDF/设定集、图片文字与站外内容若尚未解析，就不在 Markdown 字数里；已知 Markdown 范围的字数不能作为完整内容总字数。问“这篇 md”时答单文件；问“这个条目/体系”时先说明跨文件范围及未入库部分。统计不全时说明资料缺口，不能补猜数值。`;

const match = (site, sourcePath, role, prefix = false) => ({ site, sourcePath, role, prefix });
const entry = name => match('world', `source/_posts/record/light/${name}.md`, 'entry');
const resource = (path, kind) => ({ site: 'zero', path, kind, counted: false });
const LOCATIONS = [
  {
    id: 'yinxing-world', name: '阴行世界', aliases: ['yingxing_world', 'yinxing_world'],
    meaning: '角色设计、诞生故事及分散内容；同名页是入口与说明。', primary_sites: ['world'],
    selectors: [entry('阴行世界'), match('world', 'source/yinxing_world/', 'body', true)], unindexed_resources: [],
  },
  {
    id: 'light-withme', name: '光与流辰', aliases: ['光引流辰', 'light_withme'],
    meaning: 'WORLD 保留介绍和协作配套内容，测试主体位于 ZERO，不等于 WORLD 的同名入口页。',
    primary_sites: ['zero'], supporting_sites: ['world'],
    selectors: [entry('光与流辰'), match('world', 'source/light_withme/', 'support', true),
      match('zero', 'source/SCHNIE_test/', 'primary-index', true), match('zero', 'source/_posts/SCHNIE-test.md', 'primary-index')],
    unindexed_resources: ['cogn', 'NINE', 'oc_world'].map(folder => resource(`source/${folder}/index.html`, 'HTML 测试主体')),
  },
  {
    id: 'yanghui-days', name: '阳汇彼日', aliases: ['yanghui_days'],
    meaning: '概述性介绍与 ZERO 的 2025 设定集；PDF 正文未进入 Markdown 统计。', primary_sites: ['zero'], supporting_sites: ['world'],
    selectors: [entry('阳汇彼日'), match('world', 'source/yanghui_days/', 'entry', true)],
    shared_indexes: ['zero:source/core/index.md', 'zero:source/_posts/core.md', 'zero:source/struct/index.md', 'zero:source/_posts/struct.md'],
    shared_index_counting: '共享索引含多个主题，仅供定位，不整页计入本概念字数；缺少段落级范围时不补猜设定集正文总量。',
    unindexed_resources: [resource('source/download/seablue.pdf', '2025 设定集 PDF')],
  },
  {
    id: 'bingjie-domain', name: '冰结明域', aliases: ['bingjie_domain'],
    meaning: '网站、微信公众号等平台集合；已入库的介绍文字不等于所有平台内容总量。', primary_sites: [], supporting_sites: ['world'],
    selectors: [entry('冰结明域'), match('world', 'source/bingjie_domain/', 'entry', true)],
    unindexed_resources: [{ site: 'external', path: '各网站及微信公众号等平台内容', kind: '平台内容，未完整采集', counted: false }],
  },
  {
    id: 'zero-core', name: '三大观点、金泽范式与火神契约', aliases: ['人生观', '世界观', '自然观', '金泽范式', '火神契约'],
    meaning: '主要内容在 ZERO；WORLD 同名文件是入口。ZERO 的 core Markdown 也主要是资源索引。', primary_sites: ['zero'], supporting_sites: ['world'],
    selectors: ['人生行迹', '宇宙基础', '自然万态'].map(name => match('world', `source/_posts/core/${name}.md`, 'entry')).concat([
      match('world', 'source/_posts/create/light/火神契约.md', 'entry'), match('world', 'source/_posts/perception/light/金泽范式.md', 'entry'),
      match('zero', 'source/core/', 'primary-index', true), match('zero', 'source/_posts/core.md', 'primary-index'),
    ]),
    unindexed_resources: ['第九边缘：人生行迹', '第九边缘：宇宙基础', '第九边缘：自然万态', '第九边缘：火神契约', '灵耀体系：金泽范式']
      .map(name => resource(`source/download/${name}.pdf`, '核心内容 PDF')),
  },
];

export function buildContentLocations(articles) {
  return LOCATIONS.map(({ selectors, ...location }) => {
    const matched = articles.flatMap(article => {
      const sourcePath = String(article.sourcePath || article.source).replaceAll('\\', '/').replace(/^(?:blog|world|zero)\//, '');
      const selector = selectors.find(item => article.site === item.site && (item.prefix ? sourcePath.startsWith(item.sourcePath) : sourcePath === item.sourcePath));
      if (!selector) return [];
      return [{ source: article.source, site: article.site, sourcePath, role: selector.role, word_count: article.frontmatter.content_stats.word_count,
        character_count: article.frontmatter.content_stats.character_count }];
    });
    return { ...location, configured_markdown_scopes: selectors,
      coverage: '仅当前快照匹配到的公开 Markdown 文件，入口、配套文字和索引分别标注；不能作为完整内容总字数。HTML/PDF/站外正文未计入，同义条目或重复发布文件未进行作品级去重。',
      known_markdown_totals: { article_count: matched.length, word_count: matched.reduce((n, a) => n + a.word_count, 0), character_count: matched.reduce((n, a) => n + a.character_count, 0) },
      matched_markdown: matched,
    };
  });
}
