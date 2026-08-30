import { render, screen } from "@testing-library/react";
import Stub from "../content/_scaffold.mdx";
import App from "./App";

describe("app shell", () => {
  it("boots", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /vintner explorables/i }),
    ).toBeInTheDocument();
  });

  it("compiles MDX from content/", () => {
    render(<Stub />);
    expect(screen.getByText(/scaffold stub/i)).toBeInTheDocument();
  });

  it("renders the occupied-root-zone lesson", () => {
    render(<App />);
    expect(
      screen.getAllByText(/occupied water, not a dry-farm style/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/willakenzie/i).length).toBeGreaterThan(0);
  });
});
