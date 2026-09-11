import type { LauncherProject } from "../types";

type ProjectIdentityProps = {
  project: LauncherProject;
};

export default function ProjectIdentity({ project }: ProjectIdentityProps) {
  const descriptionParts = project.description.split(" · ");
  const sharedArchive = project.id === "ark" || project.id === "world";

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
      {sharedArchive && <p className="launcher-identity__relation"><span>SHARED ARCHIVE</span> ARK / WORLD 使用同一世界档案，仅呈现方式不同</p>}
    </section>
  );
}
