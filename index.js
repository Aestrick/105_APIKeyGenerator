const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // Library bawaan buat generate API Key acak
const app = express();
const port = 3000;
const db = require('./models');

// Middleware
app.use(cors()); // Biar frontend bisa akses backend
app.use(express.json()); // Biar bisa baca data JSON dari frontend

// ==========================================
// 1. CONFIG FRONTEND (PENTING)
// ==========================================
// Ini biar pas buka localhost:3000, yang muncul file di folder 'public'
app.use(express.static('public'));


// ==========================================
// 2. RUTE API (BACKEND)
// ==========================================

// A. REGISTER USER & GENERATE API KEY
app.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        // Validasi sederhana
        if (!firstName || !email) {
            return res.status(400).json({ message: "Data tidak lengkap" });
        }

        // Generate Random API Key (32 karakter hex)
        const newApiKey = crypto.randomBytes(16).toString('hex');

        // Simpan ke Database MySQL
        const newUser = await db.User.create({
            firstName,
            lastName,
            email,
            api_key: newApiKey,
            status: 'Aktif'
        });

        res.status(201).json({
            success: true,
            message: 'User berhasil disimpan',
            data: newUser
        });
    } catch (error) {
        console.error("Error Register:", error);
        res.status(500).json({ message: 'Gagal menyimpan user (Email/API Key mungkin duplikat)' });
    }
});

// B. ADMIN LOGIN
app.post('/admin-login', (req, res) => {
    const { email, password } = req.body;

    // Cek Login Hardcode (Sederhana)
    if (email === 'admin@admin.com' && password === 'admin') {
        res.json({ success: true, message: "Login Berhasil" });
    } else {
        res.status(401).json({ success: false, message: 'Email atau Password Salah' });
    }
});

// C. GET ALL USERS (BUAT DASHBOARD ADMIN)
app.get('/users', async (req, res) => {
    try {
        const users = await db.User.findAll(); // Ambil semua data dari tabel users
        res.json(users);
    } catch (error) {
        console.error("Error Get Users:", error);
        res.status(500).json({ message: 'Error mengambil data users' });
    }
});

// D. DELETE USER (BUAT TOMBOL HAPUS)
app.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // 1. Cari user berdasarkan ID
        const user = await db.User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        // 2. Hapus user dari database
        await user.destroy();

        res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) {
        console.error("Error Delete User:", error);
        res.status(500).json({ success: false, message: 'Gagal menghapus user' });
    }
});


// Jalankan Server
app.listen(port, () => {
    console.log(`Server jalan di http://localhost:${port}`);
});