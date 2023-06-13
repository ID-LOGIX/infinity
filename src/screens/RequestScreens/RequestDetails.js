import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity, Image, Modal, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopHeader from '../../components/RequestScreenComponents/TopHeader';
import SmallInput from '../../components/RequestScreenComponents/SmallInput';
import Calender from '../../components/RequestScreenComponents/Calender';
import CalendarPicker from 'react-native-calendar-picker';
import moment, { isDate } from 'moment';
import ModalStatus from '../../components/RequestScreenComponents/ModalStatus';
import NonEditAble from '../../components/RequestScreenComponents/NonEditAble';


const RequestDetails = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { id } = route.params
  console.log(id)
  const [taskName, setTaskName] = useState('')
  const [assignedBy, setassignedBy] = useState('')
  const [request, setRequest] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [showCalendarEnd, setShowCalendarEnd] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [dueType, setDueType] = useState('')
  const [priority, setPriority] = useState('')
  const [summary, setSummary] = useState('')
  const [clientName, setClientName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [show, setShow] = useState(false)
  const [dueTypeModal, setDueTypeModal] = useState(false)
  const [priorityModal, setPriorityModal] = useState(false)
  const [subdata, setSubData] = useState([])
  const [assignedTo, setAssignedTo] = useState('')
  const [assignedToModal, setAssignedToModal] = useState(false)
  const [filterRecordsId, setFilterRecordsId] = useState()
  const [subOrdinateID, setSubOrdinateID] = useState(0)
  const [statusID, setStatusID] = useState(0)
  const [dueID, setDueID] = useState('')
  const [priorityID, setpriorityID] = useState('')
  let dateDummyStart, dateDummyEnd

  const getAPIData = async (protocol, host, port, userId, id) => {
    const token = await AsyncStorage.getItem('token')
    const value = await AsyncStorage.getItem('userName');
    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        let records = data.records
        const filterRecords = records.filter(item => item.id === id);
        setStatusID(filterRecords[0].R_Status_ID.id)
        setSubOrdinateID(filterRecords[0].SalesRep_ID.id)
        setpriorityID(filterRecords[0].PriorityUser.id)
        setDueID(filterRecords[0].DueType.id)
        setFilterRecordsId(filterRecords[0].R_Status_ID.id)
        setTaskName(filterRecords[0].Name)
        setassignedBy(filterRecords[0].CreatedBy.identifier)
        setRequest(filterRecords[0].id)
        let dateStart = moment(filterRecords[0].StartDate).format('YYYY-DD-MM')
        let dateEnd = moment(filterRecords[0].EndTime).format('YYYY-DD-MM')
        setStartDate(dateStart)
        setEndDate(dateEnd)
        setStatus(filterRecords[0].R_Status_ID.identifier.split("_")[1])
        setDueType(filterRecords[0].DueType.identifier)
        setPriority(filterRecords[0].PriorityUser.identifier)
        setSummary(filterRecords[0].Summary)
        setClientName(filterRecords[0].AD_Client_ID.identifier)
        setOrganizationName(filterRecords[0].AD_Org_ID.identifier)
        setAssignedTo(filterRecords[0].SalesRep_ID.identifier)
        fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => response.json())
          .then(data => {
            const array1 = [{ Name: value, Name: value, id: userId }]
            let records = data.records
            const newArray = array1.concat(records)
            setSubData(newArray)
            setIsLoading(false)
          })
          .catch(error => {
            console.error(error)
            setIsLoading(false)
          });
      })
      .catch(error => {
        alert(error)
        setIsLoading(false)
      });
  }

  const navigateBack = () => {
    setIsLoading(true)
    const unsubscribe = navigation.addListener('focus', async () => {
      const protocol = await AsyncStorage.getItem('protocol')
      const host = await AsyncStorage.getItem('host')
      const port = await AsyncStorage.getItem('port')
      const userId = await AsyncStorage.getItem('userId')
      getAPIData(protocol, host, port, userId, id)
    });
    return unsubscribe;
  }

  const modalClose = (txt, id) => {
    setStatusID(id)
    setStatus(txt)
    setShow(false)
  }

  const modalDueType = (txt, id) => {
    setDueType(txt)
    setDueID(id)
    setDueTypeModal(false)
  }

  const modalClosePriority = (txt, id) => {
    setPriority(txt)
    setpriorityID(id)
    setPriorityModal(false)
  }

  const selectSub = (txt, id) => {
    setSubOrdinateID(id)
    setAssignedTo(txt)
    setAssignedToModal(false)
  }

  const saveButton = async () => {
    let startDateDummy, endDateDummy
    const parsedStartDate = moment(startDate, 'YYYY-DD-MM');
    startDateDummy = moment(parsedStartDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
    const parsedEndDate = moment(endDate, 'YYYY-DD-MM');
    endDateDummy = moment(parsedEndDate).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
    const protocol = await AsyncStorage.getItem('protocol')
    const host = await AsyncStorage.getItem('host')
    const port = await AsyncStorage.getItem('port')
    const token = await AsyncStorage.getItem('token')
    const userId = await AsyncStorage.getItem('userId')

    console.log('dueID',dueID,"dueType",dueType)
    fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        "Name": taskName,
        "StartDate": startDate,
        "EndTime": endDate,
        "Summary": summary,
        "PriorityUser": { "id": priorityID, "identifier": priority, "model-name": "ad_ref_list" },
        "DueType": { "id": dueID, "identifier": dueType, "model-name": "ad_ref_list" },
        "SalesRep_ID": { "id": subOrdinateID, "identifier": assignedTo, "model-name": "ad_user" },
        "R_Status_ID": { "id": statusID, "identifier": status, "model-name": "r_status" }
        // "DueType": { "id": dueID, "identifier": dueType, "model-name": "ad_ref_list" },
        // "PriorityUser": { "id": priorityID, "identifier": priority, "model-name": "ad_ref_list" },
        // "R_Status_ID": { "id": statusID, "identifier": status, "model-name": "r_status" },
        // "SalesRep_ID": { "id": subOrdinateID, "identifier": assignedTo, "model-name": "ad_user" },
        // "Summary": summary,
        // "EndTime": endDate,
        // "Name": taskName,
        // "StartTime": startDate
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log(data)
        setIsLoading(true)
        getAPIData(protocol, host, port, userId, id)
      })
      .catch(error => {
        // Handle the error
        alert(error)
        setIsLoading(false)
        // ...
      });

  }

  useEffect(() => {
    navigateBack()
  }, [navigation])

  return (
    <>
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      )}
      {!isLoading && (
        <ScrollView style={{ flex: 1 }} showsHorizontalScrollIndicator={false}>
          <View style={{ alignItems: 'center' }}>
            {/* Modal start */}
            <Modal visible={showCalendar} animationType="slide" transparent={true}>
              <View style={styles.blurView}  >
                <View style={styles.modal}>
                  <CalendarPicker
                    onDateChange={(date) => {
                      dateDummyStart = moment(date).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
                      setStartDate(moment(dateDummyStart).format('DD-MM-YYYY'))
                      setShowCalendar(false)
                    }}
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
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendar(false)}>
                    <Text style={styles.close}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Modal End */}
            <Modal visible={showCalendarEnd} animationType="slide" transparent={true}>
              <View style={styles.blurView}  >
                <View style={styles.modal}>
                  <CalendarPicker
                    onDateChange={(date) => {
                      dateDummyEnd = moment(date).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
                      setEndDate(moment(dateDummyEnd).format('DD-MM-YYYY'))
                      setShowCalendarEnd(false)
                    }}
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
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalendarEnd(false)}>
                    <Text style={styles.close}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>


            {/* Status Modal */}
            <Modal
              visible={show} // set visibility based on state
              animationType="slide" // set the animation type
              transparent={true} // make the modal transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                  <Text style={styles.txt}>Set Status</Text>
                  <TouchableOpacity onPress={() => modalClose('Open', 1000000)} style={styles.txtContainer}>
                    <Text style={styles.txt}>Open</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalClose('Waiting', 1000001)} style={styles.txtContainer}>
                    <Text style={styles.txt}>Waiting</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalClose('Close', 1000002)} style={styles.txtContainer}>
                    <Text style={styles.txt}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalClose('Final Close', 1000003)} style={styles.txtContainer}>
                    <Text style={styles.txt}>Final Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShow(!show) }} style={styles.btn}>
                    <Text style={styles.txtBtn}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>


            {/* due type */}
            <Modal
              visible={dueTypeModal}
              animationType="slide"
              transparent={true}
            >
              <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.modalViewDue}>
                  <Text style={styles.txt}>Set Type</Text>
                  <TouchableOpacity onPress={() => modalDueType('Due', '5')} style={styles.txtContainer}>
                    <Text style={styles.txt}>Due</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalDueType('Overdue', '3')} style={styles.txtContainer}>
                    <Text style={styles.txt}>Overdue</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalDueType('Scheduled', '7')} style={styles.txtContainer}>
                    <Text style={styles.txt}>Scheduled</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setDueTypeModal(false) }} style={styles.btn}>
                    <Text style={styles.txtBtn}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </Modal>


            {/* Priorty Modal */}
            <Modal
              visible={priorityModal} // set visibility based on state
              animationType="slide" // set the animation type
              transparent={true} // make the modal transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalViewPrior}>
                  <Text style={styles.txt}>Set Priority</Text>
                  <TouchableOpacity onPress={() => modalClosePriority('High', '3')} style={styles.txtContainer}>
                    <Text style={styles.txt}>High</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalClosePriority('Low', '7')} style={styles.txtContainer}>
                    <Text style={styles.txt}>Low</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalClosePriority('Medium', '5')} style={styles.txtContainer}>
                    <Text style={styles.txt}>Medium</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalClosePriority('Minor', '9')} style={styles.txtContainer}>
                    <Text style={styles.txt}>Minor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => modalClosePriority('Urgent', '1')} style={styles.txtContainer}>
                    <Text style={styles.txt}>Urgent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setPriorityModal(false) }} style={styles.btn}>
                    <Text style={styles.txtBtn}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Assigend to Modal */}
            <Modal
              visible={assignedToModal} // set visibility based on state
              animationType="slide" // set the animation type
              transparent={true} // make the modal transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalViewAssigned}>
                  <Text style={styles.txt}>Select Sub Ordinate</Text>
                  <FlatList
                    data={subdata}
                    renderItem={({ item }) =>
                      <TouchableOpacity style={styles.item} onPress={() => selectSub(item.Name, item.id)}>
                        <Text style={styles.title}>{item.Name}</Text>
                      </TouchableOpacity>
                    }
                    keyExtractor={item => item.id}
                  />
                  <TouchableOpacity onPress={() => { setAssignedToModal(false) }} style={styles.btn}>
                    <Text style={styles.txtBtn}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </Modal>



            <TopHeader onPress={() => navigation.goBack()} txt="Task Detail"
              source={require('../../asserts/RequestAsserts/message.png')}
              onPressChat={() => navigation.navigate('ChatScreen')}
              />
            <View style={styles.formCon}>


              {/* First row */}
              <View style={{ flexDirection: 'row' }}>
                <SmallInput
                  txt="Task Name"
                  // placeholder={taskName}
                  value={taskName}
                  onChangeText={(txt) => setTaskName(txt)}
                  width='40%'
                />
                <ModalStatus
                  txt="Assigned To"
                  width="57%"
                  status={assignedTo}
                  widthStatus="85%"
                  marginLeft={10}
                  source={require('../../asserts/taskDetailAssets/arrow.png')}
                  onPress={() => setAssignedToModal(true)}
                />

              </View>

              {/* second row */}
              <View style={{ flexDirection: 'row' }}>
                <NonEditAble
                  txt="Assigned By"
                  width='40%'
                  value={assignedBy} />
                <NonEditAble
                  txt="Request"
                  width='57%'
                  value={request}
                  marginLeft={10} />
              </View>


              {/* Third row */}
              <View style={{ flexDirection: 'row' }}>
                <Calender
                  dateTxt={startDate}
                  width="40%"
                  widthDate="72%"
                  txt="Start Date"
                  showCalendarPress={() => setShowCalendar(true)}
                />
                <Calender
                  width="57%"
                  dateTxt={endDate}
                  marginLeft={10}
                  widthDate='75%'
                  txt="End Date"
                  showCalendarPress={() => setShowCalendarEnd(true)}
                />
              </View>

              {/* Fourth row */}
              <View style={{ flexDirection: 'row' }}>
                <ModalStatus
                  txt="Status"
                  width="40%"
                  status={status}
                  widthStatus="82%"
                  source={require('../../asserts/taskDetailAssets/arrow.png')}
                  onPress={() => setShow(true)}
                  marginTop={10}
                />
                <ModalStatus
                  txt="Due type"
                  width="57%"
                  status={dueType}
                  widthStatus="85%"
                  marginLeft={10}
                  source={require('../../asserts/taskDetailAssets/arrow.png')}
                  onPress={() => setDueTypeModal(true)}
                  marginTop={10}
                />
              </View>

              {/* fifth row */}
              <View style={{ flexDirection: 'row' }}>
                <ModalStatus
                  txt="Priority"
                  width="40%"
                  status={priority}
                  widthStatus="82%"
                  source={require('../../asserts/taskDetailAssets/arrow.png')}
                  onPress={() => setPriorityModal(true)}
                  marginTop={10}
                />
                <ModalStatus
                  txt="Attachments"
                  width="57%"
                  status="Attachment"
                  widthStatus="85%"
                  marginLeft={10}
                  source={require('../../asserts/taskDetailAssets/attach.png')}
                  marginTop={10}
                />
              </View>


              {/* Sixth row */}
              <SmallInput
                txt="Summary"
                // placeholder="Summary"
                value={summary}
                onChangeText={(txt) => setSummary(txt)}
                width='100%'
              />

              {/* Seventh row */}
              <View style={{ flexDirection: 'row' }}>
                <NonEditAble
                  txt="Client"
                  width='40%'
                  value={clientName} />
                <NonEditAble
                  txt="Organization"
                  width='57%'
                  value={organizationName}
                  marginLeft={10} />
              </View>

              {/* eight row */}
              <View>
                <ModalStatus
                  txt="Category"
                  width="40%"
                  status="High"
                  widthStatus="82%"
                  source={require('../../asserts/taskDetailAssets/arrow.png')}
                  marginTop={10}
                />
              </View>

              {filterRecordsId === 1000003 ? <View style={{ marginBottom: 60 }}></View> :
                <TouchableOpacity style={styles.saveBtn} onPress={() => saveButton()}>
                  <Text style={styles.saveBtnTxt} >Save</Text>
                </TouchableOpacity>}
            </View>
          </View>
        </ScrollView >
      )}
    </>
  )
}

export default RequestDetails

const styles = StyleSheet.create({
  formCon: {
    width: '94%'
  },
  blurView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modal: {
    width: '90%',
    backgroundColor: '#800000',
    borderRadius: 20,
    alignItems: 'center'
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

  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1
  },
  modalView: {
    backgroundColor: '#800000',
    height: '50%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  modalViewDue: {
    backgroundColor: '#800000',
    height: '40%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  modalViewPrior: {
    backgroundColor: '#800000',
    height: '55%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  modalViewAssigned: {
    backgroundColor: '#800000',
    height: '50%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },
  txtContainer: {
    height: '12%',
    width: '80%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  txt: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'K2D-Regular'
  },
  btn: {
    backgroundColor: 'white',
    height: '12%',
    width: '80%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  txtBtn: {
    color: '#800000',
    fontSize: 20,
    fontFamily: 'K2D-Regular'
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'K2D-Regular'
  },
  saveBtn: {
    backgroundColor: '#800000',
    height: '5%',
    width: '100%',
    borderRadius: 10,
    marginBottom: 100,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnTxt: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'K2D-Regular'
  }
})