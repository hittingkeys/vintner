import * as d3 from "d3";
import { useId, useMemo, useRef, useState } from "react";
import {
  AGRIMET_ETC_GRAPE_IN,
  AGRIMET_ETR_ARAO_JUNSEP_IN,
  AGRIMET_ETR_FOGO_JUNSEP_IN,
  DEMAND_AXIS_MAX_IN,
  DEPTH_AXIS_MAX_CM,
  FAO56_RAW_FRACTION_P,
  FAO56_WINE_GRAPE_ZR_CM,
  JORY_OTHER_MU_PAWS_CM,
  JORY_PAWS_RANGE_CM,
  JORY_PAWS_REFERENCE_CM,
  LEVIN_SOUTHERN_OR_AGRIMET_IN,
  LEVIN_SOUTHERN_OR_MEASURED_IN,
  MCMINNVILLE_JUN_SEP_P_IN,
  SMART_ROOT_FRACTION_0_TO_100_CM,
  SMART_ROOT_FRACTION_0_TO_60_CM,
  WILLAKENZIE_CR_CM,
  WILLAKENZIE_CR_RANGE_CM,
  WILLAKENZIE_CR_RANGE_IN,
  YOUNG_PRESET_CM,
  cmToIn,
  inToCm,
} from "./constants";
import { formatCm, formatDemandIn, formatInchesSourced, formatInchesWhole } from "./format";
import {
  JORY_PROFILE,
  WILLAKENZIE_PROFILE,
  occupiedTawCm,
  simulate,
  type SeriesProfile,
  type SimulateResult,
} from "./model";
import "./occupied-paw.css";

interface BlockState {
  occupiedDepthCm: number;
  deficitDrip: boolean;
}

function fate(result: SimulateResult): { kind: "ok" | "thirst" | "stall"; text: string } {
  if (result.stall) {
    return { kind: "stall", text: "stall — occupied reservoir empty (Ks → 0)" };
  }
  if (result.irrigationIndicated) {
    return { kind: "thirst", text: "past RAW — irrigation indicated (Dr > 0.45 × TAW)" };
  }
  return { kind: "ok", text: "in RAW — not irrigation-indicated" };
}

function svgPoint(
  svg: SVGSVGElement,
  event: PointerEvent,
): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const local = pt.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

function ProfilePit({
  series,
  occupiedDepthCm,
  onDepth,
  result,
  drip,
  onDrip,
}: {
  series: SeriesProfile;
  occupiedDepthCm: number;
  onDepth: (cm: number) => void;
  result: SimulateResult;
  drip: boolean;
  onDrip: (on: boolean) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 320;
  const height = 460;
  const m = { top: 18, right: 12, bottom: 22, left: 42 };
  const y = d3
    .scaleLinear()
    .domain([0, DEPTH_AXIS_MAX_CM])
    .range([m.top, height - m.bottom]);
  const colX = 52;
  const colW = 132;
  const extractable = result.extractableDepthCm;
  const surface = y(0);
  const extractY = y(extractable);
  const rootY = y(Math.min(occupiedDepthCm, DEPTH_AXIS_MAX_CM));
  const taw = result.occupiedTawCm;
  const fillFrac = taw <= 0 ? 0 : result.remainingPawCm / taw;
  const waterBottom = extractY;
  const waterTop = extractable <= 0 ? surface : waterBottom - (waterBottom - surface) * fillFrac;
  const rawY =
    taw <= 0 ? surface : surface + (extractY - surface) * FAO56_RAW_FRACTION_P;
  const establishedCm =
    series.id === "jory" ? JORY_PAWS_REFERENCE_CM : WILLAKENZIE_CR_CM;
  const maxDrag = series.id === "jory" ? DEPTH_AXIS_MAX_CM : WILLAKENZIE_CR_CM;

  const depthTicks = [
    { cm: 0, label: "0 in" },
    { cm: 60, label: `24 in · ${formatCm(60)}` },
    { cm: 100, label: "1.0 m" },
    { cm: JORY_PAWS_REFERENCE_CM, label: "60 in" },
    { cm: WILLAKENZIE_CR_CM, label: "32 in Cr" },
    { cm: FAO56_WINE_GRAPE_ZR_CM.max, label: "2.0 m" },
  ];

  function setFromPointer(event: PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const { y: py } = svgPoint(svg, event);
    onDepth(Math.min(maxDrag, Math.max(0, y.invert(py))));
  }

  function onHandlePointerDown(event: React.PointerEvent<SVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.nativeEvent);
  }

  function onHandlePointerMove(event: React.PointerEvent<SVGElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setFromPointer(event.nativeEvent);
  }

  const status = fate(result);
  const crLo = y(WILLAKENZIE_CR_RANGE_CM.min);
  const crHi = y(WILLAKENZIE_CR_RANGE_CM.max);

  return (
    <section className="pit" aria-label={`${series.name} block`}>
      <div className="pit-head">
        <div className="pit-name" data-series={series.id}>
          {series.name}
        </div>
        <div className="pit-shared">well drained · moderately slow permeability</div>
      </div>
      <svg
        ref={svgRef}
        className="pit-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${series.name} soil profile. Drag the root boundary.`}
      >
        <defs>
          <pattern
            id={`${series.id}-unsourced`}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill="#d8c7a8" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#b5a790" strokeWidth="3" />
          </pattern>
        </defs>
        <rect
          className="soil-below"
          x={colX}
          y={surface}
          width={colW}
          height={y(DEPTH_AXIS_MAX_CM) - surface}
        />
        <rect
          className="soil"
          x={colX}
          y={surface}
          width={colW}
          height={Math.max(0, extractY - surface)}
        />
        {taw > 0 && extractable > 0 && (
          <>
            <rect
              className="depleted"
              x={colX}
              y={surface}
              width={colW}
              height={Math.max(0, waterTop - surface)}
            />
            <rect
              className="water"
              x={colX}
              y={waterTop}
              width={colW}
              height={Math.max(0, waterBottom - waterTop)}
            />
            <line
              className="raw-line"
              x1={colX}
              x2={colX + colW}
              y1={rawY}
              y2={rawY}
            />
          </>
        )}
        {series.id === "willakenzie" && (
          <>
            <rect
              className="cr-band"
              x={colX}
              y={crLo}
              width={colW}
              height={Math.max(0, crHi - crLo)}
            />
            <rect
              className="rock"
              x={colX}
              y={y(WILLAKENZIE_CR_CM)}
              width={colW}
              height={y(DEPTH_AXIS_MAX_CM) - y(WILLAKENZIE_CR_CM)}
            />
            <text
              className="state-label-muted"
              x={colX + colW / 2}
              y={y(WILLAKENZIE_CR_CM) + 14}
              textAnchor="middle"
            >
              Cr {formatInchesWhole(cmToIn(WILLAKENZIE_CR_CM))} typical
            </text>
            <text
              className="state-label-muted"
              x={colX + colW / 2}
              y={y(WILLAKENZIE_CR_CM) + 26}
              textAnchor="middle"
            >
              series {WILLAKENZIE_CR_RANGE_IN.min}–{WILLAKENZIE_CR_RANGE_IN.max}{" "}
              in
            </text>
          </>
        )}
        {series.id === "jory" && occupiedDepthCm > JORY_PAWS_REFERENCE_CM && (
          <>
            <rect
              x={colX}
              y={y(JORY_PAWS_REFERENCE_CM)}
              width={colW}
              height={Math.max(
                0,
                y(Math.min(occupiedDepthCm, DEPTH_AXIS_MAX_CM)) -
                  y(JORY_PAWS_REFERENCE_CM),
              )}
              fill={`url(#${series.id}-unsourced)`}
            />
            <text
              className="state-label-muted"
              x={colX + colW / 2}
              y={y(JORY_PAWS_REFERENCE_CM) + 14}
              textAnchor="middle"
            >
              no sourced PAWS below 60 in
            </text>
          </>
        )}
        <line
          className="root-line"
          x1={colX - 6}
          x2={colX + colW + 6}
          y1={rootY}
          y2={rootY}
        />
        <line
          className="root-hit"
          x1={colX - 10}
          x2={colX + colW + 18}
          y1={rootY}
          y2={rootY}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
        />
        <circle
          className="root-handle"
          cx={colX + colW + 8}
          cy={rootY}
          r={6}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
        />
        <text
          className="state-label"
          x={colX + colW + 16}
          y={rootY - 8}
        >
          roots {formatInchesWhole(cmToIn(occupiedDepthCm))}
        </text>
        <text className="state-label-muted" x={colX + colW + 16} y={rootY + 6}>
          drag
        </text>
        {taw > 0 && (
          <>
            <text
              className="state-label"
              x={colX + 8}
              y={Math.min(waterTop + 14, extractY - 4)}
              fill="#f4f1ea"
            >
              {formatCm(result.remainingPawCm)} left
            </text>
            <text className="state-label-muted" x={colX + 8} y={surface + 12}>
              Dr {formatCm(result.depletionCm)}
            </text>
            <text className="state-label-muted" x={colX + 8} y={rawY - 4}>
              RAW {formatCm(result.rawCm)}
            </text>
          </>
        )}
        {taw <= 0 && (
          <text
            className="state-label"
            x={colX + colW / 2}
            y={surface + 20}
            textAnchor="middle"
          >
            no occupied reservoir
          </text>
        )}
        {depthTicks.map((tick) => (
          <g key={tick.label}>
            <line
              className="depth-tick"
              x1={m.left - 6}
              x2={m.left}
              y1={y(tick.cm)}
              y2={y(tick.cm)}
            />
            <text
              className="depth-label"
              x={m.left - 8}
              y={y(tick.cm) + 3}
              textAnchor="end"
            >
              {tick.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="pit-metrics">
        <strong>occupied TAW {formatCm(result.occupiedTawCm)}</strong>
        {series.id === "jory" && (
          <span className="band-note">
            {" "}
            · default MU {formatCm(JORY_PAWS_RANGE_CM.min)} · range{" "}
            {formatCm(JORY_PAWS_RANGE_CM.min)}–{formatCm(JORY_PAWS_RANGE_CM.max)}{" "}
            · other MUs {JORY_OTHER_MU_PAWS_CM.map((n) => `${n}`).join(", ")} cm
          </span>
        )}
        <br />
        remaining {formatCm(result.remainingPawCm)} · Dr{" "}
        {formatCm(result.depletionCm)} · RAW {formatCm(result.rawCm)} · TAW{" "}
        {formatCm(result.occupiedTawCm)}
      </p>
      <p className="fate" data-kind={status.kind}>
        {status.text}
      </p>
      <label className="visually-hidden" htmlFor={`${series.id}-depth`}>
        {series.name} occupied rooting depth, centimeters
      </label>
      <input
        id={`${series.id}-depth`}
        className="visually-hidden"
        type="range"
        min={0}
        max={maxDrag}
        step={1}
        value={occupiedDepthCm}
        onChange={(e) => onDepth(Number(e.target.value))}
      />
      <div className="pit-controls">
        <button
          type="button"
          aria-pressed={occupiedDepthCm <= YOUNG_PRESET_CM + 0.5}
          onClick={() => onDepth(YOUNG_PRESET_CM)}
        >
          Young preset
        </button>
        <button
          type="button"
          aria-pressed={Math.abs(occupiedDepthCm - establishedCm) < 0.5}
          onClick={() => onDepth(establishedCm)}
        >
          Established
        </button>
        <button
          type="button"
          aria-pressed={drip}
          onClick={() => onDrip(!drip)}
        >
          Deficit drip
        </button>
      </div>
      <p className="young-caption">
        Young preset {formatCm(YOUNG_PRESET_CM)} is TODO:UNVERIFIED year-1
        extractable depth — not a FAO Zr midpoint. Drag the roots. Years 1–3
        typically need water (OSU EM 8973); no series named.
      </p>
    </section>
  );
}

function DemandResponse({
  demandIn,
  onDemand,
  joryDepth,
  willDepth,
  joryDrip,
  willDrip,
  jory,
  will,
}: {
  demandIn: number;
  onDemand: (inches: number) => void;
  joryDepth: number;
  willDepth: number;
  joryDrip: boolean;
  willDrip: boolean;
  jory: SimulateResult;
  will: SimulateResult;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const demandId = useId();
  const width = 720;
  const height = 260;
  const m = { top: 16, right: 16, bottom: 56, left: 44 };
  const x = d3
    .scaleLinear()
    .domain([0, DEMAND_AXIS_MAX_IN])
    .range([m.left, width - m.right]);
  const y = d3
    .scaleLinear()
    .domain([0, JORY_PAWS_RANGE_CM.max])
    .range([height - m.bottom, m.top]);

  const samples = useMemo(() => {
    const n = 80;
    return d3.range(n + 1).map((i) => (i / n) * DEMAND_AXIS_MAX_IN);
  }, []);

  const joryLow = samples.map((d) => ({
    d,
    r: simulate({
      series: JORY_PROFILE,
      occupiedDepthCm: joryDepth,
      demandCm: inToCm(d),
      deficitDrip: joryDrip,
      profilePawsCm: JORY_PAWS_RANGE_CM.min,
    }).remainingPawCm,
  }));
  const joryHigh = samples.map((d) => ({
    d,
    r: simulate({
      series: JORY_PROFILE,
      occupiedDepthCm: joryDepth,
      demandCm: inToCm(d),
      deficitDrip: joryDrip,
      profilePawsCm: JORY_PAWS_RANGE_CM.max,
    }).remainingPawCm,
  }));
  const joryLine = samples.map((d) => ({
    d,
    r: simulate({
      series: JORY_PROFILE,
      occupiedDepthCm: joryDepth,
      demandCm: inToCm(d),
      deficitDrip: joryDrip,
    }).remainingPawCm,
  }));
  const willLine = samples.map((d) => ({
    d,
    r: simulate({
      series: WILLAKENZIE_PROFILE,
      occupiedDepthCm: willDepth,
      demandCm: inToCm(d),
      deficitDrip: willDrip,
    }).remainingPawCm,
  }));
  const joryGhost = samples.map((d) => ({
    d,
    r: simulate({
      series: JORY_PROFILE,
      occupiedDepthCm: joryDepth,
      demandCm: inToCm(d),
      deficitDrip: true,
    }).remainingPawCm,
  }));
  const willGhost = samples.map((d) => ({
    d,
    r: simulate({
      series: WILLAKENZIE_PROFILE,
      occupiedDepthCm: willDepth,
      demandCm: inToCm(d),
      deficitDrip: true,
    }).remainingPawCm,
  }));

  const line = d3
    .line<{ d: number; r: number }>()
    .x((p) => x(p.d))
    .y((p) => y(p.r));
  const area = d3
    .area<{ d: number; low: number; high: number }>()
    .x((p) => x(p.d))
    .y0((p) => y(p.low))
    .y1((p) => y(p.high));
  const band = samples.map((d, i) => ({
    d,
    low: joryLow[i].r,
    high: joryHigh[i].r,
  }));

  const anchors: { inches: number; label: string; decimals: number }[] = [
    { inches: MCMINNVILLE_JUN_SEP_P_IN, label: "P 3.23", decimals: 2 },
    { inches: AGRIMET_ETC_GRAPE_IN.a, label: "grape 18.3", decimals: 1 },
    { inches: AGRIMET_ETC_GRAPE_IN.b, label: "19.6", decimals: 1 },
    { inches: AGRIMET_ETR_ARAO_JUNSEP_IN, label: "ETr 24.02", decimals: 2 },
    { inches: AGRIMET_ETR_FOGO_JUNSEP_IN, label: "25.61", decimals: 2 },
  ];

  function setFromPointer(event: PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const { x: px } = svgPoint(svg, event);
    onDemand(Math.min(DEMAND_AXIS_MAX_IN, Math.max(0, x.invert(px))));
  }

  function onPointerDown(event: React.PointerEvent<SVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.nativeEvent);
  }

  function onPointerMove(event: React.PointerEvent<SVGElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setFromPointer(event.nativeEvent);
  }

  const joryTawNow = occupiedTawCm(JORY_PROFILE, joryDepth);
  const willTawNow = occupiedTawCm(WILLAKENZIE_PROFILE, willDepth);

  return (
    <section className="response" aria-label="Remaining occupied PAW versus shared demand">
      <h3 className="response-title">
        Remaining occupied PAW vs the same seasonal demand — current{" "}
        {formatDemandIn(demandIn)}
      </h3>
      <svg
        ref={svgRef}
        className="response-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Response curves. Drag demand."
      >
        <rect
          className="demand-hit"
          x={m.left}
          y={m.top}
          width={width - m.left - m.right}
          height={height - m.top - m.bottom}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        />
        {[0, 15, 25, 41].map((cm) => (
          <g key={cm}>
            <line
              className="grid"
              x1={m.left}
              x2={width - m.right}
              y1={y(cm)}
              y2={y(cm)}
            />
            <text className="label" x={m.left - 6} y={y(cm) + 3} textAnchor="end">
              {cm}
            </text>
          </g>
        ))}
        {anchors.map((a) => (
          <g key={a.label}>
            <line
              className="anchor"
              x1={x(a.inches)}
              x2={x(a.inches)}
              y1={m.top}
              y2={height - m.bottom}
            />
            <text
              className="label"
              x={x(a.inches)}
              y={height - m.bottom + 28}
              textAnchor="middle"
            >
              {a.label}
            </text>
          </g>
        ))}
        <path className="band" d={area(band) ?? undefined} />
        <path
          className="ghost"
          stroke="#3d6b4f"
          d={line(joryGhost) ?? undefined}
        />
        <path
          className="ghost"
          stroke="#8a4b2f"
          d={line(willGhost) ?? undefined}
        />
        <path className="jory-line" d={line(joryLine) ?? undefined} />
        <path className="will-line" d={line(willLine) ?? undefined} />
        <line
          className="demand-line"
          x1={x(demandIn)}
          x2={x(demandIn)}
          y1={m.top}
          y2={height - m.bottom}
        />
        <circle
          className="demand-handle"
          cx={x(demandIn)}
          cy={y(jory.remainingPawCm)}
          r={5}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        />
        <circle
          className="demand-handle"
          cx={x(demandIn)}
          cy={y(will.remainingPawCm)}
          r={5}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        />
        <line
          className="axis"
          x1={m.left}
          x2={width - m.right}
          y1={height - m.bottom}
          y2={height - m.bottom}
        />
        <line
          className="axis"
          x1={m.left}
          x2={m.left}
          y1={m.top}
          y2={height - m.bottom}
        />
        <text className="label" x={(m.left + width - m.right) / 2} y={height - 8} textAnchor="middle">
          seasonal demand (in) — same weather on both blocks
        </text>
        <text
          className="label"
          x={14}
          y={m.top + 8}
          transform={`rotate(-90 14 ${m.top + 70})`}
        >
          remaining occupied PAW (cm)
        </text>
      </svg>
      <label className="visually-hidden" htmlFor={demandId}>
        Seasonal demand on both blocks, inches
      </label>
      <input
        id={demandId}
        className="visually-hidden"
        type="range"
        min={0}
        max={DEMAND_AXIS_MAX_IN}
        step={0.1}
        value={demandIn}
        onChange={(e) => onDemand(Number(e.target.value))}
      />
      <p className="legend">
        <span className="jory">
          <i />
          Jory now {formatCm(jory.remainingPawCm)} (TAW {formatCm(joryTawNow)})
        </span>
        <span className="ribbon">
          <i />
          Willakenzie now {formatCm(will.remainingPawCm)} (TAW{" "}
          {formatCm(willTawNow)})
        </span>
        <span>band = Jory PAWS 25–41 cm at this occupied depth</span>
        <span>dashed = deficit-drip ghost (floor at (1 − 0.45) × TAW)</span>
      </p>
    </section>
  );
}

export function OccupiedPawExplorable() {
  const [jory, setJory] = useState<BlockState>({
    occupiedDepthCm: JORY_PAWS_REFERENCE_CM,
    deficitDrip: false,
  });
  const [will, setWill] = useState<BlockState>({
    occupiedDepthCm: WILLAKENZIE_CR_CM,
    deficitDrip: false,
  });
  const [demandIn, setDemandIn] = useState(0);
  const demandCm = inToCm(demandIn);

  const joryResult = simulate({
    series: JORY_PROFILE,
    occupiedDepthCm: jory.occupiedDepthCm,
    demandCm,
    deficitDrip: jory.deficitDrip,
  });
  const willResult = simulate({
    series: WILLAKENZIE_PROFILE,
    occupiedDepthCm: will.occupiedDepthCm,
    demandCm,
    deficitDrip: will.deficitDrip,
  });

  return (
    <div className="occupied-paw">
      <p className="pit-metrics">
        <strong>Shared demand {formatDemandIn(demandIn)}</strong>
        {" · "}
        McMinnville Jun–Sep P {formatInchesSourced(MCMINNVILLE_JUN_SEP_P_IN, 2)}{" "}
        (rain, not leftover mm)
        {" · "}
        AgriMet grape {formatInchesSourced(AGRIMET_ETC_GRAPE_IN.a, 1)} /{" "}
        {formatInchesSourced(AGRIMET_ETC_GRAPE_IN.b, 1)} contested — Levin
        southern OR {formatInchesSourced(LEVIN_SOUTHERN_OR_MEASURED_IN, 1)} vs
        AgriMet {formatInchesSourced(LEVIN_SOUTHERN_OR_AGRIMET_IN, 1)}, not NVW
        {" · "}
        alfalfa ETr {formatInchesSourced(AGRIMET_ETR_ARAO_JUNSEP_IN, 2)} /{" "}
        {formatInchesSourced(AGRIMET_ETR_FOGO_JUNSEP_IN, 2)} upper envelope, not
        crop ET
      </p>
      <div className="occupied-paw-canvas">
        <ProfilePit
          series={JORY_PROFILE}
          occupiedDepthCm={jory.occupiedDepthCm}
          onDepth={(cm) => setJory((s) => ({ ...s, occupiedDepthCm: cm }))}
          result={joryResult}
          drip={jory.deficitDrip}
          onDrip={(on) => setJory((s) => ({ ...s, deficitDrip: on }))}
        />
        <ProfilePit
          series={WILLAKENZIE_PROFILE}
          occupiedDepthCm={will.occupiedDepthCm}
          onDepth={(cm) => setWill((s) => ({ ...s, occupiedDepthCm: cm }))}
          result={willResult}
          drip={will.deficitDrip}
          onDrip={(on) => setWill((s) => ({ ...s, deficitDrip: on }))}
        />
        <DemandResponse
          demandIn={demandIn}
          onDemand={setDemandIn}
          joryDepth={jory.occupiedDepthCm}
          willDepth={will.occupiedDepthCm}
          joryDrip={jory.deficitDrip}
          willDrip={will.deficitDrip}
          jory={joryResult}
          will={willResult}
        />
      </div>
      <p className="assumptions">
        Stated model assumption: occupied TAW = profile PAWS × min(occupied,
        restriction) / restriction depth. Horizon AWC in/in is TODO:UNVERIFIED.
        Demand is a shared withdrawal from that reservoir — not a sourced NVW
        Pinot ETc. ~{Math.round(SMART_ROOT_FRACTION_0_TO_60_CM * 100)}% of
        established roots in 0–60 cm, ~
        {Math.round(SMART_ROOT_FRACTION_0_TO_100_CM * 100)}% in 1.0 m (Smart et
        al. 2006) — not year-1. OSD dry period after solstice: Jory 45–75 d,
        Willakenzie 45–60 d (caption, not a demand number). Water rounded to
        whole cm.
      </p>
    </div>
  );
}
