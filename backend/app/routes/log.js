const express = require('express');
const router = express.Router();
const pool = require('../config/dbcon');
const authenticateToken = require('../middleware/authMiddleware');
const { encrypt, decrypt } = require('../utils/cryptoHelper');

/* =========================
   Helper: ดึง IP และ Encrypt
========================= */
const getSafeEncryptedIp = (req) => {
    try {
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '0.0.0.0';
        return encrypt(ip);
    } catch (err) {
        console.error('IP Encryption Error:', err.message);
        return 'encryption_error'; 
    }
};

/* =========================
   1. Log การเข้าชมหลัก (Nuxt Middleware เรียกใช้)
========================= */
router.post('/log-visit', async (req, res) => {
    const client = await pool.connect();
    try {
        const { path, method } = req.body;
        let artisanId = path?.match(/\/artisan\/(\d+)/)?.[1] || null;
        let productId = path?.match(/\/product\/(\d+)/)?.[1] || null;

        const logData = {
            ip: getSafeEncryptedIp(req),
            user_agent: req.headers['user-agent'] || 'unknown',
            path: path || '/',
            method: method || 'GET',
            referrer: req.headers.referer || null,
            lang: req.headers['accept-language'] || null,
            artisan_id: artisanId ? parseInt(artisanId, 10) : null,
            product_id: productId ? parseInt(productId, 10) : null
        };

        await client.query('BEGIN');
        // บันทึก Log กลาง
        await client.query('INSERT INTO web_page_visit (log_data, visit_time) VALUES ($1, NOW())', [logData]);

        // อัปเดตยอดวิวสรุป (ถ้าเป็นหน้าปราชญ์หรือสินค้า)
        if (logData.artisan_id) {
            await client.query(`
                INSERT INTO artisan_view_summary (artisan_id, total_views, last_updated)
                VALUES ($1, 1, NOW()) ON CONFLICT (artisan_id) 
                DO UPDATE SET total_views = artisan_view_summary.total_views + 1, last_updated = NOW();
            `, [logData.artisan_id]);
        }
        if (logData.product_id) {
            await client.query(`
                INSERT INTO product_view_summary (product_id, total_views, last_updated)
                VALUES ($1, 1, NOW()) ON CONFLICT (product_id) 
                DO UPDATE SET total_views = product_view_summary.total_views + 1, last_updated = NOW();
            `, [logData.product_id]);
        }

        await client.query('COMMIT');
        res.sendStatus(204);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Visit Log Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
});

/* =========================
   2. Export Visit Logs (ถอดรหัส IP ใน CSV)
========================= */
router.get('/export-visit-logs', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM web_page_visit ORDER BY visit_time DESC');
        const logs = result.rows;
        if (logs.length === 0) return res.status(404).send('No logs found');

        const headers = Object.keys(logs[0]);
        const csvRows = [headers.join(',')];

        logs.forEach(row => {
            const values = headers.map(header => {
                let val = row[header];
                // ถอดรหัส IP ถ้าเป็นคอลัมน์ log_data
                if (header === 'log_data' && val && val.ip) {
                    try { val.ip = decrypt(val.ip); } catch (e) { val.ip = 'decrypt_error'; }
                }
                // Format ข้อมูลสำหรับ CSV
                if (val instanceof Date) val = val.toISOString().replace('T', ' ').substring(0, 19);
                else if (typeof val === 'object') val = JSON.stringify(val).replace(/"/g, '""');
                else val = String(val || '').replace(/"/g, '""');
                
                return `"${val}"`;
            });
            csvRows.push(values.join(','));
        });

        const fileName = `visit_logs_decrypted_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.status(200).send('\uFEFF' + csvRows.join('\n'));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   3. Log การกระทำของ Admin (audit_log)
========================= */
router.post('/log-admin-action', authenticateToken, async (req, res) => {
    try {
        const { path, action, errorMessage } = req.body;
        const logData = {
            ip: getSafeEncryptedIp(req),
            user_agent: req.headers['user-agent'],
            path,
            action_type: action?.toUpperCase() || 'UNKNOWN',
            message: errorMessage || 'Success',
            admin_id: req.user?.id // ข้อมูลจาก authMiddleware
        };

        await pool.query('INSERT INTO audit_log (log_data, created_at) VALUES ($1, NOW())', [logData]);
        res.sendStatus(204);
    } catch (error) {
        console.error('Admin Log Error:', error.message);
        res.status(500).send('Internal Error');
    }
});

module.exports = router;