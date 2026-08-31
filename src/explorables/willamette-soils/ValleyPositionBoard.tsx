import type { KeyboardEvent, ReactNode } from "react";
import {
  BELT_UNCERTAINTY,
  JORY_TYPE_LOCATION,
  LAURELWOOD_TYPE_LOCATION,
  OSD_GEOGRAPHY_CAPTION,
  SCHEMATIC,
  TYPE_LOCATION_PINS,
  WILLAKENZIE_TYPE_LOCATION,
  formatDms,
  selectLandform,
  typeLocationXY,
  type LandformId,
  type ValleySelection,
} from "./geography";

function activate(
  event: KeyboardEvent,
  action: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

function Belt({
  id,
  label,
  selected,
  onChoose,
  children,
}: {
  id: LandformId;
  label: string;
  selected: boolean;
  onChoose: (id: LandformId) => void;
  children: ReactNode;
}) {
  return (
    <g
      className="belt"
      data-landform={id}
      data-selected={selected ? "true" : "false"}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={label}
      onClick={() => onChoose(id)}
      onKeyDown={(event) => activate(event, () => onChoose(id))}
    >
      {children}
    </g>
  );
}

export function ValleyPositionBoard({
  selection,
  onChooseLandform,
  onChoosePin,
}: {
  selection: ValleySelection;
  onChooseLandform: (id: LandformId) => void;
  onChoosePin: (seriesId: "jory" | "willakenzie" | "laurelwood") => void;
}) {
  const geo = selection === "unselected" ? null : selectLandform(selection);
  const selectedLandform = selection === "unselected" ? null : selection;

  const joryPin = typeLocationXY(JORY_TYPE_LOCATION);
  const willPin = typeLocationXY(WILLAKENZIE_TYPE_LOCATION);
  const laurelPin = typeLocationXY(LAURELWOOD_TYPE_LOCATION);

  return (
    <div className="valley-board" data-geography-state={selection}>
      <div className="valley-map-wrap">
        <svg
          className="valley-svg"
          viewBox={`0 0 ${SCHEMATIC.width} ${SCHEMATIC.height}`}
          role="img"
          aria-label="Willamette Valley landform schematic. OSD geographic setting, not a soil survey. Click a belt or type-location pin."
        >
          <text className="north-mark" x={150} y={14}>
            N
          </text>
          <text className="north-mark" x={150} y={434}>
            S
          </text>

          <rect className="flank" x={6} y={20} width={30} height={400} />
          <text className="flank-label" transform="translate(21,220) rotate(-90)">
            Coast Range
          </text>
          <rect className="flank" x={264} y={20} width={30} height={400} />
          <text className="flank-label" transform="translate(279,220) rotate(-90)">
            Cascades
          </text>

          <Belt
            id="surrounding-foothills"
            label="Surrounding foothills — Jory"
            selected={selectedLandform === "surrounding-foothills"}
            onChoose={onChooseLandform}
          >
            <path
              className="belt-fill jory-fill"
              d="M38,148 C36,220 38,300 44,378 C48,400 78,410 118,404 L118,376 C80,380 70,300 72,200 L72,150 C62,140 46,138 38,148 Z"
            />
            <path
              className="belt-fill jory-fill"
              d="M148,48 C188,32 232,44 238,88 C244,150 246,250 242,348 C238,386 208,412 168,410 L156,300 L148,200 L158,78 C154,58 150,50 148,48 Z"
            />
            <text className="belt-label" x={50} y={268}>
              Jory
            </text>
            <text className="belt-label" x={200} y={168}>
              Jory
            </text>
          </Belt>

          <Belt
            id="northwest-margin-hills"
            label="Northwest-margin hills — Laurelwood"
            selected={selectedLandform === "northwest-margin-hills"}
            onChoose={onChooseLandform}
          >
            <ellipse
              className="belt-fill laurel-fill"
              cx={118}
              cy={62}
              rx={54}
              ry={34}
            />
            <text className="belt-label" x={90} y={66}>
              Laurelwood
            </text>
          </Belt>

          <Belt
            id="western-margin-hills"
            label="Western-margin hills — Willakenzie, Spencer Formation"
            selected={selectedLandform === "western-margin-hills"}
            onChoose={onChooseLandform}
          >
            <ellipse
              className="belt-fill will-fill"
              cx={90}
              cy={112}
              rx={46}
              ry={38}
            />
            <text className="belt-label" x={62} y={108}>
              Willakenzie
            </text>
            <text className="belt-sub" x={68} y={122}>
              Spencer
            </text>
          </Belt>

          <Belt
            id="eastern-southern-margins"
            label="Eastern margins, southern portion — Willakenzie, Eugene and Fisher Formations"
            selected={selectedLandform === "eastern-southern-margins"}
            onChoose={onChooseLandform}
          >
            <ellipse
              className="belt-fill will-fill"
              cx={210}
              cy={348}
              rx={32}
              ry={22}
            />
            <text className="belt-label" x={186} y={346}>
              Willakenzie
            </text>
            <text className="belt-sub" x={188} y={358}>
              Eugene / Fisher
            </text>
          </Belt>

          <Belt
            id="valley-floor"
            label="Valley floor — not Jory, Willakenzie, or Laurelwood"
            selected={selectedLandform === "valley-floor"}
            onChoose={onChooseLandform}
          >
            <path
              className="belt-fill floor-fill"
              d="M172,28 L206,28 L148,200 L156,300 L164,412 L124,412 L116,300 L106,200 L148,85 Z"
            />
            <text className="belt-label floor-label" x={128} y={300}>
              floor
            </text>
          </Belt>

          <text className="city" x={184} y={44}>
            Portland
          </text>
          <text className="city" x={112} y={248}>
            Salem
          </text>
          <text className="city" x={128} y={400}>
            Eugene
          </text>

          {TYPE_LOCATION_PINS.map((pin) => {
            const { x, y } =
              pin.seriesId === "jory"
                ? joryPin
                : pin.seriesId === "willakenzie"
                  ? willPin
                  : laurelPin;
            const pinSelected =
              geo?.seriesId === pin.seriesId &&
              selectedLandform ===
                (pin.seriesId === "jory"
                  ? "surrounding-foothills"
                  : pin.seriesId === "willakenzie"
                    ? "western-margin-hills"
                    : "northwest-margin-hills");
            return (
              <g
                key={pin.seriesId}
                className="type-pin"
                data-pin={pin.seriesId}
                data-selected={pinSelected ? "true" : "false"}
                role="button"
                tabIndex={0}
                aria-label={`${pin.location.county} County type location — ${pin.seriesId}`}
                transform={`translate(${x},${y})`}
                onClick={(event) => {
                  event.stopPropagation();
                  onChoosePin(pin.seriesId);
                }}
                onKeyDown={(event) =>
                  activate(event, () => onChoosePin(pin.seriesId))
                }
              >
                <circle className="pin-dot" r={6} />
                <circle className="pin-core" r={2.5} />
              </g>
            );
          })}
        </svg>
        <p className="valley-caption">{OSD_GEOGRAPHY_CAPTION}</p>
      </div>

      <aside className="valley-readout" aria-live="polite">
        <p className="valley-uncertainty">{BELT_UNCERTAINTY}</p>
        {geo == null ? (
          <div className="valley-payload" data-readout="unselected">
            <p>
              <strong>Where:</strong> click a landform belt or a type-location
              pin. All three belts stay visible.
            </p>
            <p>
              Same three named soils sit on different landforms because that is
              where their parent materials are.
            </p>
            <p>Pins are the only point-accurate features (OSD lat/lon, NAD27).</p>
          </div>
        ) : geo.state === "floor" ? (
          <div className="valley-payload" data-readout="floor">
            <p>
              <strong>Where:</strong> {geo.where}
            </p>
            <p>
              <strong>Series:</strong> none of these three. Jory, Willakenzie,
              and Laurelwood are hillside soils.
            </p>
            <p>
              <strong>Parent material:</strong> {geo.parentMaterial}
            </p>
            <p data-osu-contrast="true">{geo.osuHillsideVsFloor}</p>
          </div>
        ) : (
          <div
            className="valley-payload"
            data-readout={geo.seriesId}
            data-landform={geo.landformId}
          >
            <p>
              <strong>Series:</strong> {geo.seriesName}
            </p>
            <p>
              <strong>Where:</strong> {geo.where}
            </p>
            <p>
              <strong>Parent material:</strong> {geo.parentMaterial}
            </p>
            {geo.formations ? (
              <p>
                <strong>Formation:</strong> {geo.formations.join(" and ")}
              </p>
            ) : null}
            {geo.elevationFt ? (
              <p>
                <strong>Elevation:</strong> {geo.elevationFt.min}–
                {geo.elevationFt.max} ft (OSD)
              </p>
            ) : null}
            {geo.typeLocation ? (
              <p>
                <strong>Type location:</strong> {geo.typeLocation.county}{" "}
                County, {geo.typeLocation.state}.{" "}
                {formatDms(geo.typeLocation.lat)},{" "}
                {formatDms(geo.typeLocation.lon)} ({geo.typeLocation.datum}).
              </p>
            ) : null}
            {geo.distribution ? (
              <p>
                <strong>Distribution:</strong> {geo.distribution}
              </p>
            ) : null}
            {geo.umpquaCaption ? (
              <p data-umpqua-caption="true">{geo.umpquaCaption}</p>
            ) : null}
            {geo.willakenzieAssociatedJory ? (
              <p data-associated-jory="true">{geo.willakenzieAssociatedJory}</p>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
