# 🎧 Telegram Music Streaming App

This project is a **music streaming platform** that fetches music content (albums and tracks) from a **public Telegram channel** and serves it through a **Spring Boot backend API** to a **web or mobile frontend**.

---

**⚠️ IMPORTANT: LEGAL AND COPYRIGHT DISCLAIMER ⚠️**

**This project explores the technical feasibility of sourcing content from a Telegram channel. However, streaming, distributing, or otherwise using copyrighted music without explicit permission and appropriate licenses from copyright holders is illegal in most jurisdictions.**

**Before proceeding with, developing, or deploying any part of this project that involves copyrighted material, you MUST:**

1.  **Ensure you have the full legal rights and necessary licenses** to use, reproduce, and publicly perform/distribute every piece of music.
2.  **Consult with a legal professional** specializing in intellectual property and copyright law to understand your obligations and potential liabilities.

**Relying on content being "publicly available" on Telegram does NOT automatically grant you the rights to use it in a separate application. The developers and contributors of this conceptual project outline do not endorse or encourage any illegal activity, and you are solely responsible for complying with all applicable laws.**

---

## 📌 Project Overview

- **Source**: Music is published in a public Telegram channel.
- **Crawler**: A Node.js service (using `gram-js`) scrapes music data and stores metadata in a shared database.
- **Backend**: A Spring Boot API serves track metadata and streams music files (either from Telegram or from local cache).
- **Frontend**: (Not included in this repo) A React or Flutter app that connects to the backend and plays the music.

---

## 🧱 Architecture

```

+----------------+     +------------------+     +------------------------+
|  Telegram API  | <-- |  Telegram Crawler| --> |   Content Database     |
|  (MTProto)     |     |  (Node.js App)   |     |     (PostgreSQL)       |
+----------------+     +------------------+     +-----------+------------+
                                                     |
                                                     v
                                           +---------------------+
                                           |  REST/GraphQL API   |
                                           |    (Spring boot)    |
                                           +----------+----------+
                                                      |
                             +------------------------+------------------------+
                             |                                                 |
                +--------------------------+                   +----------------------------+
                |     Web App (React)      |                   |   Mobile App (Flutter)     |
                +--------------------------+                   +----------------------------+

```

The system is designed with a multi-tiered architecture:

1.  **Telegram Channel (Content Source):** The public Telegram channel where music albums (audio files, cover art, descriptions) are published.
2.  **Backend Service/Worker (Content Ingestion & Processing):**
    * Regularly polls the Telegram channel for new messages using the Telegram API.
    * Parses messages to extract audio files, album art, and metadata.
    * (Recommended) Downloads media to dedicated cloud storage for reliability and performance.
    * Populates the central database with music metadata.
3.  **Database (Metadata & User Store):**
    * Stores metadata for albums, tracks, artists, genres.
    * Stores user information (profiles, playlists, favorites).
    * *This database is shared by the Backend Service/Worker and the API Server.*
4.  **API Server (Backend Logic):**
    * Exposes RESTful or GraphQL APIs for the mobile application.
    * Handles user authentication and authorization.
    * Provides endpoints for fetching music data, search, playlist management, etc.
    * Serves audio stream information (links to cloud storage or direct streams).
5.  **Cloud Storage (Recommended):**
    * Hosts audio files and images (album art) for reliable and efficient delivery.
    * Can be fronted by a CDN for improved performance.
6.  **Mobile App (Frontend):**
    * User interface for Browse, searching, and playing music.
    * Features include music player controls, playlist management, user accounts, and potentially offline downloads.

---

## 📂 Project Structure

```

/crawler        ← Node.js app using gram-js to fetch music
/api            ← Spring Boot API that serves metadata + audio
/database       ← Shared database (PostgreSQL)
/mobile         ← Mobile app (Flutter)

````

---

## 🚀 Features

### Telegram Crawler
- Connects to Telegram via MTProto
- Extracts music/audio posts
- Parses metadata: title, artist, album, file info
- Stores results in database

### Spring Boot Backend API
- REST API to serve:
  - All tracks
  - Albums
  - Search
  - Stream endpoint for audio files (supports `Range`)
- Can stream files:
  - Directly from Telegram via file references
  - Or from cached files (optional)

---

## 🔧 Technologies

| Layer         | Tech Stack                    |
|---------------|-------------------------------|
| Crawler       | Node.js + gram-js             |
| Backend       | Spring Boot (Java), JPA, REST |
| Database      | PostgreSQL                    |
| Frontend (✳)  | Flutter                       |

---

## 🗃️ Database Schema (Track Example)

```sql
Track {
  id: UUID,
  title: VARCHAR,
  artist: VARCHAR,
  album: VARCHAR,
  duration: INTEGER,
  mime_type: VARCHAR,
  telegram_file_id: TEXT,
  telegram_message_id: BIGINT,
  date_published: DATE
}
````

---

## 🔌 API Endpoints

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/api/tracks`             | List all tracks                   |
| GET    | `/api/tracks/{id}`        | Get metadata for one track        |
| GET    | `/api/tracks/{id}/stream` | Stream audio (with range support) |
| GET    | `/api/albums`             | List all albums                   |
| GET    | `/api/search?q=...`       | Search by title, artist, album    |

---

## 🔐 Authentication

* Currently, no auth is implemented.
* Can be extended with JWT for user-based features like:

    * Favorites
    * Playlists
    * Listening history

---

## Project Setup & Installation

**(Details to be added once development begins)**

This section will include steps on:
* Cloning the repository.
* Setting up the backend environment (Telegram API credentials, database connection, cloud storage configuration).
* Building and running the API server.
* Building and running the mobile application.
* Configuration of the Telegram channel (e.g., message format conventions).

---

## 📦 Getting Started

### 1. Set Up Database

Use PostgreSQL or MongoDB and create a schema called `musicapp`.

### 2. Run Telegram Crawler

```bash
cd telegram-crawler
npm install
node index.js
```

> ⚠️ You'll need a Telegram API ID, hash, and phone login.

### 3. Run Spring Boot API

```bash
cd music-api-springboot
./mvnw spring-boot:run
```

Make sure the DB config in `application.yml` matches your setup.

---

## 📁 Future Improvements

* Caching Telegram audio locally or to cloud (S3)
* Frontend player with search, albums, and playlists
* Admin panel to curate data
* Integration tests and CI/CD pipeline

---

## Usage

**(Details to be added once the application is functional)**

This section will describe how to use the application, both from an end-user perspective and potentially for administrators (if an admin panel is developed).

---

## Contributing

We welcome contributions to this project! Please read our `CONTRIBUTING.md` file (to be created) for guidelines on how to contribute, report bugs, or suggest features.

**Key areas for contribution:**
* Backend development (Telegram integration, API development)
* Frontend mobile app development
* UI/UX design
* Testing
* Documentation

**Before contributing, please ensure you understand and respect the legal disclaimer regarding copyrighted material.**

---

## 📜 License

This project is for educational and non-commercial use only. Ensure that you have legal rights for any media content streamed via the application.

---

## 👨‍💻 Author

Built by Ivan Lemovou
Tech Stack: Java, Spring Boot, Node.js, Telegram API, PostgreSQL


