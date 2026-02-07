const express = require('express');
const router = express.Router();
const config = require('../config');

// Get all districts from config
router.get('/', async (req, res) => {
    try {
        // Get districts from config
        const districts = config.NEPAL_DISTRICTS;
        
        res.json({
            status: 'Success',
            message: 'Districts retrieved successfully',
            data: districts
        });
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({
            status: 'Error',
            message: 'Failed to fetch districts',
            error: error.message
        });
    }
});

module.exports = router;
