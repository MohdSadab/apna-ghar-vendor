const bcrypt = require('bcryptjs');


const signIn = async (req, db) => {

    let { email, password } = req.body;

    console.log(password);
    const query = {
        text: 'Select * from vender where email=$1',     
        values: [email]
    }

    try {
        const result = await db.query(query)
        //console.log(result);
        if (await bcrypt.compare(password, result.rows[0].password))
            return result;

    } catch (error) {
        console.log(error);
    }
}

const getItems = async (req, db) => {

    let { id } = req.user;
    console.log(req.user);
    const query = {
        text: 'Select * from itemDetails where vendorId=$1',
        values: [id]
    }

    try {
        const result = await db.query(query);
            return result.rows;

    } catch (error) {
        console.log(error);
        return [];
    }
}


const getItem =async (req,db)=>{

    let itemId=req.params.id;

      const query = {
        text: "Select * from itemDetails where itemId=$1",
        values: [itemId]
      };

      try {
        const result = await db.query(query);
        return result.rows;
      } catch (error) {
        console.log(error);
        return [];
      }

}


module.exports = {
    signIn,
    getItems,
    getItem
}