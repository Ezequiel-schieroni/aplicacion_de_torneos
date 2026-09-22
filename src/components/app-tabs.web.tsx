import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="login" href="/login" />
        <TabTrigger name="esport" href="/esport" />
      </TabList>
    </Tabs>
  );
}
