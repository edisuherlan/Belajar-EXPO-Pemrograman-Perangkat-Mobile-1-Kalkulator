# Belajar Expo: Kalkulator

Panduan ini menunjukkan langkah membuat fitur kalkulator pada proyek Expo `aplikasi-ku`. Hasilnya dilihat di browser laptop. Android Studio dan HP tidak diperlukan.

Kode di bawah ini sama dengan berkas yang ada di repositori. Tanda pada tombol memakai lambang `−`, `×`, dan `÷`. Salin lambang itu, jangan diganti dengan tanda minus keyboard biasa.

## Berkas yang dikerjakan

| Langkah | Berkas | Perlakuan |
| --- | --- | --- |
| 2 | `src/app/kalkulator.tsx` | Berkas baru. Seluruh isi halaman. |
| 3 | `src/components/app-tabs.tsx` | Ditambah satu menu untuk HP. |
| 4 | `src/components/app-tabs.web.tsx` | Ditambah satu menu untuk browser. |

Tidak ada berkas lain yang diubah tangan. Expo menulis ulang tipe rute di `.expo/types/router.d.ts` sendiri saat server berjalan. Berkas itu tidak diketik.

## Langkah 1. Nyalakan aplikasi di browser

1. Buka terminal di folder proyek.
2. Jalankan `npx expo start`.
3. Tekan `w`. Browser membuka aplikasi. Biarkan terminal itu tetap hidup.
4. Pastikan menu Home dan Explore sudah terlihat sebelum menambah kalkulator.

## Langkah 2. Buat halaman kalkulator

1. Di folder `src/app`, buat berkas baru bernama persis `kalkulator.tsx`.
2. Nama berkas, tanpa `.tsx`, menjadi alamat `/kalkulator`.
3. Isi berkas itu dengan kode utuh berikut, lalu simpan.

Kode ini melakukan empat hal. Daftar `ROWS` menyusun tombol. `useState` menyimpan angka yang terlihat, angka yang ditahan, operator, dan tanda mulai angka baru. Fungsi `hitung` mengerjakan tambah, kurang, kali, dan bagi. Fungsi `tekan` membaca label tombol lalu memanggil fungsi yang sesuai. Bagi nol mengembalikan `null`, lalu layar menulis `Error`.

```tsx
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Operator = '+' | '−' | '×' | '÷';

const ROWS = [
  ['C', '←', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
] as const;

function hitung(kiri: number, operator: Operator, kanan: number) {
  switch (operator) {
    case '+':
      return kiri + kanan;
    case '−':
      return kiri - kanan;
    case '×':
      return kiri * kanan;
    case '÷':
      return kanan === 0 ? null : kiri / kanan;
  }
}

function formatAngka(nilai: number) {
  if (!Number.isFinite(nilai)) {
    return 'Error';
  }
  const bulat = Math.round(nilai * 1e10) / 1e10;
  const teks = String(bulat);
  if (teks.replace('-', '').replace('.', '').length > 12) {
    return bulat.toExponential(6);
  }
  return teks;
}

export default function KalkulatorScreen() {
  const theme = useTheme();
  const [layar, setLayar] = useState('0');
  const [tersimpan, setTersimpan] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [mulaiBaru, setMulaiBaru] = useState(true);

  function tampilkanError() {
    setLayar('Error');
    setTersimpan(null);
    setOperator(null);
    setMulaiBaru(true);
  }

  function tekanAngka(angka: string) {
    if (layar === 'Error' || mulaiBaru) {
      setLayar(angka);
      setMulaiBaru(false);
      return;
    }
    if (layar.replace('-', '').replace('.', '').length >= 12) {
      return;
    }
    setLayar(layar === '0' ? angka : layar + angka);
  }

  function tekanKoma() {
    if (layar === 'Error' || mulaiBaru) {
      setLayar('0.');
      setMulaiBaru(false);
      return;
    }
    if (layar.includes('.')) {
      return;
    }
    setLayar(layar + '.');
  }

  function tekanOperator(berikutnya: Operator) {
    if (layar === 'Error') {
      return;
    }
    const sekarang = Number(layar);
    if (operator && tersimpan !== null && !mulaiBaru) {
      const hasil = hitung(tersimpan, operator, sekarang);
      if (hasil === null) {
        tampilkanError();
        return;
      }
      const teks = formatAngka(hasil);
      setLayar(teks);
      setTersimpan(Number(teks));
    } else {
      setTersimpan(sekarang);
    }
    setOperator(berikutnya);
    setMulaiBaru(true);
  }

  function tekanSamaDengan() {
    if (layar === 'Error' || operator === null || tersimpan === null) {
      return;
    }
    const hasil = hitung(tersimpan, operator, Number(layar));
    if (hasil === null) {
      tampilkanError();
      return;
    }
    setLayar(formatAngka(hasil));
    setTersimpan(null);
    setOperator(null);
    setMulaiBaru(true);
  }

  function tekanHapus() {
    setLayar('0');
    setTersimpan(null);
    setOperator(null);
    setMulaiBaru(true);
  }

  function tekanMundur() {
    if (mulaiBaru || layar === 'Error') {
      setLayar('0');
      setMulaiBaru(true);
      return;
    }
    const sisa = layar.slice(0, -1);
    setLayar(sisa === '' || sisa === '-' ? '0' : sisa);
  }

  function tekanPersen() {
    if (layar === 'Error') {
      return;
    }
    setLayar(formatAngka(Number(layar) / 100));
    setMulaiBaru(true);
  }

  function tekan(tombol: string) {
    if (tombol >= '0' && tombol <= '9') {
      tekanAngka(tombol);
      return;
    }
    if (tombol === '.') {
      tekanKoma();
      return;
    }
    if (tombol === 'C') {
      tekanHapus();
      return;
    }
    if (tombol === '←') {
      tekanMundur();
      return;
    }
    if (tombol === '%') {
      tekanPersen();
      return;
    }
    if (tombol === '=') {
      tekanSamaDengan();
      return;
    }
    tekanOperator(tombol as Operator);
  }

  const rumus = operator && tersimpan !== null ? `${formatAngka(tersimpan)} ${operator}` : ' ';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.panel}>
          <View style={styles.display}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.rumus}>
              {rumus}
            </ThemedText>
            <ThemedText
              style={[styles.angka, layar.length > 9 && styles.angkaKecil]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {layar}
            </ThemedText>
          </View>

          <View style={styles.keys}>
            {ROWS.map((baris) => (
              <View key={baris.join('')} style={styles.row}>
                {baris.map((tombol) => {
                  const operatorAktif = tombol === operator;
                  const aksen = tombol === '=' || tombol === '÷' || tombol === '×' || tombol === '−' || tombol === '+';
                  return (
                    <Pressable
                      key={tombol}
                      accessibilityRole="button"
                      accessibilityLabel={tombol}
                      onPress={() => tekan(tombol)}
                      style={({ pressed }) => [
                        styles.key,
                        tombol === '0' && styles.keyWide,
                        {
                          backgroundColor: aksen
                            ? operatorAktif
                              ? '#1668B8'
                              : '#208AEF'
                            : theme.backgroundElement,
                        },
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText
                        type="subtitle"
                        style={[
                          styles.keyLabel,
                          aksen && styles.keyLabelAksen,
                          tombol === 'C' && styles.keyHapus,
                        ]}>
                        {tombol}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  panel: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'web' ? Spacing.six + Spacing.three : Spacing.two,
    paddingBottom: Platform.OS === 'ios' ? BottomTabInset + Spacing.two : Spacing.three,
    gap: Spacing.three,
  },
  display: {
    flex: 0.7,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  rumus: {
    minHeight: 20,
  },
  angka: {
    fontSize: 52,
    lineHeight: 60,
    fontWeight: '600',
  },
  angkaKecil: {
    fontSize: 36,
    lineHeight: 44,
  },
  keys: {
    flex: 1.4,
    gap: Spacing.two,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  key: {
    flex: 1,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWide: {
    flex: 2.15,
  },
  keyLabel: {
    fontSize: 26,
    lineHeight: 32,
  },
  keyLabelAksen: {
    color: '#ffffff',
  },
  keyHapus: {
    color: '#D64545',
  },
  pressed: {
    opacity: 0.75,
  },
});
```

## Langkah 3. Daftarkan menu di HP

Buka `src/components/app-tabs.tsx`. Berkas ini sudah berisi menu Home, Explore, dan Profil. Tambahkan blok Kalkulator setelah blok Profil, masih di dalam `NativeTabs`. Nilai `name` harus `kalkulator`, sama dengan nama berkas.

```tsx
<NativeTabs.Trigger name="kalkulator">
  <NativeTabs.Trigger.Label>Kalkulator</NativeTabs.Trigger.Label>
  <NativeTabs.Trigger.Icon
    src={require('@/assets/images/tabIcons/explore.png')}
    renderingMode="template"
  />
</NativeTabs.Trigger>
```

Setelah disimpan, seluruh berkas menjadi seperti berikut. Ikon Kalkulator meminjam gambar `explore.png` karena proyek ini hanya memiliki ikon home dan explore.

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profil">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="kalkulator">
        <NativeTabs.Trigger.Label>Kalkulator</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
```

## Langkah 4. Daftarkan menu di browser

Menu browser tidak membaca `app-tabs.tsx`. Buka `src/components/app-tabs.web.tsx`. Di dalam `CustomTabList`, setelah tombol Explore, tambahkan:

```tsx
<TabTrigger name="kalkulator" href="/kalkulator" asChild>
  <TabButton>Kalkulator</TabButton>
</TabTrigger>
```

Fungsi `AppTabs` pada berkas itu, setelah penambahan, seluruhnya seperti berikut. Fungsi `TabButton`, `CustomTabList`, dan objek `styles` di bawahnya tidak diubah.

```tsx
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
          <TabTrigger name="kalkulator" href="/kalkulator" asChild>
            <TabButton>Kalkulator</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}
```

## Langkah 5. Simpan, lihat, dan uji

1. Simpan ketiga berkas.
2. Kembali ke browser. Muat ulang halaman bila menu belum berubah.
3. Klik menu **Kalkulator**. Alamatnya menjadi `/kalkulator`. Angka 0 muncul di kanan atas papan tombol.
4. Kerjakan uji di tabel ini.

| Urutan yang ditekan | Yang harus terlihat |
| --- | --- |
| 1 2 + 3 = | 15 |
| 2 0 − 8 = | 12 |
| 9 × 9 = | 81 |
| 1 0 0 ÷ 4 = | 25 |
| 7 ÷ 0 = | Error |
| 1 . 5 + 2 . 5 = | 4 |
| 8 0 % | 0.8 |
| 1 2 3 ← ← | 1 |
| 9 + 1 + | 10 |
| C | 0 |

Kalau menu belum muncul, periksa tiga nama ini harus sama persis: nama berkas `kalkulator.tsx`, `name="kalkulator"`, dan `href="/kalkulator"`. Kalau bagi atau kurang tidak menghitung, bandingkan lambang pada tombol dengan lambang di dalam fungsi `hitung`. Keduanya harus −, ×, dan ÷.

Praktikum selesai bila kesepuluh uji menampilkan angka pada kolom kanan, dan menu Kalkulator tetap membuka halaman yang sama setelah browser dimuat ulang.
