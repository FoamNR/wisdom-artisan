const express = require('express');
const router = express.Router();
const pool = require('../config/dbcon');
const authenticateToken = require('../middleware/authMiddleware');

// GET: ค้นหาและดึงข้อมูลปราชญ์ (สำหรับหน้าบ้าน)
router.get('/', async (req, res) => {
    try {
        const { search, category, province } = req.query;

        // [UPDATED] เพิ่มการ Join กับตาราง artisan_view_summary และดึง total_views
        let queryText = `
            SELECT 
                artisan.artisan_id, 
                artisan.fname, 
                artisan.lname, 
                artisan.profile_img, 
                category.category_name, 
                artisan.province,
                COALESCE(avs.total_views, 0) AS total_views -- แปลง NULL เป็น 0
            FROM artisan 
            JOIN category ON artisan.category_id = category.category_id 
            LEFT JOIN artisan_view_summary avs ON artisan.artisan_id = avs.artisan_id
            WHERE artisan.status = 'เผยแพร่'
        `;

        let queryParams = [];
        let paramCount = 1;

        // 1. เงื่อนไข Search Text
        if (search) {
            queryText += ` AND (fname ILIKE $${paramCount} OR lname ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        // 2. เงื่อนไข Category
        if (category && category !== 'ทั้งหมด') {
            queryText += ` AND category_name = $${paramCount}`;
            queryParams.push(category);
            paramCount++;
        }

        // 3. เงื่อนไข Province
        if (province && province !== 'ทั้งหมด') {
            queryText += ` AND province = $${paramCount}`;
            queryParams.push(province);
            paramCount++;
        }

        // [OPTIONAL] เรียงลำดับตามยอดวิว (มาก -> น้อย) หรือตาม ID
        queryText += ` ORDER BY total_views DESC, artisan.artisan_id DESC`;

        const result = await pool.query(queryText, queryParams);

        // แปลง BigInt เป็น Int
        const rows = result.rows.map(row => ({
            ...row,
            total_views: parseInt(row.total_views, 10) || 0
        }));

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// GET: ข้อมูลสำหรับ Admin Table
router.get('/artisans-data', async (req, res) => {
    try {
        const { search } = req.query;

        // [UPDATED] เพิ่มการดึงยอดวิว
        let query = `
            SELECT 
                artisan_skill.*, 
                category.category_name,
                artisan.fname,
                artisan.lname,
                artisan.nickname,
                artisan.address,
                artisan.phone,
                COALESCE(avs.total_views, 0) AS total_views
            FROM artisan_skill
            JOIN category ON artisan_skill.category_id = category.category_id
            JOIN artisan ON artisan_skill.artisan_id = artisan.artisan_id
            LEFT JOIN artisan_view_summary avs ON artisan.artisan_id = avs.artisan_id
        `;

        let params = [];

        if (search) {
            query += ` WHERE artisan.fname ILIKE $1 
                       OR artisan.lname ILIKE $1 
                       OR category.category_name ILIKE $1 
                       OR artisan_skill.specialty_detail ILIKE $1 
                       OR artisan.address ILIKE $1`;
            params.push(`%${search}%`);
        }

        query += " ORDER BY artisan.artisan_id DESC";

        const result = await pool.query(query, params);

        const rows = result.rows.map(row => ({
            ...row,
            total_views: parseInt(row.total_views, 10) || 0
        }));

        res.status(200).json(rows);

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post('/add', authenticateToken, async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const {
            fname, lname, nickname, address, phone,
            category_name, specialty_detail, story, skill_img
        } = req.body;

        const insertArtisanQuery = `
            INSERT INTO artisan (fname, lname, nickname, address, phone, is_active)
            VALUES ($1, $2, $3, $4, $5, 1)
            RETURNING artisan_id, fname, lname
        `;
        const artisanRes = await client.query(insertArtisanQuery, [
            fname, lname, nickname, address, phone
        ]);
        const newArtisanId = artisanRes.rows[0].artisan_id;

        const catRes = await client.query(
            `SELECT category_id FROM category WHERE category_name = $1`,
            [category_name]
        );

        const categoryId = catRes.rows.length > 0 ? catRes.rows[0].category_id : null;

        const insertSkillQuery = `
            INSERT INTO artisan_skill 
            (artisan_id, category_id, specialty_detail, story, skill_img, category_name)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await client.query(insertSkillQuery, [
            newArtisanId,
            categoryId,
            specialty_detail || '-',
            story || '-',
            skill_img || 'default.jpg',
            category_name
        ]);

        // [UPDATED] สร้าง record ในตารางยอดวิวเตรียมไว้เลย (เริ่มที่ 0)
        await client.query(`
            INSERT INTO artisan_view_summary (artisan_id, total_views) VALUES ($1, 0)
        `, [newArtisanId]);

        await client.query('COMMIT');

        res.status(201).json({
            message: "เพิ่มข้อมูลปราชญ์และทักษะสำเร็จ",
            artisan: artisanRes.rows[0],
            category: category_name
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Add Artisan Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    } finally {
        client.release();
    }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM artisan WHERE artisan_id = $1`,
            [id]
        );

        // Note: artisan_view_summary ควรตั้ง Foreign Key constraint เป็น ON DELETE CASCADE ไว้
        // ถ้าไม่ได้ตั้ง ต้องเพิ่มคำสั่ง DELETE FROM artisan_view_summary WHERE artisan_id = $1 ด้วย

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ" });
        }

        res.json({ message: "ลบข้อมูลสำเร็จ" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/count', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) AS total_artisans,
                COUNT(DISTINCT district) AS total_districts,
                COUNT(DISTINCT province) AS distinct_provinces,
                COUNT(DISTINCT category_id) AS total_categories,
                SUM(CASE WHEN status = 'ฉบับร่าง' THEN 1 ELSE 0 END) AS total_drafts
            FROM artisan
        `);

        res.status(200).json({
            total_artisans: parseInt(result.rows[0].total_artisans),
            total_districts: parseInt(result.rows[0].total_districts),
            distinct_provinces: parseInt(result.rows[0].distinct_provinces),
            total_categories: parseInt(result.rows[0].total_categories),
            total_drafts: parseInt(result.rows[0].total_drafts || 0)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/artisan/by-province', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT province, COUNT(*) AS count
            FROM artisan
            GROUP BY province
            ORDER BY count DESC
            LIMIT 5
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/category/list', async (req, res) => {
    try {
        const result = await pool.query(`select category_id, category_name from category`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET: หน้า Profile รายบุคคล
router.get('/profile/:id', async (req, res) => {
    try {
        const artisan_id = req.params.id;

        // [UPDATED] เพิ่มการ Join กับ artisan_view_summary
        const result = await pool.query(
            `SELECT 
                artisan.artisan_id,
                artisan.fname,
                artisan.lname,
                artisan.profile_img,
                artisan.district,
                artisan.province,
                artisan.phone,
                artisan.biography,
                category.category_name,
                COALESCE(avs.total_views, 0) AS total_views, -- เพิ่มตรงนี้
                artisan_gallery.gallery_id, 
                artisan_gallery.image_url
            FROM artisan
            JOIN category ON artisan.category_id = category.category_id
            LEFT JOIN artisan_gallery ON artisan_gallery.artisan_id = artisan.artisan_id
            LEFT JOIN artisan_view_summary avs ON artisan.artisan_id = avs.artisan_id
            WHERE artisan.artisan_id = $1
            ORDER BY artisan_gallery.gallery_id ASC`,
            [artisan_id]
        );

        // แปลง total_views ในทุก row ให้เป็น Int (ค่าจะเหมือนกันทุก row เพราะเป็นคนเดียวกัน)
        const rows = result.rows.map(row => ({
            ...row,
            total_views: parseInt(row.total_views, 10) || 0
        }));

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/map', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.artisan_id,
                a.fname,
                a.lname,
                a.province,
                a.district,
                a.category_id,
                c.category_name,
                a.status
            FROM artisan a
            JOIN category c ON a.category_id = c.category_id;
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;