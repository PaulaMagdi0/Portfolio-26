'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { ClipReveal, Reveal } from '@/features/ui-components';
import { toLocaleDigits } from '@/lib/digits';
import { cn } from '@/lib/utils';
import type { WorkProject } from '../types';
import { AnimatedMetric } from './AnimatedMetric';
import { WorkVisitLink } from './WorkVisitLink';

interface WorkRowProps {
  project: WorkProject;
  index: number;
  total: number;
  /** Opens the case study. `opener` gets focus back when the drawer closes. */
  onOpen: (project: WorkProject, opener: HTMLElement) => void;
}

type StyledElement = HTMLElement | SVGElement;

/**
 * Mouse-driven parallax for the swatch layers. The rAF loop runs only while the
 * pointer is over the card (plus a short settle after it leaves) — six always-on
 * loops were a measurable main-thread cost for a purely decorative effect.
 */
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
    let running = false;
    let hovering = false;

    const apply = () => {
      layerRefs.forEach((ref, i) => {
        const node = ref.current;
        if (!node) return;
        const d = depth[i] ?? 0;
        node.style.transform = `translate3d(${cx * d}px, ${cy * d}px, 0)`;
      });
    };

    const tick = () => {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      apply();
      const settled = !hovering && Math.abs(mx - cx) < 0.001 && Math.abs(my - cy) < 0.001;
      if (settled) {
        cx = mx;
        cy = my;
        apply();
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      hovering = true;
      start();
    };
    const onLeave = () => {
      mx = 0;
      my = 0;
      hovering = false;
      start();
    };

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
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const bgLayerRef = useRef<HTMLDivElement | null>(null);
  const stripesLayerRef = useRef<SVGSVGElement | null>(null);
  const monoLayerRef = useRef<HTMLDivElement | null>(null);
  const swatchRef = useSwatchParallax([bgLayerRef, stripesLayerRef, monoLayerRef], [-6, 10, 18]);

  const open = () => {
    if (buttonRef.current) onOpen(project, buttonRef.current);
  };

  const name = t(project.nameKey);
  const monogramChar = name.trim().charAt(0) || project.id.charAt(0).toUpperCase();
  const [color1, color2, color3] = project.swatch;
  const isLive = project.kind === 'live';
  const showImage = !imgError;

  return (
    <Reveal as="li" className="work-row group">
      {/* The whole card is a mouse target for convenience, but the accessible control
          is the <button> inside the <h3>: a role="button" wrapper would flatten the six
          titles out of the heading outline and name the button with the card's whole
          text. Clicks anywhere on the card are forwarded to that button, except
          clicks on the "Visit site" link, which must open the site and nothing else. */}
      <div
        onClick={(e) => {
          const target = e.target;
          if (!(target instanceof Node)) return;
          if (buttonRef.current?.contains(target)) return;
          if (target instanceof Element && target.closest('a[href]')) return;
          buttonRef.current?.click();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="grid w-full cursor-pointer grid-cols-1 items-start gap-6 rounded-sm py-10 text-start md:grid-cols-12 md:gap-8 md:py-14"
        data-cursor-label={t('ui.cursor.caseStudy')}
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
              <button
                ref={buttonRef}
                type="button"
                onClick={open}
                onFocus={() => setHovered(true)}
                onBlur={() => setHovered(false)}
                aria-haspopup="dialog"
                className="focus-visible:ring-amber/60 cursor-pointer rounded-sm text-start focus-visible:ring-1 focus-visible:outline-none"
              >
                <span className="title-underline">{name}</span>
                <span className="sr-only">{t('home.work.ariaCaseStudy')}</span>
              </button>
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
          <div className="text-inkmute mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <span>{t(project.companyKey)}</span>
            <span className="bg-inkmute h-1 w-1 rounded-full" />
            <span>{t(project.periodKey)}</span>
            {isLive ? (
              // Separator and link wrap as one unit so a line break never strands the dot.
              <span className="inline-flex items-center gap-3">
                <span className="bg-inkmute h-1 w-1 rounded-full" />
                <WorkVisitLink href={project.url} />
              </span>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 self-start md:col-span-3 md:grid-cols-1">
          {project.highlights.map((m) => (
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
                {showImage ? (
                  <>
                    {/* Below the fold, so next/image lazy-loads it; the gradient layer
                        underneath is the placeholder until the fade-in completes. */}
                    <Image
                      src={project.image}
                      alt={t('home.work.screenshotAlt', { name })}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 25vw, 300px"
                      onLoad={() => setImgLoaded(true)}
                      onError={() => setImgError(true)}
                      className={cn(
                        'object-cover object-top transition-opacity duration-700 ease-out',
                        imgLoaded ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60"
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
                      <span
                        className="font-serif text-[80px] leading-none select-none md:text-[110px]"
                        style={{ color: color3, opacity: 0.2 }}
                      >
                        {monogramChar}
                      </span>
                    </div>
                  </>
                )}
                {/* The swatch gradient and the screenshot scrim are always dark, so overlay
                    text uses fixed light colours (and the card's own accent) rather than
                    theme tokens, which would go dark-on-dark in light mode. */}
                <div className="absolute inset-0 flex items-start justify-between gap-3 p-3 font-mono text-[9px] tracking-[0.18em] text-white/70 uppercase">
                  <span className="hidden min-w-0 truncate lg:inline">{project.id}</span>
                  <span
                    className="ml-auto max-w-full shrink-0 truncate rounded-sm border bg-black/40 px-1.5 py-0.5 text-[8px] tracking-[0.06em] backdrop-blur-[2px] lg:text-[9px] lg:tracking-[0.12em]"
                    style={{ color: color3, borderColor: `${color3}80` }}
                  >
                    {t(project.badgeKey)}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-end justify-between p-3 font-mono text-[9px] tracking-[0.2em] text-white/70 uppercase">
                  <span className="inline-flex items-center gap-1.5">
                    {isLive ? (
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
                      />
                    ) : null}
                    <span className={isLive ? 'text-emerald-300' : undefined}>
                      {t(`home.work.kind.${project.kind}`)}
                    </span>
                  </span>
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
