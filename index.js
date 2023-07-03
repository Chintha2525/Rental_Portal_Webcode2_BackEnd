require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const { AdminModel, ContactModel, ProductModel } = require("./schemas/userSchemas")
const { hashPassword, hashCompare, createToken, validate, roleAdminGaurd } = require('./common/auth')
const { dbUrl } = require('./common/dbConfig');
const cors = require("cors")

mongoose.connect(dbUrl)

const app = express()

app.use(cors())
app.use(express.json());

app.get("/", function (req, res) {
  res.send("Equipment rental portal Project...");
});

// Create signup for users

app.post("/signup", async (req, res) => {
  try {
    let user = await AdminModel.findOne({ email: req.body.email });

    if (!user) {
      let hashedPassword = await hashPassword(req.body.password)
      req.body.password = hashedPassword
      let user = await AdminModel.create(req.body)

      res.status(201).send({
        message: "User Signup Successfully !!!"
      })
    }
    else {
      res.status(400).send({ message: "User Already Exists !!!" })
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error
    })
  }
})


app.get('/admin/login', validate, roleAdminGaurd, async function (req, res) {
  try {
    let users = await AdminModel.find({}, { password: 0, _id: 0 });
    res.status(200).send({
      users,
      message: "Users Data Fetch Successfull!"
    })
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error
    })
  }
});


app.post('/login', async (req, res) => {
  try {
    let user = await AdminModel.findOne({ email: req.body.email }).exec()
    if (user) {
      if (await hashCompare(req.body.password, user.password)) {
        let token = await createToken({
          name: user.name,
          email: user.email,
          id: user._id,
          role: user.role
        })
        res.status(200).send({
          message: "User Login Successfull!",
          token
        })
      }
      else {
        res.status(401).send({ message: "Invalid Credential" })
      }
    }
    else {
      res.status(404).send({ message: "User Does Not Exists!" })
    }

  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error
    })
  }
})

// app.post('/login', async (req, res) => {
//   try {
//     const admin = await AdminModel.findOne({ email: req.body.email }).exec();
//     console.log(admin)
//     if (admin) {
//       const passwordMatch = await bcrypt.compare(req.body.password, admin.password);
//       if (passwordMatch) {
//         const token = jwt.sign({ _id: admin._id }, process.env.SECRET_KEY, { expiresIn: '5m' });
//         res.status(200).json({ message: 'Success', token });
//       } else {
//         res.status(401).json({ message: 'Incorrect email/password' });
//       }
//     } else {
//       res.status(404).json({ message: 'Incorrect email/password' });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// });


app.post("/contact", async (req, res) => {
  try {
    let contact = await ContactModel.create(req.body)

    res.status(201).send({
      message: "Contact Created Successfully !!!"
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "Internal Server Error" })
  }
})


app.post("/product", async (req, res) => {
  try {
    let product = await ProductModel.create(req.body)
    res.status(201).send({
      message: "Product Added Successfully"
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      message: "Internal Server Error"
    })
  }
})


app.get("/getproduct", async (req, res) => {
  try {
    let product = await ProductModel.find()
    res.status(200).send({
      product,
      message: "Products Fetch Successfilly !!!"
    })
  } catch (error) {
    res.status(500).send({
      error,
      message: "Internal Server Error"
    })
  }
})


app.get("/oneproduct/:id", async (req, res) => {
  try {
    let product = await ProductModel.findOne({ _id: req.params.id })
    res.status(200).send({
      product,
      message: "Products Fetch Successfilly !!!"
    })
  } catch (error) {
    res.status(500).send({
      error,
      message: "Internal Server Error"
    })
  }
})


app.delete("/deleteprod/:id", async (req, res) => {
  try {
    let product = await ProductModel.findOne({ _id: req.params.id })
    if (product) {
      let product = await ProductModel.deleteOne({ _id: req.params.id })
      res.status(200).send({
        message: "Product Deleted Successfully !!!"
      })
    }
    else {
      res.status(400).send({
        message: "Product Does Not Exists"
      })
    }
  } catch (error) {
    res.status(500).send({
      error,
      message: "Internal Server Error"
    })
  }
})


// app.put("/updateprod/:id", async (req, res) => {
//   try {
//     let product = await ProductModel.findOne({ _id: req.params.id })
//     if (product) {
//       product.Name = req.body.Name
//       product.Price = req.body.Price
//       product.Url = req.body.Url
//       product.Quantity = req.body.Quantity
//       product.Hours = req.body.Hours

//       await product.save()

//       res.status(200).send({
//         message: "Product Update Successfully !!!"
//       })
//     }
//     else {
//       res.status(400).send({ message: "Product Does Not Exists!" })
//     }
//   } catch (error) {
//     res.status(500).send({
//       error, message: "Internal Servar Error"
//     })
//   }
// })

app.put("/updateprod/:id", async (req, res) => {
  try {
    const connection = await mongoose.connect(dbUrl);
    const productData = await ProductModel.findOne({ _id: req.params.id });

    if (productData) {
      delete req.body._id;
      const product = await ProductModel.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      res.status(200).send(product);
      await connection.disconnect()
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});





app.post("/hours/:id", async (req, res) => {
  try {
    const { _id } = req.params.id;
    const product = await ProductModel.findById(_id);
    const { startDate, endDate } = req.body;
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    const hours = (date2 - date1) / (1000 * 3600);
    
    res.status(200).send({ hours });
    // res.status(200).send(hours);

    } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Something Went Wrong" });
  }
});





app.listen(process.env.PORT, () => console.log(`servar started in localhost:${process.env.PORT}`));

