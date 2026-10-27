# Uber Clone — Frontend

A React-based ride-booking interface for riders and captains, featuring interactive maps, real-time ride updates, live location tracking, and ride lifecycle management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Ride Lifecycle](#ride-lifecycle)
- [Real-Time Communication](#real-time-communication)
- [Backend Integration](#backend-integration)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Development Commands](#development-commands)
- [Error Handling and Reliability](#error-handling-and-reliability)
- [Security Considerations](#security-considerations)

## Overview

The frontend is the client-side application of the Uber Clone project. It provides separate experiences for riders and captains while communicating with the backend through REST APIs and Socket.IO.

The application coordinates authentication, ride requests, captain assignment, OTP-based ride initiation, live location updates, map routing, and ride completion.

The frontend is responsible for presenting application state and handling user interactions. The backend remains responsible for authentication, authorization, ride-state validation, and persistent data.

## Features

### Rider Experience

- Rider registration, email verification, login, and logout.
- Pickup and destination selection.
- Vehicle selection and ride-request workflow.
- Waiting for captain acceptance and arrival.
- Live captain location updates.
- OTP-based ride initiation.
- Route visualization during the ride.
- Real-time ride status updates.
- Ride completion and return to the rider home screen.

### Captain Experience

- Captain registration, email verification, login, and logout.
- Captain home and ride-management interfaces.
- Incoming ride requests and ride acceptance.
- Navigation towards the rider's pickup location.
- Arrival confirmation.
- OTP verification before starting the ride.
- Navigation towards the destination after ride initiation.
- Live captain GPS updates.
- Ride completion and return to the captain home screen.

### Maps and Navigation

- Interactive map rendering.
- Pickup, destination, and captain location markers.
- Route visualization between the captain and the current target.
- Route changes when the ride moves from pickup navigation to destination navigation.
- Location updates used to keep the displayed map synchronized with the ride.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Development server and build tooling |
| React Router | Client-side navigation |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP requests to backend APIs |
| Socket.IO Client | Real-time communication with the backend |
| React Leaflet | React components for interactive maps |
| Leaflet | Map rendering |
| GSAP | UI animations |
| React Icons | Interface icons |

## Architecture

The frontend communicates with the backend through two primary channels.

### 1. REST API

HTTP requests are used for operations such as:

- Registering and authenticating users.
- Verifying email addresses.
- Retrieving the authenticated user's profile.
- Refreshing authentication tokens.
- Creating and managing ride requests.
- Retrieving map-related information where supported by the backend.

### 2. Socket.IO

Socket.IO provides real-time communication for ride-related events and captain location updates.

The frontend listens for ride-state changes and updates the appropriate rider or captain interface without requiring continuous page refreshes.

### High-Level Architecture

```text
Rider Interface                 Captain Interface
       |                               |
       +---------------+---------------+
                       |
                React Application
                       |
          +------------+------------+
          |                         |
       REST API                 Socket.IO
          |                         |
          +------------+------------+
                       |
               Node.js Backend
                       |
             Express + MongoDB
```

## Ride Lifecycle

The frontend coordinates the ride experience across both roles.

```text
Rider requests a ride
          |
          v
Captain receives the request
          |
          v
Captain accepts the ride
          |
          v
Captain navigates to pickup
          |
          v
Captain confirms arrival
          |
          v
Rider provides the ride OTP
          |
          v
Backend verifies the OTP
          |
          v
Ride status becomes ongoing
          |
          v
Captain navigates to destination
          |
          v
Captain completes the ride
          |
          v
Both interfaces receive completion updates
          |
          v
Return to respective home screens
```

The backend is the authority for ride-state transitions. The frontend reflects those transitions using API responses and real-time events.

## Real-Time Communication

The application uses `socket.io-client` to establish a connection with the Socket.IO server.

Real-time communication supports:

- Ride request and acceptance updates.
- Captain arrival notifications.
- Ride-start notifications after successful OTP verification.
- Ride completion notifications.
- Captain location updates.
- Synchronization of ride status across rider and captain interfaces.

### Important Ride Events

The frontend integrates with the following event names used by the backend:

| Event | Purpose |
|---|---|
| `captain-arrived` | Notifies the rider that the captain has arrived |
| `ride-started` | Indicates that the ride has started |
| `ride-completed` | Indicates that the ride has completed |
| `ride-status-updated` | Communicates relevant ride status changes |
| `otp-verification-result` | Communicates the outcome of ride OTP verification |
| `ride-error` | Communicates a ride-related error |
| `update-location-captain` | Sends the captain's location to the backend |
| `captain-location-{captainId}` | Receives location updates for a specific captain |

Event payloads and authorization requirements should be maintained consistently with the backend implementation.

### Connection Lifecycle

Socket connections and event listeners should be managed through React effects or shared context where appropriate.

Event listeners must be removed when their owning component or subscription is no longer active. This prevents duplicate handlers and unintended state updates.

The frontend should also account for temporary disconnections and reconnecting to the server.

## Backend Integration

The frontend depends on the backend for authentication, ride management, user information, and real-time events.

Authentication-related operations include:

- `/register`
- `/login`
- `/logout`
- `/rotate-token`
- `/verify-email`
- `/get-me`

These paths are relative to the corresponding backend route mount points. Refer to the backend README for complete HTTP methods, request payloads, response formats, and route definitions.

The application uses HTTP-only cookies where configured by the backend. Frontend HTTP requests must use the appropriate credential configuration when required by the authentication design.

The frontend must not treat client-side route protection as a replacement for backend authorization.

## Installation and Setup

### Prerequisites

- Node.js and npm.
- The Uber Clone repository.
- A running backend server.
- Required external map services and configuration for the implementation.

### 1. Clone the Repository

```bash
git clone https://github.com/divyanshu226bh-dot/Uber-Clone.git
cd Uber-Clone
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `frontend` directory.

Identify the environment variable names referenced by the frontend source code and provide the appropriate backend URL and any required public map configuration.

Do not commit secrets or private API credentials to version control.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal.

The backend must also be running for authentication, ride management, and Socket.IO features to work.

## Environment Configuration

The frontend may require environment-specific configuration for:

- The backend API base URL.
- The Socket.IO server URL, if configured separately.
- Public map configuration, if required by the chosen map implementation.

Use the exact variable names expected by the source code. Vite exposes client-side environment variables prefixed with `VITE_` to browser code, so values with that prefix must never contain private secrets.

Keep development and production configuration separate.

## Development Commands

Run these commands from the `frontend` directory.

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production frontend |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

## Error Handling and Reliability

The frontend should handle common failure scenarios gracefully:

- Registration or login failures.
- Expired authentication tokens.
- Failed email verification.
- Backend unavailability.
- Socket disconnections.
- Missing or invalid map coordinates.
- Route-service failures.
- Failed ride requests or captain acceptance.
- Invalid OTP submissions.
- Ride completion errors.

Loading states and clear error messages should be displayed when an operation cannot complete.

Ride status should be updated from trusted backend responses and authorized socket events rather than assumed from a button click alone.

## Security Considerations

- Never store private server secrets in frontend code.
- Do not rely exclusively on client-side route guards.
- Do not expose authentication tokens or sensitive user information in logs.
- Use secure credential handling consistent with the backend cookie configuration.
- Ensure cross-origin requests and cookies are configured correctly for the deployment environment.
- Treat all client-submitted identifiers and ride information as untrusted until validated by the backend.

## Project Scope

This repository is an educational ride-booking application inspired by Uber. It demonstrates frontend development, REST API integration, authentication flows, interactive maps, GPS updates, and real-time communication.

It should not be considered a production ride-hailing service without further security review, testing, operational monitoring, and deployment validation.
