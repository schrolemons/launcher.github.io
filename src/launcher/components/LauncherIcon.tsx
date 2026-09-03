type LauncherIconProps = {
  className?: string;
  name?: "close" | "fullscreen" | "github" | "info" | "link" | "monitor" | "muted" | "outbound" | "pause" | "play" | "volume" | "wechat";
};

function IconDrawing({ name }: { name: NonNullable<LauncherIconProps["name"]> }) {
  switch (name) {
    case "close": return <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>;
    case "fullscreen": return <><path d="M8 3H3v5" /><path d="M16 3h5v5" /><path d="M21 16v5h-5" /><path d="M8 21H3v-5" /></>;
    case "github": return <><circle cx="12" cy="12" r="8.5" /><path d="M8.2 15.8c1.2.7 2.4.9 3.8.9 3.9 0 5.5-2.4 5.5-5.4 0-1.7-.6-3-1.7-4 .2-.8.1-1.8-.3-2.7-1.1 0-2.2.7-2.8 1.2a9.8 9.8 0 0 0-5.4 0C6.7 5.3 5.6 4.6 4.5 4.6c-.4.9-.5 1.9-.3 2.7a5.3 5.3 0 0 0-1.7 4c0 2.2.9 4.1 3.1 5" /><path d="M8.2 19v-3.1" /></>;
    case "info": return <><circle cx="12" cy="12" r="9" /><path d="M12 10.8v5.4" /><path d="M12 7.5h.01" /></>;
    case "monitor": return <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 12l2.2-2.2 2.2 2 3.6-4 2 1.8" /></>;
    case "muted": return <><path d="M4 10v4h3l4 3V7l-4 3H4z" /><path d="M16 10l4 4" /><path d="M20 10l-4 4" /></>;
    case "outbound": return <><path d="M8 16L16.5 7.5" /><path d="M10 7.5h6.5V14" /></>;
    case "pause": return <><path d="M9 6v12" /><path d="M15 6v12" /></>;
    case "play": return <path d="M8 5.5l10 6.5-10 6.5v-13z" />;
    case "volume": return <><path d="M4 10v4h3l4 3V7l-4 3H4z" /><path d="M15 9c1.7 1.7 1.7 4.3 0 6" /><path d="M18 6.5c3 3 3 8 0 11" /></>;
    case "wechat": return <><path d="M13.5 15.5c-1.1.6-2.4.9-3.8.9-4 0-7.2-2.5-7.2-5.7S5.7 5 9.7 5s7.2 2.5 7.2 5.7c0 .4-.1.8-.2 1.2" /><path d="M5.4 15.2l-1 2.3 2.8-1" /><path d="M13.8 12c3.7 0 6.7 2.2 6.7 5 0 1-.4 2-1.1 2.8l.8 1.9-2.3-.8c-1.1.6-2.5 1-4.1 1-3.7 0-6.7-2.2-6.7-5" /><path d="M7.7 9h.01M11.8 9h.01M13 16h.01M16.7 16h.01" /></>;
    case "link":
    default: return <><path d="M10 13.5l4-4" /><path d="M7.4 15.6l-1 1a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0" /><path d="M16.6 8.4l1-1a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" /></>;
  }
}

export default function LauncherIcon({ className, name = "link" }: LauncherIconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <IconDrawing name={name} />
    </svg>
  );
}
