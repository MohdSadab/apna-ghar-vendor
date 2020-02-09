const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = (req, res, next) => {

    const authrizationHeader = req.headers.authorization;
    //console.log(">>>>>",authrizationHeader,req.headers)
    if (authrizationHeader) {

        const token = authrizationHeader.split(" ")[1];
        console.log(token);
        const options = {
            expiresIn: '8h'
        }
        jwt.verify(token, config.get('jwtSecret'), options, (error, result) => {
            if (error) {
                console.log("error",error);
                res.status(403).json({
                    "error": [
                        {
                            "msg": "token is Invalid"
                        }
                    ]
                })
            }
            else {
                console.log(result);
                req.user = result;
                console.log(req.user,">>>user is");
                next();
            }
        })

    } else {

        res.status(401).json({
            "error": [
                {
                    "msg": "Authentication error , Token is Required"
                }
            ]
        })
    }
}

