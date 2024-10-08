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
- [Advanced Search](#Advanced-Search)
- [Audit Logging](#audit-logging)

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

## Advanced Search

The advanced search functionality allows you to filter and sort books based on various criteria. You can specify multiple filters and sorting options to refine your search results.

### Query Parameters

- **`title`** (optional): Filter books by title. Use partial matches with regular expressions.
- **`author`** (optional): Filter books by author. Use partial matches with regular expressions.
- **`price`** (optional): Filter books by price. Must be a non-negative number.
- **`inStock`** (optional): Filter books by stock status. Use `true` or `false`.
- **`page`** (optional): Specify the page number for pagination. Default is `1`.
- **`lim`** (optional): Specify the number of results per page. Default is `50`.
- **`sortBy`** (optional): Define the sorting criteria. Use comma-separated field names (e.g., `price,publishedDate`).
- **`sortOrder`** (optional): Define the sort order. Use `asc` for ascending or `desc` for descending. Default is `asc`.

### Examples

1. **Search by Title and Sort by Price in Ascending Order**

   ```http
   GET /api/books?title=harry&sortBy=price&sortOrder=asc
   ```
   ```http
   GET /api/books?sortBy=price
   ```
   ```http
   GET /api/books?sortOrder=asc
   ```

**Description:** Retrieves books with "harry" in the title, sorted by price in ascending order.

2. **Search by Author and Sort by Published Date in Descending Order**
   ```http
   GET /api/books?author=rowling
   ```
   ```http
   GET /api/books?sortBy=publishedDate
   ```
   ```http
   GET /api/books?sortOrder=desc
   ```

**Description:** Retrieves books by "rowling," sorted by published date in descending order.

3. **Search by Price Range and Pagination**
   ```http
   GET /api/books?price=20
   ```
   ```http
   GET /api/books?page=2
   ```
   ```http
   GET /api/books?lim=10
   ```

**Description:** Retrieves books priced at 20, with results paginated to show 10 books per page, starting from page 2.

4. **Search by Stock Status and Multiple Sort Fields**
   ```http
   GET /api/books?inStock=true
   ```
   ```http
   GET /api/books?sortBy=price,publishedDate
   ```
   ```http
   GET /api/books?sortOrder=asc
   ```

**Description:** Retrieves books that are in stock, sorted by price and published date in ascending order.

### Notes
- Sorting will only be applied if the `sortBy` parameter is specified.
- Ensure that the `sortOrder` parameter is either `asc` or `desc` to avoid unexpected results.

## Audit Logging

Audit logging is an essential feature for tracking and reviewing changes made to the system. It helps in monitoring user actions, debugging issues, and ensuring compliance.

### Feature

Audit logging captures details of create, update, and delete operations within the system. It provides transparency and traceability for all changes made to the book inventory.

### Implementation

- **Log Details**: Each log entry includes:
  - **Book ID**: To store the Book ID which has been created, updated, or deleted.
  - **Operation Type**: The type of operation (e.g., create, update, delete).
  - **Timestamp**: The date and time when the operation occurred.
  
- **Storage**: Logs are stored in a separate collection in the MongoDB database to keep them isolated from primary data and facilitate easy querying.

### Logging Library

- **Winston**: The project uses Winston for logging. Winston provides a versatile logging framework that supports various transports and formats.
