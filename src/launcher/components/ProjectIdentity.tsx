import type { LauncherProject } from "../types";

type ProjectIdentityProps = {
  project: LauncherProject;
};

export default function ProjectIdentity({ project }: ProjectIdentityProps) {
  const descriptionParts = project.description.split(" · ");

  return (
    <section className="launcher-identity" aria-label={`${project.code} 项目预览`}>
      <p className="launcher-identity__code">{project.code}</p>
      <h1>{project.name}</h1>
      <p className="launcher-identity__description">
        {descriptionParts.map((part, index) => (
          <span key={`${project.id}-${part}`}>
            {index > 0 ? " · " : ""}
            {part}
          </span>
        ))}
      </p>
    </section>
  );
}
