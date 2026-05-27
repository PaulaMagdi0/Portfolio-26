'use client';

import { useTranslations } from 'next-intl';
import type { WorkProject } from '../types';

interface WorkRowProps {
  project: WorkProject;
  index: number;
  onOpen: (project: WorkProject) => void;
}

export function WorkRow({ project, index, onOpen }: WorkRowProps) {
  const t = useTranslations();
  const indexLabel = String(index + 1).padStart(2, '0');

  const handleClick = () => {
    if (project.kind === 'live' && project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    } else {
      onOpen(project);
    }
  };

  return (
    <li className="work-row group">
      <button
        type="button"
        onClick={handleClick}
        className="grid w-full grid-cols-1 items-baseline gap-6 py-8 text-start md:grid-cols-12 md:py-12"
        data-cursor-label={project.kind === 'live' ? 'VISIT' : 'CASE STUDY'}
        data-magnetic
      >
        <div className="md:col-span-1">
          <span className="text-inkmute font-mono text-[11px] tracking-[0.18em] uppercase">
            {indexLabel}
          </span>
        </div>
        <div className="md:col-span-6">
          <h3 className="title-underline inline font-serif text-[28px] leading-tight md:text-[36px]">
            {t(project.nameKey)}
          </h3>
          <p className="text-inkdim mt-3 text-[14px]">{t(project.blurbKey)}</p>
        </div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 md:col-span-4">
          {project.metrics.map((m) => (
            <div key={m.labelKey}>
              <span className="text-amber block font-mono text-[14px]">{m.value}</span>
              <span className="text-inkmute block font-mono text-[10px] tracking-[0.18em] uppercase">
                {t(m.labelKey)}
              </span>
            </div>
          ))}
        </div>
        <div className="md:col-span-1">
          <span className="text-amber font-mono text-[10px] tracking-[0.18em] uppercase">
            {t(project.badgeKey)}
          </span>
        </div>
      </button>
    </li>
  );
}
