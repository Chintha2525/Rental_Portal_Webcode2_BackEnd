const validator = require("validator")
const mongoose = require("mongoose")

let userSchema = new mongoose.Schema(
    {
        name:{type:String,required:true},
        email:{
            type:String,
            required:true,
            lowercase:true,
            validate:(value)=>{
                return validator.isEmail(value)
            }
        },
        password:{type:String,required:true},
        role:{type:String,default:'user'},
        createdAt:{type:Date,default:Date.now}
    },
    {
       collection:'admin',
       versionKey:false
    }
)


let ProductSchema = new mongoose.Schema(
    {
        Name:{type:String,required:true},
        Price:{type:String,required:true},
        Url:{type:String,required:true},
        Quantity:{type:Number,required:true},
        Hours:{type:String,required:true},
        startDate:{type:Date,required:false},
        endDate:{type:Date,required:false},
    },
    
    {
       collection:'products',
       versionKey:false
    }
)


let AdminModel = mongoose.model('admin', userSchema)

let ProductModel = mongoose.model("products", ProductSchema)

module.exports={ AdminModel, ProductModel }


