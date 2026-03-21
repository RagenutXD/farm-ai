import { View, Text, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Analytics() {
  const { imageUri, label, analysis } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Analysis Result
      </Text>

      <Image
        source={{ uri: imageUri as string }}
        style={{ width: 250, height: 250, marginBottom: 20 }}
      />

      <Text style={{ fontSize: 18 }}>
        Result: {label}
      </Text>

      <Text style={{ fontSize: 18 }}>
        {analysis ? analysis: "You need to be online to get an analysis"}
      </Text>
    </View>
  );
}