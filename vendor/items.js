const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth');
const connection=require("../connection/connection");
const queries=require('../vendorQueries/vendorQueries');
const {check,validationResult}=require('express-validator');


//@Route for getting items by per page
router.get("/items",auth,async (req,res)=>{
const result = await queries.getItems(req,connection); 
res.status(200).json(result.rows);    

})

//@todo itemImages is required itemcoverimage is required 
//@todo upload image code array of images
router.post("/items",[
    auth,
    check('itemName', "item name is required").exists(),
    check('itemPrize',"item prize is required").exists(),
    check('itemQuantity', "item quantity is required").exists(),
    check('exptDayOfDelivery', "item expected delivery is required").exists(),
    check('returnPolicy', "Reurn policy is required").exists(),
    check('discount', "discount is required").exists(),
    check('categoryName', "category name is required").exists(),
    check('brand', "brand name is required").exists(),
    check('tags', "tag name is required").exists()
],(req,res)=>{

        const error = validationResult(req);

        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

    let {
      
        itemName,itemPrize,itemQuantity,exptDayOfDelivery,
        returnPolicy,discount,categoryName,brand,tags,
        description, detailsAndFeatures, itemImages, itemCoverImage,weight
    } = req.body;

    console.log("req",req.user);
    let vendorId = req.user.id;

    const query= {
        text:`INSERT INTO itemdetails(  itemname,itemPrize,itemQuantity,exptDayOfDelivery,
        returnPolicy,discount,categoryName,brand,tags,
        description, detailsAndFeatures, itemImages, itemCoverImage,weight,vendorId) 
        Values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        values: [itemName, itemPrize, itemQuantity, exptDayOfDelivery,
            returnPolicy, discount, categoryName, brand, tags,
            description, detailsAndFeatures, itemImages, itemCoverImage, weight,vendorId]
    }

    connection.query(query,(err,result)=>{
        if(err){
            console.log(err,">>>>>error in /api/items/post route")
            res.json({
                error:[err]
            })
        }
        else{
            res.status(200).json(result);
        }
    })

})

//@todo itemImages is required itemcoverimage is required
router.put("/items",[
    auth,
    check('itemName', "item name is required").exists(),
    check('itemPrize', "item prize is required").exists(),
    check('itemQuantity', "item quantity is required").exists(),
    check('exptDayOfDelivery', "item expected delivery is required").exists(),
    check('returnPolicy', "Reurn policy is required").exists(),
    check('discount', "discount is required").exists(),
    check('categoryName', "category name is required").exists(),
    check('brand', "brand name is required").exists(),
    check('tags', "tag name is required").exists(),
    check('itemId', "item id  is required").exists()
],(req,res)=>{

        const error = validationResult(req);

        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        let {

            itemName, itemPrize, itemQuantity, exptDayOfDelivery,
            returnPolicy, discount, categoryName, brand, tags,
            description, detailsAndFeatures, itemImages, itemCoverImage, weight
        } = req.body;

        console.log("req", req.user);
        let vendorId = req.user.id;

        const query = {
            text: `Update itemdetails set itemname=$1,itemPrize=$2,itemQuantity=$3,exptDayOfDelivery=$4,
        returnPolicy=$5,discount=$6,categoryName=$7,brand=$8,tags=$9,
        description=$10, detailsAndFeatures=$11, itemImages=$12, itemCoverImage=$13,weight=$14,vendorId=$15 where itemid=$16`,
            values: [itemName, itemPrize, itemQuantity, exptDayOfDelivery,
                returnPolicy, discount, categoryName, brand, tags,
                description, detailsAndFeatures, itemImages, itemCoverImage, weight, vendorId,req.body.itemId]
        }

        connection.query(query, (err, result) => {
            if (err) {
                console.log(err, ">>>>>error in /api/items/put route")
                res.json({
                    error: [err]
                })
            }
            else {
                res.status(200).json(result);
            }
        })
})

//@todo delete the images from server here
router.delete('/items',[
    auth,
    check('itemId', "item id is required").exists()
],(req,res)=>{

        const error = validationResult(req);

        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        const { itemId }=req.body;
        console.log(itemId);

        const query={
            text:`
             delete from itemdetails where itemId=$1
            `,
            values:[itemId]
        }

        connection.query(query,(error,result)=>{
            if(error){
                res.status(403).json({
                    error:[error]
                })
            }
            else{

                res.status(200).json({
                    "res":result,
                    "msg":"item successfully deleted"
                })
            }
        })

})



module.exports=router;