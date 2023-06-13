import { StyleSheet, Text, View, Image, Dimensions, TextInput, TouchableOpacity, BackHandler, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');
const WelcomeScreen = ({ navigation }) => {
    const [selectedValue, setSelectedValue] = useState('Select a host');
    const [IpAddress, setIpAddress] = useState('');
    const [portNum, setPortNum] = useState('');
    const options = [
        { label: 'Select a Host', value: 'select a Host' },
        { label: 'http', value: 'http' },
        { label: 'https', value: 'https' },
    ];

    const handleBackButton = () => {
        BackHandler.exitApp(); // Exit the app
        return true; // Return true to prevent default back button action
    }

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);

        // Remove event listener when component unmounts
        return () => BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    }, []);


    const navigateToSignIn = async () => {
        console.log(selectedValue)
        if (selectedValue === 'select a Host') {
            alert('Please select host')
        } else if (IpAddress.trim() === '') {
            alert('Please enter you IP address')
        } else if (portNum.trim === '') {
            alert('Please enter your Port Number')
        } else {
            await AsyncStorage.setItem('protocol', selectedValue).then(async () => {
                await AsyncStorage.setItem('host', IpAddress).then(async () => {
                    await AsyncStorage.setItem('port', portNum).then(() => {
                        navigation.navigate('SignIn')
                    })
                })
            })
        }
    }

    return (
        <ScrollView style={{ flex: 1 }}>
            {/* First image */}
            <View style={styles.imageCon}>
                <Image
                    source={require('../../asserts/splashScreenAsserts/Infinty.png')}
                    style={{ height: height / 10, width: width / 1.2,marginTop:'10%' }}

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


            {/* Input content */}
            <View style={styles.inputContainer}>
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

                <View style={{ marginTop: 12 }}>
                    <TextInput
                        onChangeText={text => setIpAddress(text)}
                        value={IpAddress}
                        placeholder="Enter your IP Adress"
                        placeholderTextColor="gray"
                        style={styles.input}
                    />
                </View>
                <View style={{ marginTop: 12 }}>
                    <TextInput
                        onChangeText={text => setPortNum(text)}
                        value={portNum}
                        placeholder="Enter your Port Number"
                        placeholderTextColor="gray"
                        style={styles.input}
                    />
                </View>
            </View>


            {/* Button */}
            <View style={styles.btnCotainer}>
                <TouchableOpacity style={styles.btn} onPress={() => navigateToSignIn()}>
                    <Text style={styles.btnTxt}>Save Changes</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom */}
            <View style={styles.bottomContainer}>
                <Text style={styles.txt}>Powered by</Text>
                <View style={styles.txtBottom}>
                    <Text style={styles.txt}>ID </Text>
                    <Text style={styles.txt}>L</Text>
                    <Text style={styles.txt2}>O</Text>
                    <Text style={styles.txt}>GIX</Text>
                </View>
            </View>
        </ScrollView>
    )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    imageCon: {
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 4.2,
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
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 4
    },
    txt2: {
        fontSize: 32,
        fontFamily: 'K2D-Bold',
        color: '#330000',
        textShadowColor: 'black',
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 4
    },
    topMiddleText: {
        flexDirection: 'row'
    },
    inputContainer: {
        alignItems: 'center',
        marginTop: 10
    },
    pickerStyle: {
        width: width / 1.3,
        borderBottomColor: '#000000',
        borderBottomWidth: 2
    },
    pickerItem: {
        color: 'gray',
        fontFamily: "K2D-Regular"
    },
    input: {
        width: width / 1.3,
        borderBottomColor: '#000000',
        borderBottomWidth: 2,
        color: 'black',
        fontFamily: 'K2D-Regular'
    },
    btn: {
        backgroundColor: "#800000",
        width: width / 1.3,
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 16,
        borderRadius: 10,
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
    bottomContainer: {
        alignItems: 'center',
        marginTop: height / 28
    },
    txtBottom: {
        flexDirection: 'row'
    },
})