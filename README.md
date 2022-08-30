
# Shoppi E-commerce-Website

## Table of contents

- [Introduction](#introduction)
- [Demo](#demo)
- [Run](#run)
- [Technology](#technology)
- [Features](#features)
- [License](#license)

## Introduction

A virtual ecommerce website using Node js, Express js, and MongoDb.

NOTE: Please read the RUN section before opening an issue.

## Demo

![screenshot](shoppi.png)
![screenshot](shoppi(1).png)
![screenshot](shoppi(2).png)
![screenshot](shoppi(3).png)
![screenshot](shoppi(4).png)
![screenshot](shoppi(5).png)
![screenshot](shoppi(6).png)
![screenshot](shoppi(7).png)

The application is deployed to AWS and can be accessed through the following link:

[Shoppi on AWS](https://shoppi.ml/)

The website resembles a real store and you can add products to your cart and wishlist and pay for them. If you want to try the checkout process, you can use the dummy card number/ upi/ Internet Bankinng provided by Razorpay for testing . Please <u><b>DO NOT</b></u> provide real card number and data.

In order to access the vendor panel on "/vendor" you need to signup and login.

In order to access the admin panel on "/admin" you need to provide the admin email and password.


## Run

To run this application, you have to set your own environmental variables. For security reasons, some variables have been hidden from view and used as environmental variables with the help of dotenv package. Below are the variables that you need to set in order to run the application:

- KEY_ID:     This is the razorpay key_Id (string).

- KEY_SECRET:  This is the razorpay key_Secret (string).

- TWILIO_SERVICE_ID: This is the Twilio Service Id (string).

- TWILIO_ACCOUNT_SID: This is the Twilio accountSID (string).

- TWILIO_AUTH_TOKEN: This is the Twilio AuthToken (string).

- PORT: Specify the port Number

After you've set these environmental variables in the .env file at the root of the project, and intsall node modules using  `npm install`

Now you can run `npm start` in the terminal and the application should work.

## Technology

The application is built with:

- Node.js 
- MongoDB
- Express 
- Bootstrap 
- AJAX
- JQuery
- Razorpay
- Twilio
- SweetAlert

Deployed in AWS EC2 instance with Nginx reverse proxy

## Features

The application displays a virtual phones and laptops store that contains virtual products and its information.

Users can do the following:

- Create an account, login or logout
- Browse available products added by the vendor
- Add products to the shopping cart and wishlist
- Delete products from the shopping cart and wishlist
- Display the shopping cart
- To checkout, a user must be logged in
- Checkout information is processed using razorpay and the payment is send to the admin
- The profile contains all the orders a user has made
- View invoices, download and cancel the orders
- Update their profile
- Search and filter products
 

Vendors can do the following:

- Create an account, login or logout
- Add products
- Veiw sale reports
- View, edit or delete their products
- Display the Orders done by the users
- Change the orders status
- Update their profile
- Send redemption requests to the admin


Admins can do the following:

- Login or logout to the admin panel
- Display sale report
- Manage users and vendors
- View all orders done by users
- View all products done by vendors
- View redeem requests and accept them

## License

[![License](https://img.shields.io/:License-MIT-blue.svg?style=flat-square)](http://badges.mit-license.org)

- MIT License
- Copyright 2022 © [ANAS MULLAPPALLY](https://github.com/anasmullappally)
