/**
 * Modul database lokal untuk fitur Penghitung IMT.
 *
 * Kenapa ada berkas ini?
 * - Halaman UI (imt.tsx) fokusus ke tampilan dan interaksi.
 * - Logika SQLite dikumpulkan di sini supaya kode lebih rapi dan mudah dipelajari.
 *
 * Teknologi: expo-sqlite (SQLite di perangkat, bukan server).
 * File database di HP: imt.db
 *
 * Operasi yang tersedia (CRUD sebagian):
 * - Create → simpanHasilIMT
 * - Read   → ambilRiwayatIMT
 * - Delete → hapusRiwayatIMT / hapusSemuaRiwayatIMT
 * - Update → belum dibuat (bisa jadi latihan lanjutan)
 */
import * as SQLite from 'expo-sqlite';

/**
 * Bentuk data yang dipakai di sisi TypeScript / UI.
 * Nama field memakai camelCase (dibuatPada) agar nyaman di React.
 */
export type RiwayatIMT = {
  id: number;
  berat: number;
  tinggi: number;
  nilai: number;
  kategori: string;
  saran: string;
  dibuatPada: string;
};

/**
 * Bentuk baris mentah dari SQLite.
 * Nama kolom mengikuti konvensi SQL (snake_case: dibuat_pada).
 * Nanti diubah ke RiwayatIMT lewat fungsi mapRow().
 */
type RiwayatIMTRow = {
  id: number;
  berat: number;
  tinggi: number;
  nilai: number;
  kategori: string;
  saran: string;
  dibuat_pada: string;
};

/**
 * Menyimpan janji (Promise) koneksi database.
 * Tujuannya: database hanya dibuka sekali (pola singleton),
 * lalu dipakai ulang oleh fungsi simpan/baca/hapus.
 */
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Membuka database dan memastikan tabel sudah siap.
 *
 * Alur singkat:
 * 1. Jika belum pernah dibuka → buat koneksi ke imt.db
 * 2. Jalankan SQL untuk membuat tabel (jika belum ada)
 * 3. Kembalikan objek database siap dipakai
 */
async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      // openDatabaseAsync membuat file imt.db otomatis jika belum ada
      const db = await SQLite.openDatabaseAsync('imt.db');

      /**
       * execAsync dipakai untuk menjalankan beberapa perintah SQL sekaligus.
       *
       * PRAGMA journal_mode = WAL
       * → mode penulisan yang lebih aman/cepat untuk SQLite modern.
       *
       * CREATE TABLE IF NOT EXISTS
       * → buat tabel hanya jika belum ada (aman dipanggil berkali-kali).
       *
       * Kolom penting:
       * - id: nomor unik otomatis (PRIMARY KEY AUTOINCREMENT)
       * - REAL: angka desimal (berat, tinggi, nilai IMT)
       * - TEXT: teks (kategori, saran, waktu)
       * - NOT NULL: wajib diisi
       */
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS riwayat_imt (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          berat REAL NOT NULL,
          tinggi REAL NOT NULL,
          nilai REAL NOT NULL,
          kategori TEXT NOT NULL,
          saran TEXT NOT NULL,
          dibuat_pada TEXT NOT NULL
        );
      `);
      return db;
    })();
  }

  return dbPromise;
}

/**
 * Mengubah baris SQLite (dibuat_pada) menjadi objek UI (dibuatPada).
 * Pemisahan nama ini umum: database pakai snake_case, JS/TS pakai camelCase.
 */
function mapRow(row: RiwayatIMTRow): RiwayatIMT {
  return {
    id: row.id,
    berat: row.berat,
    tinggi: row.tinggi,
    nilai: row.nilai,
    kategori: row.kategori,
    saran: row.saran,
    dibuatPada: row.dibuat_pada,
  };
}

/**
 * CREATE — menyimpan satu hasil perhitungan IMT ke database.
 *
 * Tanda ? pada query adalah parameter (placeholder).
 * Nilainya diisi dari argumen berikutnya, bukan digabung ke string SQL.
 * Cara ini lebih aman (mengurangi risiko SQL injection) dan lebih rapi.
 *
 * lastInsertRowId = id otomatis yang baru dibuat oleh SQLite.
 */
export async function simpanHasilIMT(input: {
  berat: number;
  tinggi: number;
  nilai: number;
  kategori: string;
  saran: string;
}) {
  const db = await getDb();
  // ISO string contoh: 2026-11-05T02:30:00.000Z (mudah diurutkan & di-parse)
  const dibuatPada = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO riwayat_imt (berat, tinggi, nilai, kategori, saran, dibuat_pada)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.berat,
    input.tinggi,
    input.nilai,
    input.kategori,
    input.saran,
    dibuatPada
  );

  return {
    id: Number(result.lastInsertRowId),
    ...input,
    dibuatPada,
  } satisfies RiwayatIMT;
}

/**
 * READ — mengambil daftar riwayat IMT.
 *
 * ORDER BY id DESC → data terbaru muncul lebih dulu.
 * LIMIT ? → batasi jumlah baris (default 20) agar tampilan tidak terlalu panjang.
 * getAllAsync → mengembalikan array objek hasil query.
 */
export async function ambilRiwayatIMT(batas = 20) {
  const db = await getDb();
  const rows = await db.getAllAsync<RiwayatIMTRow>(
    `SELECT id, berat, tinggi, nilai, kategori, saran, dibuat_pada
     FROM riwayat_imt
     ORDER BY id DESC
     LIMIT ?`,
    batas
  );
  // Ubah setiap baris SQL menjadi bentuk yang siap dipakai UI
  return rows.map(mapRow);
}

/**
 * DELETE — menghapus satu riwayat berdasarkan id.
 * Hanya baris dengan id yang cocok yang dihapus.
 */
export async function hapusRiwayatIMT(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM riwayat_imt WHERE id = ?', id);
}

/**
 * DELETE — menghapus semua riwayat IMT.
 * Tabel tetap ada; isinya saja dikosongkan.
 */
export async function hapusSemuaRiwayatIMT() {
  const db = await getDb();
  await db.runAsync('DELETE FROM riwayat_imt');
}
