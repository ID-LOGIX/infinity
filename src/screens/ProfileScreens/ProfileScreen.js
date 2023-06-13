import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, Alert, ActivityIndicator, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import Card from '../../components/ProfileScreenComponents/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');


const ProfileScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('')

  const getName = async () => {
    setIsLoading(true)
    const value = await AsyncStorage.getItem('userName');
    setUserName(value)
    setIsLoading(false)
  }

  const navigateBack = () => {
    const unsubscribe = navigation.addListener('focus', () => {
      getName()
    });

    return unsubscribe;
  }

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    navigateBack()
    return () => backHandler.remove();
  }, [])


  const handlePressRole = async () => {
    const userName = await AsyncStorage.getItem('userName')
    const password = await AsyncStorage.getItem('password')
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
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
        const clientId = responseJSON.clients[0].id;
        const clientName = responseJSON.clients[0].name
        const checkedRem = true
        navigation.navigate('SelectRoleScreen', { token, clientId, clientName, protocol, host, port, checkedRem })
      })
  };

  const handlePressLogout = () => {
    Alert.alert(
      'Confirmation Action',
      'Do you want to LogOut?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Okay',
          onPress: async () => {
            // Handle proceed action
            console.log('handlePress logout')
            const token = await AsyncStorage.getItem('token');
            const tokenOk = await AsyncStorage.getItem('tokenOk');
            console.log(token, tokenOk)
            await AsyncStorage.removeItem('token').then(async () => {
              await AsyncStorage.removeItem('tokenOk').then(() => {
                console.log('remove all item')
                navigation.navigate('SignIn')
              })
            })
          }
        }
      ]
    );
  };


  return (

    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      )}
      {!isLoading && (
        <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
          {/* Top header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Image source={require('../../asserts/ProfieScreenAssets/LeftArrow.png')} style={styles.imageBack} />
            </TouchableOpacity>
            <View style={styles.name}>
              <Text style={styles.nameTxt}>{userName}</Text>
            </View>
            <TouchableOpacity style={styles.helpCon}>
              <Text style={styles.help}>Help</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.accountCon}>
            <Text style={styles.userAccountTxt}>Your Account</Text>
          </View>
          <Card
            source={require('../../asserts/ProfieScreenAssets/Customer.jpg')}
            txt='Company Information'
            handlePress={() => navigation.navigate('CompanyInformationScreen')}
          />
          <Card source={require('../../asserts/ProfieScreenAssets/Control.jpg')} txt='Preference' />
          <Card source={require('../../asserts/ProfieScreenAssets/card.jpg')}
            txt='Change role '
            handlePress={() => { handlePressRole() }} />
          <Card source={require('../../asserts/ProfieScreenAssets/Chat.jpg')} txt='Feedback' />

          <View style={styles.accountCon}>
            <Text style={styles.userAccountTxt}>Support</Text>
          </View>

          <Card source={require('../../asserts/ProfieScreenAssets/help.jpg')} txt='Help' />

          <View style={styles.accountCon}>
            <Text style={styles.userAccountTxt}>Language</Text>
          </View>

          <Card source={require('../../asserts/ProfieScreenAssets/global.jpg')} txt='English' />

          <View style={{ width: '90%', marginTop: 15 }}>
            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => handlePressLogout()}>
              <Image source={require('../../asserts/ProfieScreenAssets/Logout.jpg')} style={{ height: height / 20, width: width / 10 }} />
              <View style={{ justifyContent: 'center', marginLeft: 10 }}>
                <Text style={{ color: '#800000', fontSize: 20, fontFamily: 'K2D-Regular' }}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  header: {
    height: height / 12,
    flexDirection: 'row',
    width: '95%',
    marginTop: 15
  },
  backBtn: {
    borderColor: 'black',
    borderWidth: 1,
    height: height / 13,
    width: width / 6.5,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5
  },
  name: {
    justifyContent: 'center',
    marginLeft: 10,
    width: '66%'
  },
  nameTxt: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'K2D-Bold'
  },
  helpCon: {
    justifyContent: 'center',
    fontSize: 15,
  },
  help: {
    color: '#800000',
    fontFamily: 'K2D-Regular',
    borderBottomColor: '#800000',
    borderBottomWidth: 1
  },
  accountCon: {
    width: '90%',
    marginTop: 10
  },
  userAccountTxt: {
    color: 'black',
    fontSize: 24,
    fontFamily: 'K2D-Bold'
  }
})