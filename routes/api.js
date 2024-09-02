const { Router } = require("express");
const {
    handleBookPost,
    handleBookGet,
    handleBookGetByID,
    handleBookPut,
    handleBookDelete,
} = require("../controllers/api");

const router = Router();

router.get("/books", handleBookGet);
router.get("/books/:id", handleBookGetByID);

router.post("/books", handleBookPost);

router.put("/books/:id", handleBookPut);

router.delete("/books/:id", handleBookDelete);

module.exports = router;
