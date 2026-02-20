const express = require('express');
const router = express.Router();
const pool = require('../config/dbcon'); 

// GET / - ดึงรายการ Gallery พร้อมยอดวิว (จากตาราง Summary)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    // แก้ไข Query:
    // 1. เปลี่ยน LEFT JOIN จาก web_page_visit เป็น product_view_summary
    // 2. ใช้ COALESCE(..., 0) เพื่อให้สินค้าที่ยังไม่มีวิวโชว์เลข 0 แทน NULL
    // 3. เอา GROUP BY ออก (เพราะ 1 gallery มี 1 ยอดวิวในตาราง summary อยู่แล้ว ไม่ต้อง count)
    let queryText = `
      SELECT
        ag.*,
        COALESCE(pvs.total_views, 0) AS total_views
      FROM artisan_gallery ag
      JOIN artisan a ON ag.artisan_id = a.artisan_id
      LEFT JOIN product_view_summary pvs 
        ON ag.gallery_id = pvs.product_id
      WHERE a.status = 'เผยแพร่'
    `;

    let queryParams = [];

    if (search) {
      queryText += `
        AND (
          ag.name_gallery ILIKE $1
          OR ag.caption ILIKE $1
        )
      `;
      queryParams.push(`%${search}%`);
    }

    // เรียงลำดับตามยอดวิว (มากไปน้อย)
    queryText += `
      ORDER BY total_views DESC, ag.gallery_id DESC
    `;

    const result = await pool.query(queryText, queryParams);

    // แปลงค่า total_views จาก String (BigInt ของ Postgres) เป็น Number
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


// GET /:id - ดึงรายละเอียด Gallery พร้อมยอดวิว
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // เพิ่ม LEFT JOIN product_view_summary เพื่อเอายอดวิวมาแสดงในหน้า Detail ด้วย
        const result = await pool.query(`
            SELECT 
                artisan_gallery.gallery_id,
                artisan_gallery.name_gallery,
                artisan_gallery.caption,
                artisan_gallery.image_url,
                artisan.artisan_id,
                artisan.fname,
                artisan.lname,
                artisan.province,
                artisan.profile_img,
                category.category_name,
                COALESCE(pvs.total_views, 0) AS total_views
            FROM artisan_gallery
            JOIN artisan ON artisan_gallery.artisan_id = artisan.artisan_id
            JOIN category ON artisan.category_id = category.category_id
            LEFT JOIN product_view_summary pvs ON artisan_gallery.gallery_id = pvs.product_id
            WHERE artisan_gallery.gallery_id = $1;
        `, [id]);       
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Gallery not found' });
        }

        // แปลง BigInt เป็น Int ก่อนส่งกลับ
        const data = result.rows[0];
        data.total_views = parseInt(data.total_views, 10) || 0;

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;