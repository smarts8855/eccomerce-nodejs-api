const express = require('express');
const { Category } = require('../models/Category');
const router = express.Router();
const { Product } = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image type');

      if(isValid){
        uploadError = null;
      }

      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {

      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage });


// route get all product data
// get method
router.get('/', async (req, res) => {
    const productList = await Product.find().populate('category')

    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList);
});

// routes to post product
// post method
router.post('/', uploadOptions.single('image'), async(req, res) => {
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(404).send('Invalid category');

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request');
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name:req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    product = await product.save();
    if(!product)
      return res.status(404).send('This product can not created.');

      res.send(product);

    
   
});

// route to get single productg
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product);
});


// route to update product

router.put('/:id',uploadOptions.single('image'), async(req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send('Invalid Product ID')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(404).send('Invalid category');
    
    const product = await Product.findById(req.body.category);
    if(!product) return res.status(404).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if(file){
        const fileName = file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`
    }else{
        imagepath = product.image
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    )
    if(!updatedProduct)
      return res.status(404).send('The product with this ID is not found.');

      res.send(updatedProduct);
});

// rute to delete product
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product){
            return res.status(200).json({
                success: true,
                message: 'The product was removed successfully.'
            })
        }else{
            return res.status(404).json({success: false, message: 'The product could not be found.'});
        }
    }).catch(err =>{
        return res.status(500).json({success: false, message: err});
    });
});

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments();

    if(!productCount){
        res.status(500).json({success: false})
    }
    res.send({
        productCount: productCount
    });
});

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({isFeatured: true}).limit(count);

    if(!products){
        res.status(500).json({success: false})
    }
    res.send(products);
});

//update image gallery
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async(req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send('Invalid Product ID')
    }
    const files = req.files
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if(files){
        files.map(file => {
            imagesPaths.push(`${basePath}${file.filename}`);
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    )

    if(!product)
       return request.status(500).send('The Product images cannot be uploaded')
    res.send(product);
})


module.exports = router;