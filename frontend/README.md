# VectorShift — Frontend Technical Assessment

A drag-and-drop pipeline builder built with React, ReactFlow, and FastAPI. Users can compose AI workflows by connecting nodes visually, then submit the pipeline for structural analysis.

---

## Live Demo

> Run locally — instructions below.

---

## What Was Built

### Part 1 — Node Abstraction System

Replaced 4 copy-pasted node files with a **config-driven architecture**. Every node is now a plain JavaScript object — no new component, no new state logic.

**Adding a new node = 1 config object (~15 lines)**

```
nodes/
├── BaseNode.jsx       — single renderer for all node types
├── useNodeFields.js   — state management hook
├── nodeConfigs.js     — all node definitions (data, no JSX)
├── index.js           — factory + exports
└── nodes.css          — unified styles across all nodes
```

9 total nodes: Input, LLM, Output, Text, HTTP Request, Code, Conditional, Note, Transform.

---

### Part 2 — Styling

Unified design system applied across all nodes via a single stylesheet. One CSS change affects every node type simultaneously. Key design decisions:

- Clean card layout with subtle shadow and border
- Consistent field typography (label → input pattern)
- Purple accent color for selected state and handles
- Custom select dropdown, toggle switch, auto-growing textarea

---

### Part 3 — Dynamic Text Node

Two behaviors implemented on the Text node:

**Auto-resize** — width grows up to 480px based on the longest line (measured via Canvas `measureText`), then height grows freely as text wraps. Prevents single-line expansion while keeping content readable.

**`{{variable}}` → Handle** — typing `{{varName}}` in the textarea dynamically creates a target handle on the left side of the node. Any valid JavaScript identifier works. Multiple variables create multiple handles. Duplicates are deduplicated.

The architecture challenge here was a **ReactFlow timing problem** — dynamic handles need to be registered in ReactFlow's internal registry before an edge can connect to them. Solved by:

1. Persisting extracted variables to the **Zustand store** (`node.data.variables`) on every keystroke
2. Reading `varHandles` from store data, not local component state
3. Calling `updateNodeInternals(id)` inside a `useEffect` that fires after React commits the new handles to the DOM

This matches how production workflow builders (n8n, Flowise) handle runtime-generated handles.

---

### Part 4 — Backend Integration

**Frontend (`submit.js`)** reads nodes and edges from the Zustand store and POSTs them to the FastAPI backend on Submit click. Displays a formatted alert with the result.

**Backend (`main.py`)** exposes a `POST /pipelines/parse` endpoint that:
- Counts nodes and edges
- Checks whether the pipeline forms a **Directed Acyclic Graph (DAG)** using **Kahn's algorithm** (topological sort via in-degree). If every node is visited during traversal, no cycle exists.
- Returns `{ num_nodes, num_edges, is_dag }`

CORS middleware configured for local development.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Pipeline Canvas | ReactFlow |
| State Management | Zustand |
| Backend | FastAPI (Python) |
| DAG Detection | Kahn's Algorithm |

---

## Running Locally

**Frontend**
```bash
cd frontend
npm install
npm start
```

**Backend**
```bash
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:8000`.

---

## Key Engineering Decisions

**Why config-driven nodes instead of component inheritance?**
Inheritance or copy-paste scales poorly — every style change requires touching N files. A config object separates *what a node is* from *how it renders*. The renderer (`BaseNode`) is written once; node authors only write data.

**Why Zustand for dynamic handle state instead of local React state?**
ReactFlow validates edge connections against handles that exist in the DOM synchronously. Local `useState` creates a timing gap — the handle exists in React's virtual DOM but hasn't been committed yet when the edge validation runs. Persisting to the Zustand store + calling `updateNodeInternals(id)` in a `useEffect` ensures handles are registered before any connection attempt.

**Why Kahn's algorithm for DAG detection?**
DFS-based cycle detection requires recursion and visited/recursion-stack tracking. Kahn's algorithm is iterative, easier to reason about, and naturally handles disconnected graphs — if `visited_count < total_nodes` after traversal, a cycle exists somewhere.

---

## Project Structure

```
frontend_technical_assessment/
├── frontend/
│   └── src/
│       ├── nodes/
│       │   ├── BaseNode.jsx
│       │   ├── useNodeFields.js
│       │   ├── nodeConfigs.js
│       │   ├── index.js
│       │   └── nodes.css
│       ├── App.js
│       ├── store.js
│       ├── submit.js
│       ├── toolbar.js
│       └── ui.js
└── backend/
    └── main.py
```