const { Types } = require("mongoose");
const redis = require("redis");

(async () => {
    client = redis.createClient();

    client.on("error", (error) =>
        console.log("Error connecting redis: ", error)
    );
    client.on("connect", () => console.log("Redis Connected"));
    await client.connect();
})();

const Book = require("../models/book");
const logger = require("../auditLog");

async function handleBookPost(req, res) {
    try {
        const { title, author, genre, publishedDate, price, inStock } =
            req.body;

        if (!title) return res.status(400).json({ error: "Title is required" });
        if (!author)
            return res.status(400).json({ error: "Author is required" });
        if (!price) return res.status(400).json({ error: "Price is required" });
        if (price < 0)
            return res.status(400).json({ error: "Price cannot be negative" });

        if (inStock && typeof inStock !== "boolean") {
            return res.status(400).json({ error: "InStock must be a boolean" });
        }
        if (publishedDate && isNaN(new Date(publishedDate).getTime())) {
            return res.status(422).json({ error: "Invalid publishedDate" });
        }

        const newBook = await Book.create({
            title,
            author,
            genre,
            publishedDate,
            price,
            inStock,
        });
        logger.info(`POST request. Created book ID: ${newBook._id}.`);
        return res.status(201).json(newBook);
    } catch (error) {
        logger.error(`Error while handling POST request. Error: ${error}`);
        if (error.name === "MongoError" && error.code === 11000) {
            return res.status(400).json({ error: "Duplicate book entry" });
        }
        return res
            .status(500)
            .json({ error: "Error while adding book", details: error.message });
    }
}

async function handleBookGet(req, res) {
    try {
        const { title, author, price, inStock, page = 1, lim = 50 } = req.query;
        const queryParams = {};
        const limInt = parseInt(lim);

        if (title) {
            queryParams.title = new RegExp(title, "i");
        }

        if (author) {
            queryParams.author = new RegExp(author, "i");
        }

        if (price) {
            const priceNum = Number(price);
            if (isNaN(priceNum)) {
                return res
                    .status(400)
                    .json({ error: "Price must be a valid number" });
            }
            if (priceNum >= 0) {
                queryParams.price = priceNum;
            } else {
                return res
                    .status(400)
                    .json({ error: "Price cannot be negative" });
            }
        }

        if (inStock) {
            if (inStock === "true") {
                queryParams.inStock = true;
            } else if (inStock === "false") {
                queryParams.inStock = false;
            } else {
                return res
                    .status(400)
                    .json({ error: "InStock must be true or false" });
            }
        }

        const cacheKey = `books:${JSON.stringify(queryParams)}:${page}:${lim}`;

        try {
            const cacheValue = await client.get(cacheKey);
            if (cacheValue) {
                logger.info(
                    `GET request from cache. Fetched book IDs: ${cacheValue}.`
                );
                return res.status(200).json(JSON.parse(cacheValue));
            }
        } catch (err) {
            console.log("Error fetching from Redis: ", err);
            logger.error(
                `GET Request, Error fetching from Redis server. Error: ${err}`
            );
            return res.status(500).send({ error: "Error in Redis server" });
        }

        const allBooks = await Book.find(queryParams)
            .skip((page - 1) * limInt)
            .limit(limInt);

        const books = await Book.countDocuments(queryParams);

        if (allBooks.length > 0) {
            await client.setEx(
                cacheKey,
                30,
                JSON.stringify({
                    page: parseInt(page),
                    totalPages: Math.ceil(books / limInt),
                    allBooks,
                    books,
                })
            );

            logger.info(
                `GET request from database. Fetched book IDs: ${allBooks}.`
            );
            return res.status(200).json({
                page: parseInt(page),
                totalPages: Math.ceil(books / limInt),
                allBooks,
                books,
            });
        } else {
            logger.info(`GET request from database. No books found.`);
            return res.status(200).send({ notFound: "No books found" });
        }
    } catch (error) {
        logger.error(`GET Request, Error fetching books. Error: ${error}`);
        return res.status(500).json({
            error: "Error while fetching books",
            details: error.message,
        });
    }
}

async function handleBookGetByID(req, res) {
    try {
        const bookId = req.params.id;

        if (!Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ error: "Invalid book ID" });
        }

        const cacheKey = bookId;

        try {
            const cacheValue = await client.get(cacheKey);
            if (cacheValue) {
                logger.info(
                    `GET request from cache. Fetched book ID: ${cacheValue}.`
                );
                return res.status(200).json(JSON.parse(cacheValue));
            }
        } catch (err) {
            console.log("Error fetching from Redis: ", err);
            logger.error(
                `GET Request, Error fetching from Redis server. Error: ${err}`
            );
            return res.status(500).send({ error: "Error in Redis server" });
        }

        const book = await Book.findOne({ _id: bookId });
        if (book) {
            logger.info(`GET request from database. Fetched book ID: ${book}.`);
            await client.setEx(cacheKey, 30, JSON.stringify({ book }));
            return res.status(200).json(book);
        } else {
            logger.info(`GET request from database. Book Not Found.`);
            return res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        logger.error(`GET Request, Error fetching books. Error: ${error}`);
        return res.status(500).json({
            error: "Error while fetching book",
            details: error.message,
        });
    }
}

async function handleBookPut(req, res) {
    try {
        const bookId = req.params.id;
        const { title, author, genre, publishedDate, price, inStock } =
            req.body;

        if (price && price < 0)
            return res.status(400).json({ error: "Price cannot be negative" });
        if (inStock !== undefined && typeof inStock !== "boolean") {
            return res.status(400).json({ error: "InStock must be a boolean" });
        }
        if (publishedDate && isNaN(new Date(publishedDate).getTime())) {
            return res.status(422).json({ error: "Invalid publishedDate" });
        }

        const updateBook = await Book.findOneAndUpdate(
            { _id: bookId },
            { title, author, genre, publishedDate, price, inStock },
            { new: true }
        );

        if (updateBook) {
            logger.info(`PUT request. Updated book ID: ${updateBook}.`);
            return res.status(200).json(updateBook);
        } else {
            logger.error(`PUT request. Book Not Found`);
            return res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        logger.error(`PUT request error from Database. Error: ${error}`);
        return res.status(500).json({
            error: "Error while updating book",
            details: error.message,
        });
    }
}

async function handleBookDelete(req, res) {
    try {
        const bookId = req.params.id;

        if (!Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ error: "Invalid book ID" });
        }

        const deletedBook = await Book.deleteOne({ _id: bookId });
        if (deletedBook.deletedCount === 1) {
            logger.info(`DELETE request. Deleted book ID: ${deletedBook}.`);
            return res.status(204).send({ success: "Successfully Deleted" });
        } else {
            logger.error(`DELETE request. Book Not Found`);
            return res.status(404).send({ error: "Book Not Found" });
        }
    } catch (error) {
        logger.error(`DELETE request error from Database. Error: ${error}`);
        return res.status(500).json({
            error: "Error while deleting book",
            details: error.message,
        });
    }
}

module.exports = {
    handleBookPost,
    handleBookGet,
    handleBookGetByID,
    handleBookPut,
    handleBookDelete,
};
