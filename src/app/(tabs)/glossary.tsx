import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  AppText, ErrorState, LoadingState, MessageState, PokemonCard, Screen, SearchField, TypeFilterBar,
} from '@/presentation/components';
import { CONTENT_MAX_WIDTH } from '@/presentation/components/Screen';
import { useGlossaryVM } from '@/presentation/hooks/useGlossaryVM';
import { formatName } from '@/shared/format';
import { spacing } from '@/shared/theme';

const CARD_MIN_WIDTH = 150;

export default function GlossaryScreen() {
  const vm = useGlossaryVM();
  const { width } = useWindowDimensions();
  const columns = Math.max(2, Math.floor(Math.min(width, CONTENT_MAX_WIDTH) / CARD_MIN_WIDTH));

  const openPokemon = useCallback((id: number) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } });
  }, []);

  const subtitle = vm.totalCount ? `${vm.totalCount.toLocaleString('en-US')} Pokémon` : undefined;
  const summary =
    vm.query || vm.type
      ? `${vm.resultCount} ${vm.resultCount === 1 ? 'match' : 'matches'}${vm.type ? ` in ${formatName(vm.type)}` : ''}`
      : null;

  return (
    <Screen title="Glossary" subtitle={subtitle}>
      <SearchField value={vm.query} onChangeText={vm.setQuery} />
      <View style={styles.filters}>
        <TypeFilterBar selected={vm.type} onChange={vm.setType} />
      </View>
      {summary && vm.status === 'ready' ? <AppText variant="caption" style={styles.summary}>{summary}</AppText> : null}

      {vm.status === 'loading' && <LoadingState label="Opening the Pokédex" />}
      {vm.status === 'error' && <ErrorState message={vm.errorMessage ?? ''} onRetry={vm.retry} />}
      {vm.status === 'ready' && (
        <FlatList
          key={columns}
          data={vm.items}
          numColumns={columns}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PokemonCard id={item.id} name={item.name} artworkUrl={item.artworkUrl} caught={vm.isCaught(item.id)} onPress={openPokemon} />
          )}
          onEndReached={vm.loadMore}
          onEndReachedThreshold={0.6}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <MessageState
              title="No Pokémon found"
              message="Try a different name or number, or clear the type filter."
              actionLabel="Clear search"
              onAction={() => {
                vm.setQuery('');
                vm.setType(null);
              }}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { marginTop: spacing.md },
  summary: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  list: { padding: spacing.md, paddingBottom: spacing.xxl, flexGrow: 1 },
});
