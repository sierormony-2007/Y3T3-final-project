const express = require('express');
const router = express.Router();
const { DeviceCategory} = require('../models');

router.get('/', async (req, res) =>{
    try {
        const categories = await DeviceCategory.findAll();
        res.json(categories);
    }catch (err) {
        res.status(500).json({ message: err.message});
    }
});
module.exports = router;