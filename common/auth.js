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

//   // const roleAdminGaurd = (req, res, next) => {
//   //   // const token = req.headers.authorization.split(" ")[1];
//   //   const authHeader = req.headers.authorization;
//   // if (!authHeader) {
//   //   return res.status(401).send({ message: "Authorization header not found" });
//   // }

//   // const token = authHeader.split(" ")[1];
//   //   if (!token) {
//   //     return res.status(401).send({ message: "Token Not Found" });
//   //   }
  
//   //   try {
//   //     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//   //     if (decoded.role === "admin") {
//   //       next();
//   //     } else {
//   //       res.status(401).send({ message: "Only Admins are Allowed" });
//   //     }
//   //   } catch (error) {
//   //     res.status(500).send({ message: "Invalid Token", error });
//   //   }
//   // };

//   const roleAdminGaurd = (req, res, next) => {
//     const authHeader = req.headers.authorization;
  
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).send({ message: "Token not found in Authorization header" });
//     }
  
//     const token = authHeader.split(" ")[1];
  
//     try {
//       const decoded = jwt.verify(token, process.env.SECRET_KEY);
  
//       if (decoded.role === "admin") {
//         next();
//       } else {
//         res.status(401).send({ message: "Only admins are allowed" });
//       }
//     } catch (error) {
//       res.status(500).send({ message: "Invalid token", error });
//     }
//   };



const validate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Token not found in Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (Math.floor(Date.now() / 1000) < decoded.exp) {
      next();
    } else {
      res.status(401).send({ message: "Token Expired" });
    }
  } catch (error) {
    res.status(500).send({ message: "Invalid Token", error });
  }
};

const roleAdminGaurd = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Token not found in Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.role === "admin") {
      next();
    } else {
      res.status(401).send({ message: "Only admins are allowed" });
    }
  } catch (error) {
    res.status(500).send({ message: "Invalid token", error });
  }
};

  

module.exports = { hashPassword, hashCompare, createToken, validate, roleAdminGaurd }