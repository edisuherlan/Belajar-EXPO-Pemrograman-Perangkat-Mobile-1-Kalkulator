# Modul belajar Expo

Panduan ini mengikuti latihan di proyek `aplikasi-ku`. Bacanya pelan. Satu pelajaran, satu perubahan, lalu lihat hasilnya di HP atau browser. Belum perlu memasang library baru.

Cara menjalankan aplikasi, dari folder proyek:

```bash
npx expo start
```

Di terminal yang sama, tekan `w` untuk browser, atau pindai kode QR dengan Expo Go. Setiap kali file disimpan, layar memperbarui sendiri.

---

## Pelajaran 1. Peta proyek

Anggap proyek ini sebuah rumah. Kamu tidak perlu menghafal semua kamar. Cukup kenali pintu depan dan ruangan yang kamu pakai.

**Layar** ada di folder `src/app/`. Satu file adalah satu layar.

| File | Arti |
|---|---|
| `src/app/index.tsx` | Layar Home, alamat `/` |
| `src/app/explore.tsx` | Layar Explore, alamat `/explore` |
| `src/app/profil.tsx` | Layar Profil, alamat `/profil` |
| `src/app/_layout.tsx` | Bukan layar. Ini pembungkus semua layar |

`_layout.tsx` memilih tema terang atau gelap, menahan splash screen, lalu menampilkan menu tab lewat komponen `AppTabs`.

**Potongan tampilan** yang dipakai ulang ada di `src/components/`. Contohnya `ThemedText` untuk tulisan dan `ThemedView` untuk kotak berwarna.

**Warna dan jarak** ada di `src/constants/theme.ts`. Angka `Spacing.three` sama dengan 16. `Spacing.four` sama dengan 24.

**Identitas aplikasi** ada di `app.json`: nama, ikon, dan warna splash. **Daftar paket** ada di `package.json`.

Tulisan `@/` di perintah impor berarti "mulai dari folder `src`". Jadi `@/components/themed-text` adalah file `src/components/themed-text.tsx`.

Folder `node_modules/` adalah isi paket yang terpasang. Jangan diedit. Folder `ios/` dan `android/` memang belum ada. Expo membuatnya nanti saat aplikasi di-build.

**Coba sendiri.** Buka `src/app/index.tsx`, ganti judul `Belajar Aplikasi Mobile` menjadi namamu, simpan, lalu lihat layar Home.

---

## Pelajaran 2. Dua tempat untuk gaya tulisan

Judul di layar Home memakai dua gaya sekaligus.

Di tengah file, tulisan dibungkus begini:

```tsx
<ThemedText type="title" style={styles.title}>
  Belajar Aplikasi Mobile
</ThemedText>
```

`type="title"` mengambil ukuran dasar dari `src/components/themed-text.tsx`: ukuran 48, ketebalan 600. `style={styles.title}` di bagian bawah `index.tsx` menimpa gaya itu, tetapi hanya untuk judul di layar Home.

Gaya yang sering dipakai pada tulisan:

- `fontSize` mengatur ukuran
- `fontWeight` mengatur ketebalan. `'400'` biasa, `'700'` tebal
- `fontStyle` berisi `'italic'` atau `'normal'`
- `textAlign` berisi `'center'`, `'left'`, atau `'right'`
- `color` mengatur warna

Jenis `type` yang sudah tersedia: `title`, `subtitle`, `default`, `small`, `smallBold`, `code`, `link`. Warna sekunder bisa lewat `themeColor="textSecondary"`.

**Coba sendiri.** Di `styles.title` pada `index.tsx`, ubah `fontSize` dari `34` menjadi `28`. Simpan. Hanya judul Home yang berubah. Kalau kamu mengubah `styles.title` di `themed-text.tsx`, setiap tulisan bertipe `title` di aplikasi ikut berubah. Untuk belajar, mulai dari `index.tsx`.

---

## Pelajaran 3. Layar Home yang bisa disentuh

Layar Home sekarang punya tiga kartu: Teks, Tata letak, dan Platform. Datanya ada di array `topik` di bagian atas `index.tsx`. Tampilan kartunya dibuat dengan mengulang array itu.

Yang terjadi saat kartu disentuh:

1. `useState` menyimpan kartu yang sedang dipilih. Awalnya `'teks'`.
2. `Pressable` memanggil `setAktif` saat ditekan.
3. Kartu yang dipilih mendapat garis biru di kiri.
4. Panel di bawah kartu menampilkan `detail` dari kartu itu.

Tidak ada pindah layar. Yang berubah hanya data di dalam layar yang sama. Itu pola paling kecil untuk interaksi: simpan satu nilai, tampilkan ulang.

Tombol **Buka halaman Explore** memakai `Link` dari `expo-router`. `href="/explore"` membuka file `explore.tsx`.

Label **Browser**, **HP Android**, atau **Emulator Android** datang dari fungsi `namaPlatform()`. `Platform.OS` membaca tempat aplikasi dibuka.

**Coba sendiri, satu per satu.**

1. Ubah kata `judul` pada salah satu objek di array `topik`. Simpan.
2. Ubah `gap` di `styles.list`. Angka lebih besar membuat kartu lebih renggang.
3. Ubah `borderLeftColor` di `styles.cardSelected`. Garis kartu terpilih berganti warna.
4. Sentuh kartu lain. Panel bawah harus ikut berganti.

---

## Pelajaran 4. Jarak di atas menu bawah

Menu bawah sudah punya tinggi sendiri. Layar di atasnya tidak perlu menyisakan pita kosong sebesar menu itu lagi.

Di `styles.content` pada `index.tsx`, `paddingBottom` mengatur ruang di bawah isi. Dulu nilainya sekitar 100 pada Android, jadi isi Home terdorong ke atas dan terasa sempit. Sekarang ruang itu hanya `Spacing.four`, yaitu 24, kecuali di iPhone yang masih membutuhkan sedikit ruang tambahan.

`SafeAreaView` dengan `edges={['top', 'left', 'right']}` menjaga isi agar tidak tertutup jam dan tepian layar, tanpa menambah ruang kosong di bawah.

**Coba sendiri.** Ubah `paddingBottom` menjadi `Spacing.six` (64), simpan, gulir sampai bawah. Ruang kosong di bawah tombol Explore membesar. Kembalikan ke `Spacing.four` kalau sudah terlihat bedanya.

---

## Pelajaran 5. Menambah menu bawah

Satu menu sama dengan satu file layar, lalu didaftarkan dua kali: sekali untuk HP, sekali untuk browser. Keduanya memakai file yang berbeda.

Kamu sudah membuat `src/app/profil.tsx` dan sudah mendaftarkannya di `src/components/app-tabs.tsx`. Di HP, menu Profil seharusnya sudah muncul. Di browser, menu itu belum ada, karena `src/components/app-tabs.web.tsx` masih hanya berisi Home dan Explore.

### Layar

Nama file, tanpa `.tsx`, menjadi alamat. `profil.tsx` dibuka di `/profil`. Isi paling kecilnya sebuah kotak dan satu tulisan:

```tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfilScreen() {
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Profil</ThemedText>
    </ThemedView>
  );
}
```

### Tab di HP

Di `src/components/app-tabs.tsx`, `name` harus sama dengan nama file.

```tsx
<NativeTabs.Trigger name="profil">
  <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
  <NativeTabs.Trigger.Icon
    src={require('@/assets/images/tabIcons/explore.png')}
    renderingMode="template"
  />
</NativeTabs.Trigger>
```

Gambar tab yang sudah tersedia hanya `home.png` dan `explore.png`. Profil masih meminjam ikon Explore. Itu cukup untuk latihan.

### Tab di browser

Di `src/components/app-tabs.web.tsx`, tambahkan ini di samping tombol Explore:

```tsx
<TabTrigger name="profil" href="/profil" asChild>
  <TabButton>Profil</TabButton>
</TabTrigger>
```

Urutan tulisan di kedua file itu yang menentukan urutan menu dari kiri ke kanan. Tiga menu masih nyaman di HP. Lebih dari empat, label mulai sesak.

**Coba sendiri.** Daftarkan Profil di file web, simpan, lalu buka browser dengan menekan `w`. Menu Profil harus muncul. Sentuh menu itu. Layar harus menampilkan tulisan Profil di tengah.

---

## Urutan kalau kamu mengulang dari nol

1. Jalankan `npx expo start` dan buka aplikasinya.
2. Ubah satu kata di `src/app/index.tsx` sampai kamu melihatnya berubah.
3. Ubah `fontSize` judul di `styles.title`.
4. Ubah satu kartu di array `topik`, lalu sentuh kartunya.
5. Ubah `paddingBottom`, lihat ruang di bawah, lalu kembalikan.
6. Pastikan menu Profil ada di `app-tabs.tsx` dan `app-tabs.web.tsx`.

Kalau sebuah langkah tidak terlihat, jangan lanjut. Simpan file, lalu lihat terminal. Pesan merah di sana biasanya menunjuk baris yang keliru.

Perintah `npm run reset-project` belum perlu dijalankan. Perintah itu menyingkirkan contoh di proyek ini dan menggantinya dengan layar kosong.
