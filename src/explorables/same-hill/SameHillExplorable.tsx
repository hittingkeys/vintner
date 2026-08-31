import * as d3 from "d3";
import { useId, useMemo, useRef, useState } from "react";
import {
  DEFAULT_PIN_BEARING_DEG,
  DEFAULT_PIN_R_M,
  FIXTURE_R,
  HILL_R_MAX_M,
  JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT,
  PENNER_ASH_FROST_HOURS_PCT,
  PENNER_ASH_LOGGER_COUNT,
  PENNER_ASH_VINEYARD_COUNT,
  RLC_POCKET_THRESHOLD,
  SOLAR_HIGHEST_BEARING,
} from "./constants";
import {
  RLC_POCKET_Z_M,
  evaluateSite,
  frostPocketInnerRM,
  profileHeights,
  wrapBearingDeg,
  xyToPolar,
  type SiteState,
} from "./model";
import "./same-hill.css";

const PLAN = {
  w: 480,
  h: 560,
  cx: 240,
  cy: 248,
  hillPx: 138,
  ringInner: 154,
  ringOuter: 186,
};
const PROFILE = { w: 520, h: 280, m: { top: 28, right: 56, bottom: 72, left: 44 } };
const PIN_R = 7;

function svgPoint(svg: SVGSVGElement, event: PointerEvent): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    const vb = svg.viewBox.baseVal;
    const vbW = vb?.width || PLAN.w;
    const vbH = vb?.height || PLAN.h;
    return {
      x: ((event.clientX - rect.left) / rect.width) * vbW,
      y: ((event.clientY - rect.top) / rect.height) * vbH,
    };
  }
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const local = pt.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

/** Compass bearing 0 = north, clockwise → SVG coords (y down). */
function polar(cx: number, cy: number, r: number, bearingDeg: number): { x: number; y: number } {
  const a = ((bearingDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Equal-width annulus sector. Thickness does not encode class (F1). */
function annulusSector(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  fromDeg: number,
  toDeg: number,
): string {
  let span = wrapBearingDeg(toDeg - fromDeg);
  if (span === 0) span = 360;
  const large = span > 180 ? 1 : 0;
  const p0o = polar(cx, cy, r1, fromDeg);
  const p1o = polar(cx, cy, r1, toDeg);
  const p1i = polar(cx, cy, r0, toDeg);
  const p0i = polar(cx, cy, r0, fromDeg);
  return [
    `M ${p0o.x} ${p0o.y}`,
    `A ${r1} ${r1} 0 ${large} 1 ${p1o.x} ${p1o.y}`,
    `L ${p1i.x} ${p1i.y}`,
    `A ${r0} ${r0} 0 ${large} 0 ${p0i.x} ${p0i.y}`,
    "Z",
  ].join(" ");
}

function PlanHill({
  site,
  onMove,
}: {
  site: SiteState;
  onMove: (rM: number, bearingDeg: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const scale = PLAN.hillPx / HILL_R_MAX_M;
  const ghost = evaluateSite(DEFAULT_PIN_R_M, DEFAULT_PIN_BEARING_DEG);
  const showGhost = Math.hypot(site.xM - ghost.xM, site.yM - ghost.yM) > 8;
  const { cx, cy, ringInner, ringOuter } = PLAN;
  const ringMid = (ringInner + ringOuter) / 2;

  const sectors = [
    {
      key: "highest",
      cls: "sun-wedge-highest",
      from: SOLAR_HIGHEST_BEARING.fromDeg,
      to: SOLAR_HIGHEST_BEARING.toDeg,
    },
    { key: "less", cls: "sun-wedge-less", from: 292.5, to: 67.5 },
    { key: "more-se", cls: "sun-wedge-more", from: 67.5, to: 157.5 },
    { key: "more-w", cls: "sun-wedge-more", from: 202.5, to: 292.5 },
  ];

  const dragging = useRef(false);

  function toPlan(xM: number, yM: number): { x: number; y: number } {
    return { x: cx + xM * scale, y: cy - yM * scale };
  }

  function setFromPointer(event: PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const p = svgPoint(svg, event);
    const xM = (p.x - cx) / scale;
    const yM = (cy - p.y) / scale;
    const polarPos = xyToPolar(xM, yM);
    onMove(Math.min(HILL_R_MAX_M, polarPos.rM), polarPos.bearingDeg);
  }

  // A2: keep capture on the SVG for the whole gesture, even after leaving .pin-hit.
  function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    dragging.current = true;
    const target = event.currentTarget;
    if (typeof target.setPointerCapture === "function") {
      target.setPointerCapture(event.pointerId);
    }
    setFromPointer(event.nativeEvent);
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const captured =
      typeof event.currentTarget.hasPointerCapture === "function" &&
      event.currentTarget.hasPointerCapture(event.pointerId);
    if (!dragging.current && !captured) return;
    setFromPointer(event.nativeEvent);
  }

  function onPointerUp(event: React.PointerEvent<SVGSVGElement>) {
    dragging.current = false;
    const target = event.currentTarget;
    if (
      typeof target.hasPointerCapture === "function" &&
      typeof target.releasePointerCapture === "function" &&
      target.hasPointerCapture(event.pointerId)
    ) {
      target.releasePointerCapture(event.pointerId);
    }
  }

  const pin = toPlan(site.xM, site.yM);
  const ghostPt = toPlan(ghost.xM, ghost.yM);
  const tickBearing = site.aspectDeg ?? site.bearingDeg;
  const tickInner = polar(cx, cy, ringInner - 2, tickBearing);
  const tickOuter = polar(cx, cy, ringOuter + 6, tickBearing);
  const downhillLabelPt = polar(cx, cy, ringOuter + 20, tickBearing);
  const pocketInnerPx = frostPocketInnerRM() * scale;
  const midS = toPlan(0, -FIXTURE_R.midSlope);
  const steepS = toPlan(0, -64);
  const pocketOnFill = toPlan(0, -120);
  const apronS = toPlan(0, -110);
  const labelN = polar(cx, cy, ringMid, 0);
  const labelS = polar(cx, cy, ringMid, 180);
  const labelE = polar(cx, cy, ringMid, 110);
  const labelW = polar(cx, cy, ringMid, 250);
  // F6: offset pin copy off the south contour labels ("5–15%", "pocket").
  const pinLabelEast = site.xM >= -8;
  const pinLabelX = pin.x + (pinLabelEast ? 28 : -28);
  const pinLabelAnchor = pinLabelEast ? "start" : "end";
  const pinLabelY = pin.y - 18;

  return (
    <section className="same-hill-plan" aria-label="Hill plan with solar-rank ring">
      <svg
        ref={svgRef}
        className="pin-hit"
        viewBox={`0 0 ${PLAN.w} ${PLAN.h}`}
        role="img"
        aria-label="Schematic hill with aspect ring. Drag the pin. Solar class is labeled on the ring; slope bands and the trough are labeled on the hill."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <circle className="hill-fill" cx={cx} cy={cy} r={PLAN.hillPx} />
        {/* A6 / F9: frost fill for every r with rlc < 0.4, through the apron. */}
        <circle
          className="trough-fill"
          data-frost-region="true"
          cx={cx}
          cy={cy}
          r={PLAN.hillPx}
        />
        <circle
          className="hill-fill"
          data-frost-inner="true"
          cx={cx}
          cy={cy}
          r={pocketInnerPx}
        />
        {[8, 20, 36, 48, 84, 110].map((r) => (
          <circle key={r} className="contour" cx={cx} cy={cy} r={r * scale} />
        ))}
        {sectors.map((s) => (
          <path
            key={s.key}
            className={s.cls}
            d={annulusSector(cx, cy, ringInner, ringOuter, s.from, s.to)}
          />
        ))}
        <text className="label-ink" x={cx} y={cy - PLAN.hillPx - 8} textAnchor="middle">
          N
        </text>
        <text className="label-ink" x={cx + PLAN.hillPx + 12} y={cy + 4} textAnchor="start">
          E
        </text>
        <text className="label-ink" x={cx} y={cy + PLAN.hillPx + 16} textAnchor="middle">
          S
        </text>
        <text className="label-ink" x={cx - PLAN.hillPx - 12} y={cy + 4} textAnchor="end">
          W
        </text>
        <text
          className="ring-label"
          x={labelS.x}
          y={labelS.y + 4}
          textAnchor="middle"
        >
          highest · SSE–SSW
        </text>
        <text
          className="ring-label"
          x={labelN.x}
          y={labelN.y + 4}
          textAnchor="middle"
        >
          less · N/NW/NE
        </text>
        <text
          className="ring-label"
          x={labelE.x}
          y={labelE.y + 4}
          textAnchor="middle"
        >
          more
        </text>
        <text
          className="ring-label"
          x={labelW.x}
          y={labelW.y + 4}
          textAnchor="middle"
        >
          more
        </text>
        <text className="label" x={cx} y={cy + 4} textAnchor="middle">
          ridge
        </text>
        <text className="label" x={midS.x} y={midS.y + 3} textAnchor="middle">
          5–15%
        </text>
        <text className="label" x={steepS.x + 22} y={steepS.y + 3} textAnchor="start">
          steeper
        </text>
        <text
          className="label-pool"
          x={pocketOnFill.x}
          y={pocketOnFill.y - 6}
          textAnchor="middle"
          data-pocket-on-fill="true"
        >
          pocket
        </text>
        <text className="label" x={apronS.x} y={apronS.y + 10} textAnchor="middle">
          &lt;1%
        </text>
        <line
          className="ring-tick"
          data-downhill-tick="true"
          x1={tickInner.x}
          y1={tickInner.y}
          x2={tickOuter.x}
          y2={tickOuter.y}
        />
        {site.aspectDeg != null && (
          <text
            className="downhill-label"
            x={downhillLabelPt.x}
            y={downhillLabelPt.y + 3}
            textAnchor="middle"
          >
            downhill
          </text>
        )}
        {showGhost && (
          <>
            <circle className="ghost" cx={ghostPt.x} cy={ghostPt.y} r={PIN_R} />
            <text className="label" x={ghostPt.x + 12} y={ghostPt.y - 8}>
              south mid-slope
            </text>
          </>
        )}
        <circle className="pin" cx={pin.x} cy={pin.y} r={PIN_R} />
        <text
          className="pin-label"
          x={pinLabelX}
          y={pinLabelY}
          textAnchor={pinLabelAnchor}
        >
          facing {site.facing}
        </text>
        <text
          className="pin-label"
          x={pinLabelX}
          y={pinLabelY + 12}
          textAnchor={pinLabelAnchor}
        >
          {site.slopeBandLabel}
        </text>
        <text
          className="pin-label"
          x={pinLabelX}
          y={pinLabelY + 24}
          textAnchor={pinLabelAnchor}
        >
          solar {site.solarClass === 2 ? "highest" : site.solarClass === 1 ? "more" : site.solarClass === 0 ? "less" : "unranked"}
        </text>
        <text className="source-on-graphic" x={24} y={518}>
          Jones et al. 2004 Umpqua GIS (reused Rogue) — ordinal rank, not Willamette W/m²
        </text>
        <text className="source-on-graphic" x={24} y={534}>
          10° south vs a flat site: up to {JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT}% more
          insolation — not south vs north (Jones & Duff 2007)
        </text>
      </svg>
    </section>
  );
}

function HillProfile({ site }: { site: SiteState }) {
  const samples = useMemo(() => profileHeights(120), []);
  const x = d3
    .scaleLinear()
    .domain([-HILL_R_MAX_M, HILL_R_MAX_M])
    .range([PROFILE.m.left, PROFILE.w - PROFILE.m.right]);
  const y = d3
    .scaleLinear()
    .domain([0, 17.5])
    .range([PROFILE.h - PROFILE.m.bottom, PROFILE.m.top]);

  const diameter = useMemo(() => {
    const left = [...samples].reverse().map((p) => ({ s: -p.rM, z: p.zM }));
    const right = samples.map((p) => ({ s: p.rM, z: p.zM }));
    return [...left.slice(0, -1), ...right];
  }, [samples]);

  const ground = d3
    .line<(typeof diameter)[number]>()
    .x((p) => x(p.s))
    .y((p) => y(p.z));

  const poolPath = useMemo(() => {
    const segs: (typeof diameter)[] = [];
    let cur: typeof diameter = [];
    for (const p of diameter) {
      if (p.z < RLC_POCKET_Z_M) {
        cur.push(p);
      } else if (cur.length) {
        segs.push(cur);
        cur = [];
      }
    }
    if (cur.length) segs.push(cur);
    return segs
      .map((seg) => {
        const pts = [
          { s: seg[0].s, z: RLC_POCKET_Z_M },
          ...seg,
          { s: seg[seg.length - 1].s, z: RLC_POCKET_Z_M },
        ];
        const line = d3
          .line<(typeof pts)[number]>()
          .x((p) => x(p.s))
          .y((p) => y(p.z));
        return line(pts);
      })
      .filter(Boolean)
      .join(" ");
  }, [diameter, x, y]);

  const pinS = Math.min(site.rM, HILL_R_MAX_M);
  const midGhost = evaluateSite(FIXTURE_R.midSlope, site.bearingDeg);
  const inPocket = site.frostClass === 1;
  const plotLeft = PROFILE.m.left;
  const plotRight = PROFILE.w - PROFILE.m.right;
  const pinX = Math.min(plotRight - PIN_R, Math.max(plotLeft + PIN_R, x(pinS)));
  const pinY = y(site.zM);
  const frostCaption = `frost ${site.frostClassLabel}${
    inPocket ? ` · ${PENNER_ASH_FROST_HOURS_PCT}% of hours` : ""
  }`;
  const labelOnLeft = pinX > (plotLeft + plotRight) / 2;
  const labelX = labelOnLeft ? pinX - 10 : pinX + 10;
  const labelAnchor = labelOnLeft ? "end" : "start";

  return (
    <section className="same-hill-profile" aria-label="Hill profile with cold-air pool">
      <svg
        viewBox={`0 0 ${PROFILE.w} ${PROFILE.h}`}
        role="img"
        aria-label="Slice through the pin. Shaded trough is the frost pocket; mid-slope is drained."
      >
        {poolPath && <path className="pool" d={poolPath} />}
        <line
          className="waterline"
          x1={PROFILE.m.left}
          x2={PROFILE.w - PROFILE.m.right}
          y1={y(RLC_POCKET_Z_M)}
          y2={y(RLC_POCKET_Z_M)}
        />
        <path className="ground" d={ground(diameter) ?? undefined} />
        <circle
          className="ghost"
          cx={x(midGhost.rM)}
          cy={y(midGhost.zM)}
          r={PIN_R}
        />
        <circle className="pin" cx={pinX} cy={pinY} r={PIN_R} />
        <text
          className="label-pool"
          x={x(FIXTURE_R.trough)}
          y={y(4.6)}
          textAnchor="middle"
        >
          pocket
        </text>
        <text
          className="label"
          x={x(FIXTURE_R.midSlope)}
          y={y(midGhost.zM) - 10}
          textAnchor="middle"
        >
          drained
        </text>
        <text
          className="pin-label"
          x={labelX}
          y={pinY + 4}
          textAnchor={labelAnchor}
        >
          {frostCaption}
        </text>
        <text className="label" x={x(0)} y={y(16.2) - 4} textAnchor="middle">
          ridge
        </text>
        <text
          className="label"
          x={PROFILE.m.left - 4}
          y={y(RLC_POCKET_Z_M) + 3}
          textAnchor="end"
        >
          RLC {RLC_POCKET_THRESHOLD}
        </text>
        <text className="source-on-graphic" x={PROFILE.m.left} y={PROFILE.h - 36}>
          Penner-Ash 2014: RLC &lt; {RLC_POCKET_THRESHOLD} = {PENNER_ASH_FROST_HOURS_PCT}% of
          frost hours ({PENNER_ASH_LOGGER_COUNT} loggers / {PENNER_ASH_VINEYARD_COUNT} n. WV
          vineyards)
        </text>
        <text className="source-on-graphic" x={PROFILE.m.left} y={PROFILE.h - 20}>
          OSU EM 8973 (rev. 2022): frost pockets via air drainage / elevation
        </text>
      </svg>
    </section>
  );
}

export function SameHillExplorable() {
  const [rM, setRM] = useState(DEFAULT_PIN_R_M);
  const [bearingDeg, setBearingDeg] = useState(DEFAULT_PIN_BEARING_DEG);
  const radiusId = useId();
  const bearingId = useId();
  const site = evaluateSite(rM, bearingDeg);
  const solarKey =
    site.solarClass === 2 ? "highest" : site.solarClass === 1 ? "more" : "less";
  const frostKey = site.frostClass === 1 ? "pocket" : "drained";

  return (
    <div className="same-hill">
      <div className="same-hill-board">
        <PlanHill
          site={site}
          onMove={(nextR, nextBearing) => {
            setRM(nextR);
            setBearingDeg(nextBearing);
          }}
        />
        <HillProfile site={site} />
        <p
          className="same-hill-state"
          data-solar={solarKey}
          data-frost={frostKey}
        >
          <span>
            facing <strong data-testid="facing">{site.facing}</strong>
          </span>
          <span>
            slope <strong data-testid="slope-band">{site.slopeBandLabel}</strong>
          </span>
          <span>
            solar{" "}
            <strong data-testid="solar-class">{site.solarClassLabel}</strong>
          </span>
          <span>
            frost{" "}
            <strong data-testid="frost-class">{site.frostClassLabel}</strong>
          </span>
        </p>
      </div>
      <label className="visually-hidden" htmlFor={radiusId}>
        Distance from ridge, metres on the schematic
      </label>
      <input
        id={radiusId}
        className="visually-hidden"
        type="range"
        min={0}
        max={HILL_R_MAX_M}
        step={1}
        value={rM}
        onChange={(e) => setRM(Number(e.target.value))}
      />
      <label className="visually-hidden" htmlFor={bearingId}>
        Bearing from north, degrees
      </label>
      <input
        id={bearingId}
        className="visually-hidden"
        type="range"
        min={0}
        max={359}
        step={1}
        value={Math.round(bearingDeg) % 360}
        onChange={(e) => setBearingDeg(Number(e.target.value))}
      />
    </div>
  );
}
