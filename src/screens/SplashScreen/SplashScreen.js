import { StyleSheet, Text, View, Dimensions, Image, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');
const SplashScreen = ({ navigation }) => {
    const getTokens = async () => {
        const token = await AsyncStorage.getItem('token')
        const tokenOk = await AsyncStorage.getItem('tokenOk')
        const roleId = await AsyncStorage.getItem('roleId')
        const userName = await AsyncStorage.getItem('userName')
        const password = await AsyncStorage.getItem('password')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const clientId = await AsyncStorage.getItem('clientId')
        const organizationId = await AsyncStorage.getItem('organizationId')
        const warehouseId = await AsyncStorage.getItem('warehouseId')
        if (token) {
            await fetch(`${protocol}:${host}:${port}/api/v1/auth/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: userName,
                    password: password
                }),
            })
                .then(response => response.text())
                .then(async (responseText) => {
                    const responseJSON = JSON.parse(responseText);
                    const token = responseJSON.token;
                    const sessionResponse = await fetch(`${protocol}://${host}:${port}/api/v1/auth/tokens`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            clientId,
                            roleId,
                            organizationId,
                            warehouseId,
                            language: 'en_US'
                        })
                    })
                    if (!sessionResponse.ok) {
                        alert('some problem with server')
                    } else {
                        const sessionData = await sessionResponse.json();
                        const token = sessionData.token
                        await AsyncStorage.setItem('token',token)
                        setTimeout(() => {
                            navigation.navigate('FingerPrintScreen', { token, tokenOk, roleId });
                        }, 3000);
                    }
                })


        } else {
            setTimeout(() => {
                navigation.navigate('WelcomeScreen')
            }, 3000)
        }
    }


    useEffect(() => {
        getTokens()
    }, [])
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#800000" />
            {/* Top image */}
            <View style={styles.imageCon}>
                <Image
                    source={require('../../asserts/splashScreenAsserts/Infinty.png')}
                    style={{ height: height / 10, width: width / 1.2, marginTop: "15%" }}
                />
            </View>

            {/* middle container */}
            <View style={styles.middleContainer}>
                <View style={styles.topMiddleText}>
                    <Text style={styles.txt}>Driving </Text>
                    <Text style={styles.txt2}>Force </Text>
                    <Text style={styles.txt}>Of</Text>
                </View>
                <View style={styles.topMiddleText}>
                    <Text style={styles.txt}>Your </Text>
                    <Text style={styles.txt}>Business</Text>
                </View>
            </View>

            {/* Bottom container */}
            <View style={styles.bottomContainer}>
                <Text style={styles.txtPowerBy}>Powered by</Text>
                <View style={styles.txtBottom}>
                    <Text style={styles.txt}>ID </Text>
                    <Text style={styles.txt}>L</Text>
                    <Text style={styles.txt2}>O</Text>
                    <Text style={styles.txt}>GIX</Text>
                </View>
            </View>
        </View>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    imageCon: {
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 2.5,
        width: width,
    },
    topMiddleText: {
        flexDirection: 'row'
    },
    txt: {
        fontSize: 40,
        fontFamily: 'K2D-Regular',
        color: '#800000',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    middleContainer: {
        alignItems: 'center'
    },
    txt2: {
        fontSize: 40,
        fontFamily: 'K2D-Regular',
        color: '#330000',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    bottomContainer: {
        alignItems: 'center',
        marginTop: height / 9
    },
    txtBottom: {
        flexDirection: 'row'
    },
    txtPowerBy: {
        fontSize: 36,
        fontFamily: 'K2D-Regular',
        color: '#330000',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    }
})