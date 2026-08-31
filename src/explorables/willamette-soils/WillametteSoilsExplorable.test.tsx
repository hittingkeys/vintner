import { act, fireEvent, render, screen } from "@testing-library/react";
import { WillametteSoilsExplorable } from "./WillametteSoilsExplorable";

describe("WillametteSoilsExplorable", () => {
  it("shows all three pits at once with parent material on the canvas (A1)", () => {
    render(<WillametteSoilsExplorable />);
    expect(screen.getAllByText(/^jory$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^willakenzie$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^laurelwood$/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/basic igneous/i)).toBeInTheDocument();
    expect(screen.getByText(/sandstone, siltstone/i)).toBeInTheDocument();
    expect(screen.getByText(/loess-like/i)).toBeInTheDocument();
    expect(screen.getAllByText(/0 in/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/72 in/).length).toBeGreaterThan(0);
  });

  it("has a shared depth control and no run button (A2, A4)", () => {
    render(<WillametteSoilsExplorable />);
    const slider = screen.getByLabelText(/depth in all three pits/i);
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveClass("visually-hidden");
    expect(document.querySelector(".depth-line")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^run$/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /calculate/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^play$/i })).not.toBeInTheDocument();
  });

  it("reads out what is here next to each pit, not only a tooltip", () => {
    render(<WillametteSoilsExplorable />);
    expect(screen.getAllByText(/at 0 in/i).length).toBe(3);
    expect(document.querySelectorAll(".pit-readout")).toHaveLength(3);
  });

  it("at 36 in only Willakenzie has hit a floor", () => {
    render(<WillametteSoilsExplorable />);
    fireEvent.change(screen.getByLabelText(/depth in all three pits/i), {
      target: { value: "36" },
    });
    const will = document.querySelector('.pit-readout[data-series="willakenzie"]');
    const jory = document.querySelector('.pit-readout[data-series="jory"]');
    const laurel = document.querySelector('.pit-readout[data-series="laurelwood"]');
    expect(will?.getAttribute("data-hit-floor")).toBe("true");
    expect(jory?.getAttribute("data-hit-floor")).toBe("false");
    expect(laurel?.getAttribute("data-hit-floor")).toBe("false");
    expect(will?.textContent).toMatch(/in rock/i);
    expect(jory?.textContent).toMatch(/still soil/i);
  });

  it("at 60 in Jory is still soil and Laurelwood has changed material but not hit bedrock", () => {
    render(<WillametteSoilsExplorable />);
    fireEvent.change(screen.getByLabelText(/depth in all three pits/i), {
      target: { value: "60" },
    });
    const jory = document.querySelector('.pit-readout[data-series="jory"]');
    const laurel = document.querySelector('.pit-readout[data-series="laurelwood"]');
    expect(jory?.getAttribute("data-hit-floor")).toBe("false");
    expect(jory?.textContent).toMatch(/bt3/i);
    expect(laurel?.textContent).toMatch(/2c/i);
    expect(laurel?.textContent).toMatch(/not a bedrock floor/i);
  });

  it("keeps Nekia as a caption, not a fourth pit", () => {
    render(<WillametteSoilsExplorable />);
    expect(document.querySelector(".nekia-caption")?.textContent).toMatch(
      /nekia.*not a fourth pit/i,
    );
    expect(document.querySelectorAll(".pit-head")).toHaveLength(3);
    expect(screen.queryByRole("heading", { name: /^nekia$/i })).not.toBeInTheDocument();
  });

  it("does not ship occupied-PAW, vine, weather, or age controls", () => {
    render(<WillametteSoilsExplorable />);
    expect(screen.queryByText(/occupied taw/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/paws/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/rooting depth/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/seasonal demand/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/young vines/i)).not.toBeInTheDocument();
  });

  it("at the 0 in and 72 in extremes, only Willakenzie ever hits a floor", () => {
    render(<WillametteSoilsExplorable />);
    const slider = screen.getByLabelText(/depth in all three pits/i);
    fireEvent.change(slider, { target: { value: "0" } });
    expect(
      document.querySelectorAll('.pit-readout[data-hit-floor="true"]'),
    ).toHaveLength(0);
    fireEvent.change(slider, { target: { value: "72" } });
    expect(
      document.querySelector('.pit-readout[data-series="willakenzie"]')?.getAttribute(
        "data-hit-floor",
      ),
    ).toBe("true");
    expect(
      document.querySelector('.pit-readout[data-series="jory"]')?.getAttribute(
        "data-hit-floor",
      ),
    ).toBe("false");
    expect(
      document.querySelector('.pit-readout[data-series="laurelwood"]')?.getAttribute(
        "data-hit-floor",
      ),
    ).toBe("false");
    expect(
      document.querySelector('.pit-readout[data-series="jory"]')?.textContent,
    ).toMatch(/still soil/i);
    expect(
      document.querySelector('.pit-readout[data-series="laurelwood"]')?.textContent,
    ).toMatch(/not a bedrock floor/i);
  });

  it("states Laurelwood vineyards are not listed among typical uses", () => {
    render(<WillametteSoilsExplorable />);
    expect(
      screen.getByText(/does not list vineyards among typical uses/i),
    ).toBeInTheDocument();
  });

  it("shows all three extents when nothing is selected (extreme)", () => {
    render(<WillametteSoilsExplorable />);
    expect(document.querySelector('[data-extent="jory"]')).toBeTruthy();
    expect(document.querySelector('[data-extent="willakenzie"]')).toBeTruthy();
    expect(document.querySelector('[data-extent="laurelwood"]')).toBeTruthy();
    expect(document.querySelector("[data-valley-map]")).toBeTruthy();
    expect(document.querySelector(".willamette-soils")?.getAttribute("data-highlighted-series")).toBe(
      "none",
    );
    expect(document.querySelector(".willamette-soils")?.getAttribute("data-geography-state")).toBe(
      "unselected",
    );
    expect(document.querySelectorAll('.pit-head[data-selected="true"]')).toHaveLength(0);
    expect(
      screen.getAllByText(/SoilWeb generalized SSURGO/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Basemap: Esri World Topo/i)).toBeInTheDocument();
    expect(screen.getAllByText(/NAD27/i)).toHaveLength(1);
    expect(screen.getByText(/snapshot 2025-10-04/)).toBeInTheDocument();
    expect(document.querySelector(".extent-legend")).toBeNull();
    expect(document.querySelectorAll(".type-pin-name")).toHaveLength(0);
    expect(
      document.querySelectorAll('[data-extent-label="jory"]').length,
    ).toBeGreaterThan(1);
    expect(
      document.querySelectorAll('[data-extent-label="willakenzie"]').length,
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll('[data-extent-label="laurelwood"]').length,
    ).toBeGreaterThan(0);
    expect(
      document.querySelector(
        '[data-extent-label="jory"][data-south-of-view="true"]',
      ),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-extent-label="jory"]')?.textContent,
    ).toMatch(/Jory/);
    expect(screen.queryByText(/CARTO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Positron/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/OpenStreetMap \(CARTO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/223414/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Coast Range/i)).not.toBeInTheDocument();
  });

  it("floor click is a distinct state and does not highlight a pit as Jory", () => {
    render(<WillametteSoilsExplorable />);
    const map = document.querySelector("[data-valley-map]");
    expect(map).toBeTruthy();
    act(() => {
      map!.dispatchEvent(
        new CustomEvent("valley-map-lonlat", {
          detail: { lon: -123.035, lat: 44.942 },
        }),
      );
    });
    expect(document.querySelector(".willamette-soils")?.getAttribute("data-highlighted-series")).toBe(
      "none",
    );
    expect(document.querySelector(".willamette-soils")?.getAttribute("data-geography-state")).toBe(
      "valley-floor",
    );
    expect(document.querySelectorAll('.pit-head[data-selected="true"]')).toHaveLength(0);
    expect(document.querySelector('.pit-head[data-series="jory"]')?.getAttribute("data-selected")).toBe(
      "false",
    );
    expect(screen.getByText(/none of these three/i)).toBeInTheDocument();
    expect(screen.getByText(/Woodburn/i)).toBeInTheDocument();
    expect(screen.queryByText(/too many nutrients/i)).not.toBeInTheDocument();
  });

  it("Jory selection shows the Umpqua caption so Jory is not Willamette-only", () => {
    render(<WillametteSoilsExplorable />);
    fireEvent.click(document.querySelector('[data-pin="jory"]')!);
    expect(document.querySelector(".willamette-soils")?.getAttribute("data-highlighted-series")).toBe(
      "jory",
    );
    expect(document.querySelector(".willamette-soils")?.getAttribute("data-geography-state")).toBe(
      "surrounding-foothills",
    );
    expect(
      document.querySelector('.pit-head[data-series="jory"]')?.getAttribute("data-selected"),
    ).toBe("true");
    expect(
      document.querySelector('.pit-head[data-series="willakenzie"]')?.getAttribute("data-selected"),
    ).toBe("false");
    const umpqua = document.querySelector("[data-umpqua-caption]");
    expect(umpqua).toBeTruthy();
    expect(umpqua?.textContent).toMatch(/Umpqua/i);
    expect(screen.getByText(/Marion County/i)).toBeInTheDocument();
  });

  it("type-location pin shares selection with the matching pit", () => {
    render(<WillametteSoilsExplorable />);
    fireEvent.click(document.querySelector('[data-pin="laurelwood"]')!);
    expect(document.querySelector(".willamette-soils")?.getAttribute("data-highlighted-series")).toBe(
      "laurelwood",
    );
    expect(
      document.querySelector('.pit-head[data-series="laurelwood"]')?.getAttribute("data-selected"),
    ).toBe("true");
    expect(screen.getByText(/Washington County/i)).toBeInTheDocument();
    fireEvent.click(document.querySelector('[data-pin="willakenzie"]')!);
    expect(document.querySelector(".willamette-soils")?.getAttribute("data-highlighted-series")).toBe(
      "willakenzie",
    );
    expect(document.querySelector(".valley-payload")?.textContent).toMatch(
      /Spencer/,
    );
  });
});
