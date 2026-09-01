import { fireEvent, render, screen } from "@testing-library/react";
import { TwoHundredKExplorable } from "./TwoHundredKExplorable";
import { formatUsd } from "./format";
import { YEAR1_CASH_USD_PER_ACRE } from "./constants";

describe("TwoHundredKExplorable", () => {
  it("shows three doors and remaining cash on the canvas (A1, F5)", () => {
    render(<TwoHundredKExplorable />);
    expect(screen.getByText(/^Land \+ plant$/)).toBeInTheDocument();
    expect(screen.getByText(/^Grapes \+ custom crush$/)).toBeInTheDocument();
    expect(screen.getByText(/^Labor \/ get hired$/)).toBeInTheDocument();
    expect(screen.getByTestId("land-remaining")).toHaveTextContent("$200,000 remaining");
    expect(screen.getByTestId("grapes-remaining")).toHaveTextContent("$200,000 remaining");
    expect(screen.getByTestId("labor-remaining")).toHaveTextContent("$200,000 remaining");
    expect(screen.getByTestId("acres-owned")).toHaveTextContent("0 ac owned");
    expect(screen.getByTestId("acres-planted")).toHaveTextContent("0 ac planted");
    expect(screen.getByTestId("tons-bought")).toHaveTextContent("0 t bought");
    expect(screen.getByTestId("labor-acres")).toHaveTextContent("0 ac owned");
    expect(screen.getAllByText(/0 brand/).length).toBeGreaterThan(0);
  });

  it("has no run or calculate button (A2)", () => {
    render(<TwoHundredKExplorable />);
    expect(screen.queryByRole("button", { name: /^run$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /calculate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^play$/i })).not.toBeInTheDocument();
  });

  it("exposes land, plant, and tons on the stacks (A4)", () => {
    render(<TwoHundredKExplorable />);
    expect(screen.getByRole("slider", { name: /acres of land to buy/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /acres to plant/i })).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: /tons of north willamette pinot noir/i }),
    ).toBeInTheDocument();
  });

  it("labels unit costs on the land stack and sources on the graphic (F8, F9, F11)", () => {
    render(<TwoHundredKExplorable />);
    expect(screen.getAllByText(/\$26,587\/acre year-1 plant/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$45,000\/acre land/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/OSU AEB 0086 \(Dec 2025\)/).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/OWB\/UO 2025 grape prices, North Willamette Pinot noir avg/)
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/OLCC winery \$500, fee schedule Rev 1\.01\.24/).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/crush fee unpublished/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/labor is 42% of AEB 0086/).length).toBeGreaterThan(0);
    expect(document.querySelector(".legend")).toBeNull();
    expect(formatUsd(YEAR1_CASH_USD_PER_ACRE)).toBe("$26,587");
  });

  it("KA1: 4 acres land leaves $20,000 and closes year-1 plant", () => {
    render(<TwoHundredKExplorable />);
    fireEvent.change(screen.getByRole("slider", { name: /acres of land to buy/i }), {
      target: { value: "4" },
    });
    expect(screen.getByTestId("land-remaining")).toHaveTextContent("$20,000 remaining");
    expect(screen.getByTestId("acres-owned")).toHaveTextContent("4 ac owned");
    expect(screen.getByTestId("acres-planted")).toHaveTextContent("0 ac planted");
    expect(screen.getByText(/year-1 plant not possible/)).toBeInTheDocument();
    expect(screen.getByText(/year-3 yield 0 t/)).toBeInTheDocument();
    expect(screen.queryByText(/0\.000/)).not.toBeInTheDocument();
    expect(document.querySelector("[data-testid='ghost-remaining']")).toBeTruthy();
  });

  it("refuses a 5th acre and keeps remaining finite", () => {
    render(<TwoHundredKExplorable />);
    fireEvent.change(screen.getByRole("slider", { name: /acres of land to buy/i }), {
      target: { value: "5" },
    });
    expect(screen.getByTestId("acres-owned")).toHaveTextContent("4 ac owned");
    expect(screen.getByTestId("land-remaining")).toHaveTextContent("$20,000 remaining");
    expect(screen.getByTestId("land-remaining").textContent).not.toMatch(/NaN/);
  });

  it("KA3: 80 tons plus license leaves $220; 81 tons clips to 80", () => {
    render(<TwoHundredKExplorable />);
    const tons = screen.getByRole("slider", {
      name: /tons of north willamette pinot noir/i,
    });
    fireEvent.change(tons, { target: { value: "80" } });
    expect(screen.getByTestId("grapes-remaining")).toHaveTextContent("$220 remaining");
    expect(screen.getByTestId("tons-bought")).toHaveTextContent("80 t bought");
    expect(screen.getByTestId("license-fee")).toHaveTextContent(/OLCC winery \$500/);
    fireEvent.change(tons, { target: { value: "81" } });
    expect(screen.getByTestId("tons-bought")).toHaveTextContent("80 t bought");
    expect(screen.getByTestId("grapes-remaining")).toHaveTextContent("$220 remaining");
  });

  it("does not ship crush $/ton, cases, Winkler, Carto, or planted Dundee comps", () => {
    render(<TwoHundredKExplorable />);
    expect(screen.queryByText(/\$800/)).not.toBeInTheDocument();
    expect(screen.queryByText(/cases/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/winkler/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/carto/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/dundee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/van duzer/i)).not.toBeInTheDocument();
  });
});
