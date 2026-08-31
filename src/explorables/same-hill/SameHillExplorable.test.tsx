import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SameHillExplorable } from "./SameHillExplorable";
import { PENNER_ASH_FROST_HOURS_PCT } from "./constants";

describe("SameHillExplorable", () => {
  it("shows facing, slope band, solar class, and frost class on the canvas (A1, F2)", () => {
    render(<SameHillExplorable />);
    expect(screen.getByTestId("facing")).toBeInTheDocument();
    expect(screen.getByTestId("slope-band")).toHaveTextContent("5–15%");
    expect(screen.getByTestId("solar-class")).toHaveTextContent(/highest/i);
    expect(screen.getByTestId("frost-class")).toHaveTextContent(/drained/i);
    expect(screen.getByText(/highest · SSE–SSW/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^pocket$/i).length).toBeGreaterThan(0);
  });

  it("labels solar classes on the ring so highest is compared to less (F8, F9)", () => {
    render(<SameHillExplorable />);
    expect(screen.getByText(/highest · SSE–SSW/i)).toBeInTheDocument();
    expect(screen.getByText(/less · N\/NW\/NE/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^more$/i).length).toBeGreaterThan(0);
    expect(document.querySelector(".same-hill-legend")).toBeNull();
  });

  it("labels frost pocket against drained on the profile (F8, F9, E4)", () => {
    render(<SameHillExplorable />);
    expect(screen.getAllByText(/^pocket$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^drained$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5–15%/).length).toBeGreaterThan(0);
    expect(screen.getByText(/<1%/)).toBeInTheDocument();
  });

  it("has no run or calculate button (A2)", () => {
    render(<SameHillExplorable />);
    expect(screen.queryByRole("button", { name: /^run$/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /calculate/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^play$/i })).not.toBeInTheDocument();
  });

  it("pointer-move with capture updates r/bearing (A2)", () => {
    render(<SameHillExplorable />);
    const svg = document.querySelector(".same-hill-plan svg") as SVGSVGElement;
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 480,
      bottom: 560,
      width: 480,
      height: 560,
      toJSON() {
        return {};
      },
    } as DOMRect);
    const radius = screen.getByLabelText(
      /distance from ridge/i,
    ) as HTMLInputElement;
    fireEvent.pointerDown(svg, { pointerId: 1, clientX: 240, clientY: 248 });
    expect(Number(radius.value)).toBeLessThan(15);
    fireEvent.pointerMove(svg, {
      pointerId: 1,
      clientX: 240,
      clientY: 337,
      buttons: 1,
    });
    expect(Number(radius.value)).toBeGreaterThan(50);
    expect(screen.getByTestId("frost-class")).toHaveTextContent(/pocket/i);
  });

  it("keeps the 81% frost caption readable at rMax (A6)", () => {
    render(<SameHillExplorable />);
    fireEvent.change(screen.getByLabelText(/distance from ridge/i), {
      target: { value: "130" },
    });
    expect(screen.getByTestId("frost-class")).toHaveTextContent(/pocket/i);
    expect(screen.getByText(/frost pocket · 81% of hours/)).toBeInTheDocument();
  });

  it("exposes pin position on the hill (A4)", () => {
    render(<SameHillExplorable />);
    expect(
      screen.getByLabelText(/distance from ridge/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/bearing from north/i),
    ).toBeInTheDocument();
  });

  it("south trough is still a frost pocket and shows 81 as a caption", () => {
    render(<SameHillExplorable />);
    fireEvent.change(screen.getByLabelText(/distance from ridge/i), {
      target: { value: "84" },
    });
    fireEvent.change(screen.getByLabelText(/bearing from north/i), {
      target: { value: "180" },
    });
    expect(screen.getByTestId("frost-class")).toHaveTextContent(/pocket/i);
    expect(
      screen.getByText(
        new RegExp(`${PENNER_ASH_FROST_HOURS_PCT}% of frost hours`),
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/81\.00/)).not.toBeInTheDocument();
  });

  it("north mid-slope stays drained with a lower solar class", () => {
    render(<SameHillExplorable />);
    fireEvent.change(screen.getByLabelText(/bearing from north/i), {
      target: { value: "0" },
    });
    expect(screen.getByTestId("frost-class")).toHaveTextContent(/drained/i);
    expect(screen.getByTestId("solar-class")).toHaveTextContent(/less/i);
  });

  it("flat apron is the <1% slope band and is in the frost fill (A6 / F9)", () => {
    render(<SameHillExplorable />);
    fireEvent.change(screen.getByLabelText(/distance from ridge/i), {
      target: { value: "110" },
    });
    expect(screen.getByTestId("slope-band")).toHaveTextContent("<1%");
    expect(screen.getByTestId("frost-class")).toHaveTextContent(/pocket/i);
    const frost = document.querySelector("[data-frost-region]");
    const inner = document.querySelector("[data-frost-inner]");
    const hill = document.querySelector(".hill-fill");
    expect(frost?.getAttribute("r")).toBe(hill?.getAttribute("r"));
    expect(Number(inner?.getAttribute("r"))).toBeLessThan(
      Number(frost?.getAttribute("r")),
    );
    const pocket = document.querySelector("[data-pocket-on-fill]");
    expect(pocket?.textContent).toMatch(/^pocket$/);
    const cx = 240;
    const cy = 248;
    const pocketR = Math.hypot(
      Number(pocket?.getAttribute("x")) - cx,
      Number(pocket?.getAttribute("y")) - cy,
    );
    expect(pocketR).toBeGreaterThan(Number(inner?.getAttribute("r")));
    expect(document.querySelector("[data-downhill-tick]")).toBeTruthy();
    expect(screen.getByText(/^downhill$/)).toBeInTheDocument();
  });

  it("10° south caption is vs a flat site, not vs north (F11)", () => {
    render(<SameHillExplorable />);
    const board = document.querySelector(".same-hill");
    expect(board?.textContent).toMatch(/25% more/);
    expect(board?.textContent).toMatch(/flat site/i);
    expect(board?.textContent).toMatch(/not south vs north/i);
    expect(board?.textContent).toMatch(/Jones & Duff 2007/);
  });

  it("ridge is finite and drained", () => {
    render(<SameHillExplorable />);
    fireEvent.change(screen.getByLabelText(/distance from ridge/i), {
      target: { value: "0" },
    });
    expect(screen.getByTestId("frost-class")).toHaveTextContent(/drained/i);
    expect(screen.getByTestId("facing").textContent).not.toMatch(/NaN/);
  });

  it("does not ship occupied PAW, GDD, or soils-map controls", () => {
    render(<SameHillExplorable />);
    expect(screen.queryByText(/occupied taw/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/winkler/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/leaflet/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/seasonal demand/i)).not.toBeInTheDocument();
  });

  it("keeps Jones, Penner-Ash, and EM 8973 on the canvas (F11)", () => {
    render(<SameHillExplorable />);
    expect(screen.getByText(/Jones et al. 2004/i)).toBeInTheDocument();
    expect(screen.getByText(/Umpqua GIS/i)).toBeInTheDocument();
    expect(screen.getByText(/Penner-Ash 2014/i)).toBeInTheDocument();
    expect(screen.getByText(/n\. WV/i)).toBeInTheDocument();
    expect(screen.getByText(/OSU EM 8973 \(rev\. 2022\)/)).toBeInTheDocument();
    expect(screen.getByText(/air drainage/i)).toBeInTheDocument();
  });

  it("does not encode solar class as circle radius (F1)", () => {
    render(<SameHillExplorable />);
    const pins = document.querySelectorAll(".same-hill .pin");
    const radii = [...pins].map((el) => el.getAttribute("r"));
    expect(new Set(radii).size).toBe(1);
  });
});
