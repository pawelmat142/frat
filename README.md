# JobHigh — Professional Network for the High-Altitude Industry

> **Note:** JobHigh is a **Progressive Web App (PWA)** designed primarily for mobile devices. Full responsive desktop layout is on the roadmap and will be refined in a soon iteration.

A fullstack web application connecting rope access technicians, industrial climbers, wind turbine specialists, and other height work professionals with employers, training providers, and equipment suppliers.

## The Problem

The high-altitude work industry — rope access, industrial climbing, wind energy, facade work — is a tight-knit but fragmented niche. Finding qualified specialists, assembling project teams, and staying in touch with the right people still happens largely through informal networks: word of mouth, Facebook groups, and phone calls.

This project was born out of a real need raised by colleagues working in the field. There was no dedicated platform to streamline how professionals in this industry find work, build teams, and communicate. **JobHigh** is the answer to that gap.

## What It Does

JobHigh is a professional networking and job marketplace platform tailored specifically to the high-altitude industry. Unlike generic job boards, it understands the domain — from certifications (IRATA, SPRAT) and work categories to availability windows and willingness to travel.

## Core Features

- **Worker Profiles** — Specialists create profiles with industry-specific fields: certifications with validity dates, work categories, max altitude, career start date, availability (date ranges or open), location, and spoken languages.
- **Advanced Worker Search** — Employers and team leads can filter candidates by certificates, work categories, communication languages, availability dates, and geographic proximity using geospatial queries.
- **Job Offers** — Companies post work offers with location (geocoded), start date, required languages, salary, and work category. Offers are searchable and filterable.
- **Real-Time Chat** — Direct messaging between users built on WebSockets, with unread counters, message history, and chat lifecycle management (open, leave, block, delete).
- **Social Connections** — A friendship/connection system with invite, accept, reject, and remove flows. Mutual connections surface in search results to help build trust.
- **Notifications** — Real-time in-app notifications for connection requests, acceptances, and other social events.
- **Training Center Integration** *(planned)* — Communication layer between workers and certified training providers for certifications and renewals.

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | NestJS (TypeScript) |
| Frontend | React (TypeScript) |
| Database | PostgreSQL + PostGIS |
| Auth | Firebase Authentication |
| Real-time | WebSockets (Socket.IO) |
| Media storage | Cloudinary |
| Containerization | Docker & Docker Compose |

## Project Structure

```
jobHigh/
├── backend/          # NestJS backend application
├── frontend/         # React frontend application
├── db/               # Database init scripts and migrations
├── shared/           # Shared TypeScript interfaces and DTOs
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Getting Started

```bash
# Development
docker compose -f docker-compose.dev.yml up

# Production
docker compose up
```

## API Documentation

TODO Swagger documentation
