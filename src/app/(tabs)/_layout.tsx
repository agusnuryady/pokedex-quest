import { Tabs } from 'expo-router/js-tabs';
import { palette } from '@/shared/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.moss,
        tabBarInactiveTintColor: palette.inkSoft,
        tabBarStyle: { backgroundColor: palette.paper, borderTopColor: palette.fog },
        headerStyle: { backgroundColor: palette.paper },
        headerTintColor: palette.ink,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Play' }} />
      <Tabs.Screen name="collection" options={{ title: 'Collection' }} />
      <Tabs.Screen name="glossary" options={{ title: 'Glossary' }} />
    </Tabs>
  );
}
