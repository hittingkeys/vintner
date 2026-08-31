import { fireEvent, render, screen } from "@testing-library/react";
import { SameHillExplorable } from "./SameHillExplorable";
import { PENNER_ASH_FROST_HOURS_PCT } from "./constants";

describe("SameHillExplorable", () => {
  it("shows facing, slope band, solar class, and frost class on the canvas (A1)", () => {
    render(<SameHillExplorable />);
    expect(screen.getByTestId("facing")).toBeInTheDocument();
    expect(screen.getByTestId("slope-band")).toHaveTextContent("5–15%");
    expect(screen.getByTestId("solar-class")).toHaveTextContent(/highest/i);
    expect(screen.getByTestId("frost-class")).toHaveTextContent(/drained/i);
    expect(screen.getByText(/sun-rank ring/i)).toBeInTheDocument();
    expect(screen.getByText(/cold air pools/i)).toBeInTheDocument();
  });

  it("has no run or calculate button (A2)", () => {
    render(<SameHillExplorable />);
    expect(screen.queryByRole("button", { name: /^run$/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /calculate/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^play$/i })).not.toBeInTheDocument();
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
    expect(screen.getByText(new RegExp(`${PENNER_ASH_FROST_HOURS_PCT}% of frost hours`))).toBeInTheDocument();
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

  it("flat apron is the <1% slope band", () => {
    render(<SameHillExplorable />);
    fireEvent.change(screen.getByLabelText(/distance from ridge/i), {
      target: { value: "110" },
    });
    expect(screen.getByTestId("slope-band")).toHaveTextContent("<1%");
  });

  it("10° south caption is vs a flat site, not vs north", () => {
    render(<SameHillExplorable />);
    fireEvent.change(screen.getByLabelText(/distance from ridge/i), {
      target: { value: "56" },
    });
    fireEvent.change(screen.getByLabelText(/bearing from north/i), {
      target: { value: "180" },
    });
    const captions = document.querySelector(".same-hill-captions");
    expect(captions?.textContent).toMatch(/25% more insolation/i);
    expect(captions?.textContent).toMatch(/flat site/i);
    expect(captions?.textContent).toMatch(/not south versus north/i);
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

  it("keeps Jones ranking uncertainty on the canvas", () => {
    render(<SameHillExplorable />);
    expect(screen.getByText(/Umpqua\/Rogue GIS/i)).toBeInTheDocument();
    expect(screen.getByText(/northern WV loggers/i)).toBeInTheDocument();
  });
});
