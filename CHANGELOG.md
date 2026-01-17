# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-01-17

## [1.0.0] - 2026-01-16

### 🎉 Initial Release

First public release of **Namaz Akışı (Offline Edition)**. This version focuses on privacy, reliability, and offline-first capabilities.

### ✨ Features

*   **Offline-First Architecture:** Complete removal of cloud dependencies (Supabase). All data is strictly stored locally on the device using `AsyncStorage`.
*   **Smart Prayer Times:** Automatic calculation of prayer times based on user location using `adhan` library (Diyanet compatible).
*   **Advanced 'Guardian' Notification System:**
    *   **Escalating Urgency:** A unique 4-level reminder system that increases intonation as time runs out (Reminder -> Warning -> Struggle -> Final Call).
    *   **Smart Frequencies:** Users can define custom intervals for each level (e.g., notify every 15 mins when 45 mins left, but every 1 min when 5 mins left).
    *   **Resilient Scheduling:** Powered by `expo-task-manager` and `background-fetch` to ensure delivery even if the app is closed or after device restarts.
*   **Missed Prayer Tracking (Kaza):** Automatic detection and logging of missed prayers.
*   **Streak System:** Visual tracking of daily prayer continuity to boost motivation.
*   **Gamification:** Level and Badge system based on worship consistency.
*   **Dark Mode:** Eye-friendly UI optimized for night usage.

### 🛠 Technical Improvements

*   **Type Safety:** Full TypeScript migration and strict type checking enabled.
*   **State Management:** Centralized state management with Redux Toolkit.
*   **Performance:** Optimized rendering and minimized background fetch latency.
*   **Testing:** Comprehensive unit and integration test suite (`npm test`).

### 🐛 Bug Fixes

*   Resolved notification scheduling issues where valid times were skipped.
*   Fixed background task execution reliability on Android.
*   Corrected "0 notifications planned" display bug.
