-- ==============================================================================
-- IDEA SPACE - KIK LKPD 6 (Kelompok 8 - XI PPLG 2)
-- Database Schema & Initial Seed for Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing table if recreating cleanly
DROP TABLE IF EXISTS ideas CASCADE;

-- 3. Create Table 'ideas'
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_num INT4 NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    feasibility INT4 NOT NULL CHECK (feasibility >= 1 AND feasibility <= 5),
    impact INT4 NOT NULL CHECK (impact >= 1 AND impact <= 5),
    total_score INT4 GENERATED ALWAYS AS (feasibility + impact) STORED,
    quadrant TEXT GENERATED ALWAYS AS (
        CASE
            WHEN feasibility >= 4 AND impact >= 4 THEN 'PRIORITAS UTAMA'
            WHEN feasibility <= 3 AND impact >= 4 THEN 'POTENSI'
            WHEN feasibility >= 4 AND impact <= 3 THEN 'PERTIMBANGKAN'
            ELSE 'TUNDA'
        END
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable Row Level Security (RLS) & Policies
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read, insert, update, and delete for school collaboration
CREATE POLICY "Allow public read access" ON ideas
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON ideas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON ideas
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON ideas
    FOR DELETE USING (true);

-- 5. Enable Supabase Realtime for 'ideas' table
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;

-- 6. Initial Seed Data (10 Ide Kelompok 8 - Kelas XI PPLG 2)
INSERT INTO ideas (order_num, name, description, feasibility, impact)
VALUES
(1, 'Fitur Virtual AR Foot Measuring (Kamera HP)', 'Ukur kaki otomatis via kamera HP agar pembeli tidak salah pilih ukuran sandal.', 4, 5),
(2, 'Sistem Dashboard Omnichannel (Gabung Stok)', 'Sinkronisasi stok Shopee, Tokopedia, dan toko fisik dalam satu layar.', 4, 5),
(3, 'Instant Auto-Gateway Payment (Pembayaran Otomatis)', 'Solusi pembayaran otomatis yang mempermudah transaksi, tanpa perlu konfirmasi manual.', 5, 5),
(4, 'AI Smart Chatbot Assistant 24 Jam', 'Asisten chat otomatis 24 jam untuk menjawab konsultasi ukuran dan stok sandal.', 4, 4),
(5, 'Cloud Inventory Management System', 'Pencatatan stok berbasis cloud untuk menggantikan rekap buku manual.', 5, 4),
(6, 'Sistem Self-Service Return (Digital RMA)', 'Formulir pengajuan retur dan tukar ukuran mandiri yang terstruktur di aplikasi.', 4, 4),
(7, 'One-Page Checkout (Percepat Transaksi)', 'Ringkas proses checkout dari 5 langkah menjadi 1 halaman instan.', 5, 4),
(8, 'Fitur Smart Filter AI (Pencarian Ukuran & Warna)', 'Filter pintar ukuran dan warna sandal yang akurat tanpa hasil meleset.', 4, 4),
(9, 'Live Tracking Courier dengan Google Maps', 'Pelacakan posisi kurir pengiriman secara real-time di peta aplikasi.', 3, 4),
(10, 'Sistem Loyalty Point & Review Foto', 'Reward poin diskon bagi pembeli yang mengunggah ulasan beserta foto asli.', 4, 3);

