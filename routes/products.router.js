const { Router } = require('express');
const pool = require('../database/database');
const router = Router();

router.get('/', async (req, res) => {
    try {
        const offset = req.query.offset ? Number(req.query.offset) : 0;
        const name = req.query.name ? req.query.name : null;
        
        const query = `
            SELECT * FROM product
            WHERE ($1::text IS NULL OR name ILIKE '%' || $1::text || '%')
            ORDER BY NAME ASC
            OFFSET $2
            LIMIT 20;
        `;

        const values = [name, offset];

        const results = await pool.query(query, values);
        res.json({ data: results.rows }).status(200);
    } catch (error) {
        console.log(error);
        res.json({ error }).status(400);
    };
});

module.exports = router;