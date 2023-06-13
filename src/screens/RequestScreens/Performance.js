import { StyleSheet, Text, View, BackHandler, ActivityIndicator, FlatList, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChartCards from '../../components/RequestScreenComponents/ChartCards';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

const Performance = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([])
    const [recordLengths, setRecordLengths] = useState([]);
    const [unCompleteNum, setUnCompleteNum] = useState(0)
    const [completeNum, setCompleteNum] = useState(0)
    const [showCalendarStart, setShowCalendarStart] = useState(false);
    const [startDate, setStartDate] = useState(null)
    const [showCalendarEnd, setShowCalendarEnd] = useState(false);
    const [endDate, setEndDate] = useState(null)

    const getAPIData = async (selectedFirstDay, selectedLastDay) => {
        setIsLoading(true)
        const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const userId = await AsyncStorage.getItem('userId')
        setStartDate(selectedFirstDay)
        setEndDate(selectedLastDay)
        let idArray = []
        fetch(`${protocol}://${host}:${port}/api/v1/models/AD_User?$filter=Supervisor_ID eq ${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                for (let i = 0; i < data.records.length; i++) {
                    idArray.push(data.records[i].id)
                }
                const endCard = { uid: userId, Name: 'My Task', id: parseInt(userId) }
                setData([...data.records, endCard])
                fetchBasedOnId(idArray, endCard, protocol, host, port, userId, token, selectedFirstDay, selectedLastDay)

            })
            .catch(error => {
                alert(error)
                setIsLoading(false)
            });

    }

    const fetchBasedOnId = async (idArray, endCard, protocol, host, port, userId, token, selectedFirstDay, selectedLastDay) => {
        idArray.push(endCard.id)
        const promises = idArray.map(id =>
            fetch(`${protocol}://${host}:${port}/api/v1/models/R_Request?$filter=SalesRep_ID eq ${id} AND CreatedBy eq ${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .catch(error => {
                    console.error(error);
                })
        );
        Promise.all(promises).then(results => {
            let tempResultCurr = []
            const dummyArray = results.reduce((acc, obj) => {
                return acc.concat(obj.records);
            }, []);
            idArray.forEach((id) => {
                const count = dummyArray.filter((item) => {
                    return item.SalesRep_ID.id === id &&
                        item.StartTime.slice(0, 10) >= selectedFirstDay &&
                        item.StartTime.slice(0, 10) <= selectedLastDay;
                }).length;
                tempResultCurr.push(count)
            });

            setRecordLengths(tempResultCurr)
            fetchunComplete(dummyArray, idArray, selectedFirstDay, selectedLastDay)
        }).catch((err) => {
            setIsLoading(false)
        })
    }

    const fetchunComplete = async (dummyArray, idArray, selectedFirstDay, selectedLastDay) => {
        let tempResult = []
        let tempResultCom = []
        const filterCompleteRecords = dummyArray.filter(item => item.R_Status_ID.id === 1000003);
        idArray.forEach((id) => {
            const count = dummyArray.filter((item) => {
                return item.SalesRep_ID.id === id &&
                    item.R_Status_ID.id === 1000003 &&
                    item.StartTime.slice(0, 10) >= selectedFirstDay &&
                    item.StartTime.slice(0, 10) <= selectedLastDay;
            }).length;
            tempResult.push(count)
        });

        idArray.forEach((id) => {
            const count = dummyArray.filter((item) => {
                return item.SalesRep_ID.id === id &&
                    item.R_Status_ID.id !== 1000003 &&
                    item.StartTime.slice(0, 10) >= selectedFirstDay &&
                    item.StartTime.slice(0, 10) <= selectedLastDay;
            }).length;
            tempResultCom.push(count)
        });

        setCompleteNum(tempResult)
        setUnCompleteNum(tempResultCom)
        setIsLoading(false)
    }

    const navigateBack = () => {
        const firstDayOfCurrMonth = moment().subtract('months').startOf('month').format('YYYY-MM-DD');
        const lastDayOfCurrMonth = moment().subtract('months').endOf('month').format('YYYY-MM-DD');
        const unsubscribe = navigation.addListener('focus', () => {
            getAPIData(firstDayOfCurrMonth, lastDayOfCurrMonth)
        });
        return unsubscribe;
    }

    useEffect(() => {
        navigateBack()
        const backAction = () => {
            navigation.goBack()
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [navigation])

    const onDateChangeStart = (date) => {
        const formattedDate = moment.utc(date).format("YYYY-MM-DD");
        if (formattedDate > endDate) {
            alert('This Date must be smaller then end date')
        } else {
            setStartDate(formattedDate);
            setShowCalendarStart(false);
            getAPIData(formattedDate, endDate)
        }
    };

    const onDateChangeEnd = (date) => {
        const formattedDate = moment.utc(date).format("YYYY-MM-DD");
        if (formattedDate < startDate) {
            alert('This Date must be greater then start date')
        } else {
            setEndDate(formattedDate);
            setShowCalendarEnd(false);
            getAPIData(startDate, formattedDate)
        }
    }


    return (
        <>
            {isLoading && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            )}
            {!isLoading && (
                <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>

                    {/* Start date modal */}
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

                    <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 5 }}>
                        <TouchableOpacity style={styles.fromBtn} onPress={() => setShowCalendarStart(true)}>
                            <View style={{ width: '70%' }} >
                                <Text style={styles.txt}>{startDate}</Text>
                            </View>
                            <Image source={require('../../asserts/taskDetailAssets/calendar.png')} style={styles.image} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toBtn} onPress={() => setShowCalendarEnd(true)}>
                            <View style={{ width: '70%' }}>
                                <Text style={styles.txt}>{endDate}</Text>
                            </View>
                            <Image source={require('../../asserts/taskDetailAssets/calendar.png')} style={styles.image} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={data}
                        renderItem={({ item }) => <ChartCards
                            name={item.Name}
                            firstTop="Total"
                            secTop="Uncomplete"
                            thirdTop="complete"
                            percentageNum={completeNum[data.indexOf(item)] / recordLengths[data.indexOf(item)]}
                            total={recordLengths[data.indexOf(item)]}
                            comp={unCompleteNum[data.indexOf(item)]}
                            unComp={completeNum[data.indexOf(item)]}
                        />}
                    />
                </View>
            )}
        </>
    )
}

export default Performance

const styles = StyleSheet.create({
    fromBtn: {
        width: '40%',
        flexDirection: 'row',
        height: 35,
        alignItems: 'center',
    },
    toBtn: {
        width: '40%',
        marginLeft: 10,
        flexDirection: 'row',
        height: 35
    },
    image: {
        height: '80%',
        width: '30%'
    },
    txt: {
        color: 'black',
        fontSize: 15,
        fontFamily: 'K2D-Bold'
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

})