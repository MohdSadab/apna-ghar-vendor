const bcrypt = require('bcryptjs');


const signIn = async (req, db) => {

    let { email, password } = req.body;
    const salt = await bcrypt.genSalt(10);

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


module.exports = {
    signIn
}