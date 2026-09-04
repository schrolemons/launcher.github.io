import { Fragment } from "react";
import type { LauncherProject, ProjectId } from "../types";

type ProjectRailProps = {
  projects: LauncherProject[];
  activeId: ProjectId;
  onSelect: (id: ProjectId) => void;
};

export default function ProjectRail({ projects, activeId, onSelect }: ProjectRailProps) {
  return (
    <nav className="launcher-rail" aria-label="项目选择">
      <div className="launcher-rail__brand" aria-label="SCHNIE Projects">
        <span className="launcher-rail__wordmark">SCHNIE</span>
        <span className="launcher-rail__brand-subtitle">PROJECTS</span>
      </div>
      <div className="launcher-rail__projects">
        {projects.map((project) => (
          <Fragment key={project.id}>
            {project.id === "zero" && <div className="launcher-rail__divider" aria-hidden="true" />}
            <button
              className="launcher-rail__project"
              type="button"
              aria-label={`选择 ${project.code}`}
              aria-pressed={project.id === activeId}
              onClick={() => onSelect(project.id)}
            >
              {project.code}
            </button>
          </Fragment>
        ))}
      </div>
    </nav>
  );
}
