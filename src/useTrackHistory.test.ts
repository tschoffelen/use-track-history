import { renderHook, act } from "@testing-library/react";
import { useTrackHistory } from "./useTrackHistory";

describe("useTrackHistory", () => {
  // Test initial state
  it("should initialize with the default value", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    expect(result.current.value).toBe("initial text");
    expect(result.current.history.length).toBe(1);
    expect(result.current.history.canUndo()).toBe(false);
    expect(result.current.history.canRedo()).toBe(false);
  });

  it("should handle undefined default value", () => {
    const { result } = renderHook(() => useTrackHistory<string>());

    expect(result.current.value).toBeUndefined();
    expect(result.current.history.length).toBe(1);
  });

  // Test update functionality
  it("should update the value and add to history when update is called", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("updated text");
    });

    expect(result.current.value).toBe("updated text");
    expect(result.current.history.length).toBe(2);
    expect(result.current.history.canUndo()).toBe(true);
    expect(result.current.history.canRedo()).toBe(false);
  });

  it("should handle multiple updates", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("update 1");
    });

    act(() => {
      result.current.update("update 2");
    });

    act(() => {
      result.current.update("update 3");
    });

    

    expect(result.current.value).toBe("update 3");
    expect(result.current.history.length).toBe(4); // initial + 3 updates
    expect(result.current.history.canUndo()).toBe(true);
    expect(result.current.history.canRedo()).toBe(false);
  });

  // Test undo functionality
  it("should revert to previous state when undo is called", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("updated text");
    });

    act(() => {
      result.current.history.undo();
    });

    expect(result.current.value).toBe("initial text");
    expect(result.current.history.canUndo()).toBe(false);
    expect(result.current.history.canRedo()).toBe(true);
  });

  it("should handle multiple undo operations (single transaction)", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("update 1");
      result.current.update("update 2");
      result.current.update("update 3");
    });

    act(() => {
      result.current.history.undo();
      result.current.history.undo();
    });

    expect(result.current.value).toBe("update 1");
    expect(result.current.history.canUndo()).toBe(true); // Can still undo to initial
    expect(result.current.history.canRedo()).toBe(true); // Can redo to update 2 and 3
  });
  it("should handle multiple undo operations (separate transactions)", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("update 1");
    });
    act(() => {
      result.current.update("update 2");
    });
    act(() => {
      result.current.update("update 3");
    });

    act(() => {
      result.current.history.undo();
    });
    act(() => {
      result.current.history.undo();
    });

    expect(result.current.value).toBe("update 1");
    expect(result.current.history.canUndo()).toBe(true); // Can still undo to initial
    expect(result.current.history.canRedo()).toBe(true); // Can redo to update 2 and 3
  });

  it("should not go past the beginning of history when undoing", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("updated text");
      result.current.history.undo();
      // Try to undo again when already at beginning
      result.current.history.undo();
    });

    expect(result.current.value).toBe("initial text");
    expect(result.current.history.canUndo()).toBe(false);
  });

  // Test redo functionality
  it("should advance to next state when redo is called", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("updated text");
      result.current.history.undo();
    });

    act(() => {
      result.current.history.redo();
    });

    expect(result.current.value).toBe("updated text");
    expect(result.current.history.canUndo()).toBe(true);
    expect(result.current.history.canRedo()).toBe(false);
  });

  it("should handle multiple redo operations", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    // Add entries and undo multiple times
    act(() => {
      result.current.update("update 1");
      result.current.update("update 2");
      result.current.update("update 3");
      result.current.history.undo();
      result.current.history.undo();
      result.current.history.undo();
    });

    // Now we're back at initial text, redo multiple times
    act(() => {
      result.current.history.redo();
      result.current.history.redo();
    });

    expect(result.current.value).toBe("update 2");
    expect(result.current.history.canUndo()).toBe(true);
    expect(result.current.history.canRedo()).toBe(true);
  });

  it("should not go past the end of history when redoing", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("updated text");
      result.current.history.undo();
      result.current.history.redo();
      // Try to redo again when already at end
      result.current.history.redo();
    });

    expect(result.current.value).toBe("updated text");
    expect(result.current.history.canRedo()).toBe(false);
  });

  // Test reset functionality
  it("should clear history and set new value when reset is called", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("update 1");
      result.current.update("update 2");
    });

    act(() => {
      result.current.reset("fresh start");
    });

    expect(result.current.value).toBe("fresh start");
    expect(result.current.history.length).toBe(1);
    expect(result.current.history.canUndo()).toBe(false);
    expect(result.current.history.canRedo()).toBe(false);
  });

  it("should handle reset without a new value", () => {
    const { result } = renderHook(() => useTrackHistory("initial text"));

    act(() => {
      result.current.update("update 1");
      result.current.reset();
    });

    expect(result.current.value).toBeUndefined();
    expect(result.current.history.length).toBe(1);
  });

  // Test branching history
  it("should truncate future history when updating after undo", () => {
    const { result } = renderHook(() => useTrackHistory("initial"));

    // Create a linear history: initial -> A -> B -> C
    act(() => {
      result.current.update("A");
      result.current.update("B");
      result.current.update("C");
    });

    // Go back to A
    act(() => {
      result.current.history.undo();
      result.current.history.undo();
    });

    expect(result.current.value).toBe("A");

    // Now branch by adding D after A (should remove B and C)
    act(() => {
      result.current.update("D");
    });

    // New history should be: initial -> A -> D
    expect(result.current.value).toBe("D");
    expect(result.current.history.length).toBe(3);

    // Go back to verify the branch
    act(() => {
      result.current.history.undo();
    });

    expect(result.current.value).toBe("A");

    // Go back once more
    act(() => {
      result.current.history.undo();
    });

    expect(result.current.value).toBe("initial");

    // Go forward twice to reach the end (D)
    act(() => {
      result.current.history.redo();
      result.current.history.redo();
    });

    expect(result.current.value).toBe("D");
    expect(result.current.history.canRedo()).toBe(false); // C should be gone
  });

  // Test with complex data types
  it("should work with objects", () => {
    const initialObject = { name: "John", age: 30 };
    const { result } = renderHook(() => useTrackHistory(initialObject));

    act(() => {
      result.current.update({ ...initialObject, age: 31 });
    });

    expect(result.current.value).toEqual({ name: "John", age: 31 });

    act(() => {
      result.current.history.undo();
    });

    expect(result.current.value).toEqual(initialObject);
  });

  it("should work with arrays", () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() => useTrackHistory(initialArray));

    act(() => {
      result.current.update([...initialArray, 4]);
    });

    expect(result.current.value).toEqual([1, 2, 3, 4]);

    act(() => {
      result.current.history.undo();
    });

    expect(result.current.value).toEqual(initialArray);
  });

  // Test maxHistorySize option
  describe("options.maxHistorySize", () => {
    it("should limit history size to maxHistorySize", () => {
      const { result } = renderHook(() =>
        useTrackHistory("initial", { maxHistorySize: 3 })
      );

      // Add more states than the maxHistorySize
      act(() => {
        result.current.update("state 1");
        result.current.update("state 2");
        result.current.update("state 3");
      });

      // Should have dropped 'initial' and kept only the most recent 3 items
      expect(result.current.history.length).toBe(3);
      expect(result.current.value).toBe("state 3");

      // First state in history should now be 'state 1'
      act(() => {
        result.current.history.undo();
        result.current.history.undo();
      });

      expect(result.current.value).toBe("state 1");
      expect(result.current.history.canUndo()).toBe(false); // Can't go back to 'initial' anymore
    });

    it("should adjust history pointer when trimming history", () => {
      const { result } = renderHook(() =>
        useTrackHistory("initial", { maxHistorySize: 3 })
      );

      // Create a history: initial -> A -> B
      act(() => {
        result.current.update("A");
        result.current.update("B");
      });

      // Go back to A
      act(() => {
        result.current.history.undo();
      });

      expect(result.current.value).toBe("A");

      // Add two more items (should trim 'initial' from the start)
      act(() => {
        result.current.update("C"); // Now have: A -> C
        result.current.update("D"); // Now have: A -> C -> D
      });

      expect(result.current.history.length).toBe(3);
      expect(result.current.value).toBe("D");

      // Go back twice
      act(() => {
        result.current.history.undo();
        result.current.history.undo();
      });

      // Should be at A, and can't go back further
      expect(result.current.value).toBe("A");
      expect(result.current.history.canUndo()).toBe(false);
    });

    it("should update normally when under maxHistorySize", () => {
      const { result } = renderHook(() =>
        useTrackHistory("initial", { maxHistorySize: 5 })
      );

      // Add states but stay under maxHistorySize
      act(() => {
        result.current.update("state 1");
        result.current.update("state 2");
      });

      expect(result.current.history.length).toBe(3); // initial + 2 updates
      expect(result.current.value).toBe("state 2");

      // Should be able to go back to initial
      act(() => {
        result.current.history.undo();
        result.current.history.undo();
      });

      expect(result.current.value).toBe("initial");
      expect(result.current.history.canUndo()).toBe(false);
    });
  });
});
