# WFC Map Generator

A Wave Function Collapse algorithm implementation in TypeScript with React, built for fun and educational purposes to explore procedural generation techniques.

## What This Project Does

This is an interactive implementation of the **Wave Function Collapse (WFC)** algorithm - a procedural generation technique inspired by quantum mechanics. The algorithm analyzes a sample input image and generates new outputs that maintain the same local patterns and adjacency rules.

### Key Features

- **Interactive UI**: Real-time pattern scanning and generation with visual feedback
- **Configurable Parameters**: Adjust pattern size, scale factor, and output dimensions
- **Step-by-Step Generation**: Watch the algorithm collapse the wave function one cell at a time
- **Live Step Counter**: Track the generation progress in real-time
- **Pattern Extraction**: Automatically extracts NxN patterns from input images with rotations and reflections

## How It Works

1. **Pattern Analysis**: The algorithm scans an input image and extracts all possible NxN patterns
2. **Adjacency Rules**: It determines which patterns can be placed next to each other
3. **Wave Function**: Initializes a grid where each cell contains all possible patterns (superposition)
4. **Collapse**: Selects the cell with lowest entropy (fewest possibilities) and collapses it to a single pattern
5. **Propagation**: Updates neighboring cells based on the newly collapsed pattern
6. **Repeat**: Continues until the entire grid is collapsed or a contradiction is found

## Educational Purpose

This project was created primarily as a learning exercise to understand:

- **Quantum-inspired algorithms** and how they apply to procedural generation
- **React hooks** and state management patterns
- **Canvas rendering** and pixel manipulation
- **TypeScript** type safety and interface design
- **Algorithm optimization** and performance considerations

## Stretch Goal: Fantasy Map Generator

The ultimate stretch goal for this project is to evolve into a **fantasy map generator** capable of creating:

- **Terrain maps** with biomes, rivers, and mountains
- **Dungeon layouts** with connected rooms and corridors
- **City maps** with districts and road networks
- **World maps** with continents and oceans

The WFC algorithm is perfect for this because it ensures local consistency while allowing global variety - exactly what you need for believable procedural maps.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/wfc-map-gen.git
cd wfc-map-gen

# Install dependencies
npm install
# or
yarn install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. **Load an Image**: The app loads a default sample image (flowers.bmp)
2. **Configure Settings**:
   - Pattern Size: Size of patterns to extract (1-10)
   - Scale Factor: Visual scaling of output pixels (1-20)
3. **Scan Patterns**: Click "Scan Patterns" to analyze the input image
4. **Generate Output**:
   - "Generate Full Map" for complete generation
   - "Generate Step" for step-by-step observation
5. **Experiment**: Try different input images and settings

## Technical Stack

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Rendering**: HTML5 Canvas API
- **State Management**: React Hooks (useState, useRef, useEffect)

## Project Structure

```
src/app/
├── _wfc/
│   ├── index.ts              # Main WFC algorithm hook
│   ├── types.ts              # TypeScript type definitions
│   └── components/
│       ├── ConvasComponent.tsx  # Main UI component
│       ├── Button.tsx           # Reusable button
│       ├── Spinner.tsx          # Loading spinner
│       └── Progress.tsx         # Progress indicator
├── page.tsx                   # Main application page
├── layout.tsx                 # Root layout
└── globals.css                # Global styles
```

## Algorithm Implementation

The core WFC algorithm is implemented as a React hook (`useWaveFunctionCollapse`) that manages:

- **Pattern extraction** from input images with rotations/reflections
- **Adjacency rule computation** for pattern compatibility
- **Wave function management** with entropy tracking
- **Cell collapse and propagation** logic
- **Contradiction detection** and error handling

## Contributing

This is a personal educational project, but contributions are welcome! Areas for improvement:

- Performance optimizations for larger patterns
- Additional pattern transformations (scaling, skewing)
- Better error handling and user feedback
- More input image formats support
- Advanced map generation features

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **[Maxim Gumin](https://github.com/mxgmn)** - Original creator of the Wave Function Collapse algorithm
- **[Robert Heaton](https://robertheaton.com/)** - [Excellent WFC algorithm explanation](https://robertheaton.com/2018/12/17/wavefunction-collapse-algorithm/)
- **[ExUtumno](https://github.com/ExUtumno)** - Algorithm terminology and concepts