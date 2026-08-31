import { render, screen } from "@testing-library/react";
import Stub from "../content/_scaffold.mdx";
import App from "./App";

describe("app shell", () => {
  afterEach(() => {
    window.location.hash = "";
  });

  it("boots on the Willamette soils landing lesson", () => {
    window.location.hash = "";
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /vintner explorables/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/three pits, not three wine styles/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/^jory$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^laurelwood$/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /occupied root zone/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /same hill/i })).toBeInTheDocument();
  });

  it("compiles MDX from content/", () => {
    render(<Stub />);
    expect(screen.getByText(/scaffold stub/i)).toBeInTheDocument();
  });

  it("still serves occupied-root-zone at #/occupied-root-zone", () => {
    window.location.hash = "#/occupied-root-zone";
    render(<App />);
    expect(
      screen.getAllByText(/occupied water, not a dry-farm style/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /willamette soils/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /same hill/i })).toBeInTheDocument();
  });

  it("serves same-hill at #/same-hill and keeps soils as the default landing", () => {
    window.location.hash = "#/same-hill";
    render(<App />);
    expect(
      screen.getAllByText(/same hill, two geometries/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByTestId("facing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /willamette soils/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /occupied root zone/i })).toBeInTheDocument();
  });
});
