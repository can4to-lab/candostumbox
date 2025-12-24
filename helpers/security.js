const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// .env dosyasından gizli anahtarı alalım (yoksa varsayılan bir değer - sadece dev için)
const JWT_SECRET = process.env.JWT_SECRET || "gizli_anahtariniz_buraya";

class Security {
    
    // 1. Şifreleme (Hashing)
    // Kullanıcının şifresini veritabanına kaydetmeden önce karıştırır.
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10); // Zorluk derecesi (tuzlama)
        return await bcrypt.hash(password, salt);
    }

    // 2. Şifre Doğrulama (Login)
    // Kullanıcının girdiği şifre ile veritabanındaki hash'i karşılaştırır.
    static async comparePassword(inputPassword, storedHash) {
        return await bcrypt.compare(inputPassword, storedHash);
    }

    // 3. Token Oluşturma (JWT Sign)
    // Kullanıcı giriş yaptığında ona kimlik kartı (token) verir.
    static generateToken(payload) {
        // Payload: Token içine gömülecek veri (örn: user_id, email)
        // expiresIn: Token'ın geçerlilik süresi (örn: 1 gün)
        return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
    }

    // 4. Token Doğrulama (Verify)
    // Gelen isteklerin yetkili olup olmadığını kontrol eder.
    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null; // Token geçersiz veya süresi dolmuş
        }
    }
}

module.exports = Security;