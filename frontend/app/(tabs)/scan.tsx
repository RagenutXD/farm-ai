import { useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useServerCheck } from '@/services/useServerCheck'

const cropTypes = ["Rice (Palay)", "Corn", "Potato"];
const growthStages = ["Seedling", "Vegetative", "Flowering / Reproductive", "Ripening"];

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState(false);
  const [cropType, setCropType] = useState("Rice (Palay)");
  const [growthStage, setGrowthStage] = useState("Flowering / Reproductive");
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [showStagePicker, setShowStagePicker] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { status, check } = useServerCheck("https://google.com");
  const [snapImg, setSnapImg] = useState("")

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={s.permissionContainer}>
        <Text style={s.permissionText}>Camera access is needed to scan crops.</Text>
        <TouchableOpacity style={s.permissionBtn} onPress={requestPermission}>
          <Text style={s.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSnap = async () => {
    if (!cameraRef.current) return;
    setAnalyzing(true);
    try {
      const isReachable = await check();
      if (!isReachable) {
        Alert.alert("No connection", "Could not reach the server. Please check your internet.");
        return;
      }
      else{
        Alert.alert("Connection Successfull", "Could not reach the server. Please check your internet.");
      }
      const snap = await cameraRef.current.takePictureAsync({ base64: true });
      // ai shit
      await new Promise((r) => setTimeout(r, 1500));
      setSnapImg(snap.uri)
      console.log(snap.uri)
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView style={s.container}>
      {/* Camera */}
      <View style={s.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={s.camera}
          facing={facing}
          flash={flash ? "on" : "off"}
        />
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <TouchableOpacity style={s.smallBtn} onPress={() => setFlash((f) => !f)}>
          <Text style={s.smallBtnText}>{flash ? "FLASH ON" : "FLASH OFF"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.snapBtn} onPress={handleSnap} disabled={analyzing}>
          {analyzing ? (
            <ActivityIndicator color="#57534e" />
          ) : (
            <Text style={s.snapText}>SNAP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.smallBtn} onPress={ () => setFacing(f => f === "front" ? "back" : "front")}>
          <Text style={s.smallBtnText}>Flip</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdowns */}
      <View style={s.dropdowns}>
        {/* Crop Type */}
        <View>
          <Text style={s.label}>CROP TYPE</Text>
          <TouchableOpacity
            style={s.dropdown}
            onPress={() => { setShowCropPicker((v) => !v); setShowStagePicker(false); }}
          >
            <Text style={s.dropdownText}>{cropType}</Text>
            <Text style={s.chevron}>⌄</Text>
          </TouchableOpacity>
          {showCropPicker && (
            <View style={s.pickerList}>
              {cropTypes.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={s.pickerItem}
                  onPress={() => { setCropType(c); setShowCropPicker(false); }}
                >
                  <Text style={[s.pickerItemText, c === cropType && s.pickerItemActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Growth Stage */}
        <View>
          <Text style={s.label}>GROWTH STAGE</Text>
          <TouchableOpacity
            style={s.dropdown}
            onPress={() => { setShowStagePicker((v) => !v); setShowCropPicker(false); }}
          >
            <Text style={s.dropdownText}>{growthStage}</Text>
            <Text style={s.chevron}>⌄</Text>
          </TouchableOpacity>
          {showStagePicker && (
            <View style={s.pickerList}>
              {growthStages.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={s.pickerItem}
                  onPress={() => { setGrowthStage(st); setShowStagePicker(false); }}
                >
                  <Text style={[s.pickerItemText, st === growthStage && s.pickerItemActive]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      {snapImg ? (
      <Image
        source={{ uri: snapImg }}
        style={{ width: "100%", height: 300 }}
      />
    ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },

  // Permission
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafaf9",
    padding: 24,
    gap: 16,
  },
  permissionText: {
    color: "#57534e",
    textAlign: "center",
    fontSize: 15,
  },
  permissionBtn: {
    borderWidth: 1,
    borderColor: "#1c1917",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  permissionBtnText: {
    color: "#1c1917",
    fontWeight: "600",
  },

  // Camera
  cameraContainer: {
    height: 560,
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  circleWrapper: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#fff",
  },
  hintWrapper: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    letterSpacing: 2,
  },

  // Controls
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  smallBtn: {
    borderWidth: 1,
    borderColor: "#1c1917",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1c1917",
    letterSpacing: 0.5,
  },
  snapBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#d6d3d1",
    alignItems: "center",
    justifyContent: "center",
  },
  snapText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#57534e",
    letterSpacing: 0.5,
  },

  // Dropdowns
  dropdowns: {
    paddingHorizontal: 20,
    gap: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#a8a29e",
    marginBottom: 6,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#d6d3d1",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: "#44403c",
    fontSize: 15,
  },
  chevron: {
    color: "#a8a29e",
    fontSize: 16,
  },
  pickerList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#d6d3d1",
    backgroundColor: "#fff",
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f4",
  },
  pickerItemText: {
    fontSize: 15,
    color: "#a8a29e",
  },
  pickerItemActive: {
    color: "#1c1917",
    fontWeight: "600",
  },
});

