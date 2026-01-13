# Dimension Visualization System

## Overview
The dimension visualization system automatically creates visual dimension lines for concrete and any other mesh with width, depth, and height measurements.

## Features

✅ **Automatic Dimension Detection** - Analyzes mesh bounding box to calculate actual dimensions  
✅ **Visual Arrows** - Yellow dimension lines with arrow endpoints  
✅ **Text Labels** - Shows actual measurements (e.g., "WIDTH: 3.50")  
✅ **Customizable** - Control color, scale, offset, and which dimensions to show  
✅ **Toggle On/Off** - Enable/disable dimensions with `showDimensions` parameter  

## Usage

### Basic Usage - Concrete with Dimensions

```typescript
import { createConcrete } from './utils/ConcreteBuilder';

// Create concrete with dimensions visible
const concreteGroup = createConcrete(
  scene,
  concreteThickness = 1,
  concreteWidth = 3,
  concreteDepth = 3,
  concretePosition,
  [],
  parentGroup,
  isFiniteConcrete = true,
  showDimensions = true  // Enable dimensions
);

// Access dimension data
if (concreteGroup.dimensionLines) {
  console.log(`Width: ${concreteGroup.dimensionLines.width}`);
  console.log(`Depth: ${concreteGroup.dimensionLines.depth}`);
  console.log(`Height: ${concreteGroup.dimensionLines.height}`);
}
```

### Advanced Usage - Custom GeometryHelper

```typescript
import { createDimensionLineSystem } from './utils/GeometryHelper';

// For any mesh
const dims = createDimensionLineSystem(myMesh, scene, {
  dimensions: ['width', 'height'],  // Show only width and height
  offset: 0.5,                       // Distance from mesh
  color: new BABYLON.Color3(1, 0, 0), // Red
  scale: 2.0,                        // 2x thickness
  arrowSize: 0.25,                   // Larger arrows
  showLabel: true                    // With text labels
});

// Access results
console.log(`Mesh dimensions:`, dims.width, dims.depth, dims.height);
console.log(`All meshes:`, dims.meshes); // Lines and arrows
console.log(`All labels:`, dims.labels); // Text blocks
```

### Without Dimensions

```typescript
// Create concrete without dimension visualization
const concreteGroup = createConcrete(
  scene,
  1, 3, 3, concretePosition, [], parentGroup, true,
  showDimensions = false  // Disable dimensions
);
```

## Configuration Options

### Default Settings (used in ConcreteBuilder)
```typescript
{
  dimensions: ['width', 'depth', 'height'],
  offset: 0.4,              // 0.4 units from concrete edge
  color: Color3(1, 1, 0),   // Yellow
  scale: 1.2,               // 20% larger than default
  arrowSize: 0.2,           // 20% of offset
  showLabel: true           // Display measurements
}
```

### Dimension Line Result Structure
```typescript
{
  group: TransformNode,     // Parent node for all elements
  meshes: Mesh[],           // All dimension line meshes
  labels: Label[],          // Text labels with positions
  width: number,            // Calculated width
  depth: number,            // Calculated depth
  height: number            // Calculated height
}
```

## What Gets Created

For each dimension (width, depth, height):
- **1 Main Line** - Cylinder representing the dimension
- **2 Arrows** - Cone arrows at start and end
- **1 Text Label** - Shows dimension name and value (optional)

Total: **3-4 visual elements per dimension**

## Customization Examples

### Small, Subtle Dimensions
```typescript
{
  color: new BABYLON.Color3(0.5, 0.5, 0.5),  // Gray
  scale: 0.5,                                 // Half size
  offset: 0.2,                                // Closer to object
  showLabel: false                            // No text
}
```

### Large, Bold Dimensions
```typescript
{
  color: new BABYLON.Color3(1, 0, 0),  // Red
  scale: 3.0,                          // 3x size
  offset: 1.0,                         // Far from object
  arrowSize: 0.5                       // Large arrows
}
```

### Single Dimension
```typescript
{
  dimensions: ['height'],  // Only show height
  offset: 0.3,
  color: new BABYLON.Color3(0, 1, 0)
}
```

## Updating Dimensions

When concrete parameters change, dimensions update automatically:

```typescript
// Update concrete with new dimensions
updateConcrete(
  concreteGroup,
  scene,
  newThickness,
  newWidth,
  newDepth,
  newPosition,
  [],
  parentGroup,
  isFiniteConcrete,
  showDimensions = true  // Dimensions recreate with new values
);
```

## Technical Details

- **Automatic Calculation** - Uses mesh bounding box to calculate dimensions
- **Parent Support** - Dimensions inherit parent transform
- **Material System** - Uses emissive material for visibility
- **No Z-Fighting** - Dimension lines are offset from mesh surface
- **Cleanup** - Properly disposed when concrete is updated/removed

## Integration with UI

To add dimension toggle to ControlPanel:

```typescript
// In App.tsx state
const [showDimensions, setShowDimensions] = useState(true);

// Pass to ConstructionViewer
<ConstructionViewer 
  showDimensions={showDimensions}
  {...otherProps}
/>

// In ControlPanel
<label>
  <input 
    type="checkbox" 
    checked={showDimensions}
    onChange={(e) => setShowDimensions(e.target.checked)}
  />
  Show Dimensions
</label>
```

## Files Modified

- `src/utils/GeometryHelper.ts` - New dimension system
- `src/utils/ConcreteBuilder.ts` - Integrated dimensions into createConcrete/updateConcrete

## Browser Compatibility

Works in all modern browsers supporting WebGL and Babylon.js 5.0+
