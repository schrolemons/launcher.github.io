import { useState } from "react";
import type { LauncherProject } from "../types";
import LauncherIcon from "./LauncherIcon";

type ProjectActionProps = {
  project: LauncherProject;
};

export default function ProjectAction({ project }: ProjectActionProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hostname = new URL(project.url).hostname;

  return (
    <div className="launcher-project-action">
      <a className="launcher-action" href={project.url} rel="noopener noreferrer" target="_blank">
        {project.actionLabel} <LauncherIcon name="outbound" />
      </a>
      <button
        aria-expanded={detailsOpen}
        aria-label={`${detailsOpen ? "隐藏" : "显示"} ${project.name} 详情`}
        className="launcher-project-action__details-toggle"
        onClick={() => setDetailsOpen((isOpen) => !isOpen)}
        type="button"
      >
        <LauncherIcon name="info" />
      </button>
      {detailsOpen && (
        <section aria-label={`${project.name} 详情`} className="launcher-project-action__details">
          <strong>{project.name}</strong>
          <p>{project.description}</p>
          <span>{hostname}</span>
        </section>
      )}
    </div>
  );
}
