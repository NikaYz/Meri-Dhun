# Meri Dhun – Real-time Music Request & Voting Platform

This project is a real-time, interactive music platform designed for live events, pubs, and college fests. It empowers a crowd to collectively influence the live music playlist by requesting, upvoting, and boosting songs, providing DJs and organizers with immediate, data-driven insights into audience preferences.

## ✨ Features

- **Anonymous & Secure Access:** A unique, QR-based login system ensures attendees can join the event seamlessly without needing to create an account. Session tokens are time-bound and automatically invalidate, preventing unauthorized access and spam.
- **Real-time Leaderboard:** A dynamic leaderboard powered by WebSockets provides a live view of the most popular songs, helping the DJ make informed decisions on the fly.
- **Interactive Voting System:** Users can search and request songs, as well as upvote, downvote, and "boost" tracks to influence their ranking in real time.
- **Organizational Controls:** The system provides admin controls for event hosts to manage the playlist, including skipping songs and managing playback.
- **Enhanced User Experience:** By turning the audience from passive listeners into active participants, the platform significantly increases engagement and creates a more memorable event atmosphere.

## ⚙️ Technology Stack

**Frontend:**
* **Next.js:** A React framework for building fast and scalable web applications.
* **TypeScript:** For type safety and improved code maintainability.

**Backend:**
* **Node.js/Express:** The server-side environment for handling API routes and WebSocket connections.
* **WebSockets:** The core technology for bi-directional, real-time communication between the server and all connected clients, ensuring instant updates.

**Database:**
* **PostgreSQL:** A powerful and reliable relational database used to store song data, votes, and event history.

## 📐 Architecture

The application is built on a robust, event-driven architecture designed for low-latency and scalability.

1. **Client-Server Communication:** The frontend, built with Next.js, establishes a persistent WebSocket connection to the backend server. All real-time events, such as votes and song boosts, are transmitted over this connection.
2. **Data Handling:** The backend processes incoming requests, updates the song rankings in the PostgreSQL database, and then broadcasts the new leaderboard state to all connected clients via their open WebSocket connections.
3. **Security:** The system uses a secure, expiring QR token system. A user scans a QR code that contains a unique, time-sensitive token. This token is used to validate the user's connection and actions for a limited period, ensuring security without requiring user credentials.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

**Prerequisites:**
* Node.js (v18.x or higher)
* npm
* PostgreSQL
* A running Redis instance (optional, for distributed systems architecture)

**Installation:**
1. Clone the repository:
   ```bash
   git clone [https://github.com/NikaYz/Meri-Dhun/.git](https://github.com/yourusername/meridhun.git)
   cd Meri-Dhun

2. Install the dependicies:
   ```bash
   npm i
3. Set environment variables with PostgreSQL connection
4. Run the app:
   ```bash
   npm run dev
## Future Works

- **Song Cooldown:** Implement a 20-minute cooldown period for songs after they have been played. This would prevent song repetition and encourage a more diverse playlist, enhancing the user experience for the entire event duration.
- **Enhanced Anti-Spam Measures:** Introduce a dynamic vote-throttling mechanism to prevent vote spamming. This would involve tracking user activity and temporarily rate-limiting accounts that exhibit suspicious behavior, ensuring the leaderboard remains an accurate reflection of genuine audience interest.
- **Distributed System Caching:** Integrate **Redis** as a distributed cache and message broker. This would enable real-time communication across multiple server instances, allowing the application to scale horizontally and handle large events with thousands of concurrent users without compromising latency or data consistency.
- **Direct Messaging Integration:** Develop a **WebSocket-based messaging feature** that allows users to send private requests or communicate directly with event organizers. This would provide a dedicated channel for special requests, feedback, or private inquiries, improving communication between the audience and the event staff.
