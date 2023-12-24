<img width="100%" alt="itineraryX logo" src="https://raw.githubusercontent.com/xrchitron/itineraryX/main/server/public/img/itineraryX_logo.jpeg">

# itineraryX [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

A website for **co-editing itinerary and discussing plans**.

## Table of contents

- [Introduction](#introduction)
   - [Get Start on itineraryX](#get-start-on-itineraryx)
- [Test account](#test-account)
- [Technical Detail](#technical-detail)
   - [Co-editing itinerary](#co-editing-itinerary)
   - [Chatroom](#chatroom)
   - [Email notification](#email-notification)
   - [Database protection](#database-protection)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo](#demo)
   - [Creating User](#creating-user)
   - [Reset password](#reset-password)
   - [CRUD itinerary](#crud-itinerary)
   - [Adding participant into itinerary](#adding-participant-into-itinerary)
   - [Editing itinerary](#editing-itinerary)
   - [View mode & Co-editing](#view-mode--co-editing)
   - [Chatroom with image and message](#chatroom-with-image-and-message)
   - [Place info and redirecting to Google Maps](#place-info-and-redirecting-to-google-maps)
- [Team member](#team-member)
- [License](#license)

## Introduction

**itineraryX** is a travel-centric app designed to simplify the process of planning and collaboratively editing your ideal travel itinerary.

#### Get Start on itineraryX :
- [itineraryX Website](https://itinerary-x.vercel.app/)
- [itineraryX API Website](https://www.itineraryx.online/)

## Test account :
Welcome to use the accounts below to enjoy itineraryX co-editing service.
- Account_01 (User01): 
   ```
   email : user01@example.com 
   password: 12345678
   ```
- Account_02 (User02): 
   ```
   email : user02@example.com 
   password: 12345678
   ```

## Technical Detail

### Co-editing itinerary
- Add destination info with Google Map Api to get calculated duration value from place to place.
- Using Socket.IO room to separate itinerary rooms, providing co-edit when other planer update the itinerary detail.

### Chatroom
- Many-to-many online chatroom with Socket.IO.
- Upload images with AWS S3 and multer.

### Email notification
- Email notification from subscriber to subscriber with AWS SES
- Become verified identities in AWS SES

### Database protection
- Utilize Object-Relational Mapping (ORM) to mitigate the risk of SQL injection attacks
- Apply Redis to temperately store frequent place data to protect database from high-frequent searching
- Apply transaction to delete reference data

## System Architecture

- Serve application on AWS Elastic Beanstalk
- Speed up searching speed with Redis on AWS EC2
- CRUD MySQL database on AWS RDS via Sequelize
- Store image in AWS S3
- Send Email via AWS SES
- Get place detail via Google Map API

<div align="center">
<img width="90%" alt="System Architecture" src="https://raw.githubusercontent.com/xrchitron/itineraryX/main/server/public/img/system_architecture_diagram.jpg"/>
</div>

## Database Schema
<div align="center">
<img width="90%" alt="database schema" src="https://raw.githubusercontent.com/xrchitron/itineraryX/main/server/public/img/itineraryX_ERD.jpg"/>
</div>

## WebSocket Structure
<div align="center">
<img width="90%" alt="webSocket structure" src="https://raw.githubusercontent.com/xrchitron/itineraryX/main/server/public/img/socket_type.jpg"/>
</div>

## Features

**Co-editing itinerary**
- Add participant into itinerary via email
- Add destinations to itinerary
- Calculate duration value between destinations
- Show planned route on the Google Map
- Redirect to the place via google map url
- CRUD operations ( Create / Read / Update / Delete )

**Chatroom**
- Many-to-many online chatroom
- Discuss the plan with the route at the same time

**Email notification**
- Reset password email would be sent when user forget password with 1 hour token
- Inviting email would be sent when adding a new participant

**Message notification**
- Receive notifications form sender
- update message status from unread to read
- Redirect to the url which the message mentioned

**Social Media**
- Change personal avatar and username
- Sign-up, sign-in and logout

## Tech Stack
**Client:**  Socket.IO / React / MaterialUI
 ( [Front-End Repository](https://github.com/Chious/itineraryX) )

**Server:** Node / Express / Nginx / Redis / Socket.IO / multer

**Database:** AWS RDS MySQL

**AWS Cloud service:** Elastic Beanstalk / Route 53 / EC2 / S3 / SES

**API Test:** mocha / supertest

## Demo
### Creating User
- Home page, Register, Login, Logout.
- Basic CRUD and upload image to AWS S3.

- <video src=https://github.com/xrchitron/itineraryX/assets/125111607/cb02ccf9-5c81-4b12-a98a-48dcb6884dfb>
   Sorry, your browser doesn't support embedded videos. ![Creating User Demo](https://youtu.be/k7VQXnbHTf0)
</video>

### Reset password
- Reset password with 1-hour token.
- Send email via AWS SES.

- <video src=https://github.com/xrchitron/itineraryX/assets/125111607/b99b0d78-c357-4642-97e4-c1c82b49cd4e>
   Sorry, your browser doesn't support embedded videos. ![Reset password Demo](https://youtu.be/sZD8jHsTyc8)
</video>

### CRUD itinerary
- Basic CRUD itinerary.

- <video src=https://github.com/xrchitron/itineraryX/assets/125111607/34a745d3-0aa0-467d-8d1e-bd98d5c51f42>
   Sorry, your browser doesn't support embedded videos. ![CRUD itinerary Demo](https://youtu.be/APgg0Q4EHb0)
</video>

### Adding participant into itinerary
- Adding participant into itinerary.
- Receiver will get the notification via socket.io.
- Redirect to the specific itinerary.

- <video src=https://github.com/xrchitron/itineraryX/assets/125111607/d4ba1db8-3bf4-4a1f-a29c-2c0ab4bb2421>
   Sorry, your browser doesn't support embedded videos. ![Adding participant into itinerary Demo](https://youtu.be/2vJXtdnQvx0)
</video>

### Editing itinerary
- CRUD the itinerary and get place info from Google Map API.
- Fasten API server response time with Redis.
- Switch transportation mode.
- Unreasonable Stay period warning.

- <video src=https://github.com/xrchitron/itineraryX/assets/125111607/baa4e888-2079-48ec-8b4c-aad1aeac9484>
   Sorry, your browser doesn't support embedded videos. ![Editing itinerary Demo](https://youtu.be/ZhT8dwD5CD0)
</video>

### View mode & Co-editing
- People can visit the page without login (uneditable & no real-time update).
- When users log in, they can co-edit the itinerary in real-time with socket.IO.

- <video src=https://github.com/xrchitron/itineraryX/assets/125111607/0e34f491-3bb3-474c-b2e5-f0d2e65409a1>
   Sorry, your browser doesn't support embedded videos. ![View mode & Co-editing Demo](https://youtu.be/lp_O-Wer46c)
</video>

### Chatroom with image and message
- Messaging and sending email in the chatroom via socket.io.

- <video src=https://github.com/xrchitron/itineraryX/assets/125111607/09d2e8a5-612c-40e1-9e47-17ced1a10b9c>
   Sorry, your browser doesn't support embedded videos. ![Chatroom with image and message Demo](https://youtu.be/1s_RJ5KT37A)
</video>

### Place info and redirecting to Google Maps
- Checking place information and redirect to google map for detail and navigation

- <video src=https://github.com/xrchitron/itineraryX/assets/125111607/6a5d8fe5-743c-46ed-ae72-a5e053ee01d3>
   Sorry, your browser doesn't support embedded videos. ![Place info and redirecting to Google Maps Demo](https://youtu.be/yG2qw4PxRqs)
</video>

## Team member

- Back-end | PM - [Chester](https://github.com/xrchitron)
- Front-end - [Sam](https://github.com/Chious)
- Front-end - [Ching](https://github.com/Ching0810)
- Front-end - [Jessie](https://github.com/jessie758)

## License
[MIT](https://choosealicense.com/licenses/mit/)