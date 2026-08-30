import { fireEvent, render, screen } from "@testing-library/react";
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
    expect(
      screen.getByLabelText(/depth in all three pits/i),
    ).toBeInTheDocument();
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
});
