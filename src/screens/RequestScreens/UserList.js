import { StyleSheet, Text, View, ActivityIndicator, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import TopHeader from '../../components/RequestScreenComponents/TopHeader';
import TopNavigationUser from '../../navigation/TopNavigation/TopNavigationUser';

const UserList = ({ navigation }) => {
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <TopHeader txt='User' onPress={() => navigation.goBack()} />
            <TopNavigationUser />
        </View>

    )
}

export default UserList

const styles = StyleSheet.create({})