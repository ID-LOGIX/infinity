import { StyleSheet, Text, View, TouchableOpacity, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import TouchID from 'react-native-touch-id';

const FingerPrintScreen = ({ route, navigation }) => {
    const { token, tokenOk, roleId } = route.params

    const addFinerPrint = () => {
        TouchID.authenticate('Authenticate with fingerprint')
            .then((fingerprintData) => {       
                navigation.navigate('BottomTab', { token, tokenOk, roleId })
            })
            .catch(() => {
                console.log('Authentication error');
            });
    }

    useEffect(() => {
        addFinerPrint()
        const backAction = () => {
            BackHandler.exitApp()
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [])


    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
            <Text style={{ color: 'black' }}>You must have to add. </Text>
            <TouchableOpacity onPress={() => addFinerPrint()}>
                <Text style={{ color: '#800000' }} >FingerPrint</Text>
            </TouchableOpacity>
        </View>
    )
}

export default FingerPrintScreen

const styles = StyleSheet.create({})