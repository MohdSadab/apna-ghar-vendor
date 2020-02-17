const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth');
const connection=require("../connection/connection");
const queries=require('../vendorQueries/vendorQueries');
const {check,validationResult}=require('express-validator');
const upload=require('../common/multer');
const cloudinary=require('../common/cloudinary');





//@Route for getting items by per page
router.get("/items",auth,async (req,res)=>{
const result = await queries.getItems(req,connection); 
res.status(200).json({
    data:result
});    

})




//@todo itemImages is required itemcoverimage is required 
//@todo upload image code array of images
router.post(
  "/items",
  [
    auth,
    check("itemName", "item name is required").exists(),
    check("itemPrize", "item prize is required").exists(),
    check("itemQuantity", "item quantity is required").exists(),
    check("exptDayOfDelivery", "item expected delivery is required").exists(),
    check("returnPolicy", "Return policy is required").exists(),
    check("discount", "discount is required").exists(),
    check("categoryName", "category name is required").exists(),
    check("brand", "brand name is required").exists(),
    check("tags", "tag name is required").exists(),
    upload.fields([
      {
        name: "itemCover",
        maxCount: 1
      },
      {
        name: "items",
        maxCount: 12
      }
    ])
  ],
  async (req, res) => {
    console.log(req.files, ">>>>>>");
    const itemImages = [];
    let itemCoverImage;
    console.log(req.files);
    if (!req.files ||!req.files.itemCover || !req.files.items) {
      res.status(400).json({
        error: [
          {
            msg: "Item Image and Cover Images is Required"
          }
        ]
      });
      return;
    }

     const error = validationResult(req);

     if (!error.isEmpty()) {
       return res.status(400).json({ error: error.array() });
     }

    cloudinary.uploader.upload(
      req.files.itemCover[0].path,(error,res)=>{
          if(error)
          {
               res.status(500).json({
                   "error":[{
                      "msg":"Error in upload image"
                   }]
               });
               return;
          }
          else{

          }
       itemCoverImage=res.secure_url;
      }
    );

    for(let i=0;i<req.files.items.length;i++){

        try{

            const result = await cloudinary.uploader.upload(
              req.files.items[i].path,
              {
                public_id: req.files.items[i].filename
              }
            );
             itemImages.push(result.secure_url);                   

        }catch(err){
            console.log(err);
             res.status(500).json({
               error: [
                 {
                   msg: "Error in upload image"
                 }
               ]
             });
            return;
        }
    }
    // console.log(itemImages);
   

    let {
      itemName,
      itemPrize,
      itemQuantity,
      exptDayOfDelivery,
      returnPolicy,
      discount,
      categoryName,
      brand,
      tags,
      description,
      detailsAndFeatures,
      weight
    } = req.body;

    console.log("req", req.user);
    let vendorId = req.user.id;

    const query = {
      text: `INSERT INTO itemdetails(itemname,itemPrize,itemQuantity,exptDayOfDelivery,
        returnPolicy,discount,categoryName,brand,tags,
        description, detailsAndFeatures, itemImages, itemCoverImage,weight,vendorId) 
        Values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      values: [
        itemName,
        itemPrize,
        itemQuantity,
        exptDayOfDelivery,
        returnPolicy,
        discount,
        categoryName,
        brand,
        tags,
        description,
        detailsAndFeatures,
        itemImages,
        itemCoverImage,
        weight,
        vendorId
      ]
    };

    connection.query(query, (err, result) => {
      if (err) {
        console.log(err, ">>>>>error in /api/items/post route");
        res.json({
          error: [err]
        });
      } else {  
        res.status(200).json({
            "success":true,
            "msg":"Item is inserted"
        });
      }
    });
  }
);

//@todo itemImages is required itemcoverimage is required
router.put("/items",[
    auth,
    check('itemName', "item name is required").exists(),
    check('itemPrize', "item prize is required").exists(),
    check('itemQuantity', "item quantity is required").exists(),
    check('exptDayOfDelivery', "item expected delivery is required").exists(),
    check('returnPolicy', "Return policy is required").exists(),
    check('discount', "discount is required").exists(),
    check('categoryName', "category name is required").exists(),
    check('brand', "brand name is required").exists(),
    check('tags', "tag name is required").exists(),
    check('itemId', "item id  is required").exists()
],(req,res)=>{

        const error = validationResult(req);

        if (!error.isEmpty()) {
            return res
              .status(400)
              .json({ error: error.array(), success: false });
        }

        let {

            itemName, itemPrize, itemQuantity, exptDayOfDelivery,
            returnPolicy, discount, categoryName, brand, tags,
            description, detailsAndFeatures, weight
        } = req.body;

        console.log("req", req.user);
        let vendorId = req.user.id;

        const query = {
            text: `Update itemdetails set itemname=$1,itemPrize=$2,itemQuantity=$3,exptDayOfDelivery=$4,
        returnPolicy=$5,discount=$6,categoryName=$7,brand=$8,tags=$9,
        description=$10, detailsAndFeatures=$11,weight=$12,vendorId=$13 where itemid=$13`,
            values: [itemName, itemPrize, itemQuantity, exptDayOfDelivery,
                returnPolicy, discount, categoryName, brand, tags,
                description, detailsAndFeatures,weight, vendorId,req.body.itemId]
        }

        connection.query(query, (err, result) => {
            if (err) {
                console.log(err, ">>>>>error in /api/items/put route")
                res.json({
                    success:false,
                    error: [err]
                })
            }
            else {
                res.status(200).json(result);
            }
        })
})


//@Route for updating cover Image of Item @Protected
router.put(
  "/itemImages/:id",
  [
    auth,
    upload.array("items",12)
  ],
  async (req, res) => {
    if (!req.files || req.files.length==0) {
      res.status(400).json({
        success: false,
        msg: "Minimum one image is required"
      });
    }

    const itemId  = req.params.id;

    const itemDetails = await queries.getItem(req, connection);
    if (itemDetails && itemDetails.length == 0) {
      res.status(404).json({
        msg: "Item is not present",
        success: false
      });
      return;
    } else {
      const coverUrl = getPubId(itemDetails[0].itemimages);
      console.log(coverUrl,"cover");
      try {
        let urls=[]
        for(let i=0;i<req.files.length;i++){  
        const url = await cloudinary.uploader.upload(req.files[i].path);
        urls.push(url.secure_url);
        }
        const query = {
          text: ` update itemdetails set itemImages=$1 where itemId=$2; `,
          values: [urls, itemId]
        };

     await connection.query(query);
        res.status(200).json({
          data: urls,
          success: true,
          msg: "item successfully Updated"
        });
        await cloudinary.api.delete_resources([...coverUrl]);
      } catch (error) {
        console.log(error);
      }
    }

    try {
    } catch (error) {
      res.status(403).json({
        error: [error],
        success: false
      });
      return;
    }
  }
);


//@Route for updating items Image of Item @Protected
router.put(
  "/itemCoverImage/:id",
  [
    auth,
    upload.array("itemCover")
  ],
  async (req, res) => {

    if(!req.file){
        res.status(400).json({
            success:false,
            msg:"Cover Image is Required"
        })
    }

    const  itemId  = req.params.id;

    const itemDetails = await queries.getItem(req, connection);
    if (itemDetails && itemDetails.length == 0) {
      res.status(404).json({
        msg: "Item is not present",
        success:false
      });
      return;
    } else {
      const coverUrl = getPubId([itemDetails[0].itemcoverimage]);
      try {
        const url = await cloudinary.uploader.upload(req.file.path);
        const query = {
          text: ` update itemdetails set itemCoverImage=$1 where itemId=$2; `,
          values: [url.secure_url, itemId]
        };

        const result = await connection.query(query);
        res.status(200).json({
          data: [url.secure_url],
          success: true,
          msg: "item successfully Updated"
        });
        await cloudinary.api.delete_resources([...coverUrl]);
       
      } catch (error) {
        console.log(error);
      }
    }

    try {
    } catch (error) {
      res.status(403).json({
        error: [error],
        success: false
      });
      return;
    }
  }
);



//@todo delete the images from server here
router.delete('/items/:id',[
    auth
],async (req,res)=>{


        const  itemId =req.params.id;
        console.log(itemId);

         const itemDetails = await queries.getItem(req,connection); 
         if(itemDetails.length==0){
             res.status(404).json({
               msg: "Item is not present",
               success: false
             });
             return;
         }
         else{
            
             const query = {
               text: `
             delete from itemdetails where itemId=$1
            `,
               values: [itemId]
             };

            const coverUrl = getPubId([itemDetails[0].itemcoverimage]);
            const imagesUrl= getPubId(itemDetails[0].itemimages);
            try{
                  const result = await connection.query(query);
                  res.status(200).json({
                    msg: "item successfully deleted",
                    success: true
                  });
                const res = await cloudinary.api.delete_resources([
                  ...coverUrl,
                  ...imagesUrl
                ]);
            } catch(error){
                 res.status(500).json({
                   error: [error],
                   success: false
                 });
                 return;   
            }
         }
})


//function for getting public id of image
const getPubId=(urls)=>{

    let result=[];

    for(let i=0;i<urls.length;i++){
         let pubId = urls[i].split("/");
         let pubCoverUrl = pubId[pubId.length - 1].split(".")[0];
         result.push(pubCoverUrl);
    }

    return result;

}






module.exports=router;