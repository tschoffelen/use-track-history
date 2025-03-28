import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { useTrackHistory } from "./index";

// Example component from README
function TextEditor() {
  const { value, update, reset, history } = useTrackHistory("Initial text");

  return (
    <div>
      <textarea value={value} onChange={(e) => update(e.target.value)} />

      <div className="toolbar">
        <button onClick={history.undo} disabled={!history.canUndo}>
          Undo
        </button>

        <button onClick={history.redo} disabled={!history.canRedo}>
          Redo
        </button>

        <button onClick={() => reset("Initial text")}>Reset</button>
      </div>
    </div>
  );
}

describe("TextEditor Example", () => {
  it("renders with initial text", () => {
    render(<TextEditor />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Initial text");
  });

  it("updates text when typing", () => {
    render(<TextEditor />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Updated text" } });

    expect(textarea).toHaveValue("Updated text");
  });

  it("handles undo/redo operations", () => {
    render(<TextEditor />);

    const textarea = screen.getByRole("textbox");
    const undoButton = screen.getByText("Undo");
    const redoButton = screen.getByText("Redo");

    // Initially undo/redo buttons should be disabled
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();

    // Make changes
    fireEvent.change(textarea, { target: { value: "First update" } });
    fireEvent.change(textarea, { target: { value: "Second update" } });

    // Undo should be enabled, redo disabled
    expect(undoButton).not.toBeDisabled();
    expect(redoButton).toBeDisabled();

    // Test undo
    fireEvent.click(undoButton);
    expect(textarea).toHaveValue("First update");

    // Now both should be enabled
    expect(undoButton).not.toBeDisabled();
    expect(redoButton).not.toBeDisabled();

    // Test redo
    fireEvent.click(redoButton);
    expect(textarea).toHaveValue("Second update");

    // Back to initial state after redo (undo enabled, redo disabled)
    expect(undoButton).not.toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it("resets to initial state", () => {
    render(<TextEditor />);

    const textarea = screen.getByRole("textbox");
    const resetButton = screen.getByText("Reset");

    // Make changes
    fireEvent.change(textarea, { target: { value: "Changed text" } });
    expect(textarea).toHaveValue("Changed text");

    // Reset
    fireEvent.click(resetButton);
    expect(textarea).toHaveValue("Initial text");

    // After reset, undo/redo should be disabled
    const undoButton = screen.getByText("Undo");
    const redoButton = screen.getByText("Redo");
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });
});
