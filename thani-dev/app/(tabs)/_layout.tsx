import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import TabBarButton from '@/components/TabButton';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const primaryColor = 'black';
  const greyColor = 'white';

  const icons: Record<string, (props: { color: string }) => JSX.Element> = {
    home: (props) => <AntDesign name="home" size={26} {...props} />,
    events: (props) => <Feather name="calendar" size={26} {...props} />,
    forum: (props) => <FontAwesome name="comments" size={26} {...props} />,
    map: (props) => <FontAwesome name="map" size={26} {...props} />,
    profile: (props) => <FontAwesome name="user" size={26} {...props} />,
  };

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route: { key: string; name: string; params?: object }, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            isFocused={isFocused}
            label={
              typeof label === 'string'
                ? label.charAt(0).toUpperCase() + label.slice(1)
                : ''
            }            
            routeName={route.name}
            color={isFocused ? primaryColor : greyColor}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {icons[route.name as keyof typeof icons]?.({ color: isFocused ? primaryColor : greyColor })}
          </TabBarButton>
        );
      })}
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: { display: 'none' }, 
        headerStyle: {
          backgroundColor: '#38b6ff', 
        },
      }}
      tabBar={(props) => <TabBar {...props} />} // Use custom TabBar
    >
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={require('../../constants/transparent_blue_logo.png')} // adjust if needed
                  style={{ width: '105', height: '105', resizeMode: 'contain' }}
                />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 25 , fontFamily: 'Poppins'}}>Home</Text>
            </View>
          ),
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: '#38b6ff',
          },
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={require('../../constants/transparent_blue_logo.png')} // adjust if needed
                  style={{ width: '105', height: '105', resizeMode: 'contain' }}
                />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 25,fontFamily: 'Poppins', }}>Events</Text>
            </View>
          ),
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: '#38b6ff',
          },
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={require('../../constants/transparent_blue_logo.png')} // adjust if needed
                  style={{ width: '105', height: '105', resizeMode: 'contain' }}
                />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 25 , fontFamily: 'Poppins',}}>Forum</Text>
            </View>
          ),
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: '#38b6ff',
          },
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={require('../../constants/transparent_blue_logo.png')} // adjust if needed
                  style={{ width: '105', height: '105', resizeMode: 'contain' }}
                />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 25, fontFamily: 'Poppins' }}>Map</Text>
            </View>
          ),
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: '#38b6ff',
          },
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={require('../../constants/transparent_blue_logo.png')} // adjust if needed
                  style={{ width: '105', height: '105', resizeMode: 'contain' }}
                />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 25, fontFamily: 'Poppins' }}>Profile</Text>
            </View>
          ),
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: '#38b6ff',
          },
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#38b6ff',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderCurve: 'continuous',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  tabbarItem: {
    alignItems: 'center',
  },
});