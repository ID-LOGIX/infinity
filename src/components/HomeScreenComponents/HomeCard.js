import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native'
import React from 'react'
const { height, width } = Dimensions.get('window');

const HomeCard = ({ source, txt, handlePress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.circle} />
            <Image source={source} style={styles.imageCon} />
            <View style={styles.textContainer}>
                <Text style={styles.text}>{txt}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default HomeCard

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 6,
        backgroundColor: '#fff',
    },
    circle: {
        width: width / 3.5,
        height: height / 7,
        borderRadius: 100,
        borderColor: '#800000',
        borderWidth: 1
    },
    textContainer: {
        position: 'absolute',
        bottom: 20,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: '#800000',
        height: height / 24,
        width: width / 3.8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        fontSize: 12,
        color: 'white',
        fontFamily: 'K2D-Regular'
    },
    imageCon: {
        height: height / 16,
        width: width / 8,
        bottom: height / 9
    }
})