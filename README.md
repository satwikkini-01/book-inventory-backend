# Book Inventory Backend API

This project is a simple RESTful API for managing a book inventory. It is built using Node.js, Express, and MongoDB. The API allows users to perform CRUD operations (Create, Read, Update, Delete) on a collection of books.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Redis Installation](#redis-installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Search & Pagination](#search--pagination)
- [Error Handling](#error-handling)
- [Caching with Redis](#caching-with-redis)

## Features

- **CRUD Operations**: Create, Read, Update, and Delete books in the inventory.
- **Search Functionality**: Search books by title, author, price or availability of the book.
- **Pagination**: Handle large datasets with pagination in the GET endpoint.
- **Input Validation**: Ensure all inputs are valid and prevent invalid data entry.
- **Error Handling**: Gracefully handle errors with appropriate HTTP status codes.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/) (v12 or higher)
- [npm](https://www.npmjs.com/get-npm) (v6 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or accessible via a connection URI)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/satwikkini-01/book-inventory-backend.git
   cd book-inventory-backend

2. **Install Dependencies:**

    ```bash
    npm install 

## Redis Installation

- To use Redis with this application, make sure Redis is installed and running. You can install Redis using Homebrew with the following command:
- To use Redis with Docker, follow these steps:
1. **Pull the Redis Docker Image**
   Pull the official Redis image from Docker Hub:
   ```bash
   docker pull redis

2. **Run Redis Container**
   Start a Redis container with the following command:
   ```bash
   docker run --name redis -d -p 6379:6379 redis
- `--name redis` assigns a name to the container.
- `-d` runs the container in detached mode.
- `-p 6379:6379` maps port 6379 of the container to port 6379 on your host machine.

3. **Verify Redis is Running**
   Check if the Redis container is up and running:
   ```bash
   docker ps
   ```

   This command should list the Redis container with port 6379 exposed.

4. **Connect to Redis**
   To connect to the Redis server running inside the container, use the Redis CLI:
   ```bash
   docker exec -it redis redis-cli
   ```



## Environment Variables

Create a .env file in the root directory of your project. This file should contain the following environment variables:

    PORT=3000
    MONGO_URL=mongodb://localhost:27017/bookInventoryDB

## Running the Application

Start the server with the following command:
    
    npm start

If you prefer to use nodemon for automatic restarts on file changes, you can use:
    
    npm run dev

The server will start on http://localhost:3000 (or the port you configured in the .env file).

## API Endpoints

**Create a Book**
- **Endpoint:** POST /api/books.
- **Description:** Add a new book to the inventory.
- **Request Body:**
        
        {
        "title": "Book Title",
        "author": "Author Name",
        "genre": "Fiction",
        "publishedDate": "2023-09-02",
        "price": 19.99,
        "inStock": true
        }
        
- **Response:** Returns the created book object.


**Get All Books**
- **Endpoint:** `GET /api/books`
- **Description:** Retrieve all books in the inventory with optional search and pagination.
- **Query Parameters:**
  - `title`: Search by book title (optional).
  - `author`: Search by author name (optional).
  - `price`: Filter by exact price (optional).
  - `inStock`: Filter by stock status (true or false, optional).
  - `page`: Page number for pagination (default: 1).
  - `lim`: Number of items per page (default: 50).
- **Response:** Returns a paginated list of books matching the search criteria, along with pagination details.

**Get a Single Book by ID**
- **Endpoint:** `GET /api/books/:id`
- **Description:** Retrieve a book by its ID.
- **Response:**
  - **200 OK:** Returns the book object if found.
  - **404 Not Found:** Returns an error message if the book is not found.

**Update a Book**
- **Endpoint:** `PUT /api/books/:id`
- **Description:** Update an existing book's details.
- **Request Body:** Accepts the same fields as the POST endpoint, but all are optional.
- **Response:**
  - **200 OK:** Returns the updated book object.
  - **404 Not Found:** Returns an error message if the book is not found.

**Delete a Book**
- **Endpoint:** `DELETE /api/books/:id`
- **Description:** Delete a book by its ID.
- **Response:**
  - **204 No Content:** Returns a success message if the book is deleted.
  - **404 Not Found:** Returns an error message if the book is not found.

## Search & Pagination

- **Search:** Use query parameters `title`, `author`, `price`, and `inStock` to search books.
- **Pagination:** Use the `page` and `lim` query parameters to paginate results.

## Error Handling

The API handles various types of errors:

- **400 Bad Request:** Invalid input, such as missing required fields or incorrect data types.
- **404 Not Found:** Requested resource does not exist (e.g., book ID not found).
- **422 Unprocessable Entity:** Invalid data format (e.g., invalid date).
- **500 Internal Server Error:** Unexpected errors such as database connectivity issues.

## Caching with Redis

This application uses Redis to cache the results of book queries. Cached data helps to improve response times for frequently accessed data.

- **Book Queries**: Cached for 30 seconds to reduce database load.
- **Book By ID**: Cached for 30 seconds to speed up access to individual book details.

If you modify or add new books, the cache will be updated automatically based on the query parameters.
