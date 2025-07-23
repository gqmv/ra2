# WebXR AR Demo - Sphere on Table

A complete WebXR Augmented Reality demo built with React, TypeScript, and Three.js. This application implements the "sphere on table" AR experience, allowing users to place a 3D sphere on real-world surfaces using their device's camera.

## Features

🎯 **Complete WebXR Implementation** - Follows all 9 stages of the WebXR AR skeleton
📱 **Cross-Platform** - Works on AR-compatible mobile devices and browsers
🔍 **Hit Testing** - Real-time surface detection and placement
⚡ **Modern Stack** - React 18, TypeScript, Three.js, Vite
🎨 **Beautiful UI** - Modern, responsive interface with real-time feedback

## Demo Stages Implemented

1. **Feature & Permission Check** - Automatically detects WebXR AR support
2. **Session Kick-off** - Requests AR session with required features
3. **3D Scene Setup** - Creates Three.js scene, lights, and sphere mesh
4. **Reference Spaces** - Sets up viewer and local-floor coordinate systems
5. **Hit-Test Setup** - Configures real-time surface detection
6. **Per-Frame Loop** - WebXR-driven render loop with pose tracking
7. **Sphere Placement** - Touch/tap to place sphere on detected surfaces
8. **Normal Rendering** - Continues rendering placed objects
9. **Session End** - Clean session termination and resource cleanup

## Requirements

- **HTTPS Required** - WebXR only works over secure connections
- **AR-Compatible Device** - Mobile device with ARCore (Android) or ARKit (iOS)
- **WebXR Browser** - Chrome, Edge, or other WebXR-supporting browser
- **Node.js 16+** - For development

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will start on `https://localhost:3000` (HTTPS is automatically configured for WebXR compatibility).

### 3. Test on Mobile Device

- Connect your mobile device to the same network
- Open your browser and navigate to `https://[your-computer-ip]:3000`
- Accept the security certificate warning
- Grant camera permissions when prompted

## Usage

1. **Check Support** - The app automatically detects if your device supports WebXR AR
2. **Start AR** - Tap the "Start AR" button to begin the AR session
3. **Grant Permissions** - Allow camera access when prompted
4. **Find Surface** - Point your camera at a flat surface (table, floor, etc.)
5. **Place Sphere** - Tap the screen when the white reticle appears on the surface
6. **Explore** - Move around to see the sphere from different angles
7. **End Session** - Tap "End AR" to return to normal view

## Project Structure

```
├── src/
│   ├── App.tsx          # Main WebXR AR application
│   └── main.tsx         # React entry point
├── types/
│   └── webxr.d.ts       # WebXR TypeScript definitions
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration with HTTPS
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Technical Details

### WebXR Features Used

- **Immersive AR Session** - Full AR mode with camera feed
- **Local Floor Reference Space** - Stable world-aligned coordinates
- **Hit Testing** - Real-time surface detection
- **Input Events** - Touch/tap interaction handling
- **Anchors** - Optional anchor creation for object stability

### Three.js Integration

- **WebGL Renderer** - Hardware-accelerated 3D rendering
- **Scene Graph** - Lights, materials, and meshes
- **Matrix Transformations** - Direct WebXR pose integration
- **Reticle System** - Visual feedback for hit testing

### React Architecture

- **Functional Components** - Modern React with hooks
- **TypeScript** - Full type safety for WebXR APIs
- **Ref Management** - Proper cleanup and resource management
- **State Management** - Centralized UI state handling

## Browser Compatibility

| Browser | Platform | Support |
|---------|----------|---------|
| Chrome | Android | ✅ Full |
| Chrome | iOS | ✅ Full |
| Edge | Android | ✅ Full |
| Safari | iOS | ⚠️ Limited |
| Firefox | Mobile | ❌ No Support |

## Troubleshooting

### "WebXR not supported"
- Ensure you're using HTTPS
- Check if your browser supports WebXR
- Try Chrome or Edge on mobile

### "AR not supported on this device"
- Your device may not have ARCore/ARKit
- Try a different mobile device
- Check if AR apps work on your device

### Camera permissions denied
- Go to browser settings
- Enable camera permissions for the site
- Refresh the page

### Performance issues
- Close other browser tabs
- Restart the browser
- Try reducing the quality settings

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run type-check # Check TypeScript types
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service that supports HTTPS.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on AR-compatible devices
5. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own WebXR applications!

## Resources

- [WebXR Device API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [WebXR Hit Testing](https://immersive-web.github.io/hit-test/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Documentation](https://react.dev/)

---

**Happy AR Development! 🚀** 