import { Tabs } from 'expo-router/js-tabs';
import { TabIcon } from '@/presentation/components/TabIcon';
import { palette } from '@/shared/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.moss,
        tabBarInactiveTintColor: palette.inkSoft,
        tabBarStyle: { backgroundColor: palette.paper, borderTopColor: palette.fog },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Play', tabBarIcon: (p) => <TabIcon tab="play" {...p} /> }}
      />
      <Tabs.Screen
        name="collection"
        options={{ title: 'Collection', tabBarIcon: (p) => <TabIcon tab="collection" {...p} /> }}
      />
      <Tabs.Screen
        name="glossary"
        options={{ title: 'Glossary', tabBarIcon: (p) => <TabIcon tab="glossary" {...p} /> }}
      />
    </Tabs>
  );
}
