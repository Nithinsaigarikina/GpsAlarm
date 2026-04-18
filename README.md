# 🔔 GPS Alarm

A location-based React Native alarm application that wakes you up or alerts you when you approach your destination. Perfect for long train or bus commutes where you want to nap without the fear of missing your stop!

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
* Node.js installed
* Expo CLI installed (`npm install -g expo-cli`)
* Expo Go app installed on your physical device, or an iOS Simulator / Android Emulator setup on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nithinsaigarikina/GpsAlarm.git
   cd GpsAlarm
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo Server:**
   ```bash
   npx expo start
   ```

4. **Launch the App:**
   Scan the QR code displayed in your terminal using the Expo Go app. Alternatively, press `i` in the terminal to open the iOS simulator.

---

## 🛠️ Tech Stack

This project leverages modern cross-platform mobile development tools:

* **Framework:** React Native + Expo (SDK 55)
* **Map & UI Routing:** `react-native-maps`
* **Geofencing & Tracking:** `expo-location`
* **Audio & Alarms:** `expo-audio`
* **Push Notifications:** `expo-notifications`
* **Device Interaction:** `expo-haptics`

---

## 🧠 How It Works (Project Logic)

The project heavily embraces React Hooks to separate logic from UI components. The main application is driven by a series of custom hooks that manage location tracking, geofencing, and system alerts.

### 1. Live Location Tracking
The `useLocationTracker` hook taps into `expo-location` to continuously poll your device's geographical coordinates (latitude/longitude). It manages background permissions and dynamically updates the UI as you travel. 

### 2. Setting a Destination
On the `HomeScreen`, an interactable `MapView` serves as the canvas. 
* By executing a long press on the map, the `useDestination` hook locks in those coordinates.
* A visual 5km radius **Geofence Circle** is drawn around your desired endpoint to provide visual feedback.

### 3. Proximity Calculation (The Haversine Formula)
At the heart of the app is the `useProximityCheck` hook. 
* It takes your live `location` and statically targeted `destination` as inputs.
* It uses the mathematical **Haversine formula** (implemented in `src/utils/haversine.js`) to calculate the exact great-circle distance between the two points across the spherical curve of the Earth.
* When this distance drops below the set threshold (e.g., 5km), the hook flips its `isInsideRadius` boolean to `true`.

### 4. Triggering the Alarm System
The `useAlarm` hook acts as a listener waiting for `isInsideRadius` to become true. When triggered, the hook executes a full-scale alert sequence natively bypassing the device's idle states:
* 🎶 **Audio:** Spins up the native `expo-audio` player to endlessly loop a custom `.wav` alarm file (`mixkit-facility-alarm-sound-999.wav`).
* 📳 **Haptics:** Engages `expo-haptics` to vibrate your device hardware aggressively.
* 📩 **Notifications:** Dispatches a local event via `expo-notifications` to drop a banner on your device, ensuring you get notified even if the app was left running slightly out-of-focus.

### 5. UI Updates & Dismissal
When the alarm is active, a high-priority, full-screen red visual overlay is forcibly rendered via a strict `zIndex` over the top of the map. When the user taps **"Dismiss Alarm"**, the audio streams pause, state is reset, and the overlay unmounts. 
