"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { gsap } from "gsap";

/**
 * "YANTRA" brand reveal — typography collapses into a line, a frame snaps
 * into being from that line, the frame builds into a window, one pane
 * slides open with GENUINE transparency (SVG mask, not a fake fill), then
 * the whole window zooms outward until the mask hole engulfs the viewport
 * and the real site is fully revealed underneath.
 *
 * Mount once near the root of app/layout.js, above {children}.
 */

export default function RevealOverlay() {
  const [show, setShow] = useState(true);
  const [dims, setDims] = useState(null);

  const ranRef = useRef(false);
  const rootRef = useRef(null);
  const textRef = useRef(null);
  const frameRef = useRef(null);
  const holeRef = useRef(null);
  const detailsRef = useRef(null);
  const rightGlassRef = useRef(null);

  // Capture viewport size once on mount.
  // This is a one-shot intro and is not meant to be resize-reactive
  // while the animation is running.
  useLayoutEffect(() => {
    setDims({
      w: window.innerWidth,
      h: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    if (!dims || ranRef.current) return;

    ranRef.current = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setShow(false);
      return;
    }

    document.body.style.overflow = "hidden";

    const { w: vw, h: vh } = dims;

    const cx = vw / 2;
    const cy = vh / 2;

    // ---- geometry -----------------------------------------------------

    const frameW = gsap.utils.clamp(480, 720, vw * 0.42);
    const frameH = frameW * 0.62;

    const frameX = cx - frameW / 2;
    const frameYFinal = cy - frameH / 2;

    const border = 1.6;
    const mullionGap = 3;

    const paneW = (frameW - mullionGap) / 2;
    const rightPaneX = cx + mullionGap / 2;

    // ---- initial states -----------------------------------------------

    gsap.set(textRef.current, {
      transformOrigin: "50% 50%",
      scale: 1,
      opacity: 1,
    });

    gsap.set(frameRef.current, {
      attr: {
        x: frameX,
        y: cy - 3,
        width: frameW,
        height: 6,
      },
      opacity: 0,
    });

    gsap.set(holeRef.current, {
      attr: {
        x: rightPaneX,
        y: frameYFinal,
        width: 0,
        height: frameH,
      },
    });

    gsap.set(detailsRef.current, {
      opacity: 0,
    });

    gsap.set(rightGlassRef.current, {
      x: 0,
    });

    const tl = gsap.timeline({
      defaults: {
        duration: 0.6,
        ease: "power2.inOut",
      },

      onComplete: () => {
        document.body.style.overflow = "";
        setShow(false);
      },
    });

    // Hold the wordmark briefly before anything moves
    tl.to({}, {
      duration: 0.4,
    });

    // PHASE 1 — text compresses vertically into a line
    tl.to(textRef.current, {
      scaleY: 0.02,
      scaleX: 1.04,
      duration: 0.65,
      ease: "power2.in",
    }).to(
      textRef.current,
      {
        opacity: 0,
        duration: 0.15,
        ease: "power1.in",
      },
      "-=0.15"
    );

    // PHASE 2 — instant frame formation from the collapsed line
    tl.to(
      frameRef.current,
      {
        opacity: 1,
        duration: 0.12,
        ease: "power1.out",
      },
      "-=0.05"
    );

    // PHASE 3 — the frame builds into a window
    tl.to(frameRef.current, {
      attr: {
        y: frameYFinal,
        height: frameH,
      },
      duration: 0.6,
      ease: "power3.out",
    });

    tl.to(
      detailsRef.current,
      {
        opacity: 1,
        duration: 0.35,
        ease: "power1.out",
      },
      "-=0.15"
    );

    // PHASE 4 — right pane slides open.
    // The mask hole grows in sync with it, making the opening genuinely
    // transparent so the real page underneath becomes visible.
    tl.to(
      rightGlassRef.current,
      {
        x: paneW,
        duration: 0.5,
        ease: "power2.inOut",
      },
      "+=0.1"
    ).to(
      holeRef.current,
      {
        attr: {
          width: paneW,
        },
        duration: 0.5,
        ease: "power2.inOut",
      },
      "<"
    );

    // PHASE 5a — merge into a single fully-open window.
    // Decorative details recede.
    tl.to(holeRef.current, {
      attr: {
        x: frameX,
        width: frameW,
      },
      duration: 0.18,
      ease: "power1.out",
    }).to(
      detailsRef.current,
      {
        opacity: 0,
        duration: 0.18,
        ease: "power1.in",
      },
      "<"
    );

    // PHASE 5b — window zooms outward until it engulfs the viewport
    tl.to(
      [frameRef.current, holeRef.current],
      {
        scale: 32,
        transformOrigin: "50% 50%",
        duration: 0.95,
        ease: "power3.in",
      },
      "+=0.02"
    );

    // PHASE 5c — safety-net fade for any residual white at extreme
    // aspect ratios.
    tl.to(rootRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.inOut",
    });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [dims]);

  if (!show || !dims) return null;

  const { w: vw, h: vh } = dims;

  const cx = vw / 2;
  const cy = vh / 2;

  const fontSize = gsap.utils.clamp(100, 200, vw * 0.09);

  const frameW = gsap.utils.clamp(480, 720, vw * 0.42);
  const frameH = frameW * 0.62;

  const frameX = cx - frameW / 2;
  const frameY = cy - frameH / 2;

  const border = 1.6;
  const mullionGap = 3;

  const paneW = (frameW - mullionGap) / 2;
  const rightPaneX = cx + mullionGap / 2;

  const trackY1 = frameY + frameH - 16;
  const trackY2 = frameY + frameH - 8;

  const sillOverhang = 16;

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <defs>
          <mask
            id="yantra-window-mask"
            maskUnits="userSpaceOnUse"
          >
            {/* White = stays opaque, black = becomes transparent */}
            <rect
              x={0}
              y={0}
              width={vw}
              height={vh}
              fill="white"
            />

            <rect
              ref={holeRef}
              fill="black"
            />
          </mask>
        </defs>

        {/* White layer punched through by the mask */}
        <rect
          x={0}
          y={0}
          width={vw}
          height={vh}
          fill="#ffffff"
          mask="url(#yantra-window-mask)"
        />

        {/* Frame — grown via real x/y/width/height,
            so the stroke never distorts */}
        <rect
          ref={frameRef}
          fill="none"
          stroke="#161616"
          strokeWidth={border}
        />

        {/* Decorative details:
            mullion, sliding tracks, sill, subtle glass highlights */}
        <g ref={detailsRef}>
          {/* Sill / ledge — reads as a window, not a doorframe */}
          <line
            x1={frameX - sillOverhang}
            y1={frameY + frameH + 7}
            x2={frameX + frameW + sillOverhang}
            y2={frameY + frameH + 7}
            stroke="#161616"
            strokeWidth={2}
            opacity={0.5}
          />

          {/* Center mullion */}
          <line
            x1={cx}
            y1={frameY}
            x2={cx}
            y2={frameY + frameH}
            stroke="#161616"
            strokeWidth={1}
          />

          {/* Sliding tracks */}
          <line
            x1={frameX + 14}
            y1={trackY1}
            x2={frameX + frameW - 14}
            y2={trackY1}
            stroke="#161616"
            strokeWidth={0.75}
            opacity={0.35}
          />

          <line
            x1={frameX + 14}
            y1={trackY2}
            x2={frameX + frameW - 14}
            y2={trackY2}
            stroke="#161616"
            strokeWidth={0.75}
            opacity={0.25}
          />

          {/* Left pane — subtle static diagonal reflection */}
          <line
            x1={frameX + paneW * 0.28}
            y1={frameY + frameH * 0.78}
            x2={frameX + paneW * 0.72}
            y2={frameY + frameH * 0.22}
            stroke="#161616"
            strokeWidth={1}
            opacity={0.07}
          />

          {/* Right pane — slides away with the opening panel */}
          <g ref={rightGlassRef}>
            <line
              x1={rightPaneX + paneW * 0.28}
              y1={frameY + frameH * 0.78}
              x2={rightPaneX + paneW * 0.72}
              y2={frameY + frameH * 0.22}
              stroke="#161616"
              strokeWidth={1}
              opacity={0.07}
            />
          </g>
        </g>

        {/* Brand wordmark */}
        <text
          ref={textRef}
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-cormorant), 'Cormorant Garamond', serif"
          fontWeight={500}
          fontSize={fontSize}
          letterSpacing="0.12em"
          fill="#161616"
        >
          YANTRA
        </text>
      </svg>
    </div>
  );
}