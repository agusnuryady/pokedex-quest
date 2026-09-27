import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppText, ConfirmButton, MessageState, PokemonCard, Screen } from '@/presentation/components';
import { CONTENT_MAX_WIDTH } from '@/presentation/components/Screen';
import { useCollectionVM } from '@/presentation/hooks/useCollectionVM';
import { formatDexNumber, formatName } from '@/shared/format';
import { palette, radius, spacing } from '@/shared/theme';

export default function CollectionScreen() {
  const vm = useCollectionVM();
  const { width } = useWindowDimensions();
  const columns = Math.max(2, Math.floor(Math.min(width, CONTENT_MAX_WIDTH) / 150));

  const openPokemon = useCallback((id: number) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } });
  }, []);

  const subtitle = `${vm.caughtCount} caught, ${vm.seenCount} seen`;

  if (vm.isEmpty) {
    return (
      <Screen title="Collection" subtitle={subtitle}>
        <MessageState
          title="No Pokémon yet"
          message="Go to Play, choose your first partner, and walk through the tall grass to catch more."
          actionLabel="Go to Play"
          onAction={() => router.navigate('/')}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Collection" subtitle={subtitle}>
      <FlatList
        key={columns}
        data={vm.entries}
        numColumns={columns}
        keyExtractor={(item) => String(item.speciesId)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          vm.partner ? (
            <Pressable
              onPress={() => openPokemon(vm.partner!.speciesId)}
              accessibilityRole="button"
              accessibilityLabel={`Partner: ${formatName(vm.partner.name)}, level ${vm.partner.level}`}
              style={styles.partner}
            >
              <Image source={vm.partner.artworkUrl} style={styles.partnerArt} contentFit="contain" />
              <View style={styles.partnerText}>
                <AppText variant="caption" color={palette.mossDeep}>Your partner</AppText>
                <AppText variant="title">{formatName(vm.partner.name)}</AppText>
                <AppText variant="number">{`${formatDexNumber(vm.partner.speciesId)}, Lv ${vm.partner.level}`}</AppText>
              </View>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <PokemonCard id={item.speciesId} name={item.name} artworkUrl={item.artworkUrl} detail={item.detail} caught onPress={openPokemon} />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <ConfirmButton
              label="Start over"
              confirmLabel="Tap again to erase all progress"
              onConfirm={() => {
                vm.startOver();
                router.navigate('/');
              }}
            />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  partner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    margin: spacing.xs,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: palette.pollen,
  },
  partnerArt: { width: 96, height: 96 },
  partnerText: { flex: 1, gap: spacing.xs },
  footer: { marginTop: spacing.xxl, alignItems: 'center' },
});
