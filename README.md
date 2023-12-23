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
- Email notification from subscriber to subscriber with AWS SES (in the sandbox)

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

- [Creating User Demo](https://www.youtube.com/watch?v=k7VQXnbHTf0)

### Reset password
- Reset password with 1-hour token.
- Send email via AWS SES.

- [Reset Password Demo](https://www.youtube.com/watch?v=sZD8jHsTyc8)

### CRUD itinerary
- Basic CRUD itinerary.

- [CRUD Itinerary Demo](https://www.youtube.com/watch?v=APgg0Q4EHb0)

### Adding participant into itinerary
- Adding participant into itinerary.
- Receiver will get the notification via socket.io.
- Redirect to the specific itinerary.

- [Adding Participant Demo](https://www.youtube.com/watch?v=2vJXtdnQvx0)

### Editing itinerary
- CRUD the itinerary and get place info from Google Map API.
- Fasten API server response time with Redis.
- Switch transportation mode.
- Unreasonable Stay period warning.

- [Editing Itinerary Demo](https://www.youtube.com/watch?v=ZhT8dwD5CD0)

### View mode & Co-editing
- People can visit the page without login (uneditable & no real-time update).
- When users log in, they can co-edit the itinerary in real-time with socket.IO.

- [View Mode & Co-editing Demo](https://www.youtube.com/watch?v=lp_O-Wer46c)

### Chatroom with image and message
- Messaging and sending email in the chatroom via socket.io.

- [Chatroom with Image and Message Demo](https://www.youtube.com/watch?v=1s_RJ5KT37A)

## Team member

- Back-end | PM - [Chester](https://github.com/xrchitron)
- Front-end - [Sam](https://github.com/Chious)
- Front-end - [Ching](https://github.com/Ching0810)
- Front-end - [Jessie](https://github.com/jessie758)

## License
[MIT](https://choosealicense.com/licenses/mit/)