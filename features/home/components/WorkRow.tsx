'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { ClipReveal, Reveal } from '@/features/ui-components';
import { toLocaleDigits } from '@/lib/digits';
import type { WorkProject } from '../types';
import { AnimatedMetric } from './AnimatedMetric';

interface WorkRowProps {
  project: WorkProject;
  index: number;
  total: number;
  onOpen: (project: WorkProject) => void;
}

type StyledElement = HTMLElement | SVGElement;

function useSwatchParallax(
  layerRefs: ReadonlyArray<React.RefObject<StyledElement | null>>,
  depth: ReadonlyArray<number>,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    };
    const onLeave = () => {
      mx = 0;
      my = 0;
    };

    const tick = () => {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      layerRefs.forEach((ref, i) => {
        const node = ref.current;
        if (!node) return;
        const d = depth[i] ?? 0;
        node.style.transform = `translate3d(${cx * d}px, ${cy * d}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [layerRefs, depth]);

  return containerRef;
}

export function WorkRow({ project, index, total, onOpen }: WorkRowProps) {
  const t = useTranslations();
  const locale = useLocale();
  const indexLabel = toLocaleDigits(String(index + 1).padStart(2, '0'), locale);
  const totalLabel = toLocaleDigits(String(total).padStart(2, '0'), locale);
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const bgLayerRef = useRef<HTMLDivElement | null>(null);
  const stripesLayerRef = useRef<SVGSVGElement | null>(null);
  const monoLayerRef = useRef<HTMLDivElement | null>(null);
  const swatchRef = useSwatchParallax([bgLayerRef, stripesLayerRef, monoLayerRef], [-6, 10, 18]);

  const isLive = project.kind === 'live';
  const hasLiveLink = isLive && !!project.url;
  let cursorLabel = t('ui.cursor.caseStudy');
  if (hasLiveLink && project.url) {
    try {
      cursorLabel = new URL(project.url).hostname;
    } catch {
      cursorLabel = t('ui.cursor.visit');
    }
  }

  const activate = () => {
    if (hasLiveLink && project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    } else {
      onOpen(project);
    }
  };

  // No author-supplied name (aria-label/labelledby) on the card: an
  // `aria-label` on this content-rich `role="button"` always trips axe's
  // `label-content-name-mismatch` because the card's full visible text can't
  // fit the label. Instead the accessible name is computed from the card's
  // content, and the action hint ("opens in new tab" / "view case study") is
  // appended as a visually-hidden child so screen readers still announce it.
  const actionHint = hasLiveLink ? t('home.work.ariaVisit') : t('home.work.ariaCaseStudy');

  const monogramChar = t(project.nameKey).trim().charAt(0) || project.id.charAt(0).toUpperCase();
  const [color1, color2, color3] = project.swatch;
  const showImage = Boolean(project.image) && !imgError;

  return (
    <Reveal as="li" className="work-row group">
      {/* div, not article: ARIA forbids role="button" on <article> (axe
          aria-allowed-role), and the button role suppresses article
          semantics for AT anyway — the <li> provides the list structure. */}
      <div
        role="button"
        tabIndex={0}
        onClick={activate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate();
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="focus-visible:ring-amber/60 grid w-full cursor-pointer grid-cols-1 items-start gap-6 rounded-sm py-10 text-start focus-visible:ring-1 focus-visible:outline-none md:grid-cols-12 md:gap-8 md:py-14"
        data-cursor-label={cursorLabel}
        data-magnetic
      >
        <div className="md:col-span-1">
          <span className="text-inkmute font-mono text-[11px] tracking-[0.18em] uppercase">
            {indexLabel}
          </span>
        </div>
        <div className="md:col-span-5">
          <div className="mb-3 flex items-baseline gap-3">
            <h3 className="text-ink font-serif text-[28px] leading-[1.1] md:text-[36px]">
              <span className="title-underline">{t(project.nameKey)}</span>
              <span className="sr-only">{actionHint}</span>
            </h3>
            <motion.span
              aria-hidden
              className="text-amber inline-flex shrink-0"
              animate={{
                x: hovered ? 4 : 0,
                y: hovered ? -4 : 0,
                opacity: hovered ? 1 : 0.5,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </motion.span>
          </div>
          <p className="text-inkdim max-w-[440px] text-[14px] leading-relaxed">
            {t(project.blurbKey)}
          </p>
          <div className="text-inkmute mt-4 flex items-center gap-3 font-mono text-[11px]">
            <span>{t(project.companyKey)}</span>
            <span className="bg-inkmute h-1 w-1 rounded-full" />
            <span>{t(project.periodKey)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 self-start md:col-span-3 md:grid-cols-1">
          {project.metrics.map((m) => (
            <div
              key={m.labelKey}
              className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3"
            >
              <span className="text-ink font-serif text-[24px] leading-none tabular-nums md:text-[28px]">
                <AnimatedMetric value={m.value} />
              </span>
              <span className="text-inkmute font-mono text-[10px] tracking-[0.08em] uppercase md:text-[11px]">
                {t(m.labelKey)}
              </span>
            </div>
          ))}
        </div>
        <div className="self-start md:col-span-3">
          <div data-skew style={{ willChange: 'transform' }}>
            <ClipReveal>
              <div
                ref={swatchRef}
                className="border-line relative aspect-[4/3] overflow-hidden rounded-md border"
              >
                <div
                  ref={bgLayerRef}
                  className="absolute inset-[-10%]"
                  style={{
                    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 60%, ${color3}22 100%)`,
                    willChange: 'transform',
                  }}
                />
                {project.image && !imgError ? (
                  <>
                    <Image
                      src={project.image}
                      alt={`${t(project.nameKey)} — screenshot`}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      onLoad={() => setImgLoaded(true)}
                      onError={() => setImgError(true)}
                      className={`object-cover object-top transition-opacity duration-700 ease-out ${
                        imgLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50"
                    />
                  </>
                ) : (
                  <>
                    <svg
                      ref={stripesLayerRef}
                      className="absolute inset-[-10%] h-[120%] w-[120%] opacity-[0.07]"
                      aria-hidden
                      style={{ willChange: 'transform' }}
                    >
                      <defs>
                        <pattern
                          id={`stripes-${project.id}`}
                          width="8"
                          height="8"
                          patternUnits="userSpaceOnUse"
                          patternTransform="rotate(45)"
                        >
                          <rect width="1" height="8" fill="#ededed" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#stripes-${project.id})`} />
                    </svg>
                    <div
                      ref={monoLayerRef}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ willChange: 'transform' }}
                    >
                      <span className="text-ink/15 font-serif text-[80px] leading-none select-none md:text-[110px]">
                        {monogramChar}
                      </span>
                    </div>
                  </>
                )}
                <div className="absolute inset-0 flex items-start justify-between p-3 font-mono text-[9px] tracking-[0.18em] uppercase">
                  <span className={showImage ? 'text-white/80' : 'text-ink/40'}>{project.id}</span>
                  {isLive ? (
                    <span className="bg-bg/40 flex items-center gap-1.5 rounded-sm border border-emerald-400/60 px-1.5 py-0.5 text-emerald-400 backdrop-blur-[2px]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      {t(project.badgeKey)}
                    </span>
                  ) : (
                    <span className="text-amber/90 border-amber/40 bg-bg/40 rounded-sm border px-1.5 py-0.5 backdrop-blur-[2px]">
                      {t(project.badgeKey)}
                    </span>
                  )}
                </div>
                <div
                  className={`absolute inset-0 flex items-end justify-between p-3 font-mono text-[9px] tracking-[0.2em] uppercase ${
                    showImage ? 'text-white/75' : 'text-ink/40'
                  }`}
                >
                  <span>{project.kind}</span>
                  <span>
                    {indexLabel}/{totalLabel}
                  </span>
                </div>
              </div>
            </ClipReveal>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="border-line bg-bg2/40 text-inkdim rounded border px-2 py-1 font-mono text-[10px]"
              >
                {tag.split(' (')[0]}
              </span>
            ))}
            {project.stack.length > 6 ? (
              <span className="text-inkmute px-2 py-1 font-mono text-[10px]">
                +{project.stack.length - 6}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
