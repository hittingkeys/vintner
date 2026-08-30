import { render, screen } from "@testing-library/react";
import { OccupiedPawExplorable } from "./OccupiedPawExplorable";

describe("OccupiedPawExplorable", () => {
  it("shows both blocks and occupied-TAW state on the canvas (A1)", () => {
    render(<OccupiedPawExplorable />);
    expect(screen.getAllByText(/jory/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/willakenzie/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/occupied TAW 25 cm/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/occupied TAW 15 cm/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/25–41 cm/i)).toBeInTheDocument();
    expect(screen.getByText(/shared demand/i)).toBeInTheDocument();
  });

  it("has no run or calculate button (A2)", () => {
    render(<OccupiedPawExplorable />);
    expect(screen.queryByRole("button", { name: /^run$/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /calculate/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^play$/i })).not.toBeInTheDocument();
  });

  it("exposes rooting depth and demand as sliders on the objects (A4)", () => {
    render(<OccupiedPawExplorable />);
    expect(
      screen.getByLabelText(/jory occupied rooting depth/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/willakenzie occupied rooting depth/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/seasonal demand on both blocks/i),
    ).toBeInTheDocument();
  });
});
