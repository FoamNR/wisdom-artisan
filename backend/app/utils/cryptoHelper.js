const crypto = require('crypto');

// ดึงค่าจาก ENV
const rawKey = process.env.ENCRYPTION_KEY || 'default_secret_key_at_least_32_chars';

// บังคับให้ Key มีความยาว 32 Bytes เสมอ (ใช้ Buffer.alloc เพื่อจองพื้นที่ 32 bytes)
const ENCRYPTION_KEY = Buffer.alloc(32, rawKey, 'utf8'); 
const IV_LENGTH = 16; 

function encrypt(text) {
    try {
        if (!text) return null;

        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        
        let encrypted = cipher.update(String(text));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        // ส่งกลับในรูปแบบ iv:encrypted_data
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption Process Error:', error.message);
        throw new Error('Failed to encrypt');
    }
}

function decrypt(text) {
    try {
        if (!text || !text.includes(':')) return text;

        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption Process Error:', error.message);
        return 'decryption_error';
    }
}

module.exports = { encrypt, decrypt };