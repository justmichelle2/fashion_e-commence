import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DesignerDirectoryScreen } from '../screens/Create/DesignerDirectoryScreen';
import { DesignerRequestScreen } from '../screens/Create/DesignerRequestScreen';
import { InspoUploadScreen } from '../screens/Create/InspoUploadScreen';

const Stack = createNativeStackNavigator();

export function CreateStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Designers" component={DesignerDirectoryScreen} options={{ title: 'Request a designer' }} />
      <Stack.Screen name="DesignerRequest" component={DesignerRequestScreen} options={{ title: 'Custom request' }} />
      <Stack.Screen name="InspoUpload" component={InspoUploadScreen} options={{ title: 'Upload inspo' }} />
    </Stack.Navigator>
  );
}
