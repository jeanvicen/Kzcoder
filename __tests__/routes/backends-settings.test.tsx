import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BackendsSettingsScreen } from "#/routes/backends-settings";

vi.mock("#/components/features/backends/manage-backends-modal", async () => {
  const React = await import("react");

  return {
    ManageBackendsModal: ({ onClose }: { onClose: () => void }) =>
      React.createElement(
        "div",
        { "data-testid": "manage-backends-modal" },
        React.createElement(
          "button",
          { type: "button", onClick: onClose },
          "Close manager",
        ),
      ),
  };
});

describe("BackendsSettingsScreen", () => {
  it("opens the existing backend manager from Settings", async () => {
    const user = userEvent.setup();

    render(<BackendsSettingsScreen />);

    const manageButton = screen.getByTestId(
      "manage-backends-settings-button",
    );
    expect(manageButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByTestId("manage-backends-modal"),
    ).not.toBeInTheDocument();

    await user.click(manageButton);

    expect(
      await screen.findByTestId("manage-backends-modal"),
    ).toBeInTheDocument();
    expect(manageButton).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Close manager" }));

    expect(
      screen.queryByTestId("manage-backends-modal"),
    ).not.toBeInTheDocument();
    expect(manageButton).toHaveAttribute("aria-expanded", "false");
  });
});
