<img width="100%" alt="itineraryX logo" src="https://raw.githubusercontent.com/xrchitron/itineraryX/main/server/public/img/itineraryX_logo.jpeg">

# itineraryX [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

A website for **co-editing itinerary and discussing plans**.

## Introduction

**itineraryX** is used for co-editing itinerary and discussing plans in one platform

#### Get Start on itineraryX : [itineraryX Website](https://www.itineraryx...)

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
- Add destination info with Google Map Api and calculate duration value from place to place.
- Using Socket.IO room to separate itinerary rooms, providing co-edit correctly to planers.
- Apply Redis to temperately store frequent place data to protect database from high-frequent searching

### Chatroom
- Many-to-many online chatroom using Socket.IO room.
- Upload images with AWS S3 and multer.

## System Architecture

- Serve application on AWS Elastic Beanstalk
- DataBase is on AWS RDS MySQL cloud service
- Speed up searching speed with Redis on AWS EC2

<div align="center">
<img width="90%" alt="System Architecture" src="..."/>
</div>

## Database Schema
<div align="center">
<img width="90%" alt="database schema" src="https://raw.githubusercontent.com/xrchitron/itineraryX/main/server/public/img/itineraryX_ERD-01.jpg"/>
</div>

## Features

**Co-editing itinerary**
- Add destinations to itinerary
- Calculate duration value between destinations
- Show planned route on the Google Map
- Redirect to the place via google map url
- CRUD operations ( Create / Read / Update / Delete )

**Chatroom**
- Many-to-many online chatroom
- Discuss the plan with the route at the same time

**Add participant notification**
- Inviting Email would be sent when adding a new participant

**Social Media**
- Friend system
- Following other users
- Change personal avatar
- Sign-up and sign-in

## Tech Stack
**Client:**  Socket.IO / React / MaterialUI
 ( [Front-End Repostority](https://github.com/Chious/itineraryX) )

**Server:** Node / Express / Nginx / Socket.IO / multer

**Database:** AWS RDS MySQL

**AWS Cloud service:** EC2 / S3 / SES

**API Test:** mocha / supertest


## License
[MIT](https://choosealicense.com/licenses/mit/)

## Links
- [itineraryX](http://itinerary-x-production-dev.ap-northeast-1.elasticbeanstalk.com/)