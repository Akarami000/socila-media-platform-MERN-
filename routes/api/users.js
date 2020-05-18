const express = require('express')
const router = express.Router()
const { check ,validationResult }= require('express-validator')
const User = require('../../models/User')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('config')

//@rout POST api/user
//@des Regester user
//@access pubic

router.post ('/',[
    check('name','Name is require')
    .not()
    .isEmpty(),
    check('email','Please include the email').isEmail(),
    check('password','Please enter the password with 6 or more character').isLength({min:6})
],
async(req,res)=>{
const errors = validationResult(req)
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
}

const{name,email, password} = req.body;


try{
//see if user exists
let  user  = await User.findOne({email});

if(user){
   return res.status(400).json({errors:[{msg:"user already exists"}]})
}

// get user gravatar
const avatar =gravatar.url(email,{
    s:'200',
    r:'pg',
    d:'mm'
})

user = new User({
    name,
    email,
    avatar,
    password
})
//Encrypt password
const salt = await bcrypt.genSalt(10);

user.password = await bcrypt.hash(password,salt)

await user.save()

//return jsonbtoken
const payload ={
    user:{
        id:user.id

    }
}
jwt.sign(payload,config.get('jwtSecret'),
{expiresIn:360000},
(err,token)=>{
    if(err) throw err;
    res.json({token})
}
)

// res.send('User registered')

}

catch(err){
console.error(err.message);
res.status(500).send('server error')
}
})

module.exports= router