import {
  StyleSheet, Text, TextInput, View, TouchableOpacity, Modal, Image, ActivityIndicator,
  ScrollView, Platform
} from 'react-native'
import React, { useEffect, useState } from 'react'
import TopHeader from '../../components/RequestScreenComponents/TopHeader'
import CalendarPicker from 'react-native-calendar-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { decode as atob, encode as btoa } from 'base-64';


const CreateNewReq = ({ navigation }) => {
  const [startDate, setStartDate] = useState(null)
  const [name, setName] = useState('')
  const [endDate, setEndDate] = useState(null)
  const [showCalendarStart, setShowCalendarStart] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [priority, setPriority] = useState()
  const [isLoading, setIsLoading] = useState(false);
  const [subdata, setSubData] = useState([])
  const [assigned, setAssigned] = useState()
  const [summary, setSummary] = useState('');
  const [clientId, setClientId] = useState()
  const [organizationId, seOrganizationId] = useState()
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString();
  const priorityData = [
    { label: 'Select Priority', value: 'Select Priority', id: 0 },
    { label: 'High', value: 'High', id: 1 },
    { label: 'Low', value: 'Low', id: 2 },
    { label: 'Medium', value: 'Medium', id: 3 },
    { label: 'Minor', value: 'Minor', id: 4 },
    { label: 'Urgent', value: 'Urgent', id: 5 }
  ]
  const [pickerKey, setPickerKey] = useState()
  const [subOrdinateKey, setSubOrdinateKey] = useState()
  const [attachmentData, setAttachmentData] = useState('Select attachment')
  const [attachment, setAttachment] = useState({ name: '', data: '' })

  let AD_Org_ID, AD_Role_ID


  const getAPIData = async (protocol, host, port, userId) => {
    const token = await AsyncStorage.getItem('token')
    const value = await AsyncStorage.getItem('userName');
    setClientId(await AsyncStorage.getItem('clientId'))
    seOrganizationId(await AsyncStorage.getItem('organizationId'))
    fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const array1 = [{ Name: 'Select SubOrdinate', Name: 'Select SubOrdinate' }, { Name: value, Name: value, id: userId }]
        let records = data.records
        const newArray = array1.concat(records)
        setSubData(newArray)
        setIsLoading(false)
      })
      .catch(error => console.error(error));
  }

  const navigateBack = () => {
    setIsLoading(true)
    const unsubscribe = navigation.addListener('focus', async () => {
      const protocol = await AsyncStorage.getItem('protocol')
      const host = await AsyncStorage.getItem('host')
      const port = await AsyncStorage.getItem('port')
      const userId = await AsyncStorage.getItem('userId')
      setStartDate(null)
      setEndDate(null)
      setPriority()
      setAssigned()
      setSummary('')
      getAPIData(protocol, host, port, userId)
    });
    return unsubscribe;
  }

  useEffect(() => {
    navigateBack()
  }, [navigation])

  const onDateChangeStart = (date) => {
    setStartDate(date);
    setShowCalendarStart(false);
  };

  const onDateChangeEnd = (date) => {
    setEndDate(date);
    setShowCalendarEnd(false);
  };

  const saveData = async () => {
    const clientName = await AsyncStorage.getItem('clientName')
    const value = await AsyncStorage.getItem('userName');
    const userId = await AsyncStorage.getItem('userId')
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const token = await AsyncStorage.getItem('token')
    const roleId = await AsyncStorage.getItem('roleId')
    setIsLoading(true)
    await fetch(`${protocol}://${host}:${port}/api/v1/auth/roles?client=${clientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(async (data) => {
        const fetchRole = data.roles
        AD_Role_ID = fetchRole.find(item => item.id == roleId)
        await fetch(`${protocol}://${host}:${port}/api/v1/auth/organizations?client=${clientId}&role=${roleId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
          .then(response => response.json())
          .then(data => {
            const fetchOran = data.organizations
            AD_Org_ID = fetchOran.find(item => item.id == organizationId)
            fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                "AD_Client_ID": { "id": parseInt(clientId), "identifier": clientName },
                "AD_Org_ID": { "id": AD_Org_ID.id, "identifier": AD_Org_ID.name },
                "AD_Role_ID": { "id": AD_Role_ID.id, "identifier": AD_Role_ID.name },
                "CloseDate": "",
                "ConfidentialType": { "id": "I", "identifier": "internal", "model-name": "ad_ref_list" },
                "ConfidentialTypeEntry": { "id": "I", "identifier": "internal", "model-name": "ad_ref_list" },
                "Created": formattedDate,
                "CreatedBy": { "id": parseInt(userId), "identifier": value, "model-name": "ad_user" },
                "DateLastAction": "",
                "DueType": { "id": "5", "identifier": "Due", "model-name": "ad_ref_list" },
                "IsActive": true,
                "IsEscalated": false,
                "IsInvoiced": false,
                "IsSelfService": false,
                "NextAction": { "id": "F", "identifier": "Follow up", "model-name": "ad_ref_list", "propertyLabel": "Next action" },
                "PriorityUser": { "id": pickerKey.toString(), "identifier": priority, "model-name": "ad_ref_list" },
                "Processed": false,
                "QtyInvoiced": 0,
                "QtyPlan": 0,
                "QtySpent": 0,
                "R_RequestType_ID": { "id": 1000000, "identifier": "Personal Tasks", "model-name": "r_requesttype", "propertyLabel": "Request Type" },
                "R_Status_ID": { "id": 1000000, "identifier": "9_open", "model-name": "r_status" },
                "RequestAmt": 0,
                "SalesRep_ID": { "id": subOrdinateKey, "identifier": assigned, "model-name": "ad_user" },
                "StartDate": moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
                "Summary": summary,
                "Updated": "",
                "UpdatedBy": { "id": parseInt(userId), "identifier": "System", "model-name": "ad_user", "propertyLabel": "Updated By" },
                "id": parseInt(userId),
                "model-name": "r_request",
                "uid": "8e38b9fa-1ec2-4783-a661-475f4ea8d458",
                "EndTime": moment(endDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
                "Name": name,
                "StartTime": moment(startDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
              })
            })
              .then(response => {
                return response.json();
              })
              .then(async (data) => {
                // Handle the response data
                setStartDate(null)
                setEndDate(null)
                setSummary('')
                setPriority(priorityData[0])
                setAssigned(data[0])
                setName('')
                let newDocId = data.id
                console.log('newDocId', newDocId)
                fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${newDocId}/attachments`, {
                  method: 'POST',
                  body: JSON.stringify(attachment),
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': `Bearer ${token}`,
                  },
                  credentials: 'same-origin'
                })
                  .then(response => {
                    return response.json()
                      .then(data => {
                        setIsLoading(false)
                      })
                  }).catch(err => {
                    console.log('err when not upload image', err)
                    setIsLoading(false)
                  })
              })
              .catch(error => {
                alert(error);
                // Handle the error
                setIsLoading(false);
              });
          })
          .catch(error => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false)
      });
  }

  const Save = async () => {
    if (startDate === null) {
      alert('Start Date cannot be empty')
    } else if (endDate === null) {
      alert('End data cannot be empty')
    } else if (!priority) {
      alert('Please Select the priority')
    } else if (!assigned) {
      alert('Please select the SubOrdinate')
    } else if (summary.trim() === '') {
      alert('Please Enter the Summary')
    }
    else if (startDate.toISOString().substring(0, 10) < formattedDate.substring(0, 10)) {
      alert('Start date must greate then or equal to current date')
    } else if (endDate.toISOString().substring(0, 10) < formattedDate.substring(0, 10)) {
      alert('End date must greate then or equal to current date')
    } else if (endDate.toISOString().substring(0, 10) < startDate.toISOString().substring(0, 10)) {
      alert('End date must be greatet then or equal to start date')
    } else if (pickerKey === 0) {
      alert('Please select the priority')
    } else if (subOrdinateKey === 0) {
      alert('Please Select the Subordinate')
    } else if (name.trim() === '') {
      alert('Please enter the task name')
    }
    else if (attachmentData === 'Select attachment') {
      alert('Please add the attachment')
    }
    else {
      saveData()
    }
  }

  const getID = async (itemIndex, itemValue) => {
    setAssigned(itemValue)
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const userId = await AsyncStorage.getItem('userId')
    const token = await AsyncStorage.getItem('token')
    fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (itemIndex === 0) {
          setSubOrdinateKey(0)
        } else (
          setSubOrdinateKey(subdata[itemIndex].id)
        )
      })
      .catch(error => console.error(error));
  }

  async function pickDocument() {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const fileUri = result[0].uri
      console.log(result)
      RNFS.readFile(fileUri, 'base64')
        .then((dataResponce) => {
          const base64Data = btoa(dataResponce);
          // console.log('name',base64Data)
          setAttachment({name:result[0].name,data:base64Data})
          // console.log('data',dataResponce)
          setAttachmentData(result[0].name)
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Error!
      }
    }
  }

  return (
    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      )}
      {!isLoading && (
        <View style={{ backgroundColor: "white", alignItems: 'center', height: '100%' }}>
          <TopHeader onPress={() => navigation.goBack()} txt="Create New Task" />
          {/* Start Date modal */}
          <Modal visible={showCalendarStart} animationType="slide" transparent={true}>
            <View style={styles.blurView}  >
              <View style={styles.modal}>
                <CalendarPicker
                  onDateChange={onDateChangeStart}
                  previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
                  nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
                  textStyle={{
                    color: 'white',
                    fontFamily: 'K2D-Regular'
                  }}
                  customDatesStyles={{
                    color: 'white',
                    fontFamily: 'K2D-Regular'
                  }}
                />
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendarStart(false)}>
                  <Text style={styles.close}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* end date model */}
          <Modal visible={showCalendarEnd} animationType="slide" transparent={true}>
            <View style={styles.blurView}  >
              <View style={styles.modal}>
                <CalendarPicker
                  onDateChange={onDateChangeEnd}
                  previousTitleStyle={{ color: 'white', marginLeft: 15, fontFamily: 'K2D-Regular' }}
                  nextTitleStyle={{ color: 'white', marginRight: 15, fontFamily: 'K2D-Regular' }}
                  textStyle={{
                    color: 'white',
                    fontFamily: 'K2D-Regular'
                  }}
                  customDatesStyles={{
                    color: 'white',
                    fontFamily: 'K2D-Regular'
                  }}
                />
                <TouchableOpacity onPress={() => setShowCalendarEnd(false)} style={styles.closeBtn}>
                  <Text style={{ color: 'black' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Textinput */}
          <ScrollView style={styles.inputContainer}>
            <Text style={styles.topTxt}>Task Name</Text>
            <View style={styles.name}>
              <TextInput
                style={{ color: '#800000' }}
                onChangeText={text => setName(text)}
                value={name}
              />
            </View>
            {/* Start Date */}
            <Text style={styles.topTxt}>Select Start Date</Text>
            <TouchableOpacity onPress={() => setShowCalendarStart(true)} style={styles.startDate}>
              {startDate && (
                <Text style={styles.inside}>
                  {startDate.toString()}
                </Text>
              )}
              {!startDate && (
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: '88%' }}>
                    <Text style={styles.inside}>
                      Selected Start Date
                    </Text>
                  </View>
                  <Image source={require('../../asserts/RequestAsserts/calendar.png')} style={styles.calender} />
                </View>
              )}
            </TouchableOpacity>

            {/* end date */}
            <Text style={styles.topTxt}>Select End Date</Text>
            <TouchableOpacity onPress={() => setShowCalendarEnd(true)} style={styles.startDate}>
              {endDate && (
                <Text style={styles.inside}>
                  {endDate.toString()}
                </Text>
              )}
              {!endDate && (
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: '88%' }}>
                    <Text style={styles.inside}>
                      Selected End Date
                    </Text>
                  </View>
                  <Image source={require('../../asserts/RequestAsserts/calendar.png')} style={styles.calender} />
                </View>
              )}
            </TouchableOpacity>

            {/* priority */}
            <Text style={styles.topTxt}>Priority</Text>
            <View style={styles.startDate}>
              <Picker
                selectedValue={priority}
                onValueChange={(itemValue, itemIndex) => (
                  setPriority(itemValue),
                  setPickerKey(itemIndex)
                )}
                dropdownIconColor={'#800000'}
                style={styles.pickerItem}

              >
                {priorityData.map(option => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}

              </Picker>
            </View>

            {/* Assigned */}
            <Text style={styles.topTxt}>Assigned To</Text>
            <View style={styles.startDate}>
              <Picker
                selectedValue={assigned}
                onValueChange={(itemValue, itemIndex) => (
                  getID(itemIndex, itemValue)
                )}
                dropdownIconColor={'#800000'}
                style={styles.pickerItem}

              >
                {subdata.map(option => (
                  <Picker.Item
                    // key={option.value}
                    label={option.Name}
                    value={option.Name}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.topTxt}>Attachments</Text>
            <TouchableOpacity style={styles.attachmentStyle} onPress={() => pickDocument()} >
              <View style={{ width: '85%', marginLeft: 10 }}>
                <Text style={styles.attachmentTxt}>{attachmentData}</Text>
              </View>
              <Image source={require('../../asserts/taskDetailAssets/attach.png')} style={styles.imageAttach} />
            </TouchableOpacity>

            {/* Summary */}
            <Text style={styles.topTxt}>Summary</Text>
            <View style={styles.summary}>
              <TextInput
                style={{ color: '#800000' }}
                onChangeText={text => setSummary(text)}
                value={summary}
              />
            </View>

            <TouchableOpacity style={styles.btnSave} onPress={() => Save()}>
              <Text style={[styles.topTxt, { color: 'white' }]}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </>
  )
}

export default CreateNewReq

const styles = StyleSheet.create({
  inputContainer: {
    width: '90%',
    flex: 1,
  },
  startDate: {
    borderWidth: 1,
    borderColor: '#800000',
    height: '5%',
    justifyContent: 'center',
    marginTop: 5,
    borderRadius: 10,
    marginBottom: 5
  },
  topTxt: {
    color: '#800000',
    fontSize: 16,
    fontFamily: 'K2D-Regular',
  },
  inside: {
    marginLeft: 10,
    color: '#800000',
    fontFamily: 'K2D-Regular',
  },
  modal: {
    width: '90%',
    backgroundColor: '#800000',
    borderRadius: 20,
    alignItems: 'center'
  },
  blurView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  closeBtn: {
    backgroundColor: 'white',
    height: '10%',
    width: '40%',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  close: {
    color: '#800000',
    fontSize: 16,
    fontFamily: 'K2D-Regular'
  },
  pickerItem: {
    color: '#800000',
    fontFamily: "K2D-Regular",
    fontSize: 16
  },
  calender: {
    height: '100%',
    width: '7%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    // marginLeft: '45%'
  },
  btnSave: {
    backgroundColor: '#800000',
    height: '5%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '100%'
  },
  summary: {
    borderWidth: 1,
    borderColor: '#800000',
    height: '12%',
    marginTop: 5,
    borderRadius: 10,
    marginBottom: 15
  },
  name: {
    borderWidth: 1,
    borderColor: '#800000',
    height: '5%',
    marginTop: 5,
    borderRadius: 10,
    marginBottom: 5
  },
  attachmentStyle: {
    borderWidth: 1,
    borderColor: '#800000',
    height: '5%',
    // justifyContent: 'center',
    marginTop: 5,
    borderRadius: 10,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: 'center'
  },
  imageAttach: {
    height: '65%',
    width: '10%'
  },
  attachmentTxt: {
    color: '#800000',
    fontFamily: "K2D-Regular"
  }
}) 