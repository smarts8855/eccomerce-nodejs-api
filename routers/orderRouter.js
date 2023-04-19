const express = require('express');
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/order-item')
const router = express.Router();




// get method
router.get('/', async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if(!orderList){
        res.status(500).json({success: false})
    }
    res.send(orderList);
});
// get single order
router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ path: 'orderItems', populate: {path: 'product', populate: 'category'}});

    if(!order){
        res.status(500).json({success: false})
    }
    res.send(order);
});

// post method
router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(orderItemIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalprice = orderItem.product.price * orderItem.quantity;
        return totalprice
    }))
    const totalprice = totalPrices.reduce((a,b) => a + b, 0);
    let order = new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalprice,
        user:req.body.user,
    })

     order = await order.save();
     if(!order){
        return res.status(404).send('The Order cannot be crated')
     }

     res.send(order);
   
});

//Update order
router.put('/:id', async(req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
           
        },
        {new: true}
    )
    if(!order)
      return res.status(404).send('The order with this ID is not found.');

      res.send(order);
});

//Delete order
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order){
            await order.orderItems.map(async orderItem => {
             await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({
                success: true,
                message: 'The order was removed successfully.'
            })
        }else{
            return res.status(404).json({success: false, message: 'The order could not be found.'});
        }
    }).catch(err =>{
        return res.status(500).json({success: false, message: err});
    });
});

router.get('/get/totalsales', async(req, res) => {
    const totalSales = await Order.aggregate([
        {$group: {_id: null, totalsales: {$sum: '$totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(404).send('The order sales cannot be generated');
    }
    res.send({tatalsales: totalSales.pop().totalsales})
})

router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments();

    if(!orderCount){
        res.status(500).json({success: false})
    }
    res.send({
        orderCount: orderCount
    });
});

router.get('/get/userorders/:userid', async(req,res) => {
    const userOrderList = await Order.find({user: req.params.userid})
    .populate({ path: 'orderItems', populate: {path: 'product', populate: 'category'}}).sort({'dateOrdered': -1});

    if(!userOrderList){
        res.status(500).json({message: false})
    }
    res.send(userOrderList)
})
module.exports = router;