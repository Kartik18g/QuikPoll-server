import {Router} from 'express'
import {User} from '../mongodb/models/index'

const router = Router()

router.get("/:id",async(req,res)=>{
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        return res.json({
            message: 'user fetched successfully',
            success: true,
            data:{
                user
            }
        })
    } catch (error) {
        console.log(error)
        return res.json({
            message: 'Something went wrong',
            success: false,
            data:{
                user:null
            }
        })
    }
})

router.post('/', async (req, res) => {
    try {
        const {name} = req.body
        const user = new User({name})
        await user.save()
         res.json({
            message: 'User created',
            success: true,
            data:{user}
        })
    } catch (error) {
        console.log(error)
        res.json({
            message: 'Something went wrong',
            success: false,
            data:{user:null}
        })
    }
})

export default router