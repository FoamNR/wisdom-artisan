const express = require('express');
const router = express.Router();
const pool = require('../config/dbcon');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/artisan', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                artisan.fname AS artisan_fname,
                artisan.lname AS artisan_lname,
                users.fname AS user_fname,
                users.lname AS user_lname,
                TO_CHAR(artisan.created_at, 'DD/MM/YYYY HH24:MI') AS created_at,
                TO_CHAR(artisan.updated_at, 'DD/MM/YYYY HH24:MI') AS updated_at
            FROM artisan
            JOIN users ON artisan.created_by = users.user_id
            ORDER BY artisan.artisan_id DESC
            LIMIT 1;
        `);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/category', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                category.category_name,
                users.fname AS user_fname,
                users.lname AS user_lname,
                TO_CHAR(category.updated_at, 'DD/MM/YYYY HH24:MI') AS updated_at
            FROM category
            JOIN users ON category.updated_by = users.user_id
            ORDER BY category.updated_at DESC
            LIMIT 1
        `);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


module.exports = router;