import * as d3 from "d3";
import { useId, useRef, useState } from "react";
import {
  DEFAULT_DEPTH_IN,
  DEPTH_MAX_IN,
  DEPTH_MIN_IN,
  JORY_TYPICAL_CLAY_TO_IN,
  NEKIA_BEDROCK_RANGE_IN,
  NEKIA_R_TYPICAL_IN,
  OSD_JORY,
  OSD_LAURELWOOD,
  OSD_NEKIA,
  OSD_WILLAKENZIE,
  WILLAKENZIE_CR_RANGE_IN,
  WILLAKENZIE_CR_TYPICAL_IN,
} from "./constants";
import {
  OSU_INVENTORY,
  landformForPin,
  selectLandform,
  type LandformId,
  type ValleySelection,
} from "./geography";
import {
  PITS,
  clampDepthIn,
  readoutAt,
  type Horizon,
  type SoilSeries,
} from "./model";
import { ValleyPositionBoard } from "./ValleyPositionBoard";
import "./willamette-soils.css";

const PIT_FILL: Record<Horizon["kind"], string> = {
  soil: "#c4a574",
  paralithic: "#6b6560",
  nonconforming: "#9a7b5c",
};

const JORY_SOIL_FILL: Record<string, string> = {
  Ap: "#8b4a2f",
  A: "#8b3a2a",
  AB: "#7a3326",
  Bt1: "#6e2a22",
  Bt2: "#5c241c",
  Bt3: "#4a1d16",
};

function svgPoint(svg: SVGSVGElement, event: PointerEvent): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const local = pt.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

function horizonFill(series: SoilSeries, horizon: Horizon): string {
  if (series.id === "jory" && horizon.kind === "soil") {
    return JORY_SOIL_FILL[horizon.name] ?? PIT_FILL.soil;
  }
  return PIT_FILL[horizon.kind];
}

function horizonCaption(horizon: Horizon): string {
  const bits = [horizon.name];
  if (horizon.texture) bits.push(horizon.texture);
  if (horizon.color) bits.push(horizon.color);
  return bits.join(" · ");
}

export function WillametteSoilsExplorable() {
  const sliderId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [depthIn, setDepthIn] = useState(DEFAULT_DEPTH_IN);
  const [selection, setSelection] = useState<ValleySelection>("unselected");

  const geo = selection === "unselected" ? null : selectLandform(selection);
  const highlightedSeries = geo?.pitHighlighted ?? null;

  function chooseLandform(id: LandformId) {
    setSelection((prev) => (prev === id ? "unselected" : id));
  }

  function choosePin(seriesId: SoilSeries["id"]) {
    setSelection(landformForPin(seriesId));
  }

  const width = 720;
  const height = 420;
  const m = { top: 10, right: 12, bottom: 16, left: 36 };
  const y = d3
    .scaleLinear()
    .domain([DEPTH_MIN_IN, DEPTH_MAX_IN])
    .range([m.top, height - m.bottom]);

  const pitGap = 16;
  const pitCount = PITS.length;
  const pitW =
    (width - m.left - m.right - pitGap * (pitCount - 1)) / pitCount;
  const pitXs = PITS.map((_, i) => m.left + i * (pitW + pitGap));
  const depthY = y(depthIn);
  const ticks = [0, 12, 24, 36, 48, 60, 72];

  function setFromPointer(event: PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    setDepthIn(Math.round(clampDepthIn(y.invert(svgPoint(svg, event).y))));
  }

  function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.nativeEvent);
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setFromPointer(event.nativeEvent);
  }

  const readouts = PITS.map((series) => readoutAt(series, depthIn));

  return (
    <section
      className="willamette-soils"
      aria-label="Willamette landforms and three typical soil pits"
      data-highlighted-series={highlightedSeries ?? "none"}
      data-geography-state={selection}
    >
      <ValleyPositionBoard
        selection={selection}
        onChooseLandform={chooseLandform}
        onChoosePin={choosePin}
      />

      <div className="pits-board">
        <div className="pits-align">
          {PITS.map((series) => (
            <header
              key={series.id}
              className="pit-head"
              data-series={series.id}
              data-selected={highlightedSeries === series.id ? "true" : "false"}
              role="button"
              tabIndex={0}
              aria-pressed={highlightedSeries === series.id}
              aria-label={`${series.name} typical pedon`}
              onClick={() => choosePin(series.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  choosePin(series.id);
                }
              }}
            >
              <div className="pit-name" data-series={series.id}>
                {series.name}
              </div>
              <p className="pit-formed">Formed from {series.parentMaterial}.</p>
              <p className="pit-drain">
                {series.drainage} · {series.permeability} permeability
              </p>
            </header>
          ))}
        </div>

        <svg
          ref={svgRef}
          className="pits-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Typical pedons, shared depth ${depthIn} inches. Drag the depth line.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                className="tick"
                x1={8}
                x2={width - 8}
                y1={y(t)}
                y2={y(t)}
              />
              <text className="tick-label" x={4} y={y(t) + 3}>
                {t} in
              </text>
            </g>
          ))}

          {PITS.map((series, i) => {
            const x = pitXs[i]!;
            return (
              <g key={series.id} aria-label={`${series.name} typical pedon`}>
                {series.id === "willakenzie" ? (
                  <rect
                    className="cr-band"
                    x={x}
                    y={y(WILLAKENZIE_CR_RANGE_IN.min)}
                    width={pitW}
                    height={
                      y(WILLAKENZIE_CR_RANGE_IN.max) -
                      y(WILLAKENZIE_CR_RANGE_IN.min)
                    }
                  />
                ) : null}
                {series.horizons.map((h) => {
                  const top = Math.max(h.topIn, DEPTH_MIN_IN);
                  const bottom = Math.min(h.bottomIn, DEPTH_MAX_IN);
                  if (bottom <= top) return null;
                  const y1 = y(top);
                  const y2 = y(bottom);
                  return (
                    <g key={h.name}>
                      <rect
                        className={`horizon-${h.kind}`}
                        x={x}
                        y={y1}
                        width={pitW}
                        height={y2 - y1}
                        fill={horizonFill(series, h)}
                      />
                      {h.kind === "nonconforming" ? (
                        <g className="hatch">
                          {d3.range(y1, y2, 8).map((hy) => (
                            <line
                              key={hy}
                              x1={x}
                              x2={x + pitW}
                              y1={hy}
                              y2={hy + 6}
                            />
                          ))}
                        </g>
                      ) : null}
                      {y2 - y1 > 16 ? (
                        <text
                          className="horizon-label"
                          x={x + 6}
                          y={y1 + 12}
                        >
                          {h.name}
                          {h.kind === "paralithic" ? " floor" : ""}
                          {h.kind === "nonconforming" ? " change" : ""}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
                <rect
                  className="pit-outline"
                  data-selected={
                    highlightedSeries === series.id ? "true" : "false"
                  }
                  x={x}
                  y={y(DEPTH_MIN_IN)}
                  width={pitW}
                  height={y(DEPTH_MAX_IN) - y(DEPTH_MIN_IN)}
                />
              </g>
            );
          })}

          <line
            className="depth-hit"
            x1={m.left}
            x2={width - m.right}
            y1={depthY}
            y2={depthY}
          />
          <line
            className="depth-line"
            x1={m.left}
            x2={width - m.right}
            y1={depthY}
            y2={depthY}
          />
          {pitXs.map((x) => (
            <circle
              key={x}
              className="depth-handle"
              cx={x + pitW / 2}
              cy={depthY}
              r={5}
            />
          ))}
        </svg>

        <div className="pits-align">
          {readouts.map((here) => (
            <div
              key={here.seriesId}
              className="pit-readout"
              data-series={here.seriesId}
              data-hit-floor={here.hitFloor ? "true" : "false"}
            >
              <p className="here">
                <strong>At {here.depthIn} in:</strong>{" "}
                {horizonCaption({
                  name: here.horizonName,
                  topIn: 0,
                  bottomIn: 0,
                  texture: here.texture,
                  color: here.color,
                  kind: here.hitFloor
                    ? "paralithic"
                    : here.materialChanged
                      ? "nonconforming"
                      : "soil",
                })}
              </p>
              <p className="floor" data-hit={here.hitFloor ? "true" : "false"}>
                {here.floorLabel}
              </p>
            </div>
          ))}
        </div>
      </div>

      <label className="visually-hidden" htmlFor={sliderId}>
        Depth in all three pits, inches
      </label>
      {/* A4: SVG depth line is the visible control; range is AT-only. */}
      <input
        id={sliderId}
        className="visually-hidden"
        type="range"
        min={DEPTH_MIN_IN}
        max={DEPTH_MAX_IN}
        step={1}
        value={depthIn}
        aria-valuemin={DEPTH_MIN_IN}
        aria-valuemax={DEPTH_MAX_IN}
        aria-valuenow={depthIn}
        aria-valuetext={`${depthIn} inches`}
        onChange={(event) => setDepthIn(Number(event.target.value))}
      />

      <p className="nekia-caption">
        Nekia (OSD {OSD_NEKIA.monthYear}) is not a fourth pit: moderately deep,
        same basalt family as Jory, {NEKIA_BEDROCK_RANGE_IN.min}–
        {NEKIA_BEDROCK_RANGE_IN.max} in to hard bedrock, typical R at{" "}
        {NEKIA_R_TYPICAL_IN} in.
      </p>
      <p className="uses-note">
        Jory is Oregon’s state soil (2011); vineyards are among its listed uses
        (OSD {OSD_JORY.monthYear}). Laurelwood’s OSD does not list vineyards
        among typical uses (OSD {OSD_LAURELWOOD.monthYear}). Scale is 0–
        {DEPTH_MAX_IN} in; Jory’s typical pedon is still clay at{" "}
        {JORY_TYPICAL_CLAY_TO_IN} in.
      </p>
      <p className="source-note">
        One described pit each, not every vineyard. Horizons and depths: USDA
        NRCS Official Soil Series Descriptions —{" "}
        <a href={OSD_JORY.url}>JORY {OSD_JORY.monthYear}</a>,{" "}
        <a href={OSD_WILLAKENZIE.url}>
          WILLAKENZIE {OSD_WILLAKENZIE.monthYear}
        </a>
        , <a href={OSD_LAURELWOOD.url}>LAURELWOOD {OSD_LAURELWOOD.monthYear}</a>,{" "}
        <a href={OSD_NEKIA.url}>NEKIA {OSD_NEKIA.monthYear}</a>. Willakenzie
        typical Cr {WILLAKENZIE_CR_TYPICAL_IN} in; series range to paralithic{" "}
        {WILLAKENZIE_CR_RANGE_IN.min}–{WILLAKENZIE_CR_RANGE_IN.max} in. Map
        extents: SoilWeb generalized SSURGO series extent (UC Davis), not a
        soil survey you can site from. Hillside vs floor:{" "}
        <a href={OSU_INVENTORY.url}>{OSU_INVENTORY.source}</a>.
      </p>
    </section>
  );
}
