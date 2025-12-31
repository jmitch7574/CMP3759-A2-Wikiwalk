import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WikiMapView from './src/views/WikiMapView';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { DebugProvider } from './src/context/DebugContext';
import Toast from 'react-native-toast-message';
import { CollectionProvider } from './src/context/CollectionContext';

const Tabs = createBottomTabNavigator();

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView>
        <DebugProvider>
          <CollectionProvider>
            <NavigationContainer>
              <Tabs.Navigator initialRouteName="Map">
                <Tabs.Screen
                  name="Collection"
                  component={WikiMapView}
                  options={{
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="book" color={color} size={size}></MaterialCommunityIcons>
                    ),
                  }}
                />
                <Tabs.Screen
                  name="Map"
                  component={WikiMapView}
                  options={{
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="map" color={color} size={size}></MaterialCommunityIcons>
                    )
                  }}
                />
                <Tabs.Screen
                  name="Milestones"
                  component={WikiMapView}
                  options={{
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="trophy" color={color} size={size}></MaterialCommunityIcons>
                    ),
                  }}
                />
              </Tabs.Navigator>
            </NavigationContainer>
            <Toast bottomOffset={100} />
          </CollectionProvider>
        </DebugProvider>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleButtonContainer: {
    top: -30,                      // ← pushes it OUT of the bar
    justifyContent: "center",
    alignItems: "center",
  },
  middleButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,                  // Android shadow
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
});
