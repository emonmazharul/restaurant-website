import jwt from 'jsonwebtoken'
import Router from 'express'


function play() {
  const chunk = jwt.sign({
    email:'dev.mazharul@gmail.com',
  
  }, process.env.JWT_SECRET || 'thisissecret', {expiresIn:'1h'});
  console.log(chunk);
  let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRldi5tYXpoYXJ1bEBnbWFpbC5jb20iLCJpYXQiOjE3NjIwMzc1MDgsImV4cCI6MTc2MjA0MTEwOH0.TWwaWWmYtjfnLT3agvyoF6K52r3sAT-w529JIadjhO0`;
  const auth = jwt.verify(token, 'thisissecret', (err,decode) => {
    console.log(decode);
    if(decode) return 'still valid token';
     return 'things are working';
    
  });
  console.log(auth)
}
const router = new Router();

router.get('/', (req,res) => {
    res.send({message:'hello how areyou'});
})


export default router;