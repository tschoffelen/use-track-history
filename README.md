# use-track-history

[![NPM Version](https://img.shields.io/npm/v/use-track-history.svg)](https://www.npmjs.com/package/use-track-history)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/use-track-history)](https://bundlephobia.com/package/use-track-history)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight React hook for state history tracking with undo/redo capabilities.

- 🪶 **Lightweight**: < 1KB minzipped, zero dependencies
- 🧠 **Type-safe**: Written in TypeScript with full type support
- 🧩 **Flexible**: Works with any data type (strings, objects, arrays)
- ⚡ **Optimized**: Uses React's built-in performance optimization hooks

## Installation

```bash
npm install use-track-history # or: yarn add use-track-history
```

## Quick Start

```tsx
import { useTrackHistory } from "use-track-history";

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
```

## API Reference

### `useTrackHistory(defaultValue?, options?)`

Creates a history-tracked state.

#### Parameters

| Parameter      | Description                       |
| -------------- | --------------------------------- |
| `defaultValue` | Initial value to store in history |
| `options`      | Optional configuration object     |

#### Options

| Option           | Type   | Description                                                                           |
| ---------------- | ------ | ------------------------------------------------------------------------------------- |
| `maxHistorySize` | number | Maximum number of history entries to keep. When exceeded, oldest entries are removed. |

#### Return Object

| Property  | Description                                       |
| --------- | ------------------------------------------------- |
| `value`   | Current value in the history                      |
| `update`  | Updates the value and adds it to history          |
| `reset`   | Clears history and sets a new initial value       |
| `history` | Contains history control functions and properties |

#### `History` Object

| Property  | Type     | Description                     |
| --------- | -------- | ------------------------------- |
| `undo`    | function | Move back to previous state     |
| `redo`    | function | Move forward to next state      |
| `canUndo` | boolean  | Check if undo is available      |
| `canRedo` | boolean  | Check if redo is available      |
| `length`  | number   | Total number of history entries |

## Common patterns

### Using typed state

In Typescript, we can type our history object:

```tsx
import { useTrackHistory } from "use-track-history";

type Profile = {
  name: string;
  age: number;
};

function MyComponent() {
  const { value, update, history } = useTrackHistory<Profile>({
    name: "Bob",
    age: 32,
  });

  // ...
}
```

### Adding keyboard shortcuts

You can use the excellent [`react-hotkeys-hook`](https://www.npmjs.com/package/react-hotkeys-hook) library
to add <kbd>Cmd+Z</kbd> and <kbd>Cmd+Shift+Z</kbd> keyboard shortcuts:

```tsx
import { useTrackHistory } from "use-track-history";

function MyComponent() {
  const { value, update, history } = useTrackHistory("initial value");

  useHotkeys("mod+z", history.undo, {
    enabled: history.canUndo,
    preventDefault: true,
  });

  useHotkeys("mod+shift+z", history.redo, {
    // or ctrl+y on Windows
    enabled: history.canRedo,
    preventDefault: true,
  });

  // ...
}
```

### Maximum history size

To limit memory usage, you might want to limit the history size:

```tsx
import { useTrackHistory } from "use-track-history";

function MyComponent() {
  const { value, update, reset, history } = useTrackHistory("", {
    maxHistorySize: 30,
  });

  // ...
}
```


<br /><br />

---

<div align="center">
	<b>
		<a href="https://includable.com/consultancy?utm_source=use-track-history">Get professional support for this package →</a>
	</b>
	<br>
	<sub>
		Custom consulting sessions available for implementation support or feature development.
	</sub>
</div>