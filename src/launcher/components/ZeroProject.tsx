import type { LauncherProject } from "../types";
import "../zero-project.css";

export function ZeroIdentity({ project }: { project: LauncherProject }) {
  return (
    <section className="zero-identity" aria-label={`${project.code} 项目预览`}>
      <p className="zero-identity__eyebrow"><span>ORIGIN / 00</span><span>SCHNIE</span></p>
      <h1>{project.code}<span aria-hidden="true">.</span></h1>
      <div className="zero-identity__baseline">
        <span className="zero-identity__name">{project.name}</span>
        <span className="zero-identity__rule" aria-hidden="true" />
        <span>第九边缘 / 元点</span>
      </div>
    </section>
  );
}

export function ZeroArchive({ project }: { project: LauncherProject }) {
  return (
    <section className="zero-archive" aria-label="元点档案">
      <div className="zero-archive__index" aria-hidden="true">00</div>
      <div className="zero-archive__body">
        <p className="zero-archive__eyebrow">THE ORIGIN OF SCHNIE</p>
        <h2>一切，从零开始。</h2>
        <p className="zero-archive__description">{project.description}</p>
      </div>
      <div className="zero-archive__footer"><span>元点档案</span><span>ZERO / ORIGIN</span></div>
    </section>
  );
}
