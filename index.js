const express = require("express");
const { connect } = require("mongoose");
require("dotenv").config();

const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;

app.use(express.json());

if (!PORT) {
    console.error("PORT not found");
    process.exit(1);
}

if (!mongoUrl) {
    console.error("MONGO_URL not found");
    process.exit(1);
}

connect(mongoUrl)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log("Error connecting MongoDB", error);
    });

app.use("/api", apiRouter);

app.listen(PORT, (err) => {
    if (err) {
        console.log("Error starting server", err);
        process.exit(1);
    }
    console.log(`Server running on PORT: ${PORT}`);
});
