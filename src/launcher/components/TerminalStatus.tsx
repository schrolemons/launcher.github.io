import type { CSSProperties } from 'react';

type Props = {
  status: string;
  state: 'ready' | 'busy' | 'error';
  contextPercent: number;
  contextChars: number;
  contextLimit: number;
  trust?: number;
  affinity?: number;
};

export default function TerminalStatus({ status, state, contextPercent, contextChars, contextLimit, trust, affinity }: Props) {
  const metrics = [
    { id: 'context', label: '上下文', name: '上下文占用', value: contextPercent, hint: `当前对话与输入共 ${contextChars} / ${contextLimit} 字符；为字符估算，发送时会自动裁剪历史。` },
    { id: 'trust', label: '可信度', name: '回答可信度', value: trust, hint: '模型对本次回答证据与完整度的自评，不代表经过校准的事实准确率。' },
    { id: 'affinity', label: '好感度', name: '好感度', value: affinity, hint: '模型给出的互动氛围评分，用于终端表现，不影响事实和证据判断。' },
  ];
  return <div className="world-terminal__statusbar" role="group" aria-label="终端状态" data-state={state}>
    <div className="world-terminal__signal" role="status" title={status}>
      <i aria-hidden="true" /><span>{status}</span>
    </div>
    {metrics.map(({ id, label, name, value, hint }) => <div className={`world-terminal__metric world-terminal__metric--${id}`} key={id} title={hint}>
      <div className="world-terminal__metric-label"><span>{label}</span><strong>{value === undefined ? '—' : `${value}%`}</strong></div>
      <div className="world-terminal__metric-track" role={value === undefined ? undefined : 'meter'} aria-label={value === undefined ? undefined : name}
        aria-valuemin={value === undefined ? undefined : 0} aria-valuemax={value === undefined ? undefined : 100} aria-valuenow={value}
        style={{ '--metric-fill': `${value ?? 0}%` } as CSSProperties}><i /></div>
    </div>)}
  </div>;
}
