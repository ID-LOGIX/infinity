import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/HomeScreens/HomeScreen';
import HelpScreen from '../../screens/HelpScreen/HelpScreen';
import ProfileScreen from '../../screens/ProfileScreens/ProfileScreen';

const Tab = createBottomTabNavigator();


const BottomTab = ({ route, navigation }) => {
    const { tokenOk, token, roleId } = route.params

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let icon;

                    if (route.name === 'Home') {
                        icon = focused
                            ? require('../../asserts/BottomTabAssets/HomeActive.jpg')
                            : require('../../asserts/BottomTabAssets/HomeInActive.jpg');
                    } else if (route.name === 'Help') {
                        icon = focused
                            ? require('../../asserts/BottomTabAssets/helpActive.jpg')
                            : require('../../asserts/BottomTabAssets/helpInActive.jpg');
                    } else if (route.name === 'Profile') {
                        icon = focused
                            ? require('../../asserts/BottomTabAssets/profileActive.jpg')
                            : require('../../asserts/BottomTabAssets/profileInActive.jpg');
                    }

                    // You can return any component that you like here!
                    return <Image source={icon} style={{ width: size, height: size }} />;
                },
            })}
            tabBarOptions={{
                activeTintColor: 'tomato',
                inactiveTintColor: 'gray',
            }}

        >
            <Tab.Screen options={{ tabBarActiveTintColor: '#800000' }}
                name="Home" component={HomeScreen} initialParams={{ tokenOk, token, roleId }} />
            <Tab.Screen
                options={{ tabBarActiveTintColor: '#800000' }}
                name="Help" component={HelpScreen} />
            <Tab.Screen
                options={{ tabBarActiveTintColor: '#800000' }}
                name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    )
}

export default BottomTab

const styles = StyleSheet.create({})