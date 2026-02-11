# Dashboard Builder Documentation

## 1. Architecture Overview

Dashboard Builder is a spec-driven, client-side dashboard creation tool built with React, TypeScript, and Zustand.

### Data Flow

```
User Action → Zustand Store (DashboardSpec) → React Components → Rendered Widgets
                    ↕                                ↕
             LocalStorage                     Data Provider (queries)
                    ↕                                ↕
              Undo/Redo (Zundo)              Filter Store (runtime selections)

UI Selection (cell index) → Separate UISelectionStore (no undo/redo)
```

**Core principle**: The entire dashboard is described by a single `DashboardSpec` JSON object. All mutations go through the Zustand store, which maintains undo/redo history via Zundo. Widgets are rendered by looking up their type in the Widget Registry and passing config + data.

**Three stores**:
- `useDashboardStore` — Main store wrapped with Zundo temporal middleware for undo/redo
- `useUISelectionStore` — Transient UI state (selected cell index) outside undo/redo history
- `useFilterStore` — Runtime filter selections from filter widgets (not persisted)

### Key Technologies
- **React 19** — UI framework
- **Zustand + Immer** — Immutable state management
- **Zundo** — Temporal undo/redo middleware
- **Zod 4** — Schema validation (note: `z.record()` requires two arguments, e.g. `z.record(z.string(), z.unknown())`)
- **React Grid Layout** — Drag-and-drop grid (uses `onDragStop`/`onResizeStop` for persistence)
- **Recharts** — Charts (bar, line, area, pie, donut, stacked-bar, scatter)
- **Tailwind CSS 4** — Styling with Neural Light design system
- **React Router** — Client-side routing
- **TanStack Query** — Async data fetching

---

## 2. Getting Started

### Install

```bash
cd dashboard-builder
npm install
```

### Run (development)

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Build (production)

```bash
npm run build
npm run preview
```

### Project Structure

```
src/
├── ai/                    # AI service interface + MCP tool system
│   ├── ai-service.interface.ts
│   ├── mock-ai.service.ts
│   ├── tools.ts           # Tool definitions
│   └── tool-executor.ts   # Tool dispatch + validation
├── components/
│   ├── builder/           # Builder UI (toolbar, palette, inspector, grid, AI modal)
│   ├── viewer/            # Read-only viewer
│   └── widgets/           # Widget implementations (KPI, Chart, Table, Text, Container, Filter)
├── lib/                   # Code generation & runtime compilation
│   ├── code-gen.ts        # Generates JSX source from widget config
│   └── code-runner.ts     # Compiles custom code via Function()
├── data/                  # Dummy datasets
├── providers/             # Data provider abstraction
├── registry/              # Widget registry (plugin system)
├── schemas/               # Zod schemas (dashboard spec, widget configs)
├── store/                 # Zustand stores, persistence, hooks
├── index.css              # Neural Light design system styles
└── App.tsx                # Routes
```

---

## 3. Widget System

### Registry Pattern

Widgets are registered at startup via `registerWidget()` in `src/registry/register-all.ts`. Each registration provides:

| Field | Description |
|-------|-------------|
| `type` | Unique string identifier (`kpi`, `chart`, `table`, `text`, `container`) |
| `label` | Display name in palette |
| `icon` | Lucide icon name |
| `configSchema` | Zod schema for widget-specific config |
| `defaultConfig` | Parsed default config from schema |
| `component` | React component to render |
| `defaultSize` | Default grid size `{w, h}` |

### Built-in Widgets

| Type | Description | Default Size |
|------|-------------|-------------|
| `kpi` | Single metric display with optional trend | 3 × 2 |
| `chart` | 7 chart types (see below) | 6 × 4 |
| `table` | Paginated data table | 6 × 4 |
| `text` | Rich text / markdown block | 4 × 2 |
| `container` | Nested grid of sub-widgets | 6 × 4 |
| `filter` | Interactive data filter (dropdown/buttons/date) | 4 × 1 |

### Filter Widget

The filter widget provides interactive data filtering across all widgets bound to the same dataset.

**Config**: `{ displayType, datasetId, field, label, options }`

| Field | Description |
|-------|-------------|
| `displayType` | `dropdown` (default), `button-group`, or `date-range` |
| `datasetId` | Dataset to filter |
| `field` | Field to filter on |
| `label` | Display label |
| `options` | Explicit values (auto-populated from data if empty) |

**Display modes**:
- **dropdown** — `<select>` with "All" option
- **button-group** — Horizontal buttons, active one highlighted
- **date-range** — Two date inputs producing `gte`/`lte` filters

**Architecture**: Active filter selections live in a runtime `useFilterStore` (not persisted). `useWidgetData` subscribes to the filter store and merges active filters into every query for matching datasets.

### Chart Types

The chart widget supports 7 types via the `chartType` config field:

| chartType | Description |
|-----------|-------------|
| `bar` | Vertical bar chart |
| `line` | Line chart |
| `area` | Area chart (line with fill) |
| `pie` | Pie chart |
| `donut` | Donut chart (pie with inner radius) |
| `stacked-bar` | Stacked bar chart (all numeric fields) |
| `scatter` | Scatter plot |

### Container Widget

The container widget provides a configurable rows × cols grid where each cell can hold an independent sub-widget.

**Config**: `{ cols: number, rows: number, cells: (CellSpec | null)[] }`

**CellSpec**:
```typescript
{
  type: string        // Widget type (kpi, chart, table, text)
  title: string       // Cell title
  config: object      // Widget-specific config
  datasetId?: string  // Optional per-cell dataset (inherits from container if omitted)
}
```

**Interaction**:
- Click an empty cell to open a widget picker overlay
- Click a filled cell to select it — the Inspector Panel shows that cell's config
- Each cell can have its own dataset binding or inherit from the container
- Click "Back to Container" in the inspector to return to container-level config

### Creating a Custom Widget

1. Define a config schema in `src/schemas/widget-configs.schema.ts`:
   ```typescript
   export const myWidgetConfigSchema = z.object({
     someField: z.string().default('hello'),
   })
   ```

2. Create the component in `src/components/widgets/MyWidget.tsx`:
   ```typescript
   export function MyWidget({ config, data }: WidgetProps) {
     const c = config as MyWidgetConfig
     return <div>{c.someField}</div>
   }
   ```

3. Register in `src/registry/register-all.ts`:
   ```typescript
   registerWidget({
     type: 'mywidget',
     label: 'My Widget',
     icon: 'Star',
     configSchema: myWidgetConfigSchema,
     defaultConfig: myWidgetConfigSchema.parse({}),
     component: MyWidget,
     defaultSize: { w: 4, h: 3 },
   })
   ```

4. Add the type to `widgetSpecSchema` in `src/schemas/dashboard.schema.ts`:
   ```typescript
   type: z.enum(['kpi', 'chart', 'table', 'text', 'container', 'mywidget'])
   ```

### Widget Props

```typescript
interface WidgetProps {
  config: Record<string, unknown>  // Widget-specific configuration
  data: DataResult | null          // Queried data from data provider
  width: number                    // Current pixel width
  height: number                   // Current pixel height
}
```

Container widgets also receive `onConfigChange?: (config: Record<string, unknown>) => void` to persist cell changes.

---

## 4. Data Providers

### Interface

```typescript
interface DataProvider {
  listDatasets(): Promise<{ id: string; name: string }[]>
  getFields(datasetId: string): Promise<FieldDef[]>
  query(query: DataQuery): Promise<DataResult>
}
```

### Built-in: LocalDummyProvider

Provides three in-memory datasets:
- **sales** — Monthly sales (month, revenue, units, region)
- **tokens** — AI token usage (model, tokens_in, tokens_out, cost, date)
- **portfolio** — Portfolio holdings (asset, sector, value, weight, return_ytd)

### Adding a Real API Provider

1. Implement `DataProvider` interface in `src/providers/my-api.provider.ts`
2. Swap the provider in `src/providers/provider-context.tsx`:
   ```typescript
   const defaultProvider = new MyApiProvider('https://api.example.com')
   ```

---

## 5. AI / MCP Tool Interface

The AI system uses a structured tool-calling pattern compatible with MCP (Model Context Protocol).

### Available Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `add_widget` | Add a widget | `type`, `title`, `config`, `datasetId`, `x`, `y`, `w`, `h` |
| `remove_widget` | Remove by ID | `id` |
| `update_widget_config` | Update config | `id`, `config` |
| `update_widget_title` | Set title | `id`, `title` |
| `add_filter_widget` | Add a filter widget | `title`, `datasetId`, `field`, `displayType`, `options` |
| `set_data_binding` | Bind to dataset | `id`, `datasetId` |
| `update_layout` | Move/resize | `id`, `x`, `y`, `w`, `h` |
| `set_dashboard_name` | Rename dashboard | `name` |
| `list_widgets` | List current widgets | _(none)_ |
| `list_datasets` | List available datasets | _(none)_ |
| `get_dashboard_spec` | Get full spec JSON | _(none)_ |

### Tool Call Format

```typescript
interface ToolCall {
  name: string
  params: Record<string, unknown>
}

interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}
```

### AI Modal

The AI prompt modal shows tool calls executing sequentially with status indicators:
- Pending (clock icon)
- Running (spinner)
- Done (check icon)
- Error (alert icon with message)

### Connecting an LLM

1. Implement `AiService` interface (replace `MockAiService`)
2. The `chat()` method receives a user prompt and current spec, returns `ToolCall[]`
3. Each tool call is executed via `tool-executor.ts` which validates with Zod and dispatches to the Zustand store
4. For MCP integration, expose `tools.ts` definitions as MCP tool schemas and route MCP tool calls through `executeToolCall()`

### AI Service Interface

```typescript
interface AiService {
  generateDashboard(prompt: string, currentSpec?: DashboardSpec): Promise<Partial<DashboardSpec>>
  getTools(): AiTool[]
  executeToolCall(call: ToolCall): Promise<ToolResult>
  chat(prompt: string, currentSpec: DashboardSpec): Promise<ToolCall[]>
}
```

---

## 6. Dashboard Spec Format

The complete dashboard is a single JSON object:

```json
{
  "id": "abc123",
  "name": "My Dashboard",
  "version": 1,
  "pageSettings": {
    "layoutMode": "scrollable",
    "pageWidth": 1200,
    "rowHeight": 80
  },
  "layout": [
    { "i": "widget1", "x": 0, "y": 0, "w": 3, "h": 2 }
  ],
  "widgets": [
    {
      "id": "widget1",
      "type": "kpi",
      "title": "Revenue",
      "config": {
        "label": "Revenue",
        "prefix": "$",
        "suffix": "",
        "color": "#3b82f6"
      },
      "customCode": "const rows = data?.rows ?? []\nreturn ...",
      "dataBinding": {
        "datasetId": "sales",
        "fieldMap": {},
        "filters": [
          { "field": "region", "op": "eq", "value": "North" }
        ]
      }
    }
  ]
}
```

### Layout

12-column grid. Each layout item: `i` (widget ID), `x` (column 0-11), `y` (row), `w` (width 1-12), `h` (height in row units). New widgets are placed at the bottom of the grid (`y = maxY`).

### Widget Types & Config

- **kpi**: `label`, `prefix`, `suffix`, `trendField?`, `color`
- **chart**: `chartType` (`bar`|`line`|`area`|`pie`|`donut`|`stacked-bar`|`scatter`), `xField`, `yField`, `color`
- **table**: `columns` (string[]), `pageSize` (number)
- **text**: `content` (string), `fontSize` (`sm`|`base`|`lg`|`xl`|`2xl`)
- **container**: `cols` (number), `rows` (number), `cells` (CellSpec[])
- **filter**: `displayType` (`dropdown`|`button-group`|`date-range`), `datasetId`, `field`, `label`, `options`

### Page Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `layoutMode` | `'scrollable'` \| `'portrait-fixed'` \| `'landscape-fixed'` | `'scrollable'` | Page layout mode |
| `pageWidth` | number | `1200` | Page width in pixels |
| `rowHeight` | number | `80` | Height of each grid row in pixels |

**Layout modes**:
- **Scrollable** — Fixed width, vertically scrollable (web-style). Content is centered and capped at `pageWidth`.
- **Portrait Fixed** — Fixed-size page in portrait orientation. Both axes scroll if content overflows.
- **Landscape Fixed** — Fixed-size page in landscape orientation. Both axes scroll if content overflows.

### CellSpec (Container sub-widgets)

```typescript
{
  type: string            // Widget type (kpi, chart, table, text)
  title: string           // Cell title
  config: object          // Widget-specific config
  dataBinding?: {         // Optional per-cell dataset binding
    datasetId: string
    fieldMap?: Record<string, string>
    filters?: FilterSpec[]
  }
}
```

### Filter Operators

`eq`, `neq`, `gt`, `lt`, `contains`, `gte`, `lte`

---

## 7. Builder UI

### Toolbar
- **Home button** — Returns to the landing page
- **Dashboard name** — Editable inline
- **Undo / Redo** — Powered by Zundo (50-step history)
- **Settings** — Opens page settings panel (gear icon, deselects any widget)
- **Developer Mode** — Toggle (Code2 icon) to enable code editing on widget cards. Shows a confirmation warning on first enable
- **AI Assistant** — Opens AI prompt modal
- **Export JSON** — Downloads the dashboard spec
- **Preview** — Opens read-only viewer

### Widget Palette (left sidebar)
- **Filter** and **Container** buttons at the top
- **Charts** — Collapsible section with 7 chart subtypes (bar, line, area, pie, donut, stacked bar, scatter)
- **KPI**, **Table**, **Text** — Individual buttons

### Inspector Panel (right sidebar)
- **No widget selected**: Shows page settings (max width selector, row height slider)
- **Widget selected**: Shows widget config with code/visual mode toggle
- **Container cell selected**: Shows cell config with "Back to Container" button
- Config fields are auto-generated from Zod schemas with smart input types:
  - Enums → dropdowns
  - Numbers → number inputs
  - Booleans → checkboxes
  - Arrays → textarea (one per line) or multi-select checkboxes for `columns`
  - Field keys (`xField`, `yField`, `field`, `trendField`) → dropdown populated from dataset fields
  - `columns` → multi-select checkbox list from dataset fields
  - `datasetId` → dropdown of available datasets
  - `color` → native color picker + text input
- Data binding section for dataset selection and field mapping
- Filter widgets show dataset/field config inline (no separate data binding section)

### Developer Mode & Code Editing

Developer Mode is a global toggle in the toolbar (Code2 icon). When enabled:

- Each widget card shows a Code/Eye toggle in its header
- Clicking the Code button opens a **full source code editor** showing the complete JSX rendering code for that widget (not just JSON config)
- The code is generated from the widget's type and current config with values inlined (e.g., field names, colors, chart type logic)
- Users can freely edit the code — change colors, add Recharts components (Legend, custom tooltips), modify layouts, etc.
- **Apply** validates the code, saves it as `customCode` on the widget spec, and switches back to visual mode
- **Reset** removes custom code and returns to config-driven rendering
- Widgets with custom code show a "custom" badge in their header
- Custom code is persisted in the dashboard JSON and survives reload/export
- Available libraries in scope: React (useState, useMemo, useEffect, useRef), all Recharts components, TrendingUp/TrendingDown icons

**Warning**: A confirmation dialog appears when enabling Developer Mode, explaining that manual code changes override inspector-based configuration.

### View Mode

The viewer (`/viewer/:id`) renders dashboards in read-only mode:
- All widgets are non-interactive (no drag, resize, or editing)
- Container cells cannot be modified
- No widget picker, add buttons, or remove buttons
- Layout items are marked as `static` to prevent any movement

---

## 8. Style Guide — Neural Light Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `paper-50` | `#f8fafc` | Base background |
| `paper-100` | `#f1f5f9` | Hover states, table stripes |
| `tech-blue` | `#3b82f6` | Primary accent |
| `tech-purple` | `#8b5cf6` | Secondary accent |
| `tech-mint` | `#10b981` | Success/positive |

### Key CSS Classes

- **`.glass-card`** — Glassmorphism panel (semi-transparent white, backdrop blur, subtle shadow)
- **`.text-ai-gradient`** — Blue-to-purple gradient text
- **`.text-value-gradient`** — Gradient text for KPI values
- **`.btn-gradient`** — Gradient button (blue→purple)
- **`.aurora-container` + `.aurora-element`** — Animated aurora background

### Typography

- **Sans**: Inter (all UI text)
- **Mono**: JetBrains Mono (code, tool names)

### Usage

All panels (toolbar, sidebar, inspector) use `glass-card` with `rounded-none` for flush edges. Widget cards use `glass-card rounded-xl`. Buttons use either `btn-gradient` (primary) or ghost style (`hover:bg-white/50`).
