# AI Dashboard Builder

> <span style="font-size:1.05em;"><strong>Why low-code when you have the best coder in the world?</strong></span>  
> <sub><em>Stop dragging. Start shipping.</em></sub>

---

## The Problem with “Low-Code”

PowerBI, Tableau, Looker — they all promise **“anyone can build dashboards.”**  
But anyone who’s actually used them knows the truth: you spend more time **fighting the tool** than building the thing.

- **Custom tooltips?** <span style="color:#d73a49;"><strong>Workaround.</strong></span>  
- **Conditional formatting with real logic?** <span style="color:#d73a49;"><strong>Workaround.</strong></span>  
- **A chart that doesn’t exist in the preset menu?** <span style="color:#d73a49;"><strong>Sorry, not possible.</strong></span>

---

## The Shift: AI Writes Real Code

Meanwhile, AI models have gotten *really* good at writing **TypeScript**.

They can:

- Generate **Recharts** components  
- Wire up **data transformations**  
- Produce **pixel-perfect layouts**  
- All from a **plain English prompt**

So why are we still dragging and dropping?

---

## 🧠 What Makes This Different

> **AI Dashboard Builder** flips the model.  
> Instead of hiding code behind a GUI, it embraces it.

✅ **Every widget is a React component**  
✅ **Every chart is real TypeScript you can read, edit, and extend**  
✅ The AI doesn’t fight a low-code abstraction — it writes **actual code** into a **live canvas**  
✅ When the AI gets it **90% right**, you tweak the last **10%** yourself — in the *same* code editor, with full control

> <span style="color:#0969da;"><strong>The result:</strong></span> dashboards that do exactly what you want, built in **minutes** instead of **hours**.

---

## How It Works

1. **Describe what you want** — The AI generates widgets, binds data, and arranges the layout  
2. **See it live** — Every change renders instantly on a drag-and-drop grid canvas  
3. **Fine-tune anything** — Toggle <span style="color:#8250df;"><strong>Developer Mode</strong></span> to edit the actual rendering code of any widget  
4. **Export & share** — Save as JSON, open in the read-only viewer, or keep iterating

---

## Quick Start

```bash
cd dashbaord_builder
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## Architecture

```
User Prompt → AI Service → Tool Calls → Zustand Store (DashboardSpec) → React Components
                                              ↕                              ↕
                                        LocalStorage                   Data Provider
                                              ↕
                                        Undo/Redo (Zundo)
```

Everything is driven by a single `DashboardSpec` JSON object. The AI manipulates it through structured tool calls (`add_widget`, `update_widget_config`, `set_data_binding`, etc.). The same spec powers the visual builder, the code editor, and the viewer.

### Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 19 + TypeScript |
| State | Zustand + Immer + Zundo (undo/redo) |
| Layout | React Grid Layout (drag & drop) |
| Charts | Recharts (bar, line, area, pie, donut, stacked-bar, scatter) |
| Styling | Tailwind CSS 4 (Neural Light design system) |
| Validation | Zod 4 |
| Routing | React Router |
| Data | TanStack Query + pluggable DataProvider interface |

### Project Structure

```
src/
├── ai/              # AI service interface, tool definitions, tool executor
├── components/
│   ├── builder/     # Builder UI (toolbar, palette, canvas, inspector)
│   ├── viewer/      # Read-only dashboard viewer
│   └── widgets/     # Widget components (KPI, Chart, Table, Text, Container, Filter)
├── lib/             # Code generation & runtime compilation
├── providers/       # Data provider abstraction (swap in any API)
├── registry/        # Widget registry (plugin system)
├── schemas/         # Zod schemas for dashboard spec & widget configs
└── store/           # Zustand stores, persistence, custom hooks
```

---

## Implementation Roadmap

### Phase 1: Builder Foundation (In Progress)

Build the core dashboard editor with all the interfaces the AI will need.

- [x] Spec-driven architecture — single `DashboardSpec` JSON drives everything
- [x] Widget registry with plugin pattern (KPI, Chart, Table, Text, Container, Filter)
- [x] Drag-and-drop grid canvas with React Grid Layout
- [x] Visual inspector panel — auto-generates config forms from Zod schemas
- [x] Data provider abstraction with pluggable interface
- [x] Developer Mode — full code editor per widget, custom code persistence
- [x] Undo/redo, save/load, JSON export/import
- [x] Page settings (scrollable, portrait-fixed, landscape-fixed modes)
- [x] Filter widget with cross-widget data filtering
- [x] Container widget (nested grid of sub-widgets)
- [x] Collapsible palette, closeable inspector, zoom slider
- [x] AI tool interface defined (`tools.ts`) with Zod-validated tool schemas
- [ ] Continuing improvements

### Phase 2: LLM Integration (Next)

Wire up a real AI service to drive the builder through the tool interface.

- [ ] Implement `AiService` adapter for Claude API (replace `MockAiService`)
- [ ] System prompt engineering — teach the model the tool schemas, widget types, and dashboard spec format
- [ ] Streaming tool execution — show tool calls executing in real-time in the AI modal
- [ ] Multi-turn conversation — let the AI see the current spec and iterate on it
- [ ] Prompt templates for common patterns ("sales dashboard", "KPI overview", "comparison report")

### Phase 3: Code-First AI Editing

Let the AI write and modify widget rendering code directly.

- [ ] AI-powered code editing — "make this chart show percentages" modifies the widget's TypeScript
- [ ] Code suggestions — AI proposes code changes in a diff view
- [ ] Smart code generation — AI generates optimized Recharts/React code, not just config JSON
- [ ] Code validation & sandboxing — safely compile and preview AI-generated code before applying
- [ ] Version history per widget — track AI edits vs. manual edits

### Phase 4: Data & Deployment

Connect to real data sources and make dashboards shareable.

- [ ] REST/GraphQL data provider — plug in any API endpoint
- [ ] SQL data provider — direct database queries
- [ ] Real-time data with WebSocket subscriptions
- [ ] Dashboard sharing via URL (static export or hosted viewer)
- [ ] Collaborative editing (multi-user)
- [ ] Scheduled data refresh & alerts

---

## AI Tool Interface

The AI operates through structured tool calls, validated by Zod schemas:

| Tool | What it does |
|------|-------------|
| `add_widget` | Add a widget with type, config, position, and data binding |
| `remove_widget` | Remove a widget by ID |
| `update_widget_config` | Update any widget's configuration |
| `update_layout` | Move or resize widgets on the grid |
| `set_data_binding` | Bind a widget to a dataset |
| `add_filter_widget` | Add an interactive filter |
| `list_datasets` | Discover available data sources |
| `get_dashboard_spec` | Read the full dashboard state |

See [docs/README.md](docs/README.md) for the complete technical reference, widget system docs, and data provider guide.

---

## Developer Mode

Toggle Dev Mode in the toolbar to unlock per-widget code editing:

- Click the `</>` icon on any widget card to open its full TypeScript source
- Edit Recharts components, add custom logic, change styles — anything goes
- **Apply** saves the code; **Reset** returns to config-driven rendering
- Custom code persists in the dashboard JSON and survives export/import

Available in scope: React hooks, all Recharts components, Lucide icons.

---

## License

MIT
