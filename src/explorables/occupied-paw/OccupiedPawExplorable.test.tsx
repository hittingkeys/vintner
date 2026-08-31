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
    expect(screen.getAllByText(/0\.0 in \(0 cm\)/).length).toBeGreaterThan(0);
    expect(document.querySelector(".legend")).toBeNull();
    expect(document.querySelector(".jory-on-line")?.textContent).toMatch(/Jory/);
    expect(document.querySelector(".will-on-line")?.textContent).toMatch(
      /Willakenzie/,
    );
    expect(document.querySelector(".drip-on-line")?.textContent).toMatch(
      /drip floor/,
    );
    expect(screen.getByText(/SoilWeb SSURGO PAWS/)).toBeInTheDocument();
    expect(screen.getByText(/USW00094273/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /young preset/i })).toBeNull();
    expect(screen.getAllByRole("button", { name: /Young, 16 inches/i }).length).toBe(
      2,
    );
    expect(screen.getAllByText(/60 in Established/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/32 in Cr Established/).length).toBeGreaterThan(0);
    for (const el of document.querySelectorAll(".age-stop")) {
      expect(Number(el.getAttribute("x"))).toBeLessThan(108);
    }
    expect(screen.getByText(/Levin 11\.4 vs 20\.2 \(not NVW\)/)).toBeInTheDocument();
    expect(screen.getByText(/AgriMet ARAO\/FOGO/)).toBeInTheDocument();
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
    expect(screen.getAllByRole("button", { name: /deficit drip/i }).length).toBe(
      2,
    );
    expect(document.querySelectorAll(".age-ghost")).toHaveLength(2);
  });
});
