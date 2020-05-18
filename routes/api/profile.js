const express = require('express')
const router = express.Router()
const auth  = require('../../middleware/auth') 
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const {check , validationResult} = require('express-validator')
const request = require('request') 
const config = require('config')   
const Post = require('../../models/Post')
//@rout GET api/profile/me
//@des Get current user
//@access private
router.get('/me',auth,async(req,res)=>{
try{
 const profile = await Profile.findOne({user:req.user.id}).populate('user',["name",'avatar']);

 if(!profile){
     return res.status(400).json({msg:"Profile not exits"})
 } 
res.json(profile)
}
catch(err){
    console.error(err.message)
    res.status(500).send("Server Error")
}
})

//@rout POST api/profile
//@des Create user profile
//@access private

router.post('/',[auth,[check('status','Status is requir')
.not()
.isEmpty(),check('skills',"skills is require")
.not()
.isEmpty()
]],
async(req,res)=>{
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
}
const{
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
} = req.body;
 
///build profile object
const profileFields = {};
profileFields.user = req.user.id;
if(company) profileFields.company = company;
if (website)profileFields.website = website ;
if (location)profileFields.location= location;
if (bio) profileFields.bio= bio;
if (status) profileFields.status=status;
if (githubusername)profileFields.githubusername = githubusername;
if (skills){
    profileFields.skills = skills.split(',').map(skills => skills.trim())
}
 //build social object
 profileFields.social = {};
 if (youtube) profileFields.social.youtube = youtube;
 if (twitter) profileFields.social.twitter = twitter;
 if (facebook) profileFields.social.facebook = facebook;
 if (linkedin) profileFields.social.linkedin = linkedin;
 if (instagram) profileFields.social.instagram = instagram;

 try{
let profile = await Profile.findOne({user:req.user.id})
if(profile){
    //update
    profile = await Profile.findOneAndUpdate(
        {user:req.user.id},
        {$set:profileFields},
        {new:true}
        );
        return res.json(profile)

        
} 
//Create
profile = new Profile(profileFields);
await profile.save();
res.json(profile);
}
catch(err){
     console.error(err.message);
     res.status(500).send('Serever error');
 
}
})
//@rout GET api/profile
//@des get all profile by user id
//@access private
router.get('/',async(req,res)=>{
    try {
        const profiles = await Profile.find().populate('user',['name','avatar'])
        res.json(profiles)
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("server Error")
    }
})

//@rout POST api/profile/user/:user_id
//@des Create user profile by user id
//@access private
router.get('/user/:user_id',async(req,res)=>{
    try{
const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
if(!profile) return res.status(400).json({msg:"Profile not found "});


res.json(profile)

    }
    catch(err){
        console.error(err.message);
        if(err.kind == "ObjectId"){
return res.status(400).json({msg:"Profile not found"})
        }
        res.status(500).send("Server error")
    }

})

//@rout DELETE api/profile
//@des DELETE profile user and Posts
//@access private
router.delete('/',auth,async(req,res)=>{
    try {
        // Remove user posts
        await Post.deleteMany({user:req.user.id})
        //remove profile
         await Profile.findOneAndRemove({user:req.user.id})
        //remove user
        await User.findOneAndRemove({_id:req.user.id})
         res.json({msg:"User deleted"})
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("server Error")
    }
}) 

//@rout PUT api/profile/experience
//@des Add profile experience 
//@access private
router.put('/experience',[auth,[
    check('title',"Title is requried").not().isEmpty(),
    check('company',"company is required").not().isEmpty(),
    check('from','From date is requried').not().isEmpty()

]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }=req.body

    const newExp ={
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id})
        profile.experience.unshift(newExp); //unshit to push
        await profile.save()    
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
        
    }

})
//@rout DELETE api/profile/experience/:exp-id
//@des DELETE experience from profile 
//@access private

router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.user.id})
        
        //get remove
        const removeIndex = profile.experience
        .map(item=>item.id)
        .indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex,1)

        await profile.save();
        res.json(profile)

    } catch (err) {
        console.error(err.message)  
        res.status(500).send('Server Error')
        
    }
})


//@rout PUT api/profile/education
//@des Add profile edcation
//@access private
router.put('/education',[auth,[
    check('school',"school is requried").not().isEmpty(),
    check('degree',"Degree is required").not().isEmpty(),
    check('fieldofstudy','Fieldofstudy is requried').not().isEmpty(),
    check('from','From date is require').not().isEmpty()


]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const{
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body

    const newEdu ={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id})
        profile.education.unshift(newEdu); //unshit to push
        await profile.save()    
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
        
    }

})
//@rout DELETE api/profile/education/:edu-id
//@des DELETE education from profile 
//@access private

router.delete('/education/:exp_id',auth,async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.user.id})
        
        //get remove
        const removeIndex = profile.education
        .map(item=>item.id)
        .indexOf(req.params.edu_id);
        profile.education.splice(removeIndex,1)

        await profile.save();
        res.json(profile)

    } catch (err) {
        console.error(err.message)  
        res.status(500).send('Server Error')
        
    }
})

//@rout get api/profile/github:username
//@des get user repos from github 
//@access ppublic

router.get('/github/:username',(req,res)=>{
    try {
        const options = {
uri:`https://api.girhub.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get(
'githubClientId'    
)}&client_secret=${config.get('githubSecret')}`,
method:'GET',
headers:{'user-agent':'node.js'}
        };
        request(options,(errors,response,body)=>{
            if(errors)console.error(errors)
            
            if(response.statusCode!== 200){
               return res.status(404).json({msg:"no Github profile found"})
            }
            res.json(JSON.parse(body))
        })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('server Error')
        
    }
})


module.exports= router