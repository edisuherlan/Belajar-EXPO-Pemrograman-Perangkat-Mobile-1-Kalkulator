import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ambilRiwayatIMT, type RiwayatIMT } from '@/lib/imt-db';

const KATEGORI = [
  { key: 'Berat badan kurang', label: 'Kurang', color: '#3B82F6' },
  { key: 'Rentang normal', label: 'Normal', color: '#0D9488' },
  { key: 'Berat badan berlebih', label: 'Berlebih', color: '#D97706' },
  { key: 'Obesitas', label: 'Obesitas', color: '#DC2626' },
] as const;

const CHART_HEIGHT = 160;

function warnaKategori(kategori: string) {
  return KATEGORI.find((item) => item.key === kategori)?.color ?? '#64748B';
}

function formatTanggal(iso: string) {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) {
    return '-';
  }
  return tanggal.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export default function GrafikIMT() {
  const router = useRouter();
  const [riwayat, setRiwayat] = useState<RiwayatIMT[]>([]);
  const [error, setError] = useState('');
  const [memuat, setMemuat] = useState(true);

  const muatData = useCallback(async () => {
    setMemuat(true);
    try {
      const data = await ambilRiwayatIMT(30);
      setRiwayat(data);
      setError('');
    } catch {
      setError('Gagal memuat data grafik dari database lokal.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void muatData();
    }, [muatData])
  );

  const ringkasan = useMemo(() => {
    if (riwayat.length === 0) {
      return null;
    }

    const nilai = riwayat.map((item) => item.nilai);
    const total = nilai.reduce((acc, n) => acc + n, 0);
    const terbaru = riwayat[0];

    return {
      jumlah: riwayat.length,
      rataRata: total / riwayat.length,
      terendah: Math.min(...nilai),
      tertinggi: Math.max(...nilai),
      terbaru,
    };
  }, [riwayat]);

  const distribusi = useMemo(() => {
    return KATEGORI.map((item) => {
      const jumlah = riwayat.filter((row) => row.kategori === item.key).length;
      const persen = riwayat.length === 0 ? 0 : (jumlah / riwayat.length) * 100;
      return { ...item, jumlah, persen };
    });
  }, [riwayat]);

  const tren = useMemo(() => {
    const data = [...riwayat].reverse().slice(-8);
    const maxNilai = Math.max(30, ...data.map((item) => item.nilai), 1);
    return data.map((item) => ({
      ...item,
      tinggiBar: Math.max(8, (item.nilai / maxNilai) * CHART_HEIGHT),
    }));
  }, [riwayat]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Kembali</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>ANALISIS • LOKAL</Text>
          <Text style={styles.title}>Grafik IMT</Text>
          <Text style={styles.subtitle}>
            Ringkasan sederhana dari riwayat IMT yang tersimpan di database lokal.
          </Text>
        </View>

        <Pressable style={styles.refresh} onPress={() => void muatData()}>
          <Text style={styles.refreshText}>{memuat ? 'Memuat...' : 'Muat ulang'}</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!memuat && riwayat.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum ada data</Text>
            <Text style={styles.emptyText}>
              Hitung IMT di menu IMT terlebih dahulu. Setelah ada riwayat, grafik akan muncul di sini.
            </Text>
          </View>
        ) : null}

        {ringkasan ? (
          <>
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Jumlah</Text>
                <Text style={styles.statValue}>{ringkasan.jumlah}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Rata-rata</Text>
                <Text style={styles.statValue}>{ringkasan.rataRata.toFixed(1)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Terendah</Text>
                <Text style={styles.statValue}>{ringkasan.terendah.toFixed(1)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Tertinggi</Text>
                <Text style={styles.statValue}>{ringkasan.tertinggi.toFixed(1)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Hasil terbaru</Text>
              <Text style={[styles.latestValue, { color: warnaKategori(ringkasan.terbaru.kategori) }]}>
                {ringkasan.terbaru.nilai.toFixed(1)}
              </Text>
              <Text style={styles.latestCategory}>{ringkasan.terbaru.kategori}</Text>
              <Text style={styles.latestMeta}>
                {ringkasan.terbaru.berat} kg • {ringkasan.terbaru.tinggi} cm •{' '}
                {formatTanggal(ringkasan.terbaru.dibuatPada)}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Distribusi kategori</Text>
              <Text style={styles.cardHint}>Persentase hasil berdasarkan kategori IMT dewasa.</Text>
              {distribusi.map((item) => (
                <View key={item.key} style={styles.barRow}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabel}>{item.label}</Text>
                    <Text style={styles.barCount}>
                      {item.jumlah} ({item.persen.toFixed(0)}%)
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max(item.persen, item.jumlah > 0 ? 4 : 0)}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tren nilai IMT</Text>
              <Text style={styles.cardHint}>Hingga 8 pengukuran terakhir (kiri = lebih lama).</Text>
              <View style={styles.chartArea}>
                {tren.map((item) => (
                  <View key={item.id} style={styles.chartColumn}>
                    <Text style={styles.chartValue}>{item.nilai.toFixed(1)}</Text>
                    <View style={styles.chartBarWrap}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: item.tinggiBar,
                            backgroundColor: warnaKategori(item.kategori),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartDate}>{formatTanggal(item.dibuatPada)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.legend}>
                {KATEGORI.map((item) => (
                  <View key={item.key} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        <Text style={styles.disclaimer}>
          Grafik ini dibuat tanpa library tambahan, hanya View dan Text. Data diambil dari SQLite
          lokal di perangkat Anda.
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
    gap: 14,
    backgroundColor: '#F4FAFA',
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    color: '#0F766E',
    fontWeight: '700',
  },
  hero: {
    paddingVertical: 6,
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
  refresh: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#DDF5EF',
  },
  refreshText: {
    color: '#0F766E',
    fontWeight: '700',
  },
  error: {
    color: '#B45309',
    fontWeight: '700',
  },
  emptyCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE9E8',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12334C',
  },
  emptyText: {
    marginTop: 6,
    lineHeight: 20,
    color: '#526777',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE9E8',
  },
  statLabel: {
    fontSize: 12,
    color: '#667985',
    fontWeight: '600',
  },
  statValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '800',
    color: '#12334C',
  },
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE9E8',
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12334C',
  },
  cardHint: {
    marginTop: -4,
    fontSize: 13,
    color: '#667985',
    lineHeight: 18,
  },
  latestValue: {
    fontSize: 42,
    fontWeight: '800',
  },
  latestCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F766E',
  },
  latestMeta: {
    color: '#526777',
  },
  barRow: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  barLabel: {
    fontWeight: '700',
    color: '#244454',
  },
  barCount: {
    color: '#667985',
    fontSize: 13,
  },
  barTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E7F0EF',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  chartArea: {
    minHeight: CHART_HEIGHT + 48,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    paddingTop: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#244454',
  },
  chartBarWrap: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  chartBar: {
    width: '70%',
    maxWidth: 28,
    borderRadius: 8,
  },
  chartDate: {
    fontSize: 10,
    color: '#80919C',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#526777',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 17,
    color: '#667985',
    paddingBottom: 16,
  },
});
