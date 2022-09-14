const {
  getuser,
  placebid,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  makepayment,
  heldup,
  updateUser,
} = require("../controllers/user");
const router = require("express").Router();

//Get user data-->HB
router.get("/getuser/:id", getuser);

//Place a bid-->HB
router.post("/placebid", placebid);

//Add to wacthlist-->HB
router.post("/addtowatchlist", addToWatchlist);

//Remove from watchlist-->HB
router.post("/removefromwatchlist", removeFromWatchlist);

//Get watchlist-->HB
router.get("/watchlist", getWatchlist);

//Payment for a auction item-->HB
router.post("/pay", makepayment);

//Get heldup items-->HB
router.post("/heldup/:id", heldup);

//Update user data-->RJS
router.put("/update/:id",updateUser);

module.exports = router;
