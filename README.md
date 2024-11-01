HikeSense Dashboard
===================

HikeSense Dashboard is a web-based interface designed to enhance the hiking experience by allowing users to monitor their health data, manage hikes, and connect with friends for safety tracking. This dashboard component integrates seamlessly with the HikeSense server to provide a user-friendly environment for accessing hiking statistics, alerts, and real-time communications.

Stack
-----

-   **App:** `/hike-sense-app` 
-   **Arduino:** `/hike-sense-arduino` (Hardware component for health monitoring)
-   **Server:** `/hike-sense-server` 

Features
--------

-   **User Management:**

    -   User sign-up, login, and JWT-based authentication.
    -   Account management with friend connections for enhanced safety tracking.
-   **Hiking Data Visualization:**

    -   Display of real-time health metrics, including heart rate and other statistics during hikes.
    -   Graphical representation of past hikes, routes, durations, and health metrics.
-   **Hike Management:**

    -   Storage and retrieval of hike details, including routes, heart rate, temperature, and more.
    -   Historical data view for tracking performance over time.
-   **OpenAI Integration:**

    -   Access to hiking and safety tips powered by OpenAI's API to enhance user knowledge and preparation for hikes.
-   **Google Maps Integration:**

    -   Use Google Maps API to plan hikes, view routes, and explore hiking locations interactively.
-   **Real-Time Communication:**

    -   WebSocket-based chat feature for real-time messaging between friends.
    -   Live updates on user location and safety stats.

Technologies
------------

-   **Framework:** React
-   **State Management:** Context API for global state management
-   **Storage:** MMKV Storage for persisting user data and hike statistics
-   **Real-Time Communication:** WebSocket for chat and updates
-   **API Integration:** Communication with the HikeSense server for data retrieval and updates
-   **AI Integration:** OpenAI API for hiking and safety tips
-   **Mapping:** Google Maps API for planning hikes
