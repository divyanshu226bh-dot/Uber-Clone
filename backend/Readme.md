# Uber Clone — Backend

Backend API and real-time server for the Uber Clone application. The backend handles rider and captain registration, email OTP verification, login, token and session management, nearby-captain lookup, ride creation, ride acceptance, captain location updates, and the ride lifecycle using Socket.IO.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Application Architecture](#application-architecture)
- [REST API Reference](#rest-api-reference)
- [Authentication and Session Flow](#authentication-and-session-flow)
- [Real-Time Communication](#real-time-communication)
- [Ride Lifecycle](#ride-lifecycle)
- [Database Models](#database-models)
- [Implementation and Security Notes](#implementation-and-security-notes)

## Overview

The backend is built with Node.js and Express. MongoDB stores account, session, OTP, captain, and ride data. Socket.IO provides real-time communication between riders and captains.

The application exposes two REST API prefixes:

- `/api/auth` — registration, email verification, login, profile lookup, token rotation, and logout.
- `/api/maps` — nearby-captain lookup.

Ride creation, acceptance, arrival, OTP verification, ride completion, and live captain-location updates are handled through Socket.IO events in `server.js`, rather than dedicated REST endpoints in the supplied route files.

## Technology Stack

| Technology                      | Purpose                                  |
| ------------------------------- | ---------------------------------------- |
| Node.js                         | JavaScript runtime                       |
| Express 5                       | HTTP API and middleware                  |
| MongoDB                         | Application data storage                 |
| Mongoose                        | MongoDB models and database operations   |
| Socket.IO                       | Real-time client-server communication    |
| JSON Web Token (`jsonwebtoken`) | Access and refresh tokens                |
| `cookie-parser`                 | Reading cookies from incoming requests   |
| `cors`                          | Cross-origin request configuration       |
| `dotenv`                        | Loading environment variables            |
| Nodemailer                      | Sending email OTPs through Gmail OAuth2  |
| `morgan`                        | HTTP request logging                     |
| Nodemon                         | Restarting the server during development |

## Project Structure

```text
backend/
├── node_modules/
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── map.controller.js
│   │   └── auth.controller.js
│   ├── models/
│   │   ├── captain.model.js
│   │   ├── otp.model.js
│   │   ├── ride.model.js
│   │   ├── session.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── map.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   └── email.service.js
│   └── utils/
│       └── utils.js
├── .env
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
├── readme.md
└── server.js
```

### Main file responsibilities

| File                                 | Responsibility                                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `app.js`                             | Configures Express, request logging, body parsing, cookies, CORS, and REST route prefixes.                                 |
| `server.js`                          | Connects to MongoDB, creates the HTTP server and Socket.IO instance, handles real-time ride events, and starts the server. |
| `src/config/config.js`               | Loads environment variables and exports application configuration.                                                         |
| `src/config/database.js`             | Connects to MongoDB using Mongoose.                                                                                        |
| `src/controllers/auth.controller.js` | Implements rider/captain registration, email verification, login, profile lookup, token rotation, and logout.              |
| `src/controllers/map.controller.js`  | Looks up nearby active captains and handles the nearby-captains API request.                                               |
| `src/routes/user.routes.js`          | Defines authentication-related HTTP routes.                                                                                |
| `src/routes/map.routes.js`           | Defines the nearby-captains HTTP route.                                                                                    |
| `src/models/user.model.js`           | Defines the rider account schema.                                                                                          |
| `src/models/captain.model.js`        | Defines captain accounts, vehicle details, availability status, location, and socket ID.                                   |
| `src/models/otp.model.js`            | Stores email verification OTP hashes.                                                                                      |
| `src/models/session.model.js`        | Stores refresh-token hashes and session metadata.                                                                          |
| `src/models/ride.model.js`           | Defines ride details, coordinates, fare, OTP, payment method, and ride status.                                             |
| `src/services/email.service.js`      | Configures Nodemailer with Gmail OAuth2 and sends emails.                                                                  |
| `src/utils/utils.js`                 | Generates six-digit email OTPs and creates their HTML email template.                                                      |

## Prerequisites

Before running the backend, install and configure:

- Node.js and npm.
- MongoDB, either a local instance or a MongoDB Atlas database.
- Gmail OAuth2 credentials for the email verification service.
- The frontend application, if you want to test the complete rider and captain experience.

## Installation and Setup

Run the following commands from the `backend` directory:

```bash
npm install
```

Create a `.env` file in the backend root and configure the environment variables listed below.

Start the development server using the script defined in `package.json`:

```bash
npm run nod
```

The `nod` script runs `nodemon server.js`. The project does not define an `npm run dev` script in the supplied `package.json`.

## Environment Variables

The application reads the following variables in `src/config/config.js` and `src/services/email.service.js`.

| Variable               | Purpose                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `PORT`                 | Port on which the HTTP server listens.                                        |
| `MONGO_URI`            | MongoDB connection URI.                                                       |
| `JWT_SECRET`           | Secret used to sign and verify JWTs.                                          |
| `CLIENT_URL`           | Client URL configuration; defaults to `http://localhost:5173` in `config.js`. |
| `GOOGLE_CLIENT_ID`     | Google OAuth2 client ID for email delivery.                                   |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret.                                                  |
| `GOOGLE_REFRESH_TOKEN` | OAuth2 refresh token used by Nodemailer.                                      |
| `GOOGLE_USER`          | Gmail account used as the email sender.                                       |

Example `.env` template:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_google_oauth_refresh_token
GOOGLE_USER=your_gmail_address
```

Replace every placeholder with your own configuration. Do not commit `.env` or expose real credentials in your repository.

**Configuration note:** `app.js` currently hardcodes the Express CORS origin to `http://localhost:5173`; the `CLIENT_URL` variable is not used by that CORS configuration in the supplied code. Socket.IO separately permits `http://localhost:5173` and `http://localhost:3000`.

## Running the Server

The server startup sequence in `server.js` is:

1. Load the Express application and backend configuration.
2. Configure DNS resolution using `8.8.8.8` for MongoDB Atlas SRV lookups.
3. Attempt the MongoDB connection.
4. Create an HTTP server around the Express application.
5. Initialize Socket.IO with its own CORS configuration.
6. Store the Socket.IO instance on the Express application as `io`.
7. Register the socket connection and ride-event handlers.
8. Start listening on `config.PORT`.

The application logs a database connection error if the initial database connection fails, but the supplied code does not explicitly terminate the process in that catch block. Successful operation therefore depends on a valid database connection.

## Application Architecture

```text
React / Vite Frontend
        |
        | HTTP requests
        v
Express Application (app.js)
        |
        ├── /api/auth  ──> user.routes.js
        |                    └── auth.controller.js
        |
        └── /api/maps  ──> map.routes.js
                             └── map.controller.js

React / Vite Frontend
        |
        | Socket.IO connection and events
        v
HTTP + Socket.IO Server (server.js)
        |
        ├── Ride creation and acceptance
        ├── Captain location updates
        ├── Captain arrival
        ├── Ride OTP verification
        └── Ride completion
        |
        v
MongoDB through Mongoose models
```

The `io` instance is also attached to the Express application with `app.set("io", io)`, allowing application code to retrieve it through `req.app.get("io")` when needed.

## REST API Reference

All paths below are relative to the route prefixes mounted in `app.js`. The HTTP methods and paths are taken from the supplied route files.

### Authentication routes

Base path: `/api/auth`

| Method | Endpoint                     | Purpose                                                                                                  |
| ------ | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/auth/register`         | Register a rider and initiate email OTP verification.                                                    |
| `POST` | `/api/auth/register-captain` | Register a captain with vehicle details and initiate email OTP verification.                             |
| `POST` | `/api/auth/verify-email`     | Verify an email address using an OTP.                                                                    |
| `POST` | `/api/auth/login`            | Authenticate a rider.                                                                                    |
| `POST` | `/api/auth/login-captain`    | Authenticate a captain.                                                                                  |
| `GET`  | `/api/auth/get-me`           | Fetch the authenticated account profile using a Bearer access token.                                     |
| `GET`  | `/api/auth/rotate-token`     | Rotate refresh and access tokens using the refresh-token cookie.                                         |
| `GET`  | `/api/auth/logout`           | Revoke the session associated with the refresh-token hash and clear the cookie.                          |
| `GET`  | `/api/auth/logout-all`       | Revoke active sessions associated with the account identified by the refresh token and clear the cookie. |

**Important route-name detail:** the uploaded `src/routes/user.routes.js` registers `/register-captain`. If the frontend currently calls `/api/auth/captain-register`, update either the route definition or the frontend request so both sides use the same path. The two names are not interchangeable.

#### 1. Register a rider

`POST /api/auth/register`

The controller reads `username`, `email`, and `password` from the JSON request body.

On successful registration, it creates a rider account, generates a six-digit OTP, stores the OTP hash, and attempts to send the verification email.

The successful response has status `201` and includes a message, `username`, `email`, and `verified`.

If a rider with the same username or email is found, the controller returns `409 Conflict`.

#### 2. Register a captain

`POST /api/auth/register-captain`

The controller reads `username`, `email`, `password`, and `vehicle`.

The vehicle object must include:

- `color`
- `plate`
- `capacity`
- `vehicleType` — one of `car`, `auto`, or `moto`

On success, the controller creates the captain account, generates and stores an OTP hash, and attempts to send the verification email. The successful response has status `201`.

A missing required vehicle field returns `400 Bad Request`. An existing username or email in the captain collection returns `409 Conflict`.

#### 3. Verify email

`POST /api/auth/verify-email`

The controller reads `email` and `otp` from the request body. It hashes the supplied OTP, looks for a matching OTP record, marks the associated rider or captain as verified, and deletes OTP records for that account.

A matching OTP returns status `200`. An invalid OTP returns `400 Bad Request`.

#### 4. Login

`POST /api/auth/login`

`POST /api/auth/login-captain`

Both endpoints accept `email` and `password`.

The controller checks that the account exists, checks that its email is verified, and compares the submitted password hash with the stored value. Successful login creates a refresh-token session and returns an access token in the JSON response. The refresh token is set in an HTTP-only cookie.

Access tokens are configured to expire after 10 minutes. Refresh tokens are configured to expire after seven days.

#### 5. Fetch the current account profile

`GET /api/auth/get-me`

Send the access token in the `Authorization` header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The controller verifies the JWT and searches the rider collection first, then the captain collection. The response includes `username`, `email`, and `role`.

The endpoint returns `401` if the Bearer token is missing and `404` if the account cannot be found. The supplied controller does not wrap `jwt.verify()` in a local error handler, so invalid or expired tokens may propagate to Express's error handling.

#### 6. Rotate tokens

`GET /api/auth/rotate-token`

This endpoint reads the `refreshToken` cookie, verifies the refresh token, hashes it, and searches for a matching non-revoked session. If a session is found, it generates a new refresh token and access token, replaces the stored refresh-token hash, updates the cookie, and returns the new access token.

The controller returns `401` if the refresh cookie is missing or no valid session matches.

#### 7. Logout

`GET /api/auth/logout`

This endpoint hashes the refresh token from the cookie, revokes a matching non-revoked session, clears the `refreshToken` cookie, and returns a success message.

If the cookie is missing, it returns `401`.

#### 8. Logout from all devices

`GET /api/auth/logout-all`

This endpoint verifies the refresh token, marks all non-revoked sessions belonging to the token's account as revoked, clears the cookie, and returns a success message.

If the cookie is missing, it returns `401`.

### Map routes

Base path: `/api/maps`

| Method | Endpoint                        | Purpose                                            |
| ------ | ------------------------------- | -------------------------------------------------- |
| `GET`  | `/api/maps/get-nearby-captains` | Fetch active captains within the requested radius. |

#### Get nearby captains

`GET /api/maps/get-nearby-captains`

Query parameters read by `map.controller.js`:

| Parameter | Required | Purpose                                                              |
| --------- | -------- | -------------------------------------------------------------------- |
| `ltd`     | Yes      | Latitude value expected by the controller.                           |
| `lng`     | Yes      | Longitude value expected by the controller.                          |
| `radius`  | No       | Search radius in kilometres; defaults to `5` in the helper function. |

Example request:

```http
GET /api/maps/get-nearby-captains?ltd=26.9124&lng=75.7873&radius=5
```

The controller checks that `ltd` and `lng` are present. If either is missing, it returns `400` with an error message. If the query succeeds, it returns the matching captain documents with status `200`; if the lookup throws, it returns `500`.

The helper `getCaptainsInRadius()` filters captains by `status: "active"` and uses MongoDB's `$geoWithin` with `$centerSphere` to apply a radius-based search.

**Implementation note:** the helper currently passes coordinates as `[[parseFloat(ltd), parseFloat(lng)], ...]`. Verify the coordinate order against the intended latitude/longitude convention and your stored data before relying on geographic accuracy. The endpoint returns matching captain documents directly; it does not explicitly project a restricted response shape in the supplied controller.

## Authentication and Session Flow

### Registration and email verification

1. The rider or captain submits registration details.
2. The relevant controller checks for an existing account in the corresponding collection.
3. The password is hashed using Node.js `crypto` with SHA-256.
4. The account is created with `verified` initially set to `false`.
5. A six-digit OTP is generated.
6. The SHA-256 hash of the OTP is stored in the OTP collection.
7. Nodemailer attempts to send the OTP email through Gmail OAuth2.
8. The client submits the email address and OTP to `/api/auth/verify-email`.
9. The controller hashes the submitted OTP, checks for a match, marks the account as verified, and deletes its OTP records.

### Login and token rotation

1. The user submits an email address and password.
2. The controller checks account existence and email verification.
3. The submitted password is hashed and compared with the stored password hash.
4. The server generates a JWT access token with a `10m` expiry and a refresh token with a `7d` expiry.
5. The refresh-token hash, account ID, IP address, and user-agent information are stored in a session document.
6. The refresh token is set in an HTTP-only cookie, while the access token is returned in the response JSON.
7. When a new access token is required, `/api/auth/rotate-token` validates the refresh token against the stored session and replaces its hash with the hash of a newly issued refresh token.
8. Logout revokes the matching session; logout-all revokes all active sessions associated with the account.

### Cookie configuration

The refresh-token cookie is configured with:

- `httpOnly: true`
- `secure: process.env.NODE_ENV === "production"`
- `sameSite: "lax"`
- A seven-day `maxAge`

The frontend must send requests with credentials enabled when it needs the browser to include or accept the refresh-token cookie across origins.

## Real-Time Communication

Socket.IO is initialized in `server.js` and shares the HTTP server created around the Express application.

### Socket rooms

| Room                | Purpose                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `user_${userId}`    | Rider-specific events.                                                          |
| `captain_${userId}` | Captain-specific events.                                                        |
| `captains`          | Broadcast ride requests to connected captains that have joined the shared room. |

Clients join rooms by emitting the `join` event with `userId` and `userType`. Captains join both their individual room and the shared `captains` room. Other client types join a `user_${userId}` room.

### Socket event reference

The following events are registered by the supplied `server.js`.

| Event                           | Direction                             | Purpose                                                                                   |
| ------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `connection`                    | Client → server lifecycle             | Handles a new Socket.IO connection.                                                       |
| `join`                          | Client → server                       | Joins the rider or captain rooms.                                                         |
| `create-ride`                   | Rider → server                        | Validates the ride request, creates a ride document, and notifies the rider and captains. |
| `ride-created`                  | Server → rider room                   | Sends the newly created ride ID, OTP, and status.                                         |
| `new-ride-popup`                | Server → `captains` room              | Notifies connected captains about a new ride request.                                     |
| `accept-ride`                   | Captain → server                      | Attempts to assign a captain to a pending ride.                                           |
| `ride-accepted`                 | Server → rider room                   | Sends the accepted ride details and captain information to the rider.                     |
| `ride-accept-confirmed`         | Server → accepting socket             | Confirms acceptance and returns ride details to the accepting captain's socket.           |
| `update-location-captain`       | Captain → server                      | Saves the captain's latest coordinates and socket ID.                                     |
| `captain-location-${captainId}` | Server → all connected sockets        | Broadcasts the captain's latest location using a captain-specific event name.             |
| `captain-arrived`               | Captain → server; server → rider room | Validates arrival and notifies the rider.                                                 |
| `ride-status-updated`           | Server → captain room                 | Notifies the captain of the arrival status update.                                        |
| `verify-ride-otp`               | Captain → server                      | Validates the ride OTP and starts an eligible ride.                                       |
| `otp-verification-result`       | Server → requesting socket            | Reports whether OTP verification succeeded.                                               |
| `ride-started`                  | Server → rider and captain rooms      | Notifies both parties that the ride has started.                                          |
| `complete-ride`                 | Captain → server                      | Validates destination proximity and completes an ongoing ride.                            |
| `ride-completed`                | Server → rider and captain rooms      | Notifies both parties that the ride is complete.                                          |
| `ride-error`                    | Server → requesting socket            | Reports ride-related validation or processing errors.                                     |
| `disconnect`                    | Client → server lifecycle             | Handles a disconnected socket.                                                            |

### Captain location updates

When the server receives `update-location-captain`, it reads `captainId` and `location`. It expects the location object to contain `ltd` and `lng`, saves these values and the socket ID to the captain document, and emits a location event named `captain-location-${captainId}`.

In the current implementation, that event is emitted with `io.emit(...)`, which broadcasts it to all connected sockets—not just the assigned rider. This is an important privacy and access-control limitation to address before production deployment.

## Ride Lifecycle

The ride status is stored in MongoDB and defined by the ride model.

```text
pending
   |
   | Captain accepts
   v
accepted
   |
   | Captain is within 50 metres of pickup
   v
arrived
   |
   | Correct four-digit OTP
   v
ongoing
   |
   | Captain is within 50 metres of destination
   v
completed
```

The model also supports `cancelled`, but the supplied `server.js` does not register a cancellation event.

### 1. Create a ride

The rider emits `create-ride` with `userId`, `pickup`, `destination`, `pickupCoords`, `destinationCoords`, `vehicleType`, and `price`.

The server validates the rider ID, addresses, coordinates, and positive fare, checks that the rider exists, generates a four-digit ride OTP, and creates a ride document with status `pending`.

It emits `ride-created` to the rider's room and `new-ride-popup` to the shared captain room.

### 2. Accept a ride

The captain emits `accept-ride` with `rideId`, `userId`, and `captainData`, which must include the captain's `_id`.

The server validates the IDs, checks that the captain exists, and conditionally changes the matching rider's ride from `pending` to `accepted` while assigning the captain. If the ride is no longer pending or cannot be matched, acceptance fails.

On success, the server emits `ride-accepted` to the rider and `ride-accept-confirmed` to the accepting socket.

### 3. Mark captain arrival

The captain emits `captain-arrived` with `rideId`, `userId`, and `captainId`.

The server checks the ride assignment and current status, reads the captain's last saved location, and calculates the distance to the pickup coordinates. The status changes from `accepted` to `arrived` only if the captain is within 50 metres.

The rider receives `captain-arrived`; the captain room receives `ride-status-updated`.

### 4. Verify the ride OTP

The captain emits `verify-ride-otp` with `rideId`, `captainId`, and the four-digit `otp`.

The server checks the OTP format, retrieves the assigned ride in `arrived` status, explicitly selects the otherwise excluded OTP field, and compares the submitted OTP. A conditional database update changes the status to `ongoing`.

The requesting socket receives `otp-verification-result`, and both the rider and captain rooms receive `ride-started`.

### 5. Complete the ride

The captain emits `complete-ride` with `rideId` and `captainId`.

The server checks that the ride is assigned to that captain and is `ongoing`. It then checks the captain's saved location and calculates the distance to the destination. The ride changes to `completed` only if the captain is within 50 metres.

The server emits `ride-completed` to the rider and captain rooms. Invalid IDs, missing location, an incorrect ride state, or excessive distance result in a `ride-error` event.

## Database Models

### User model — `user.model.js`

Stores rider account information:

- `username`
- `email`
- `password`
- `verified`
- `role` (defaults to `rider`)

Username and email are required and unique in the user collection.

### Captain model — `captain.model.js`

Stores captain account and vehicle information:

- `username`, `email`, `password`, `verified`, and `role`
- `status` (`active` or `inactive`, defaulting to `inactive`)
- `vehicle.color`, `vehicle.plate`, `vehicle.capacity`, and `vehicle.vehicleType`
- `location.ltd` and `location.lng`
- `socketId`

The vehicle type is restricted to `car`, `auto`, or `moto`. The schema also defines a compound index on the stored latitude and longitude fields.

### OTP model — `otp.model.js`

Stores:

- `email`
- `user` — the associated account ID
- `otpHash`

Mongoose timestamps are enabled. The verification controller deletes OTP records for the account after successful verification.

### Session model — `session.model.js`

Stores:

- `user`
- `refreshTokenHash`
- `ip`
- `userAgent`
- `revoked`

Mongoose timestamps are enabled. Refresh tokens themselves are not stored in the session document; their hashes are stored instead.

### Ride model — `ride.model.js`

Stores:

- Rider and captain references
- Pickup and destination addresses
- Pickup and destination coordinates
- Fare, duration, and distance
- Ride status
- OTP
- Payment method

Coordinates use `lat` and `lng` fields. The ride status enum contains `pending`, `accepted`, `arrived`, `ongoing`, `completed`, and `cancelled`. The payment method enum contains `cash` and `online`, defaulting to `cash`. The OTP field is marked `select: false` and is required.

## Implementation and Security Notes

This section describes the supplied implementation rather than making a general claim that the backend is production-secure.

- **Password hashing:** The authentication controller uses SHA-256 directly for passwords. SHA-256 is not a password-hashing algorithm designed to resist brute-force attacks. Use a password-hashing function such as Argon2id or bcrypt before deploying with real accounts.
- **Authorization:** `get-me` verifies a Bearer JWT, but the supplied Socket.IO handlers accept IDs from client-emitted payloads and do not show a Socket.IO authentication middleware that verifies those identities. Do not assume a room name or client-supplied ID proves identity.
- **Location privacy:** Captain coordinates are broadcast using `io.emit`, making them available to all connected sockets. Restrict location updates to authorized recipients and validate that the sender is the captain they claim to be.
- **Refresh-token handling:** Rotation checks the stored refresh-token hash and `revoked` flag, but logout and logout-all do not apply identical session validation checks. Review these flows together before production use.
- **OTP handling:** Email OTP hashes are stored in the OTP collection, and ride OTPs are stored on ride documents with the ride OTP excluded from normal Mongoose selection. The supplied code does not show OTP expiry, rate limiting, or an attempt limit.
- **Email errors:** `sendEmail()` catches and logs delivery errors rather than rethrowing them. Consequently, a registration controller can return a successful registration response even if the verification email could not be delivered.
- **CORS:** Express and Socket.IO have separate CORS configurations. Update both deliberately when changing the frontend origin.
- **Environment variables:** Never commit real database URIs, JWT secrets, or Gmail OAuth2 credentials.
- **Error handling:** Some controller paths call `jwt.verify()` without a local `try/catch`. Invalid or expired tokens should be handled consistently by centralized error middleware or explicit controller handling.
- **Testing:** The supplied `package.json` has a placeholder `test` script that exits with an error. Automated test coverage is not configured by that script.

## Current Scope

The supplied backend implements REST endpoints for authentication and nearby-captain lookup, alongside Socket.IO events for ride creation and the main ride lifecycle. The route files do not define REST endpoints for creating, accepting, starting, or completing rides; those operations are implemented as socket event handlers in `server.js`.

For a complete end-to-end deployment, the frontend and backend must use matching endpoint paths, socket event names, payload shapes, and environment configuration.
