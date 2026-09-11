import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

type Option = { value: string; label: string; detail: string };
type Props = { label: string; value: string; options: Option[]; disabled?: boolean; onChange: (value: string) => void };

export default function TerminalSelect({ label, value, options, disabled = false, onChange }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  const [active, setActive] = useState(selected);
  const search = useRef({ text: '', time: 0 });

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open, id]);

  const choose = (index: number) => {
    if (options[index].value !== value) onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); return; }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active);
      else { setActive(selected); setOpen(true); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : !open ? selected : (active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      setActive(next); setOpen(true);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      search.current = { text: (now - search.current.time < 700 ? search.current.text : '') + event.key.toLowerCase(), time: now };
      const match = options.findIndex(option => option.label.toLowerCase().startsWith(search.current.text));
      if (match >= 0) { setActive(match); setOpen(true); }
    }
  };

  return <div ref={root} className="terminal-select" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <span className="terminal-select__label" id={`${id}-label`}>{label}</span>
    <button ref={trigger} type="button" role="combobox" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined} aria-activedescendant={open ? `${id}-${active}` : undefined} disabled={disabled}
      className="terminal-select__trigger" onKeyDown={onKeyDown} onClick={() => { setActive(selected); setOpen(!open); }}>
      <span>{options[selected].label}</span><svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.2" /></svg>
    </button>
    {open && <div id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className="terminal-select__menu">
      {options.map((option, index) => <div key={option.value} id={`${id}-${index}`} role="option" aria-label={`${option.label} ${option.detail}`} aria-selected={value === option.value} className={`terminal-select__option ${active === index ? 'is-active' : ''}`}
        onPointerMove={() => setActive(index)} onPointerDown={event => event.preventDefault()} onClick={() => choose(index)}>
        <span className="terminal-select__index" aria-hidden="true">0{index + 1}</span><span><strong>{option.label}</strong><small>{option.detail}</small></span><span className="terminal-select__check" aria-hidden="true">{value === option.value ? '✓' : ''}</span>
      </div>)}
    </div>}
  </div>;
}
