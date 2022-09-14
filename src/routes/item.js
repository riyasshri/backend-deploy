const router = require("express").Router();
const { createitem, getitem, reject, live, getDown, acceptBid, updateItem, getByCat, findprod } = require("../controllers/item");

//Create an auction item-->HB
router.post("/createitem", createitem);

//Get auction item by id-->HB
router.get("/getitem/:id", getitem);

//Get all items based on category for recommendation-->RJS
router.get("/getall",getByCat);

//Get item based on search value-->RJS
router.get("/search/:search_txt",findprod);

//Update item data-->RJS
router.put("/updateitem/:id", updateItem);

//Bring down the auctioned item-->RJS
router.post("/down", getDown);

//Approve the amount & change status to sold for auction item-->RJS
router.post("/accept/:id", acceptBid);

//Reject offer & resume-->HB
router.post("/reject", reject);

//Bring item live again-->HB
router.post("/live", live);

module.exports = router;
