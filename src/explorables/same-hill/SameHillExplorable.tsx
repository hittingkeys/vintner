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
} from "./constants";
import {
  RLC_POCKET_Z_M,
  evaluateSite,
  profileHeights,
  solarClassAt,
  xyToPolar,
  type SiteState,
} from "./model";
import "./same-hill.css";

const PLAN = { size: 480, cx: 240, cy: 240, hillPx: 152, ringInner: 168, ringOuter: 198 };
const PROFILE = { w: 480, h: 220, m: { top: 18, right: 16, bottom: 36, left: 36 } };

function svgPoint(svg: SVGSVGElement, event: PointerEvent): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const local = pt.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

function solarWedgeClass(code: ReturnType<typeof solarClassAt>["code"]): string {
  if (code === 2) return "sun-wedge-highest";
  if (code === 1) return "sun-wedge-more";
  return "sun-wedge-less";
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

  const wedges = useMemo(() => {
    return d3.range(16).map((i) => {
      const a0 = (i * 22.5 - 90) * (Math.PI / 180);
      const a1 = ((i + 1) * 22.5 - 90) * (Math.PI / 180);
      const mid = i * 22.5 + 11.25;
      const solar = solarClassAt(mid);
      const inner = PLAN.ringInner;
      const outer = PLAN.ringOuter;
      const cx = PLAN.cx;
      const cy = PLAN.cy;
      const d = [
        `M ${cx + inner * Math.cos(a0)} ${cy + inner * Math.sin(a0)}`,
        `L ${cx + outer * Math.cos(a0)} ${cy + outer * Math.sin(a0)}`,
        `A ${outer} ${outer} 0 0 1 ${cx + outer * Math.cos(a1)} ${cy + outer * Math.sin(a1)}`,
        `L ${cx + inner * Math.cos(a1)} ${cy + inner * Math.sin(a1)}`,
        `A ${inner} ${inner} 0 0 0 ${cx + inner * Math.cos(a0)} ${cy + inner * Math.sin(a0)}`,
        "Z",
      ].join(" ");
      return { d, cls: solarWedgeClass(solar.code), key: i };
    });
  }, []);

  const contours = [8, 20, 36, 48, 84, 110];

  function toPlan(xM: number, yM: number): { x: number; y: number } {
    return { x: PLAN.cx + xM * scale, y: PLAN.cy - yM * scale };
  }

  function setFromPointer(event: PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const p = svgPoint(svg, event);
    const xM = (p.x - PLAN.cx) / scale;
    const yM = (PLAN.cy - p.y) / scale;
    const polar = xyToPolar(xM, yM);
    onMove(Math.min(HILL_R_MAX_M, polar.rM), polar.bearingDeg);
  }

  function onPointerDown(event: React.PointerEvent<SVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.nativeEvent);
  }

  function onPointerMove(event: React.PointerEvent<SVGElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setFromPointer(event.nativeEvent);
  }

  const pin = toPlan(site.xM, site.yM);
  const ghostPt = toPlan(ghost.xM, ghost.yM);
  const markerAngle = ((site.aspectDeg ?? site.bearingDeg) - 90) * (Math.PI / 180);
  const markerR = (PLAN.ringInner + PLAN.ringOuter) / 2;
  const marker = {
    x: PLAN.cx + markerR * Math.cos(markerAngle),
    y: PLAN.cy + markerR * Math.sin(markerAngle),
  };
  const troughInner = 64 * scale;
  const troughOuter = 96 * scale;

  return (
    <section className="same-hill-plan" aria-label="Hill plan with solar-rank ring">
      <h3>Sun-rank ring — solar class by aspect</h3>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${PLAN.size} ${PLAN.size}`}
        role="img"
        aria-label="Schematic hill. Drag the pin. Sun-rank ring shows solar class by facing."
      >
        <circle className="hill-fill" cx={PLAN.cx} cy={PLAN.cy} r={PLAN.hillPx} />
        <circle
          className="trough-fill"
          cx={PLAN.cx}
          cy={PLAN.cy}
          r={troughOuter}
        />
        <circle
          className="hill-fill"
          cx={PLAN.cx}
          cy={PLAN.cy}
          r={troughInner}
        />
        {contours.map((r) => (
          <circle
            key={r}
            className="contour"
            cx={PLAN.cx}
            cy={PLAN.cy}
            r={r * scale}
          />
        ))}
        {wedges.map((w) => (
          <path key={w.key} className={w.cls} d={w.d} />
        ))}
        <text className="label-ink" x={PLAN.cx} y={18} textAnchor="middle">
          N
        </text>
        <text className="label-ink" x={PLAN.size - 14} y={PLAN.cy + 4} textAnchor="middle">
          E
        </text>
        <text className="label-ink" x={PLAN.cx} y={PLAN.size - 8} textAnchor="middle">
          S
        </text>
        <text className="label-ink" x={14} y={PLAN.cy + 4} textAnchor="middle">
          W
        </text>
        <text
          className="label"
          x={PLAN.cx}
          y={PLAN.cy + 4}
          textAnchor="middle"
        >
          ridge
        </text>
        <text
          className="label"
          x={toPlan(0, -FIXTURE_R.midSlope).x}
          y={toPlan(0, -FIXTURE_R.midSlope).y + 12}
          textAnchor="middle"
        >
          south mid-slope
        </text>
        <text
          className="label"
          x={toPlan(0, -FIXTURE_R.trough).x}
          y={toPlan(0, -FIXTURE_R.trough).y + 12}
          textAnchor="middle"
        >
          trough
        </text>
        {site.aspectDeg !== null && (
          <circle className="ring-marker" cx={marker.x} cy={marker.y} r={5} />
        )}
        {showGhost && (
          <>
            <circle className="ghost" cx={ghostPt.x} cy={ghostPt.y} r={8} />
            <text
              className="label"
              x={ghostPt.x + 12}
              y={ghostPt.y - 8}
            >
              ghost: south mid-slope
            </text>
          </>
        )}
        <circle
          className="pin-hit"
          cx={PLAN.cx}
          cy={PLAN.cy}
          r={PLAN.ringOuter}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        />
        <circle className="pin" cx={pin.x} cy={pin.y} r={7} />
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
    .domain([0, 17])
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
    const below = diameter.filter((p) => p.z < RLC_POCKET_Z_M);
    if (below.length < 2) return undefined;
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
        const start = { s: seg[0].s, z: RLC_POCKET_Z_M };
        const end = { s: seg[seg.length - 1].s, z: RLC_POCKET_Z_M };
        const pts = [start, ...seg, end];
        const line = d3
          .line<(typeof pts)[number]>()
          .x((p) => x(p.s))
          .y((p) => y(p.z));
        return line(pts);
      })
      .filter(Boolean)
      .join(" ");
  }, [diameter, x, y]);

  const pinS = site.rM;
  const pinZ = site.zM;
  const opposite = evaluateSite(site.rM, site.bearingDeg + 180);

  return (
    <section className="same-hill-profile" aria-label="Hill profile with cold-air pool">
      <h3>Hill profile — cold air pools in the trough</h3>
      <svg
        viewBox={`0 0 ${PROFILE.w} ${PROFILE.h}`}
        role="img"
        aria-label="North–south style slice through the pin. Shaded pool is the frost pocket."
      >
        <line
          className="axis"
          x1={PROFILE.m.left}
          x2={PROFILE.w - PROFILE.m.right}
          y1={y(0)}
          y2={y(0)}
        />
        {poolPath && <path className="pool" d={poolPath} />}
        <line
          className="waterline"
          x1={PROFILE.m.left}
          x2={PROFILE.w - PROFILE.m.right}
          y1={y(RLC_POCKET_Z_M)}
          y2={y(RLC_POCKET_Z_M)}
        />
        <path className="ground" d={ground(diameter) ?? undefined} />
        <circle className="pin" cx={x(pinS)} cy={y(pinZ)} r={6} />
        <circle className="ghost" cx={x(-opposite.rM)} cy={y(opposite.zM)} r={5} />
        <text className="label" x={x(-HILL_R_MAX_M) + 8} y={y(0) + 14}>
          opposite face
        </text>
        <text
          className="label"
          x={x(HILL_R_MAX_M) - 8}
          y={y(0) + 14}
          textAnchor="end"
        >
          this face ({site.facing})
        </text>
        <text className="label" x={x(0)} y={y(16) - 6} textAnchor="middle">
          ridge
        </text>
        <text
          className="label"
          x={PROFILE.m.left - 4}
          y={y(RLC_POCKET_Z_M) + 3}
          textAnchor="end"
        >
          RLC 0.4
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
        <dl className="same-hill-state">
          <div>
            <dt>Facing</dt>
            <dd data-testid="facing">{site.facing}</dd>
          </div>
          <div>
            <dt>Slope band</dt>
            <dd data-testid="slope-band">{site.slopeBandLabel}</dd>
          </div>
          <div data-solar={solarKey}>
            <dt>Solar class</dt>
            <dd data-testid="solar-class">{site.solarClassLabel}</dd>
          </div>
          <div data-frost={frostKey}>
            <dt>Frost class</dt>
            <dd data-testid="frost-class">{site.frostClassLabel}</dd>
          </div>
        </dl>
        <PlanHill
          site={site}
          onMove={(nextR, nextBearing) => {
            setRM(nextR);
            setBearingDeg(nextBearing);
          }}
        />
        <HillProfile site={site} />
        <p className="same-hill-legend">
          <span className="highest">
            <i />
            highest solar (SSE–SSW)
          </span>
          <span className="more">
            <i />
            more (SE/SW/W/E)
          </span>
          <span className="less">
            <i />
            less (N/NW/NE)
          </span>
          <span className="pool">
            <i />
            frost pocket (relative lowness)
          </span>
        </p>
        <p className="same-hill-captions">
          {site.frostHoursCaptionPct !== null && (
            <>
              <strong>
                {PENNER_ASH_FROST_HOURS_PCT}% of frost hours
              </strong>{" "}
              in this study sat at RLC &lt; {RLC_POCKET_THRESHOLD} — Penner-Ash
              &amp; Pogue 2014, {PENNER_ASH_LOGGER_COUNT} loggers /{" "}
              {PENNER_ASH_VINEYARD_COUNT} northern Willamette vineyards. Sourced
              caption, not a modeled {PENNER_ASH_FROST_HOURS_PCT}.00.{" "}
            </>
          )}
          {site.southVsFlatInsolationCaptionPct !== null && (
            <>
              <strong>
                Up to {JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT}% more insolation
              </strong>{" "}
              is 10° south versus a <strong>flat</strong> site (Jones &amp;
              Duff) — not south versus north.{" "}
            </>
          )}
          Jones solar ranking is Umpqua/Rogue GIS, not a Willamette
          opposite-face measurement. Penner-Ash is northern WV loggers. Schematic
          hill, not a survey you can site from.
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
