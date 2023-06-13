import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import ChatHeader from '../../components/ChatScreenComponents/ChatHeader'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ChatScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [SMS, setSMS] = useState([])
  const [loginUser, setLoginUser] = useState('')

  const getAPIData = async (protocol, host, port, userId, token) => {
    try {
      const url = `${protocol}://${host}:${port}/api/v1/models/R_RequestUpdate?$filter=R_Request_ID eq 1000163`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await response.json();
      setSMS(json.records)
      setIsLoading(false)
    } catch (error) {
      console.error(error);
      setIsLoading(false)
    }


  }

  const navigateBack = async () => {
    setIsLoading(true)
    const unsubscribe = navigation.addListener('focus', async () => {
      const protocol = await AsyncStorage.getItem('protocol')
      const host = await AsyncStorage.getItem('host')
      const port = await AsyncStorage.getItem('port')
      const userId = await AsyncStorage.getItem('userId')
      setLoginUser(userId)
      const token = await AsyncStorage.getItem('token')
      getAPIData(protocol, host, port, userId, token)
    });
    return unsubscribe
  }


  useEffect(() => {
    navigateBack()
  }, [navigation])

  const renderItem = ({ item }) => {
    const textColor = item.CreatedBy.id == loginUser ? '#800000' : 'black';
    const content = item.CreatedBy.id == loginUser ? 'flex-end' : null;
    const marName = item.CreatedBy.id == loginUser ? '62%' : null;
    const borderBottomLeftRadius = item.CreatedBy.id == loginUser ? 15 : null
    const borderTopRightRadius = item.CreatedBy.id == loginUser ? 15 : null
    const borderTopLeftRadius = item.CreatedBy.id == loginUser ? 15 : null
    return (
      <View style={[styles.itemContainer, { alignItems: content }]}>
        <Text style={[styles.itemText, { color: textColor, marginRight: marName }]}>
          {item.CreatedBy.identifier}
        </Text>
        <View style={[styles.messageCon,
        {
          borderColor: textColor,
          borderBottomLeftRadius: borderBottomLeftRadius,
          borderTopLeftRadius: borderTopLeftRadius,
          borderTopRightRadius: borderTopLeftRadius
        }]}>
          <Text style={{ color: textColor, marginLeft: 5 }}>
            {item.Result}
          </Text>
        </View>
      </View>
    );
  };

  return (

    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      )}

      {!isLoading && (
        <View style={{ flex: 1 }}>
          <ChatHeader onPress={() => navigation.goBack()} />
          <View style={styles.container}>


            <View style={styles.chatContainer}>
              <FlatList
                data={SMS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>

            <View style={styles.txtInpuCon}>
              <View style={styles.input}>
                <TextInput style={styles.txtInput}
                  placeholder='Type Here'
                  placeholderTextColor="black"
                />
                <TouchableOpacity>
                  <Image source={require('../../asserts/ChatAssets/sendBtn.png')} style={styles.sendBtn} />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      )}
    </>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#800000',
    flex: 1,
  },
  chatContainer: {
    backgroundColor: 'white',
    height: '86%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15
  },
  txtInpuCon: {
    height: '14%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    width: '85%',
    height: 35,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  sendBtn: {
    height: 27,
    width: 25,
    marginRight: 6
  },
  txtInput: {
    width: '89%',
    borderRadius: 10,
    height: 40,
    color: 'black',
    fontFamily: 'K2D-Regular',
  },
  itemContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 9
  },
  itemText: {
    fontSize: 14,
  },
  messageCon: {
    width: '70%',
    borderWidth: 1,
    marginTop: 5,
    height: 35,
    justifyContent: 'center',
  }
})