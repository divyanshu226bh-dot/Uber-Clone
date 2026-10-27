# Uber Clone

A full-stack ride-booking web application inspired by Uber, built using the MERN stack and Socket.IO. The application connects riders with captains and supports real-time ride updates.

## Features

- **User Authentication:** Registration, email OTP verification, login, and session management.
- **Captain Authentication:** Separate registration and login for captains, including vehicle details.
- **Real-Time Communication:** Socket.IO for ride requests, ride acceptance, and status updates.
- **Location Tracking:** Captain location updates and proximity-based ride arrival and completion checks.
- **Ride Management:** Ride lifecycle from request and acceptance to arrival, journey, and completion.
- **Nearby Captains:** API for finding active captains near a specified location.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Real-Time Communication:** Socket.IO
- **Authentication:** JWT, HTTP-only cookies, refresh tokens
- **Email Verification:** Nodemailer with Google OAuth2

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB connection
- Required environment variables configured for the backend

### Installation

Clone the repository:

```bash
git clone "https://github.com/divyanshu226bh-dot/Uber-Clone.git"
cd Uber-Clone
```

Install dependencies and start the frontend and backend separately. Follow their respective README files for setup instructions and required environment variables.

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## Project Status

This project is under development, with a focus on full-stack development, authentication, real-time communication, and ride management.
