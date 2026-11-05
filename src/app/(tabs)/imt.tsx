import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

import {
  ambilRiwayatIMT,
  hapusRiwayatIMT,
  hapusSemuaRiwayatIMT,
  simpanHasilIMT,
  type RiwayatIMT,
} from '@/lib/imt-db';

type HasilIMT = {
  nilai: number;
  kategori: string;
  saran: string;
};

function tentukanKategori(nilai: number): HasilIMT {
  if (nilai < 18.5) {
    return {
      nilai,
      kategori: 'Berat badan kurang',
      saran: 'Pertimbangkan pola makan bergizi seimbang. Konsultasikan dengan tenaga kesehatan bila diperlukan.',
    };
  }
  if (nilai < 25) {
    return {
      nilai,
      kategori: 'Rentang normal',
      saran: 'Pertahankan kebiasaan makan seimbang, aktivitas fisik, dan istirahat yang cukup.',
    };
  }
  if (nilai < 30) {
    return {
      nilai,
      kategori: 'Berat badan berlebih',
      saran: 'Mulai dari kebiasaan sehat yang realistis, seperti aktivitas fisik teratur dan pola makan seimbang.',
    };
  }
  return {
    nilai,
    kategori: 'Obesitas',
    saran: 'Pertimbangkan konsultasi dengan tenaga kesehatan untuk penilaian yang sesuai kondisi pribadi.',
  };
}

function formatWaktu(iso: string) {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) {
    return iso;
  }

  return tanggal.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PenghitungIMT() {
  const router = useRouter();
  const [berat, setBerat] = useState('');
  const [tinggi, setTinggi] = useState('');
  const [hasil, setHasil] = useState<HasilIMT | null>(null);
  const [peringatan, setPeringatan] = useState('');
  const [riwayat, setRiwayat] = useState<RiwayatIMT[]>([]);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [statusSimpan, setStatusSimpan] = useState('');

  async function muatRiwayat() {
    try {
      const data = await ambilRiwayatIMT();
      setRiwayat(data);
    } catch {
      setPeringatan('Gagal memuat riwayat dari database lokal.');
    }
  }

  useEffect(() => {
    void muatRiwayat();
  }, []);

  function tolak(judul: string, pesan: string) {
    setHasil(null);
    setStatusSimpan('');
    setPeringatan(pesan);
    Alert.alert(judul, pesan);
  }

  async function hitungIMT() {
    const bb = Number(berat.replace(',', '.'));
    const tbCm = Number(tinggi.replace(',', '.'));

    if (
      !berat.trim() ||
      !tinggi.trim() ||
      !Number.isFinite(bb) ||
      !Number.isFinite(tbCm) ||
      bb <= 0 ||
      tbCm <= 0
    ) {
      tolak('Input belum benar', 'Masukkan berat dan tinggi badan dengan angka yang valid.');
      return;
    }

    if (bb > 500 || tbCm < 50 || tbCm > 250) {
      tolak('Periksa kembali input', 'Pastikan satuan berat adalah kg dan tinggi adalah cm.');
      return;
    }

    const tbMeter = tbCm / 100;
    const nilai = bb / (tbMeter * tbMeter);
    const hasilBaru = tentukanKategori(nilai);

    setPeringatan('');
    setHasil(hasilBaru);
    setSedangSimpan(true);
    setStatusSimpan('Menyimpan ke database lokal...');

    try {
      await simpanHasilIMT({
        berat: bb,
        tinggi: tbCm,
        nilai: hasilBaru.nilai,
        kategori: hasilBaru.kategori,
        saran: hasilBaru.saran,
      });
      await muatRiwayat();
      setStatusSimpan('Hasil tersimpan di database lokal.');
    } catch {
      setStatusSimpan('Perhitungan berhasil, tetapi gagal disimpan ke database.');
    } finally {
      setSedangSimpan(false);
    }
  }

  function resetForm() {
    setBerat('');
    setTinggi('');
    setHasil(null);
    setPeringatan('');
    setStatusSimpan('');
  }

  function konfirmasiHapus(item: RiwayatIMT) {
    Alert.alert('Hapus riwayat?', `Hapus hasil IMT ${item.nilai.toFixed(1)} (${item.kategori})?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await hapusRiwayatIMT(item.id);
              await muatRiwayat();
            } catch {
              Alert.alert('Gagal', 'Riwayat tidak berhasil dihapus.');
            }
          })();
        },
      },
    ]);
  }

  function konfirmasiHapusSemua() {
    Alert.alert('Hapus semua riwayat?', 'Semua hasil IMT tersimpan akan dihapus dari database lokal.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus semua',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await hapusSemuaRiwayatIMT();
              await muatRiwayat();
            } catch {
              Alert.alert('Gagal', 'Riwayat tidak berhasil dihapus.');
            }
          })();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>KESEHATAN • EDUKASI</Text>
          <Text style={styles.title}>Penghitung IMT</Text>
          <Text style={styles.subtitle}>
            Indeks Massa Tubuh membantu memberi gambaran awal hubungan berat dan tinggi badan.
          </Text>
          <Pressable
            style={styles.grafikButton}
            onPress={() => router.push('/grafik')}>
            <Text style={styles.grafikButtonText}>Lihat grafik IMT</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Berat badan (kg)</Text>
          <TextInput
            style={styles.input}
            value={berat}
            onChangeText={setBerat}
            keyboardType="decimal-pad"
            placeholder="Contoh: 60"
            placeholderTextColor="#8AA0A8"
            accessibilityLabel="Berat badan dalam kilogram"
          />

          <Text style={styles.label}>Tinggi badan (cm)</Text>
          <TextInput
            style={styles.input}
            value={tinggi}
            onChangeText={setTinggi}
            keyboardType="decimal-pad"
            placeholder="Contoh: 165"
            placeholderTextColor="#8AA0A8"
            accessibilityLabel="Tinggi badan dalam sentimeter"
          />

          <Pressable
            style={[styles.button, sedangSimpan && styles.buttonDisabled]}
            onPress={() => {
              void hitungIMT();
            }}
            disabled={sedangSimpan}>
            <Text style={styles.buttonText}>{sedangSimpan ? 'Menyimpan...' : 'Hitung IMT'}</Text>
          </Pressable>
          <Pressable style={styles.resetButton} onPress={resetForm}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
          {peringatan ? <Text style={styles.warning}>{peringatan}</Text> : null}
          {statusSimpan ? <Text style={styles.status}>{statusSimpan}</Text> : null}
        </View>

        {hasil && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>HASIL PERHITUNGAN</Text>
            <Text style={styles.value}>{hasil.nilai.toFixed(1)}</Text>
            <Text style={styles.category}>{hasil.kategori}</Text>
            <Text style={styles.advice}>{hasil.saran}</Text>
          </View>
        )}

        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.infoTitle}>Riwayat tersimpan</Text>
            {riwayat.length > 0 ? (
              <Pressable onPress={konfirmasiHapusSemua}>
                <Text style={styles.clearAll}>Hapus semua</Text>
              </Pressable>
            ) : null}
          </View>

          {riwayat.length === 0 ? (
            <Text style={styles.infoText}>Belum ada hasil IMT yang disimpan di database lokal.</Text>
          ) : (
            riwayat.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyMain}>
                  <Text style={styles.historyValue}>{item.nilai.toFixed(1)}</Text>
                  <View style={styles.historyMeta}>
                    <Text style={styles.historyCategory}>{item.kategori}</Text>
                    <Text style={styles.historyDetail}>
                      {item.berat} kg • {item.tinggi} cm
                    </Text>
                    <Text style={styles.historyTime}>{formatWaktu(item.dibuatPada)}</Text>
                  </View>
                </View>
                <Pressable onPress={() => konfirmasiHapus(item)} hitSlop={8}>
                  <Text style={styles.deleteText}>Hapus</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Bagaimana IMT dihitung?</Text>
          <Text style={styles.infoText}>
            IMT = berat badan (kg) ÷ tinggi badan (m)². Tinggi dalam sentimeter perlu diubah menjadi
            meter.
          </Text>
          <Text style={styles.infoTitle}>Kategori IMT dewasa</Text>
          <Text style={styles.infoText}>• Di bawah 18,5: berat badan kurang</Text>
          <Text style={styles.infoText}>• 18,5–24,9: rentang normal</Text>
          <Text style={styles.infoText}>• 25,0–29,9: berat badan berlebih</Text>
          <Text style={styles.infoText}>• 30,0 atau lebih: obesitas</Text>
        </View>

        <Text style={styles.disclaimer}>
          Catatan: hasil ini merupakan edukasi umum, bukan diagnosis medis. Batas kategori di atas
          ditujukan untuk orang dewasa dan tidak digunakan untuk menilai anak/remaja atau ibu hamil.
          Data tersimpan hanya di perangkat Anda (SQLite lokal).
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4FAFA',
  },
  page: {
    flexGrow: 1,
    padding: 18,
    paddingTop: Platform.OS === 'web' ? Spacing.six + Spacing.three : 18,
    gap: 14,
    backgroundColor: '#F4FAFA',
  },
  hero: {
    paddingVertical: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#0D9488',
  },
  title: {
    marginTop: 5,
    fontSize: 28,
    fontWeight: '800',
    color: '#12334C',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#526777',
  },
  grafikButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#DDF5EF',
    borderWidth: 1,
    borderColor: '#B8E4D9',
  },
  grafikButtonText: {
    color: '#0F766E',
    fontWeight: '700',
  },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE9E8',
    gap: 9,
  },
  label: {
    marginTop: 3,
    fontWeight: '700',
    color: '#244454',
  },
  input: {
    borderWidth: 1,
    borderColor: '#B8D6D4',
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#12334C',
  },
  button: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#0D9488',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  resetButton: {
    padding: 11,
    alignItems: 'center',
  },
  resetText: {
    color: '#0F766E',
    fontWeight: '700',
  },
  warning: {
    color: '#B45309',
    fontWeight: '700',
    lineHeight: 20,
  },
  status: {
    color: '#0F766E',
    fontWeight: '600',
    lineHeight: 20,
  },
  resultCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#DDF5EF',
    borderWidth: 1,
    borderColor: '#B8E4D9',
  },
  resultLabel: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#0F766E',
  },
  value: {
    marginTop: 4,
    fontSize: 42,
    fontWeight: '800',
    color: '#12334C',
  },
  category: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F766E',
  },
  advice: {
    marginTop: 8,
    lineHeight: 21,
    color: '#244454',
  },
  historyCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE9E8',
    gap: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearAll: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E7F0EF',
  },
  historyMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#12334C',
    minWidth: 58,
  },
  historyMeta: {
    flex: 1,
    gap: 2,
  },
  historyCategory: {
    fontWeight: '700',
    color: '#0F766E',
  },
  historyDetail: {
    color: '#526777',
    fontSize: 13,
  },
  historyTime: {
    color: '#80919C',
    fontSize: 12,
  },
  deleteText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  infoCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE9E8',
  },
  infoTitle: {
    marginBottom: 6,
    marginTop: 4,
    fontWeight: '700',
    fontSize: 15,
    color: '#12334C',
  },
  infoText: {
    marginBottom: 4,
    lineHeight: 20,
    color: '#526777',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 17,
    color: '#667985',
    paddingHorizontal: 3,
    paddingBottom: 12,
  },
});
