import { StyleSheet, Text, View, Dimensions, BackHandler, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import TopHeader from '../../components/HomeScreenComponents/TopHeader'
import NameContainer from '../../components/HomeScreenComponents/NameContainer'
import HomeCard from '../../components/HomeScreenComponents/HomeCard'
import HomeNotifyCard from '../../components/HomeScreenComponents/HomeNotifyCard'
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = ({ navigation, route }) => {
  const { tokenOk, token, roleId } = route.params
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [approvalNum, setApprovalNum] = useState()
  const [protocol, setProtocol] = useState()
  const [reqNum, setReqNum] = useState()
  const [host, setHost] = useState()
  const [clientName, setClientName] = useState('')
  const [port, setPort] = useState()

  const getName = async () => {
    const value = await AsyncStorage.getItem('userName');
    const protocol = await AsyncStorage.getItem('protocol')
    setClientName(await AsyncStorage.getItem('clientNameSelected'))
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const userId = await AsyncStorage.getItem('userId')
    setProtocol(protocol)
    setHost(host)
    setPort(port)
    setName(value)
    getApprovalNum(protocol, host, port)
    getReqNum(protocol, host, port, userId)
  }

  const handleBackButton = () => {
    BackHandler.exitApp();
    return true;
  }

  const getApprovalNum = async (protocol, host, port) => {
    setIsLoading(true)
    await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setApprovalNum(data['array-count'])
        setIsLoading(false)
      })
      .catch(error => {
        console.error(error)
        setIsLoading(false)
      });
  }

  const getReqNum = async (protocol, host, port, userId) => {
    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=CreatedBy eq ${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        let record = data.records
        const filteredData = record.filter(record => record.R_Status_ID.id !== 1000003);
        const lengthOfFilteredData = filteredData.length;
        setReqNum(lengthOfFilteredData)
      })
      .catch(error => console.error(error));
  }

  const Approval = async () => {
    setIsLoading(true)
    await fetch(`${protocol}://${host}:${port}/api/v1/models/mbl_workflow_v?$filter= AD_Role_ID eq ${roleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const dataArray = data.records
        const tableIdsToSupplyChain = [702, 259, 319];
        const filteredArraySupply = dataArray.filter(obj => tableIdsToSupplyChain.includes(obj.AD_Table_ID.id));

        const tableIdsAccount = [335, 318, 224]
        const filteredArrayAccount = dataArray.filter(obj => tableIdsAccount.includes(obj.AD_Table_ID.id));
        navigation.navigate('ApprovalScreens', { token, filteredArraySupply, filteredArrayAccount, tokenOk, roleId })
        setIsLoading(false)
      })
      .catch(error => {
        console.error(error)
        navigation.navigate('ApprovalScreens')
        setIsLoading(false)
      });
  }

  const navigateBack = () => {
    const unsubscribe = navigation.addListener('focus', () => {
      getName()
    });

    return unsubscribe;
  }

  useEffect(() => {
    getName()
    navigateBack()
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [navigation])

  return (
    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      )}
      {!isLoading && (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <TopHeader />
          <NameContainer name={name} clientName={clientName} />
          <View style={{ alignItems: 'center', marginTop: 5 }}>
            <View style={{ width: '95%' }}>
              <Text style={styles.txt}>Driving Force Of Your Business</Text>
            </View>
          </View>
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <View style={{ width: '95%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>

              <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between' }}>
                <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Report.png')} txt="Reports" />
                <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Transaction.png')} txt="Transaction" />
              </View>

              <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>
                <HomeCard source={require('../../asserts/HomeScreenAssets/CardAssets/Male.png')} txt="Portal" />
                <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Approval.png')}
                  txt="Approvals"
                  num={approvalNum}
                  clickHandler={() => Approval()}
                />
              </View>

              <View style={{ flexDirection: 'row', width: '85%', justifyContent: 'space-between', marginTop: 30 }}>
                <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Volume.png')}
                  txt="ATS"
                  clickHandler={() => navigation.navigate('UserList', { token })}
                  num={reqNum}
                />
                <HomeNotifyCard source={require('../../asserts/HomeScreenAssets/CardAssets/Alarm.png')} txt="Notification" />
              </View>
            </View>
          </View>
        </View>
      )}
    </>

  )
}

export default HomeScreen

const styles = StyleSheet.create({
  txt: {
    fontSize: 20,
    color: '#000000',
    fontFamily: 'K2D-Bold'
  }
})