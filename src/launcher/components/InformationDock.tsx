import { useEffect, useId, useRef, useState, type KeyboardEvent, type WheelEvent } from "react";
import { A11y, Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { FeedItem, FeedKind, LauncherProject } from "../types";
import "swiper/css";
import "swiper/css/navigation";

export const MAX_VISIBLE_FEED_ITEMS = 3;

const feedTabs: Array<{ kind: FeedKind; label: string }> = [
  { kind: "announcement", label: "公告" },
  { kind: "news", label: "新闻" },
  { kind: "information", label: "资讯" },
];

export function isExternalFeedHref(href: string): boolean {
  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

function FeedRow({ item }: { item: FeedItem }) {
  const content = (
    <>
      <span className="information-dock__feed-tag">{item.tag ?? "资讯"}</span>
      <span className="information-dock__feed-title">{item.title}</span>
      <time dateTime={item.date}>{item.date}</time>
    </>
  );

  const opensExternally = item.href && isExternalFeedHref(item.href);

  return item.href ? (
    <a
      className="information-dock__feed-row"
      href={item.href}
      {...(opensExternally ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  ) : (
    <article className="information-dock__feed-row">{content}</article>
  );
}

export default function InformationDock({ project }: { project: LauncherProject }) {
  const [activeFeed, setActiveFeed] = useState<FeedKind>("announcement");
  const [feedPage, setFeedPage] = useState(0);
  const wheelUnlockTimer = useRef<number | undefined>(undefined);
  const tabId = useId();
  const panelId = `${tabId}-${project.id}-panel`;
  const feed = [...project.feeds[activeFeed]].sort((left, right) => (right.top ?? 0) - (left.top ?? 0));
  const pageCount = Math.max(1, Math.ceil(feed.length / MAX_VISIBLE_FEED_ITEMS));
  const visibleFeed = feed.slice(feedPage * MAX_VISIBLE_FEED_ITEMS, (feedPage + 1) * MAX_VISIBLE_FEED_ITEMS);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    setActiveFeed("announcement");
  }, [project.id]);

  useEffect(() => {
    setFeedPage(0);
  }, [activeFeed, project.id]);

  useEffect(() => () => window.clearTimeout(wheelUnlockTimer.current), []);

  const selectTab = (kind: FeedKind) => {
    setActiveFeed(kind);
    document.getElementById(`${tabId}-${kind}`)?.focus();
  };

  const onFeedWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (pageCount <= 1 || Math.abs(event.deltaY) < 8 || wheelUnlockTimer.current !== undefined) return;

    const nextPage = Math.min(pageCount - 1, Math.max(0, feedPage + (event.deltaY > 0 ? 1 : -1)));
    if (nextPage === feedPage) return;

    event.preventDefault();
    setFeedPage(nextPage);
    wheelUnlockTimer.current = window.setTimeout(() => {
      wheelUnlockTimer.current = undefined;
    }, 240);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: FeedKind) => {
    const index = feedTabs.findIndex((tab) => tab.kind === current);
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % feedTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + feedTabs.length) % feedTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = feedTabs.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    selectTab(feedTabs[nextIndex].kind);
  };

  return (
    <section className="information-dock" data-testid="information-dock" aria-label={`${project.code} 信息`}> 
      <div className="information-dock__cover">
        {project.slides.length > 0 ? (
          <Swiper
            key={project.id}
            modules={[Autoplay, A11y, Navigation]}
            loop
            navigation
            autoplay={reducedMotion ? false : { delay: 5000, disableOnInteraction: false }}
            a11y={{ enabled: true }}
          >
            {project.slides.map((slide) => (
              <SwiperSlide key={slide.title}>
                {slide.href ? (
                  <a
                    href={slide.href}
                    className="information-dock__slide-link"
                    {...(isExternalFeedHref(slide.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <img src={slide.image} alt={slide.title} />
                  </a>
                ) : (
                  <img src={slide.image} alt={slide.title} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="information-dock__cover-placeholder" aria-label={`${project.code} 轮播图占位`}>
            {project.code}
          </div>
        )}
      </div>
      <div className="information-dock__feeds">
        <div className="information-dock__tabs" role="tablist" aria-label="信息分类">
          {feedTabs.map(({ kind, label }) => {
            const selected = activeFeed === kind;
            const id = `${tabId}-${kind}`;

            return (
              <button
                key={kind}
                type="button"
                role="tab"
                id={id}
                aria-controls={panelId}
                aria-selected={selected}
                className="information-dock__tab"
                onClick={() => setActiveFeed(kind)}
                onKeyDown={(event) => onTabKeyDown(event, kind)}
                tabIndex={selected ? 0 : -1}
              >
                {label}
              </button>
            );
          })}
          {pageCount > 1 ? <span className="information-dock__pager" aria-live="polite">{feedPage + 1} / {pageCount}</span> : null}
        </div>
        <div
          key={`${project.id}-${activeFeed}`}
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${tabId}-${activeFeed}`}
          aria-label={`${feedTabs.find((tab) => tab.kind === activeFeed)?.label}，滚轮翻页`}
          className="information-dock__feed-list"
          onWheel={onFeedWheel}
          tabIndex={0}
        >
          <div className="information-dock__feed-page" key={`${project.id}-${activeFeed}-${feedPage}`}>
            {visibleFeed.length > 0 ? visibleFeed.map((item) => <FeedRow key={`${item.date}-${item.title}`} item={item} />) : <p className="information-dock__empty">内容由站点维护者补充</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
