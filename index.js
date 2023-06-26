require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const { AdminModel, ContactModel, ProductModel } = require("./schemas/userSchemas")
const { hashPassword, hashCompare, createToken, validate, roleAdminGaurd } = require('./common/auth')
const { dbUrl } = require('./common/dbConfig');

mongoose.connect(dbUrl)

const app = express()

app.use(express.json());

app.get("/", function (req, res) {
    res.send("Equipment rental portal Project...");
  });

// Create signup for users

  app.post("/signup", async (req, res) => {
    try {
        let user = await AdminModel.findOne({emaill : req.body.email})
        
        if (!user) {
            let hashedPassword = await hashPassword(req.body.password)
            req.body.password = hashedPassword
            let user = await AdminModel.create(req.body)
            
            res.status(201).send({
                message : "User Signup Successfully !!!"
            })
        }
        else {
            res.status(400).send({ message : "User Already Exists !!!"})
        }
    } catch (error) {
        res.status(500).send({ 
            message : "Internal Server Error", 
            error
        })
    }
  })


  app.get('/admin/login', validate, roleAdminGaurd, async function (req, res) {
    try {
      let users = await AdminModel.find({},{password:0, _id:0});
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
      let user = await AdminModel.findOne({ email: req.body.email })
      if(user) {
        if (await hashCompare(req.body.password, user.password)) {
          let token = await createToken({
            name : user.name,
            email : user.email,
            id : user._id,
            role : user.role
          })
          res.status(200).send({
            message: "User Login Successfull!",
            token
          })
        }
        else{
          res.status(402).send({ message: "Invalid Credential" })
        }
      }
      else{
        res.status(400).send({ message: "User Does Not Exists!" })
      }
  
    } catch(error) {
      res.status(500).send({
        message: "Internal Server Error",
        error
      })
    }
  })


  app.post("/contact", async(req, res) => {
    try {
        let contact = await ContactModel.create(req.body)
        
        res.status(201).send({
            message : "User Signup Successfully !!!"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({message : "Internal Server Error"})
    }
  })


  app.post("/product", async(req, res) => {
    try {
        let product = await ProductModel.create(req.body)
        res.status(201).send({
            message : "Product Added Successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message : "Internal Server Error"
        })
    }
  })


  app.get("/getproduct", async(req, res) => {
    try {
      let product = await ProductModel.find({},{_id:0})
      res.status(200).send({
        product,
        message : "Products Fetch Successfilly !!!"
      })
    } catch (error) {
      res.status(500).send({
        error,
        message : "Internal Server Error"
      })
    }
  })


  app.get("/oneproduct/:id", async(req, res) => {
    try {
      let product = await ProductModel.findOne({ _id : req.params.id})
      res.status(200).send({
        product,
        message : "Products Fetch Successfilly !!!"
      })
    } catch (error) {
      res.status(500).send({
        error,
        message : "Internal Server Error"
      })
    }
  })


  app.delete("/deleteprod/:id", async (req, res) => {
    try {
      let product = await ProductModel.findOne({ _id : req.params.id })
      if (product) {
        let product = await ProductModel.deleteOne({ _id : req.params.id })
        res.status(200).send({
          message : "Product Deleted Successfully !!!"
        })
      }
      else {
        res.status(400).send({
          message : "Product Does Not Exists"
        })
      }
    } catch (error) {
      res.status(500).send({
        error,
        message : "Internal Server Error"
      })
    }
  })


  app.put("/updateprod/:id", async(req, res) => {
    try {
      let product = await ProductModel.findOne({ _id : req.params.id })
      if (product) {
        product.Name = req.body.Name
        product.Price = req.body.Price
        product.Url = req.body.Url
        product.Quantity = req.body.Quantity
        product.Hours = req.body.Hours

        await product.save()

        res.status(200).send({
          message : "Product Update Successfully !!!"
        })
      }
      else {
        res.status(400).send({ message: "Product Does Not Exists!" })
      }
    } catch (error) {
      res.status(500).send({
        error, message : "Internal Servar Error"
      })
    }
  })


  

  app.listen(process.env.PORT, () => console.log(`servar started in localhost:${process.env.PORT}`));

