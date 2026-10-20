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
