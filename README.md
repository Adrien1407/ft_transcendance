# Pong Game with Real-Time Multiplayer, Chat, Channels, and Leaderboard

This project is an implementation of the classic game Pong, with additional features such as real-time multiplayer, chat functionality, channels, and a leaderboard. The game allows multiple players to compete against each other in a dynamic and interactive gaming environment.

**Note: This project was developed by a team of 4 developers.**
- [wSzki](https://github.com/wSzki)
- [thibaut1304](https://github.com/thibaut1304)
- [Er1t](https://github.com/er1t-h)
- [adrien1407](https://github.com/adrien1407)


## Stack

- **Backend:** The backend is built using NestJS, a powerful Node.js framework. It leverages the benefits of TypeScript for strong typing and an enhanced development experience. The backend utilizes WebSockets (e.g., Socket.io) for real-time communication between players in both the chat and the Pong game.

- **Frontend:** The frontend is developed using TypeScript and React, a popular JavaScript framework for building user interfaces. The frontend build is optimized using ViteJS for fast development and better performance.

- **Database:** The application utilizes PostgreSQL as the database to store player information, channel creation, leaderboard data.

- **Reverse Proxy:** Nginx is used as a reverse proxy to handle incoming client requests and distribute them to the appropriate backend services.

- **Containerization:** Docker Compose is employed for containerization, enabling easy deployment and management of the application and its dependencies.


## Getting Started

To get started with the Pong game, follow these steps:

1. Clone the repository: `git clone https://github.com/adrien1407/ft_transcendance.git`
2. Fill the  `.env` file in the root directory of the project with the following environment variables:

   CLIENT_ID=your-client-id  
   CLIENT_SECRET=your-client-secret  

   Please obtain valid credentials for the 42 API and replace `your-client-id` and `your-client-secret` with the actual values.

3. Build the project by running the build script: `./build`
4. Access the game in your web browser at `https://your-ip:8443`.


Please note that before running the project, you must obtain valid credentials for the 42 API. These credentials are required for the proper functioning of the application.
