import { useEffect, useState } from "react";
import type { LauncherTool } from "../types";
import LauncherIcon from "./LauncherIcon";

type ToolRailProps = {
  tools: LauncherTool[];
  openToolId: string | null;
  onOpenTool: (toolId: string) => void;
  onCloseTool: () => void;
};

type ToolPopoverProps = {
  tool: Exclude<LauncherTool, { mode: "link" }>;
  onClose: () => void;
};

export function ToolPopover({ tool, onClose }: ToolPopoverProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [tool.id, tool.qrImage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="launcher-tool-popover__backdrop" onClick={onClose}>
      <section
        aria-labelledby={`${tool.id}-tool-title`}
        aria-modal="true"
        className="launcher-tool-popover"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label={`关闭 ${tool.label} 二维码`} className="launcher-tool-popover__close" onClick={onClose} type="button">
          <LauncherIcon name="close" />
        </button>
        <p className="launcher-tool-popover__eyebrow">工具连接</p>
        <h2 id={`${tool.id}-tool-title`}>{tool.label}</h2>
        <p>{tool.description}</p>
        {imageFailed ? (
          <p className="launcher-tool-popover__image-error" role="status">二维码图片不可用</p>
        ) : (
          <img alt={`${tool.label} 二维码`} className="launcher-tool-popover__qr" onError={() => setImageFailed(true)} src={tool.qrImage} />
        )}
        {tool.mode === "both" && (
          <a className="launcher-tool-popover__visit" href={tool.href} rel="noopener noreferrer" target="_blank">
            直接访问 <LauncherIcon name="outbound" />
          </a>
        )}
      </section>
    </div>
  );
}

export default function ToolRail({ tools, openToolId, onOpenTool, onCloseTool }: ToolRailProps) {
  const openTool = tools.find((tool): tool is Exclude<LauncherTool, { mode: "link" }> => tool.id === openToolId && tool.mode !== "link");

  return (
    <aside aria-label="工具" className="launcher-tool-rail">
      <div className="launcher-tool-rail__items">
        {tools.map((tool) => tool.mode === "link" ? (
          <a aria-label={tool.label} className="launcher-tool-rail__item" data-tooltip={tool.label} href={tool.href} key={tool.id} rel="noopener noreferrer" target="_blank">
            <LauncherIcon name={tool.icon} />
            <span className="launcher-sr-only">{tool.label}</span>
          </a>
        ) : (
          <button
            aria-label={tool.label}
            aria-expanded={openTool?.id === tool.id}
            className="launcher-tool-rail__item"
            data-tooltip={tool.label}
            key={tool.id}
            onClick={() => onOpenTool(tool.id)}
            type="button"
          >
            <LauncherIcon name={tool.icon} />
            <span className="launcher-sr-only">{tool.label}</span>
          </button>
        ))}
      </div>
      {openTool && <ToolPopover key={openTool.id} onClose={onCloseTool} tool={openTool} />}
    </aside>
  );
}
