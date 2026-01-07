# 3D Construction Model Viewer

A web application built with React, Vite, and Three.js for displaying and interacting with 3D construction models.

## Features

- **3D Visualization**: Realistic 3D rendering of construction sites with buildings, cranes, and safety equipment
- **Interactive Controls**: 
  - Drag with mouse to rotate the view
  - Scroll to zoom in/out
  - Real-time camera controls
- **Realistic Materials**: Physics-based material rendering with proper shadows and lighting
- **Construction Elements**:
  - Building structures with pillars, beams, roof, and walls
  - Crane with boom and hook
  - Safety cones for construction site safety
  - Ground plane with grid

## Tech Stack

- **React 18**: UI framework
- **Vite**: Lightning-fast build tool and dev server
- **Three.js**: 3D graphics library
- **TypeScript**: Type-safe development

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

Dependencies are already installed. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ConstructionViewer.tsx    # Main 3D viewer component
│   └── ThreeCanvas.tsx            # Reusable Three.js canvas component
├── utils/
│   └── constructionModels.ts      # 3D model creation functions
├── styles/
│   └── ThreeCanvas.css            # Canvas styling
├── App.tsx                        # Main app component
├── App.css                        # App styling
├── main.tsx                       # Entry point
└── index.css                      # Global styles
```

## Usage

### Controls

- **Rotate**: Click and drag with mouse
- **Zoom**: Scroll wheel

### Creating Custom Models

You can extend the `constructionModels.ts` file to create custom 3D elements:

```tsx
export const createCustomModel = (scene: THREE.Scene) => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
};
```

## Customization

### Change Scene Background Color

Edit `src/components/ConstructionViewer.tsx`:
```tsx
scene.background = new THREE.Color(0x1a1a2e); // Change hex color
```

### Adjust Lighting

Modify the `directionalLight` and `ambientLight` properties in `ConstructionViewer.tsx`.

### Add More Models

Add new model creation functions to `constructionModels.ts` and call them in the `useEffect` hook of `ConstructionViewer.tsx`.

## Performance Tips

- Use efficient geometry and material settings
- Limit the number of lights in the scene
- Use shadow maps wisely (they impact performance)
- Consider using `THREE.InstancedMesh` for repeated objects

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (WebGL required)

## Future Enhancements

- [ ] GLB/GLTF model loading
- [ ] Animation system for crane movements
- [ ] Physics-based interactions
- [ ] Export functionality
- [ ] Real-time collaboration features
- [ ] Material editor
- [ ] Lighting controls UI

## Troubleshooting

### Black screen
- Check browser console for WebGL errors
- Ensure hardware acceleration is enabled in your browser
- Try a different browser

### Performance issues
- Reduce shadow map resolution
- Decrease grid size
- Remove unnecessary models from the scene

### Controls not working
- Ensure the viewer container has focus
- Try refreshing the page
- Check that JavaScript is enabled

## Support

For issues and questions, please check the browser console for error messages.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
