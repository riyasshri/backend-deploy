const { default: mongoose } = require("mongoose");
const Item = require("../models/Item");
const User = require("../models/User");
const sendEamil = require("../lib/sendEmail");
const sendEmail = require("../lib/sendEmail");

exports.createitem = async (req, res, next) => {
  try {
    const { email, name, basePrice, img, minInc, desc, category, proof } =
      req.body;
    const user = await User.findOne(
      {
        email: email,
      },
      {
        email: 1,
        listed: 1,
      }
    );
    if (!user) {
      res.status(404).json({
        status: "faiure",
        msg: "User not found",
      });
    }
    if (!img || !name || !basePrice) {
      res.status(404).json({
        status: "faiure",
        msg: "Either name or image array or basePrice is missing",
      });
    }
    const item = new Item({
      name,
      basePrice,
      img,
      currentPrice: basePrice,
      minInc,
      owner: user._id,
      desc,
      category,
      proof,
    });
    await item.save();
    user.listed.push(item._id);
    await user.save();
    res.status(200).json({
      status: "success",
      item,
    });
  } catch (error) {
    next(error);
  }
};

exports.getitem = async (req, res, next) => {
  try {
    const item = await Item.findById(mongoose.Types.ObjectId(req.params.id));
    if (!item) {
      return res.status(404).json({
        status: "failure",
        msg: "Item with tha id doesnt exists",
      });
    }
    res.status(200).json({
      status: "success",
      item,
    });
  } catch (error) {
    next(error);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const { email, id } = req.body;
    const user = await User.findOne(
      {
        email: email,
      },
      { listed: 1 }
    );
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        status: "failure",
        msg: "Item not found",
      });
    }
    if (!user) {
      return res.status(404).json({
        status: "failure",
        msg: "user not found",
      });
    }
    if (!user.listed.includes(id)) {
      return res.status(200).json({
        status: "failure",
        msg: "Cannot be done because you are not the owner",
      });
    }
    if ((item.boughtBy = null && item.status == "sold")) {
      const subject = `${item.name} is live again`;
      const emailBody = `The previous offer for ${item.name} has been rejected & has been made live again`;
      sendEamil(item.heldBy, emailBody, subject);
      item.status = "live";
      item.heldBy = null;
      item.watchers.map(async (w) => {
        const u = await User.findById(w, { email: 1, _id: 0 });
        sendEamil(u.email, emailBody, subject);
      });
      await User.findByIdAndUpdate(item.heldBy, {
        $pull: {
          heldItems: item_id,
        },
      });
      await item.save();
    } else {
      return res.status(403).json({
        status: "failure",
        msg: "Cannot reject offer because the offer is already live not bought by any one",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.live = async (req, res, next) => {
  try {
    const { email, id } = req.body;
    const user = await User.findOne(
      {
        email: email,
      },
      { listed: 1 }
    );
    if (!user.listed.includes(id)) {
      return res.status(403).json({
        status: "failure",
        msg: "Cannot bring it live because not the owner",
      });
    }
    const item = await Item.findById(mongoose.Types.ObjectId(id));
    if (!item) {
      return res.status(404).json({
        status: "failure",
        msg: "Item not found",
      });
    }
    if (item.status == "down") {
      item.status = "live";
      await item.save();
      return res.status(200).json({
        status: "success",
        item,
      });
    } else {
      return res.status(401).json({
        status: "failure",
        msg: "Either already live or sold",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getDown = async (req, res, next) => {
  try {
    const { email, id } = req.body;
    const user = await User.findOne({ email: email }, {
      listed: 1
    });

    if (!user) {
      res.status(404).json({ status: "failure", msg: "user not found" })
    }
    if (!user.listed.includes(id)) {
      res.status(404).json({
        status: "failure",
        msg: "user not owner of item"
      })

      const item = await Item.findById(mongoose.Types.ObjectId(id));
      if (item.status == "live") {
        item.status = "down";
        await save();
      }
      return res.status(400).json({ status: "failure", msg: "item is not live" })
    }
  } catch (error) {
    next(error);
  }
}

exports.acceptBid = async (req, res, next) => {
  try {
    const { uid } = req.body;
    const { id } = req.params;
    const user = await User.findById(uid, { email: 1 })
    const item = await Item.findById(id, {
      owner: 1, heldBy: 1, status: 1, name: 1
    });
    if (!uid == item.owner) {
      return res.status(400).json({
        status: "failure",
        msg: "You are not the owner"
      })
    }
    item.status = "sold";
    sendEmail(user.email, `Your offer for ${item.name} has been accepted by the owner.Pay the due ASAP`, `Offer accepted for ${item.name}`);
    await item.save();
    res.status(200).json({
      status: "success",
      msg: "Item status updated."
    })
  } catch (error) {
    next(error);
  }
}

exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const item = await Item.findByIdAndUpdate(id, body, { new: true })
    res.status(200).json({
      status: "success",
      item
    })
  } catch (error) {
    next(error);
  }
}
exports.getByCat = async (req, res, next) => {
  try {
    const cats = [
      "collectibles & art",
      "electronics",
      "fashion",
      "home & garden",
      "auto parts & accessories",
      "musical instruments & gears",
      "spoorting goods",
      "toys & hobbies",
      "video games & consoles",
      "business & international",
    ];
    const data = await Item.find({
      category: {
        $in: cats
      }
    }, {
      name: 1,
      basePrice: 1,
      currentPrice: 1,
      owner: 1,
      img: 1
    }).sort({
      createdAt: -1
    }).limit(50);
    let count = data.length;
    res.status(200).json({
      status: "success",
      data,
      count
    })
  } catch (error) {
    next(error);
  }
}

exports.findprod = async (req, res, next) => {
  try {
    const { search_txt } = req.params;
    console.log(search_txt);
    const prods = await Item.find({
      $text: {
        $search: search_txt
      }
    })
    res.status(200).json({
      status: "success",
      prods
    })
  } catch (error) {
    next(error);
  }
}


// exports.getByCat = async(req,res,next)=>{
//   try {
//     const cats = [
//       "collectibles & art",
//       "fashion",
//       "home & garden",
//       "auto parts & accessories",
//       "musical instruments & gears",
//       "spoorting goods",
//       "toys & hobbies",
//       "video games & consoles",
//       "business & international",
//       "electronics",
//     ];
//   } catch (error) {
//     next(error);
//   }
// }