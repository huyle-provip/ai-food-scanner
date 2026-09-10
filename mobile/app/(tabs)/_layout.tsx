import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { ScanTabButton } from "../../components/ScanTabButton";

function TabIcon({ label, color }: { label: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 22 }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16a34a",
        sceneStyle: { backgroundColor: "#F7F7F7" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon label="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarButton: (props) => <ScanTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <TabIcon label="☰" color={color} />,
        }}
      />
    </Tabs>
  );
}
