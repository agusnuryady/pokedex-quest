import { Tabs } from 'expo-router/js-tabs';
import { palette } from '@/shared/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.moss,
        tabBarInactiveTintColor: palette.inkSoft,
        tabBarStyle: { backgroundColor: palette.paper, borderTopColor: palette.fog },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Play' }} />
      <Tabs.Screen name="collection" options={{ title: 'Collection' }} />
      <Tabs.Screen name="glossary" options={{ title: 'Glossary' }} />
    </Tabs>
  );
}
