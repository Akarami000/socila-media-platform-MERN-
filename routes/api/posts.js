const express = require('express')
const router = express.Router()
const {check,validationResult}= require('express-validator')
const auth = require('../../middleware/auth')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

//@rout GET api/post
//@des test rout
//@access pubic

router.post('/',[auth,[
    check('text','text is require')
    .not()
    .isEmpty()
]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
return res.status(400).json({errors:errors.array()})
    }
try {

    const  user =  await User.findById(req.user.id).select('-password');

    const newPost = new Post({
        text:req.body.text,
        name:user.name,
        avatar: user.avatar,
        user : req.user.id

    })
    const post  = await newPost.save();
    res.json(post)
    
} catch (err) {
console.errors(err.message);
res.status(500).send('Server Error')    
}

})

//@rout GET api/post
//@des test rout
//@access pubic

router.get('/',auth,async(req,res)=>{
    try {
        const posts = await  Post.find().sort({date:-1})
        res.send(posts)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('server Error')
        
    }
})

//@rout GET api/post/:id
//@des Get psot by ID
//@access private

router.get('/:id',auth,async(req,res)=>{
    try {
        const posts = await  Post.findById(req.params.id)
        if(!posts){
            return res.status(404).json({msg:'post not found'})
        }
        
        res.send(posts)
    } catch (err) {
        console.error(err.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg:'post not found'})
        }
        
        res.status(500).send('server Error')
        
    }
})

//@rout DELET api/posts/:id
//@des delet post
//@access private

router.delete('/:id',auth,async(req,res)=>{
    try {
        const post = await  Post.findById(req.params.id);
      if(!post){
          return res.status(404).json({msg:'post not found'})
      }
      //check user
      if(post.user.toString() !== req.user.id){
          return res.status(401).json({msg:"User not authoriszed"})
      }

      await post.remove();
      
        res.json({msg:'post removed'})
    } catch (err) {
        console.error(err.message)
        if(err.kind === 'ObjectId')
        {
            return res.status(404).json({msg:'Post not found'})
        }
        res.status(500).send('server Error')
        
    }
})


//@rout PUT api/posts/like/:id
//@des like a post
//@access private

router.put('/like/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

    //Check if the post has alredy been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
    return res.status(400).json({msg:'Post already liked'});
    }
    post.likes.unshift({user:req.user.id});
    await post.save();
    res.json(post.likes)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
        
    }
})


//@rout PUT api/posts/like/:id
//@des like a post
//@access private

router.put('/unlike/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)

    //Check if the post has alredy been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
    return res.status(400).json({msg:'Post has not yet been liked'});
    }
    
    //Get remove index
    const removeIndex = post.likes
    .map(like => like.user.toString())
    .indexOf(req.user.id);

    post.likes.splice(removeIndex,1)
    
    await post.save();
    
    res.json(post.likes)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
        
    }
})

//@rout post api/posts/comment/:id
//@des comment on a post
//@access private

router.post('/comment/:id',[auth,[
    check('text','text is require')
    .not()
    .isEmpty()
]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
return res.status(400).json({errors:errors.array()})
    }
try {

    const  user =  await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id)

    const newComments = new Post({
        text:req.body.text,
        name:user.name,
        avatar: user.avatar,
        user : req.user.id

    })
    post.comments.unshift(newComments) 
    await post.save();
    res.json(post.comments)
    
} catch (err) {
console.errors(err.message);
res.status(500).send('Server Error')    
}

})


//@rout DELETE api/posts/comment/:id/:comment_id
//@des DELETE comment
//@access private

router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
//Pull out comment
const comment = post.comments.find(
    comment=>comment.id === req.params.comment_id
);
//make sure the comment exits
if(!comment){
    return res.status(404).json({msg:"Comment does not exits"})
}
//check user 
if(comment.user.toString() !==req.user.id){
    return res.status(401).json({msg:'User not authorized'})
}
//Get remove index
const removeIndex = post.comments
.map(comment => comment.user.toString())
.indexOf(req.user.id);

post.comments.splice(removeIndex,1)

await post.save();

res.json(post.comments)

    } catch (err) {
        console.errors(err.message);
res.status(500).send('Server Error')  
    }
})


module.exports= router