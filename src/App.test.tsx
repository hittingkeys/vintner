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
});
