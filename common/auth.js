const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const saltRounds = 10

const hashPassword = async(password) => {
    let salt = await bcrypt.genSalt(saltRounds)
    let hashedPassword =  await bcrypt.hash(password, salt)
    return hashedPassword
}

const hashCompare = async(password, hashedPassword)=>{
    return await bcrypt.compare(password, hashedPassword)
}

const createToken = async(payload)=>{
    let token = await jwt.sign(payload, process.env.SECRET_KEY, {expiresIn:"5m"})
    return token
}

// const validate = (req, res, next) => {
//     const token = req.headers.authorization.split(" ")[1];
//     if (!token) {
//       return res.status(401).send({ message: "Token Not Found" });
//     }
  
//     try {
//       const decoded = jwt.verify(token, process.env.SECRET_KEY);
//       if (Math.floor(Date.now() / 1000) < decoded.exp) {
//         next();
//       } else {
//         res.status(401).send({ message: "Token Expired" });
//       }
//     } catch (error) {
//       res.status(500).send({ message: "Invalid Token", error });
//     }
//   };

const validate = async(req,res,next)=>{
    
  if(req.headers.authorization)
  {
      //"Bearer hfdwibfjwehdbfjwdhbeflewhjbclewf"
      //["Bearer","hfdwibfjwehdbfjwdhbeflewhjbclewf"]
      let token = req.headers.authorization.split(" ")[1]
      let data = await jwt.decode(token)
      if(Math.floor((+new Date()) / 1000) < data.exp)
          next()
      else
          res.status(401).send({message:"Token Expired"})
  }
  else
  {
      res.status(400).send({message:"Token Not Found"})
  }
}

  

  const roleAdminGaurd = async(req,res,next)=>{

    if(req.headers.authorization)
    {
        //"Bearer hfdwibfjwehdbfjwdhbeflewhjbclewf"
        //["Bearer","hfdwibfjwehdbfjwdhbeflewhjbclewf"]
        let token = req.headers.authorization.split(" ")[1]
        let data = await jwt.decode(token)
        if(data.role==='admin')
            next()
        else
            res.status(401).send({message:"Only Admins are allowed"})
    }
    else
    {
        res.status(400).send({message:"Token Not Found"})
    }
}

module.exports = { hashPassword, hashCompare, createToken, validate, roleAdminGaurd }