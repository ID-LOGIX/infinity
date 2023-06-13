import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

const SmallInput = ({ txt, placeholder, value, onChangeText,width,marginLeft }) => {
    return (
        <View style={{width:width,marginLeft:marginLeft}}>
            <Text style={styles.txt}>{txt}</Text>
            <View style={styles.inputCon}>
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor="black"
                    fontFamily="K2D-Regular"
                    value={value}
                    onChangeText={onChangeText}
                    fontSize={16}
                    color="black"
                />
            </View>
        </View>
    )
}

export default SmallInput

const styles = StyleSheet.create({
    inputCon: {
        borderColor: '#800000',
        borderWidth: 1,
        marginTop: 5,
        borderRadius: 10
    },
    txt: {
        fontSize: 14,
        fontFamily: 'K2D-Regular',
        color: '#800000'
    }
})