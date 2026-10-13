# Patan Durbar Square — browser 3D study

This is a buildless JavaScript / Three.js 0.160 application. No dependency install or build step is required. Three.js and fonts load from their existing public CDNs, so the first visit requires internet access.

## Run

From this directory:

```powershell
python -m http.server 8765
```

Then open http://127.0.0.1:8765/ in a WebGL-capable browser. If Python is not on PATH in this Codex workspace, the bundled interpreter used for the preview is:

```powershell
& 'C:\Users\diwas\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 8765
```

## Controls

- Drag to orbit, wheel/pinch to zoom, right-drag to pan.
- Select a landmark in the side panel for a close view.
- Overview resets the camera; Plan looks down over the complete layout.
- Eye level places the camera at 1.68 m. Drag to look, use WASD or arrow keys to move, and Escape to return to overview. This is a free inspection camera, without pedestrian collision simulation.
- Markers are optional numbered buttons, with overlap culling. Names stay in the side panel.
- Neutral daylight and late afternoon are available. Ambient shadows can be disabled on slower devices.

## Source organization

- `index.html` — document, evidence notes and accessible controls.
- `style.css` — responsive viewer interface.
- `scene.js` — ground openings, context, lighting, ambient occlusion, navigation and overlay.
- `architecture.js` — separately named monument builders, palace wings, water structures and guardians.
- `geometry.js` — dimensioned geometry, steps, frames, arches, roofs and static mesh batching.
- `materials.js` — deterministic, matte procedural surface materials with physical texture scale.

Every major landmark is a named Three.js group. The site coordinates are retained from the earlier model. The geometry is an interpretive reconstruction with estimated dimensions, not a survey or a scan. Detail notes in the viewer distinguish documented architectural identities from conservative sculptural approximations. No religious text or narrative relief sequence has been invented.

## Validation

The scene checks for non-finite landmark geometry and exactly 21 Krishna Mandir pinnacles on startup. Its console reports the landmark count, temple roof counts, octagonal footprint and ground opening count. `window.patanDiagnostics()` returns read-only frame and camera diagnostics for development.
