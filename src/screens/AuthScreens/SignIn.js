import { StyleSheet, Text, View, Image, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, BackHandler, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');


const SignIn = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [selectedValue, setSelectedValue] = useState('');
    const options = [
        // { label: 'Select Language', value: 'Select Language' },
        { label: 'English', value: 'English' },
        // { label: 'Urdu', value: 'Urdu' },
    ];
    const [checked, setChecked] = useState(false);
    const [checkedRem, setCheckedRem] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    let protocol, host, port


    const handleCheckedChange = () => {
        setChecked(!checked);
    };

    const handleCheckedRem = () => {
        setCheckedRem(!checkedRem)
    }

    const login = async () => {
        const getPreUser = await AsyncStorage.getItem('userName')
        protocol = await AsyncStorage.getItem('protocol')
        host = await AsyncStorage.getItem('host')
        port = await AsyncStorage.getItem('port')
        setIsLoading(true)
        if (userName.trim() === '') {
            alert('Please enter userName')
            setIsLoading(false)
        } else if (password.trim() === '') {
            alert('Please enter password')
            setIsLoading(false)
        } else {
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
                    await AsyncStorage.setItem('tokenLogin',token)
                    let clientId = responseJSON.clients[0].id;
                    const clientName = responseJSON.clients[0].name
                    await AsyncStorage.setItem('userName', userName).then(async () => {
                        await AsyncStorage.setItem('password', password).then(async () => {
                            const client = await AsyncStorage.getItem('clientId')
                            const roleId = await AsyncStorage.getItem('roleId')
                            const organizationId = await AsyncStorage.getItem('organizationId')
                            const warehouseId = await AsyncStorage.getItem('warehouseId')
                            if (checked) {
                                navigation.navigate('SelectRoleScreen', { token, clientId, clientName, protocol, host, port, checkedRem })
                                setIsLoading(false)
                            } else {
                                if (client) {
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
                                    });

                                    if (!sessionResponse.ok) {
                                        throw new Error('Error'),
                                        setIsLoading(false)
                                    } else {
                                        const sessionData = await sessionResponse.json();
                                        const tokenOk = sessionData.userId
                                        const token = sessionData.token
                                        if (checkedRem) {
                                            if (userName.trim() === getPreUser) {
                                                await AsyncStorage.setItem('token', token).then(async () => {
                                                    await AsyncStorage.setItem('tokenOk', tokenOk.toString()).then(async () => {
                                                        await AsyncStorage.setItem('clientName', clientName).then(async () => {
                                                            navigation.navigate('FingerPrintScreen', { token, tokenOk, roleId })
                                                            setIsLoading(false)
                                                        })
                                                    })
                                                })
                                            } else {
                                                await AsyncStorage.setItem('token', token).then(async () => {
                                                    await AsyncStorage.setItem('tokenOk', tokenOk.toString()).then(async () => {
                                                        await AsyncStorage.setItem('clientName', clientName).then(async () => {
                                                            navigation.navigate('SelectRoleScreen', { token, clientId, clientName, protocol, host, port, checkedRem })
                                                            setIsLoading(false)
                                                        })
                                                    })
                                                })
                                            }

                                        } else {
                                            if (userName.trim() === getPreUser) {
                                                navigation.navigate('FingerPrintScreen', { token, tokenOk, roleId })
                                                setIsLoading(false)
                                            } else {
                                                navigation.navigate('SelectRoleScreen', { token, clientId, clientName, protocol, host, port, checkedRem })
                                                setIsLoading(false)
                                            }
                                        }
                                    }
                                } else {
                                    navigation.navigate('SelectRoleScreen', { token, clientId, clientName, protocol, host, port, checkedRem })
                                    setIsLoading(false)
                                }
                            }
                        })
                    })
                })
                .catch(error => {
                    console.error(error);
                    setIsLoading(false)
                });
        }
    }

    const navigateBack = () => {
        const unsubscribe = navigation.addListener('focus', async () => {
            protocol = await AsyncStorage.getItem('protocol')
            host = await AsyncStorage.getItem('host')
            port = await AsyncStorage.getItem('port')
            setUserName('')
            setPassword('')
            setChecked(false)
            setCheckedRem(false)
            setIsLoading(false)
        });

        return unsubscribe;
    }

    useEffect(() => {
        navigateBack()

        const backAction = () => {
            navigation.navigate('WelcomeScreen')
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [navigation])

    return (
        <>
            {isLoading && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            )}
            {!isLoading && (
                <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                    {/* First image */}
                    <View style={styles.imageCon}>
                        <Image
                            source={require('../../asserts/splashScreenAsserts/Infinty.png')}
                            style={{ height: height / 10, width: width / 1.2, marginTop: '10%' }}

                        />
                    </View>
                    {/* Second txt container */}
                    <View style={styles.middleContainer}>
                        <View style={styles.topMiddleText}>
                            <Text style={styles.txt}>Driving </Text>
                            <Text style={styles.txt2}>Force </Text>
                            <Text style={styles.txt}>Of </Text>
                            <Text style={styles.txt}>Your</Text>
                        </View>
                        <Text style={styles.txt}>Business</Text>
                    </View>

                    {/* Input container */}
                    <View style={styles.inpucontainer}>
                        {/* First input */}
                        <View style={{ marginTop: 12, flexDirection: 'row' }}>
                            <TextInput
                                onChangeText={text => setUserName(text)}
                                value={userName}
                                placeholder="Enter your Name"
                                placeholderTextColor="gray"
                                style={styles.input}
                            />
                            <View style={styles.imageContainer}>
                                <Image
                                    style={styles.imageInput}
                                    source={require('../../asserts/authScreenAssets/Male.png')} />
                            </View>
                        </View>

                        {/* Second input */}
                        <View style={{ marginTop: 20, flexDirection: 'row' }}>
                            <TextInput
                                onChangeText={text => setPassword(text)}
                                value={password}
                                placeholder="Enter your Password"
                                placeholderTextColor="gray"
                                style={styles.input}
                                secureTextEntry
                            />
                            <View style={styles.imageContainer}>
                                <Image
                                    style={styles.imageInput}
                                    source={require('../../asserts/authScreenAssets/lock.png')} />
                            </View>
                        </View>


                        <View style={styles.pickerStyle}>
                            <Picker
                                selectedValue={selectedValue}
                                onValueChange={(itemValue, itemIndex) =>
                                    setSelectedValue(itemValue)
                                }
                                style={styles.pickerItem}
                                dropdownIconColor={'#330000'}
                            >
                                {options.map(option => (
                                    <Picker.Item
                                        key={option.value}
                                        label={option.label}
                                        value={option.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Check box */}
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <View style={styles.checkBoxCon}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: width / 1.6 }}>
                                    <Text style={styles.checkBoxTxt}>Select role</Text>
                                </View>
                                <CheckBox
                                    checked={checked}
                                    onPress={handleCheckedChange}
                                    containerStyle={{
                                        borderColor: '#800000',
                                        width: width / 11.5,
                                        height: height / 23,
                                        borderWidth: 2,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'white'
                                    }}
                                    checkedIcon={
                                        <Image
                                            source={require('../../asserts/authScreenAssets/check.png')}
                                            style={{ width: 20, height: 20 }}
                                        />
                                    }
                                    uncheckedIcon={
                                        <View style={{ backgroundColor: 'white' }}></View>
                                    }
                                />
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: width / 1.6 }}>
                                    <Text style={styles.checkBoxTxt}>Remember me</Text>
                                </View>
                                <CheckBox
                                    checked={checkedRem}
                                    onPress={handleCheckedRem}
                                    containerStyle={{
                                        borderColor: '#800000',
                                        width: width / 11.5,
                                        height: height / 23,
                                        borderWidth: 2,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'white'
                                    }}

                                    checkedIcon={
                                        <Image
                                            source={require('../../asserts/authScreenAssets/check.png')}
                                            style={{ width: 20, height: 20 }}
                                        />
                                    }
                                    uncheckedIcon={
                                        <View style={{ backgroundColor: 'white' }}></View>
                                    }
                                />
                            </View>
                        </View>
                    </View>

                    {/* Button */}
                    <View style={styles.btnCotainer}>
                        <TouchableOpacity style={styles.btn} onPress={() => login()}>
                            <Text style={styles.btnTxt}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </>
    )
}

export default SignIn

const styles = StyleSheet.create({
    imageCon: {
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 7,
        width: width,
    },
    middleContainer: {
        alignItems: 'center'
    },
    txt: {
        fontSize: 32,
        fontFamily: 'K2D-Bold',
        color: '#800000',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3
    },
    txt2: {
        fontSize: 32,
        fontFamily: 'K2D-Bold',
        color: '#330000',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3
    },
    topMiddleText: {
        flexDirection: 'row'
    },
    input: {
        width: width / 1.5,
        borderBottomColor: '#000000',
        borderBottomWidth: 2,
        color: 'black',
        fontFamily: 'K2D-Regular'
    },
    inpucontainer: {
        marginTop: 10,
        alignItems: 'center'
    },
    imageInput: {
        height: height / 20,
        width: width / 10
    },
    imageContainer: {
        borderBottomColor: '#000000',
        borderBottomWidth: 2,
    },
    pickerStyle: {
        width: width / 1.3,
        borderBottomColor: '#000000',
        borderBottomWidth: 2,
        marginTop: 20
    },
    pickerItem: {
        color: 'gray',
        fontFamily: "K2D-Regular"
    },
    checkBoxCon: {
        width: width / 1.3
    },
    checkBoxTxt: {
        fontSize: 22,
        fontFamily: 'K2D-SemiBold',
        color: '#800000'
    },
    btnCotainer: {
        alignItems: 'center',
        marginTop: 30
    },
    btnTxt: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'K2D-Bold'
    },
    btn: {
        backgroundColor: "#800000",
        width: width / 1.3,
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 16,
        borderRadius: 10
    },
})