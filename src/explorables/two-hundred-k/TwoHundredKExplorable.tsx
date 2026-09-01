import * as d3 from "d3";
import { useRef, useState } from "react";
import {
  AEB_BUDGET_ACRES,
  AEB_Y5_CUMULATIVE_CASH_USD_PER_ACRE,
  LABOR_SHARE_OF_ESTABLISHMENT_CASH,
  LAND_USD_PER_ACRE,
  MAX_GRAPE_TONS,
  MAX_LAND_ACRES,
  STACK_USD,
  YEAR1_CASH_USD_PER_ACRE,
} from "./constants";
import { formatAcres, formatGrapeTons, formatUsd, formatYieldTons } from "./format";
import {
  evaluateGrapes,
  evaluateLabor,
  evaluateLandPlant,
  grapeTonsFromRemainingUsd,
  landAcresFromRemainingUsd,
  maxPlantAcresGivenLand,
  plantAcresFromPlantSpendUsd,
  year1PlantCostUsd,
  type GrapesState,
  type LandPlantState,
} from "./model";
import "./two-hundred-k.css";

const STACK = {
  w: 272,
  h: 508,
  x: 44,
  colW: 54,
  top: 56,
  bottom: 434,
};

function svgPoint(svg: SVGSVGElement, event: PointerEvent): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    const vb = svg.viewBox.baseVal;
    const vbW = vb?.width || STACK.w;
    const vbH = vb?.height || STACK.h;
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

function yScale(): d3.ScaleLinear<number, number> {
  return d3
    .scaleLinear()
    .domain([0, STACK_USD])
    .range([STACK.bottom, STACK.top]);
}

function segmentY(
  y: d3.ScaleLinear<number, number>,
  fromUsd: number,
  toUsd: number,
): { y: number; h: number } {
  const y0 = y(fromUsd);
  const y1 = y(toUsd);
  return { y: Math.min(y0, y1), h: Math.abs(y1 - y0) };
}

function CashAxis({ y }: { y: d3.ScaleLinear<number, number> }) {
  return (
    <>
      <rect
        className="stack-track"
        x={STACK.x}
        y={STACK.top}
        width={STACK.colW}
        height={STACK.bottom - STACK.top}
      />
      <text className="label" x={STACK.x + STACK.colW + 6} y={STACK.top - 6}>
        {formatUsd(STACK_USD)}
      </text>
      <text className="label" x={STACK.x + STACK.colW + 6} y={STACK.bottom + 12}>
        {formatUsd(0)}
      </text>
      <line
        className="mark"
        x1={STACK.x - 4}
        x2={STACK.x + STACK.colW + 4}
        y1={y(0)}
        y2={y(0)}
      />
    </>
  );
}

function GhostRemaining({
  remainingUsd,
  y,
}: {
  remainingUsd: number | null;
  y: d3.ScaleLinear<number, number>;
}) {
  if (remainingUsd === null) return null;
  const box = segmentY(y, 0, remainingUsd);
  return (
    <rect
      className="stack-ghost"
      data-testid="ghost-remaining"
      x={STACK.x - 3}
      y={box.y}
      width={STACK.colW + 6}
      height={Math.max(box.h, 2)}
    />
  );
}

function LandDoor({
  state,
  ghostRemainingUsd,
  onLand,
  onPlant,
}: {
  state: LandPlantState;
  ghostRemainingUsd: number | null;
  onLand: (acres: number) => void;
  onPlant: (acres: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<"land" | "plant" | null>(null);
  const y = yScale();
  const remaining = segmentY(y, 0, state.remainingUsd);
  const plant = segmentY(
    y,
    state.remainingUsd,
    state.remainingUsd + state.plantCostUsd,
  );
  const land = segmentY(
    y,
    state.remainingUsd + state.plantCostUsd,
    STACK_USD,
  );
  const leftoverAfterLand = STACK_USD - state.landCostUsd;
  const maxPlant = maxPlantAcresGivenLand(state.landAcres);

  function remainingAt(event: PointerEvent): number {
    const svg = svgRef.current;
    if (!svg) return state.remainingUsd;
    return Math.max(0, Math.min(STACK_USD, y.invert(svgPoint(svg, event).y)));
  }

  function onPointerDown(mode: "land" | "plant", event: React.PointerEvent<SVGElement>) {
    drag.current = mode;
    svgRef.current?.setPointerCapture(event.pointerId);
    const remainingUsd = remainingAt(event.nativeEvent);
    if (mode === "land") {
      onLand(landAcresFromRemainingUsd(remainingUsd));
    } else {
      const plantSpend = leftoverAfterLand - remainingUsd;
      onPlant(plantAcresFromPlantSpendUsd(state.landAcres, plantSpend));
    }
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (drag.current === null) return;
    const captured =
      typeof event.currentTarget.hasPointerCapture === "function" &&
      event.currentTarget.hasPointerCapture(event.pointerId);
    if (!captured && event.buttons === 0) return;
    const remainingUsd = remainingAt(event.nativeEvent);
    if (drag.current === "land") {
      onLand(landAcresFromRemainingUsd(remainingUsd));
    } else {
      const plantSpend = leftoverAfterLand - remainingUsd;
      onPlant(plantAcresFromPlantSpendUsd(state.landAcres, plantSpend));
    }
  }

  function onPointerUp() {
    drag.current = null;
  }

  const acreStops = Array.from({ length: MAX_LAND_ACRES + 1 }, (_, ac) => ({
    ac,
    usd: STACK_USD - ac * LAND_USD_PER_ACRE,
  }));

  return (
    <section className="two-hundred-k-door" aria-label="Land + plant">
      <h3 className="two-hundred-k-door-title">Land + plant</h3>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${STACK.w} ${STACK.h}`}
        role="img"
        aria-label="Land and plant cash stack. Drag remaining cash to buy acres."
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <CashAxis y={y} />
        <text className="label-ink" x={STACK.x} y={18}>
          20-ac year-1 plant {formatUsd(year1PlantCostUsd(AEB_BUDGET_ACRES))} — off
          this stack
        </text>
        {state.landCostUsd > 0 && (
          <rect
            className="stack-land"
            x={STACK.x}
            y={land.y}
            width={STACK.colW}
            height={land.h}
          />
        )}
        {state.plantCostUsd > 0 && (
          <rect
            className="stack-plant"
            x={STACK.x}
            y={plant.y}
            width={STACK.colW}
            height={plant.h}
          />
        )}
        <rect
          className="stack-remaining"
          data-testid="land-remaining-bar"
          x={STACK.x}
          y={remaining.y}
          width={STACK.colW}
          height={Math.max(remaining.h, 1)}
        />
        <GhostRemaining remainingUsd={ghostRemainingUsd} y={y} />
        <text
          className="label-on-cash"
          x={STACK.x + 4}
          y={Math.min(STACK.bottom - 6, remaining.y + Math.max(remaining.h - 6, 12))}
        >
          {formatUsd(state.remainingUsd)}
        </text>
        {state.landCostUsd > 0 && (
          <text
            className="label-ink"
            x={STACK.x + STACK.colW + 8}
            y={land.y + Math.min(14, land.h / 2)}
          >
            land {formatAcres(state.landAcres)} {formatUsd(state.landCostUsd)}
          </text>
        )}
        {state.plantCostUsd > 0 && (
          <text
            className="label-ink"
            x={STACK.x + STACK.colW + 8}
            y={plant.y + 12}
          >
            plant {formatAcres(state.plantedAcres)} {formatUsd(state.plantCostUsd)}
          </text>
        )}
        <line
          className="mark"
          x1={STACK.x}
          x2={STACK.x + STACK.colW + 52}
          y1={y(YEAR1_CASH_USD_PER_ACRE)}
          y2={y(YEAR1_CASH_USD_PER_ACRE)}
        />
        <text
          className="label"
          x={STACK.x + STACK.colW + 8}
          y={y(YEAR1_CASH_USD_PER_ACRE) - 4}
        >
          {formatUsd(YEAR1_CASH_USD_PER_ACRE)}/acre year-1 plant
        </text>
        <line
          className="mark"
          x1={STACK.x}
          x2={STACK.x + STACK.colW + 52}
          y1={y(LAND_USD_PER_ACRE)}
          y2={y(LAND_USD_PER_ACRE)}
        />
        <text
          className="label"
          x={STACK.x + STACK.colW + 8}
          y={y(LAND_USD_PER_ACRE) + 12}
        >
          {formatUsd(LAND_USD_PER_ACRE)}/acre land
        </text>
        {acreStops.map((stop) => (
          <text
            key={stop.ac}
            className="acre-stop"
            role="button"
            tabIndex={0}
            data-pressed={state.landAcres === stop.ac ? "true" : "false"}
            aria-label={`${stop.ac} acres of land`}
            x={STACK.x - 6}
            y={y(stop.usd) + 3}
            textAnchor="end"
            onClick={() => onLand(stop.ac)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onLand(stop.ac);
              }
            }}
          >
            {stop.ac === 0 ? "0" : `${stop.ac} ac`}
          </text>
        ))}
        <rect
          className="stack-hit"
          data-control="land"
          x={STACK.x}
          y={STACK.top}
          width={STACK.colW}
          height={STACK.bottom - STACK.top}
          onPointerDown={(event) => onPointerDown("land", event)}
        />
        <circle
          className="handle"
          cx={STACK.x + STACK.colW}
          cy={y(state.remainingUsd)}
          r={5}
          onPointerDown={(event) => onPointerDown("land", event)}
        />
        <circle
          className="handle"
          data-control="plant"
          cx={STACK.x + STACK.colW + 14}
          cy={y(state.remainingUsd)}
          r={5}
          onPointerDown={(event) => onPointerDown("plant", event)}
        />
        <text className="label" x={STACK.x + STACK.colW + 22} y={y(state.remainingUsd) + 4}>
          {state.year1PlantPossible
            ? `plant ${formatAcres(state.plantedAcres)}`
            : "year-1 plant closed"}
        </text>
        <text className="source-on-graphic" x={4} y={STACK.h - 22}>
          OSU AEB 0086 (Dec 2025)
        </text>
        <text className="source-on-graphic" x={4} y={STACK.h - 10}>
          statewide OR budget, not a planted-comps survey
        </text>
      </svg>
      <p className="two-hundred-k-state">
        <strong data-testid="land-remaining">{formatUsd(state.remainingUsd)} remaining</strong>
        {" · "}
        <span data-testid="acres-owned">{formatAcres(state.landAcres)} owned</span>
        {" · "}
        <span data-testid="acres-planted">{formatAcres(state.plantedAcres)} planted</span>
        {" · "}
        year-3 yield {formatYieldTons(state.year3YieldTons)}
        {" · "}
        {state.year1PlantPossible ? "year-1 plant possible" : "year-1 plant not possible"}
        {" · "}
        max plant {maxPlant} ac
        {" · "}
        year-5 cumulative still {formatUsd(AEB_Y5_CUMULATIVE_CASH_USD_PER_ACRE)}/acre
        (caption, not this stack)
      </p>
      <label className="visually-hidden" htmlFor="land-acres">
        Acres of land to buy
      </label>
      <input
        id="land-acres"
        className="visually-hidden"
        type="range"
        min={0}
        max={MAX_LAND_ACRES}
        step={1}
        value={state.landAcres}
        onChange={(event) => onLand(Number(event.target.value))}
      />
      <label className="visually-hidden" htmlFor="planted-acres">
        Acres to plant
      </label>
      <input
        id="planted-acres"
        className="visually-hidden"
        type="range"
        min={0}
        max={Math.max(maxPlant, 0)}
        step={1}
        value={state.plantedAcres}
        disabled={maxPlant === 0}
        onChange={(event) => onPlant(Number(event.target.value))}
      />
    </section>
  );
}

function GrapesDoor({
  state,
  ghostRemainingUsd,
  onTons,
}: {
  state: GrapesState;
  ghostRemainingUsd: number | null;
  onTons: (tons: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const y = yScale();
  const remaining = segmentY(y, 0, state.remainingUsd);
  const license = segmentY(
    y,
    state.remainingUsd,
    state.remainingUsd + state.licenseUsd,
  );
  const grapes = segmentY(
    y,
    state.remainingUsd + state.licenseUsd,
    STACK_USD,
  );
  const tonStops = [0, 40, 80].map((tons) => {
    const next = evaluateGrapes(tons);
    return { tons, usd: next.remainingUsd };
  });

  function setFromPointer(event: PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const remainingUsd = Math.max(
      0,
      Math.min(STACK_USD, y.invert(svgPoint(svg, event).y)),
    );
    onTons(grapeTonsFromRemainingUsd(remainingUsd));
  }

  function onPointerDown(event: React.PointerEvent<SVGElement>) {
    dragging.current = true;
    svgRef.current?.setPointerCapture(event.pointerId);
    setFromPointer(event.nativeEvent);
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const captured =
      typeof event.currentTarget.hasPointerCapture === "function" &&
      event.currentTarget.hasPointerCapture(event.pointerId);
    if (!dragging.current && !captured) return;
    setFromPointer(event.nativeEvent);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <section className="two-hundred-k-door" aria-label="Grapes + custom crush">
      <h3 className="two-hundred-k-door-title">Grapes + custom crush</h3>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${STACK.w} ${STACK.h}`}
        role="img"
        aria-label="Grapes and custom-crush cash stack. Drag remaining cash to buy tons."
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <pattern
            id="crush-unpublished"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#5c574e" strokeWidth="1.5" />
          </pattern>
        </defs>
        <CashAxis y={y} />
        {state.grapeCostUsd > 0 && (
          <rect
            className="stack-grape"
            x={STACK.x}
            y={grapes.y}
            width={STACK.colW}
            height={grapes.h}
          />
        )}
        {state.licenseUsd > 0 && (
          <rect
            className="stack-license"
            x={STACK.x}
            y={license.y}
            width={STACK.colW}
            height={Math.max(license.h, 2)}
          />
        )}
        <rect
          className="stack-remaining"
          data-testid="grapes-remaining-bar"
          x={STACK.x}
          y={remaining.y}
          width={STACK.colW}
          height={Math.max(remaining.h, 1)}
        />
        {state.tons > 0 && (
          <rect
            className="crush-hatch"
            x={STACK.x}
            y={remaining.y}
            width={STACK.colW}
            height={Math.max(remaining.h, 1)}
          />
        )}
        <GhostRemaining remainingUsd={ghostRemainingUsd} y={y} />
        <text
          className="label-on-cash"
          x={STACK.x + 4}
          y={Math.min(STACK.bottom - 6, remaining.y + Math.max(remaining.h - 6, 12))}
        >
          {formatUsd(state.remainingUsd)}
        </text>
        {state.grapeCostUsd > 0 && (
          <text
            className="label-ink"
            x={STACK.x + STACK.colW + 8}
            y={grapes.y + 14}
          >
            Pinot noir {formatGrapeTons(state.tons)} {formatUsd(state.grapeCostUsd)}
          </text>
        )}
        <text
          className="label-ink"
          x={STACK.x + STACK.colW + 8}
          y={state.licenseUsd > 0 ? license.y + 10 : STACK.top + 28}
          data-testid="license-fee"
        >
          {state.tons > 0
            ? `OLCC winery ${formatUsd(state.licenseUsd)}`
            : "OLCC winery $500 when tons > 0"}
        </text>
        <text
          className="label-ink"
          x={STACK.x + STACK.colW + 8}
          y={remaining.y - 8}
        >
          crush fee unpublished
        </text>
        {tonStops.map((stop) => (
          <text
            key={stop.tons}
            className="ton-stop"
            role="button"
            tabIndex={0}
            data-pressed={state.tons === stop.tons ? "true" : "false"}
            aria-label={`${stop.tons} tons of North Willamette Pinot noir`}
            x={STACK.x - 6}
            y={y(stop.usd) + 3}
            textAnchor="end"
            onClick={() => onTons(stop.tons)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onTons(stop.tons);
              }
            }}
          >
            {stop.tons === 0 ? "0" : `${stop.tons} t`}
          </text>
        ))}
        <rect
          className="stack-hit"
          data-control="grapes"
          x={STACK.x}
          y={STACK.top}
          width={STACK.colW}
          height={STACK.bottom - STACK.top}
          onPointerDown={onPointerDown}
        />
        <circle
          className="handle"
          cx={STACK.x + STACK.colW}
          cy={y(state.remainingUsd)}
          r={5}
          onPointerDown={onPointerDown}
        />
        <text className="source-on-graphic" x={4} y={STACK.h - 22}>
          OWB/UO 2025 grape prices, North Willamette Pinot noir avg
        </text>
        <text className="source-on-graphic" x={4} y={STACK.h - 10}>
          OLCC winery $500, fee schedule Rev 1.01.24
        </text>
      </svg>
      <p className="two-hundred-k-state">
        <strong data-testid="grapes-remaining">{formatUsd(state.remainingUsd)} remaining</strong>
        {" · "}
        <span data-testid="tons-bought">{formatGrapeTons(state.tons)} bought</span>
        {" · "}
        0 acres
        {" · "}
        crush fee unpublished
        {" · "}
        custom crush is legal; TTB no federal fee
        {" · "}
        max {MAX_GRAPE_TONS} t still clears $500
      </p>
      <label className="visually-hidden" htmlFor="grape-tons">
        Tons of North Willamette Pinot noir
      </label>
      <input
        id="grape-tons"
        className="visually-hidden"
        type="range"
        min={0}
        max={MAX_GRAPE_TONS}
        step={1}
        value={state.tons}
        onChange={(event) => onTons(Number(event.target.value))}
      />
    </section>
  );
}

function LaborDoor() {
  const y = yScale();
  const labor = evaluateLabor();
  const remaining = segmentY(y, 0, labor.remainingUsd);
  const laborPct = Math.round(LABOR_SHARE_OF_ESTABLISHMENT_CASH * 100);

  return (
    <section className="two-hundred-k-door" aria-label="Labor / get hired">
      <h3 className="two-hundred-k-door-title">Labor / get hired</h3>
      <svg
        viewBox={`0 0 ${STACK.w} ${STACK.h}`}
        role="img"
        aria-label="Labor door. The $200,000 stack is still in hand as runway."
      >
        <CashAxis y={y} />
        <rect
          className="stack-remaining"
          data-testid="labor-remaining-bar"
          x={STACK.x}
          y={remaining.y}
          width={STACK.colW}
          height={remaining.h}
        />
        <text
          className="label-on-cash"
          x={STACK.x + 4}
          y={remaining.y + 18}
        >
          runway {formatUsd(labor.remainingUsd)}
        </text>
        <text
          className="label-ink"
          x={STACK.x + STACK.colW + 8}
          y={STACK.top + 24}
        >
          0 acres · 0 tons · 0 brand
        </text>
        <text
          className="label-ink"
          x={STACK.x + STACK.colW + 8}
          y={STACK.top + 40}
        >
          this door spends $0 of the stack
        </text>
        <text className="label" x={STACK.x + STACK.colW + 8} y={STACK.top + 58}>
          labor is {laborPct}% of AEB 0086 first-five-year cash — annotation, not
          a spend here
        </text>
        <text className="source-on-graphic" x={4} y={STACK.h - 22}>
          OSU AEB 0086 (Dec 2025)
        </text>
        <text className="source-on-graphic" x={4} y={STACK.h - 10}>
          labor 42% of establishment cash
        </text>
      </svg>
      <p className="two-hundred-k-state">
        <strong data-testid="labor-remaining">{formatUsd(labor.remainingUsd)} remaining</strong>
        {" · "}
        <span data-testid="labor-acres">0 ac owned</span>
        {" · "}
        0 t · 0 brand
        {" · "}
        labor is {laborPct}% of AEB 0086 first-five-year cash costs
      </p>
    </section>
  );
}

export function TwoHundredKExplorable() {
  const [landAcres, setLandAcres] = useState(0);
  const [plantedAcres, setPlantedAcres] = useState(0);
  const [tons, setTons] = useState(0);
  const [ghostLandRemaining, setGhostLandRemaining] = useState<number | null>(
    null,
  );
  const [ghostGrapeRemaining, setGhostGrapeRemaining] = useState<number | null>(
    null,
  );

  const land = evaluateLandPlant(landAcres, plantedAcres);
  const grapes = evaluateGrapes(tons);

  function changeLand(nextAcres: number) {
    setGhostLandRemaining(land.remainingUsd);
    const next = evaluateLandPlant(nextAcres, plantedAcres);
    setLandAcres(next.landAcres);
    setPlantedAcres(next.plantedAcres);
  }

  function changePlant(nextAcres: number) {
    setGhostLandRemaining(land.remainingUsd);
    const next = evaluateLandPlant(landAcres, nextAcres);
    setPlantedAcres(next.plantedAcres);
  }

  function changeTons(nextTons: number) {
    setGhostGrapeRemaining(grapes.remainingUsd);
    setTons(evaluateGrapes(nextTons).tons);
  }

  return (
    <div className="two-hundred-k">
      <div className="two-hundred-k-board">
        <p className="two-hundred-k-lede">
          <strong>{formatUsd(STACK_USD)} liquid business capital</strong>
          {" — "}
          same stack in each door. Not a Portland rent budget. Not a winery P&L.
        </p>
        <LandDoor
          state={land}
          ghostRemainingUsd={
            ghostLandRemaining !== null && ghostLandRemaining !== land.remainingUsd
              ? ghostLandRemaining
              : null
          }
          onLand={changeLand}
          onPlant={changePlant}
        />
        <GrapesDoor
          state={grapes}
          ghostRemainingUsd={
            ghostGrapeRemaining !== null &&
            ghostGrapeRemaining !== grapes.remainingUsd
              ? ghostGrapeRemaining
              : null
          }
          onTons={changeTons}
        />
        <LaborDoor />
        <p className="two-hundred-k-sources">
          OSU AEB 0086 (Dec 2025). OWB/UO 2025 grape prices, North Willamette Pinot
          noir avg. OLCC winery $500, fee schedule Rev 1.01.24. Crush fee
          unpublished — remaining on the grapes door is not net of crush.
        </p>
      </div>
    </div>
  );
}
