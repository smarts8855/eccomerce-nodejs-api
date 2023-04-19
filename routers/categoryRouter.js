const express = require('express');
const { Category } = require('../models/Category');
const router = express.Router();



// get method
router.get('/', async (req, res) => {
    const categorytList = await Category.find()

    if(!categorytList){
        res.status(500).json({success: false})
    }
    res.send(categorytList);
});

// post method
router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

     category = await category.save();
     if(!category){
        return res.status(404).send('The category cannot be crated')
     }

     res.send(category);
   
});

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category){
            return res.status(200).json({
                success: true,
                message: 'The category was removed successfully.'
            })
        }else{
            return res.status(404).json({success: false, message: 'The category could not be found.'});
        }
    }).catch(err =>{
        return res.status(500).json({success: false, message: err});
    });
});

router.put('/:id', async(req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        {new: true}
    )
    if(!category)
      return res.status(404).send('The category with this ID is not found.');

      res.send(category);
});

// category count
router.get('/get/count', async (req, res) => {
    const categoryCount = await Category.countDocuments();

    if(!categoryCount){
        res.status(500).json({success: false})
    }
    res.send({
        categoryCount: categoryCount
    });
});

module.exports = router;