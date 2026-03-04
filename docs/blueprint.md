## Blueprint for Canvas Editor

This document outlines the basic structure and data flow for a canvas-based editor application. The editor will allow users to add, manipulate, and style various objects on a canvas, including shapes, text, and images. The project will be built using Next.js and will leverage Konva.js for canvas rendering and manipulation.

### Data Structures

**Canvas State:**
- `canvasSize`: `{ width: number, height: number }` - Represents the dimensions of the canvas.
- `backgroundColor`: `{ isGradient: boolean, isTransparent: boolean, solidColor: string, colorStops: [{ stop: number, color: string }], gradientDirection: string }` - Defines the background of the canvas. It can be a solid color or a gradient. If `isTransparent` is true, the background will be transparent, regardless of other settings.
- `backgroundImage`: `string | null` - URL or data URL of the background image.
- `nodes`: `Array<Node>` - An array of all the objects currently on the canvas.

**Node (Base Object):**
- `id`: `string` - Unique identifier for the node.
- `type`: `string` - Type of the node (e.g., 'rect', 'circle', 'text', 'image').
- `x`: `number` - X-coordinate of the node.
- `y`: `number` - Y-coordinate of the node.
- `width`: `number` - Width of the node.
- `height`: `number` - Height of the node.
- `rotation`: `number` - Rotation of the node in degrees.
- `scaleX`: `number` - Horizontal scale of the node.
- `scaleY`: `number` - Vertical scale of the node.
- `opacity`: `number` - Opacity of the node (0-1).
- `data-is-gradient`: `boolean`
- `data-solid-color`: `string`
- `data-color-stops`: `Array<{ stop: number, color: string }>`
- `data-gradient-direction`: `string`
- `animation`: `{ type: string, settings: any } | null` - Animation applied to the node.

**Specific Node Types (Properties inherit from Base Node):**

- **Shape (`rect`, `circle`, `line`, etc.):**
  - `fill`: `string` - Fill color.
  - `stroke`: `string` - Stroke color.
  - `strokeWidth`: `number` - Stroke width.

- **Text:**
  - `text`: `string` - The text content.
  - `fontFamily`: `string` - Font family.
  - `fontSize`: `number` - Font size.
  - `fontStyle`: `string` - Font style (e.g., 'normal', 'italic', 'bold').
  - `textDecoration`: `string` - Text decoration (e.g., 'none', 'underline').
  - `textAlign`: `string` - Text alignment (e.g., 'left', 'center', 'right').

- **Image:**
  - `src`: `string` - URL or data URL of the image.
  - `mask`: `{ shape: string, settings: any } | null` - Mask applied to the image.

### Core Components

1.  **`Canvas.tsx`**: The main component that houses the Konva Stage. It will be responsible for rendering the background and all the nodes. It will also handle events like object selection, transformation, and drag-and-drop.

2.  **`PropertiesToolbar.tsx`**: A toolbar that displays properties of the selected object or global canvas properties if no object is selected. This will include controls for size, position, color, font styles, etc.

3.  **`ObjectPropertiesPanel.tsx`**: A panel within the `PropertiesToolbar` that shows detailed properties for the currently selected object(s). This is where the user can fine-tune the appearance and behavior of elements.

4.  **`Toolbox.tsx`**: A sidebar or toolbar containing buttons to add new objects to the canvas (e.g., add text, add rectangle, upload image).

### Hooks and Context

1.  **`useCanvas.ts` / `CanvasContext.tsx`**: A React context and hook to manage the global state of the canvas, including the `nodes` array, `canvasSize`, `backgroundColor`, and `selectedNodes`.

2.  **`useHistory.ts`**: A hook to manage undo/redo functionality by keeping a history of canvas state changes.

3.  **`useObjectManipulation.ts`**: A hook containing the logic for manipulating objects on the canvas (e.g., resizing, rotating, changing properties).

4.  **`useBackground.ts`**: A hook specifically for managing the canvas background, including solid colors, gradients, and images.

### Initial Setup

- **Default Canvas:** When the editor loads, it should initialize with a default canvas size (e.g., 1200x630px) and a light gray background (`#E0E0E0`).
- **Component Structure:** The main page (`page.tsx`) will assemble the `Canvas`, `PropertiesToolbar`, and `Toolbox` components.
- **State Management:** The `CanvasProvider` will wrap the main editor layout to provide the canvas context to all child components.
