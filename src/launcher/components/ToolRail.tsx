import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { LauncherTool } from "../types";
import LauncherIcon from "./LauncherIcon";

type ToolRailProps = {
  tools: LauncherTool[];
  openToolId: string | null;
  accent: string;
  accentSoft: string;
  onOpenTool: (toolId: string) => void;
  onCloseTool: () => void;
};

type ToolPopoverProps = {
  tool: Exclude<LauncherTool, { mode: "link" }>;
  accent: string;
  accentSoft: string;
  onClose: () => void;
};

export function ToolPopover({ tool, accent, accentSoft, onClose }: ToolPopoverProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const accentStyle = { "--accent": accent, "--accent-soft": accentSoft } as CSSProperties;

  useEffect(() => {
    setImageFailed(false);
    setZoomed(false);
  }, [tool.id, tool.qrImage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (zoomed) setZoomed(false);
        else onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, zoomed]);

  return (
    <>
      <div className="launcher-tool-popover__backdrop" onClick={onClose} style={accentStyle}>
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
            <button
              aria-label={`放大 ${tool.label} 二维码`}
              className="launcher-tool-popover__qr-button"
              onClick={() => setZoomed(true)}
              type="button"
            >
              <img
                alt={`${tool.label} 二维码`}
                className="launcher-tool-popover__qr"
                onError={() => setImageFailed(true)}
                src={tool.qrImage}
              />
            </button>
          )}
          {tool.mode === "both" && (
            <a className="launcher-tool-popover__visit" href={tool.href} rel="noopener noreferrer" target="_blank">
              直接访问
            </a>
          )}
        </section>
      </div>
      {zoomed && !imageFailed && (
        <div
          aria-label={`${tool.label} 二维码（放大）`}
          className="launcher-tool-popover__zoom"
          onClick={() => setZoomed(false)}
          role="dialog"
          style={accentStyle}
        >
          <button aria-label="关闭放大二维码" className="launcher-tool-popover__zoom-close" onClick={() => setZoomed(false)} type="button">
            <LauncherIcon name="close" />
          </button>
          <img alt={`${tool.label} 二维码（放大）`} src={tool.qrImage} />
        </div>
      )}
    </>
  );
}

export default function ToolRail({ tools, openToolId, accent, accentSoft, onOpenTool, onCloseTool }: ToolRailProps) {
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
      {openTool && createPortal(
        <ToolPopover key={openTool.id} accent={accent} accentSoft={accentSoft} onClose={onCloseTool} tool={openTool} />,
        document.body,
      )}
    </aside>
  );
}
