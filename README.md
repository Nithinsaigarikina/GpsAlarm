# GPS Alarm

A location-based alarm app built with React Native and Expo. Triggers an alert when you approach your destination — built for commuters who want to nap on long train or bus rides without missing their stop.

---

## Tech Stack

| Technology | Why it was chosen |
|---|---|
| **React Native + Expo (SDK 55)** | Cross-platform mobile development with a single codebase — runs on iOS and Android without native build complexity |
| **`expo-location`** | Provides continuous GPS polling and background location permissions out of the box |
| **`react-native-maps`** | Interactive map canvas with native rendering — supports custom overlays like the geofence circle |
| **`expo-audio`** | Direct access to the native audio player — essential for looping alarm sounds reliably even in low-power states |
| **`expo-notifications`** | Delivers local push banners so the alert fires even when the app is slightly out of focus |
| **`expo-haptics`** | Hardware-level vibration feedback — reinforces the audio alert through physical sensation |

---

## Architecture

The project heavily embraces React Hooks to keep UI and logic strictly separated. Every major system — location, geofencing, proximity, alarm — lives in its own custom hook under `src/hooks`. Screens under `src/screens` are pure UI with no embedded logic.

```
src/
├── hooks/
│   ├── useLocationTracker.js   # Live GPS polling
│   ├── useDestination.js       # Destination selection
│   ├── useProximityCheck.js    # Haversine distance calculation
│   └── useAlarm.js             # Alarm trigger and dismissal
├── screens/
│   └── HomeScreen.js           # Map UI, geofence overlay, alarm UI
└── utils/
    └── haversine.js            # Great-circle distance formula
```

---

## How it works

### 1. Live Location Tracking

The `useLocationTracker` hook taps into `expo-location` to continuously poll the device's geographical coordinates (latitude/longitude). It manages background permissions and dynamically pushes coordinate updates as the user travels.

### 2. Setting a Destination

On the `HomeScreen`, an interactable `MapView` serves as the canvas. A long press fires the `useDestination` hook which locks in those coordinates as the target. A visual **5km radius geofence circle** is drawn around the destination to give the user spatial feedback on the trigger zone.

### 3. Proximity Calculation — The Haversine Formula

At the heart of the app is `useProximityCheck`. It takes the live `location` and the pinned `destination` as inputs and runs the **Haversine formula** (implemented in `src/utils/haversine.js`) to calculate the exact great-circle distance between the two points across the spherical surface of the Earth. When this distance drops below the threshold (5km), the hook flips its `isInsideRadius` boolean to `true`.

### 4. Triggering the Alarm

The `useAlarm` hook listens for `isInsideRadius` to become `true`. When triggered, it fires a full-scale alert sequence that bypasses the device's idle states:

- **Audio** — the native `expo-audio` player loops a `.wav` alarm file continuously
- **Haptics** — `expo-haptics` engages aggressive hardware vibration
- **Notifications** — `expo-notifications` dispatches a local banner, ensuring the alert lands even if the app is slightly out of focus

### 5. UI and Dismissal

When the alarm is active, a full-screen red overlay is rendered with a strict `zIndex` over the map — impossible to miss. Tapping **Dismiss Alarm** pauses audio, resets all state, and unmounts the overlay cleanly.

---

## Getting Started

**Prerequisites**
- Node.js
- Expo CLI — `npm install -g expo-cli`
- Expo Go app on a physical device, or iOS Simulator / Android Emulator

**Installation**

```bash
git clone https://github.com/Nithinsaigarikina/GpsAlarm.git
cd GpsAlarm
npm install
npx expo start
```

Scan the QR code in your terminal with Expo Go, or press `i` to open the iOS simulator.

## Tech

`React Native` · `Expo` · `JavaScript` · `expo-location` · `react-native-maps` · `expo-audio` · `expo-notifications` · `expo-haptics`
