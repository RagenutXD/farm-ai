import React from 'react'
import { Tabs } from 'expo-router'


const _layout = () => {
  return (
    <Tabs>
        <Tabs.Screen
            name='dashboard'
            options={{
                title: 'Home',
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name='scan'
            options={{
                title: 'Scan',
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name='field'
            options={{
                title: 'Field',
                headerShown: false,
            }}
        />
    </Tabs>
  )
}

export default _layout