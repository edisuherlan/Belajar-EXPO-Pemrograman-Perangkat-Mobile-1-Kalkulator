import * as Device from 'expo-device';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const topik = [
  {
    id: 'teks',
    nomor: '01',
    judul: 'Teks',
    ringkas: 'Ukuran, tebal, dan perataan',
    detail: 'Judul ini memakai type="title". Ukuran tambahannya ada di styles.title di bawah file ini.',
  },
  {
    id: 'tata',
    nomor: '02',
    judul: 'Tata letak',
    ringkas: 'Jarak, sudut, dan susunan',
    detail: 'gap, padding, dan borderRadius di objek styles mengatur jarak kartu. Ubah satu angka, lalu simpan.',
  },
  {
    id: 'platform',
    nomor: '03',
    judul: 'Platform',
    ringkas: 'HP, emulator, atau browser',
    detail: 'Platform.OS membaca tempat aplikasi dibuka. Kartu yang sama bisa menampilkan kalimat berbeda.',
  },
] as const;

type TopikId = (typeof topik)[number]['id'];

function namaPlatform() {
  if (Platform.OS === 'web') {
    return 'Browser';
  }
  if (Platform.OS === 'android') {
    return Device.isDevice ? 'HP Android' : 'Emulator Android';
  }
  if (Platform.OS === 'ios') {
    return Device.isDevice ? 'iPhone' : 'Simulator iOS';
  }
  return Platform.OS;
}

export default function HomeScreen() {
  const [aktif, setAktif] = useState<TopikId>('teks');
  const dipilih = topik.find((item) => item.id === aktif) ?? topik[0];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <ThemedView style={styles.hero}>
            <AnimatedIcon />
            <ThemedView type="backgroundElement" style={styles.chip}>
              <ThemedText type="code">{namaPlatform()}</ThemedText>
            </ThemedView>
            <ThemedText type="title" style={styles.title}>
              Belajar Aplikasi Mobile
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Sentuh salah satu kartu. Isinya berubah tanpa pindah layar.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.list}>
            {topik.map((item) => {
              const selected = item.id === aktif;
              return (
                <Pressable key={item.id} onPress={() => setAktif(item.id)}>
                  <ThemedView
                    type={selected ? 'backgroundSelected' : 'backgroundElement'}
                    style={[styles.card, selected && styles.cardSelected]}>
                    <ThemedText type="code" themeColor="textSecondary">
                      {item.nomor}
                    </ThemedText>
                    <ThemedView style={styles.cardCopy}>
                      <ThemedText type="smallBold">{item.judul}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {item.ringkas}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </Pressable>
              );
            })}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.detail}>
            <ThemedText type="smallBold">{dipilih.judul}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {dipilih.detail}
            </ThemedText>
          </ThemedView>

          <Link href="/explore" asChild>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={styles.buttonLabel}>
                Buka halaman Explore
              </ThemedText>
            </Pressable>
          </Link>

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'web' ? Spacing.six + Spacing.four : Spacing.three,
    paddingBottom: Platform.OS === 'ios' ? BottomTabInset + Spacing.two : Spacing.four,
    gap: Spacing.four,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  chip: {
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  title: {
    textAlign: 'center',
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    textAlign: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  cardSelected: {
    borderLeftColor: '#208AEF',
  },
  cardCopy: {
    flex: 1,
    gap: Spacing.half,
    backgroundColor: 'transparent',
  },
  detail: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.five,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.75,
  },
});
