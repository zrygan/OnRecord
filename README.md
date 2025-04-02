# OnRecord

<!-- TODO -->

## How To:

See prerequisites or packages before running the code below.

Open Command Prompt terminal and type the following line:

```
nodemon js/server.js
```

Then, open another Command Prompt terminal and type the following line:

```
mongod --dbpath __YOUR_DB_PATH__
```

## Technologies and Prerequisites

This project uses the following technologies

- Node
- Express
- MongoDB
- Mongoose
- BCrypt

### Installing these technologies

To install the required packages, run the following command in your project directory:

For Windows:

```
Get-Content requirements.txt | ForEach-Object { npm install $_ }
```

For Linux:

```
xargs npm install < requirements.txt
```

Next, [MongoDB Community Server](https://www.mongodb.com/try/download/community) must also be downloaded.

### Running the app locally

1. To run the app locally, run this code.

```
node js/server.js
```

2. Enter `localhost:3000` in your web browser while the app is running.

3. To access the app online, you may access this link: https://onrecord-7bis.onrender.com
