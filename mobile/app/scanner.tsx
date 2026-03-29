import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";

export default function ScannerScreen() {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = (data: string) => {
    setScanned(true);
    Alert.alert(
      "QR Code Escaneado!",
      `Cabine identificada: ${data}\n\nDeseja registrar a ordem de servico?`,
      [
        { text: "Cancelar", style: "cancel", onPress: () => setScanned(false) },
        {
          text: "Registrar OS",
          onPress: () => {
            // In production: save to Supabase with GPS coordinates
            Alert.alert("Sucesso!", "Ordem de servico registrada com sucesso!", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Camera placeholder - in production use expo-camera CameraView */}
      <View style={styles.cameraPlaceholder}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.instructionText}>Aponte a camera para o QR Code da cabine</Text>
      </View>

      {/* Demo scan button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => handleBarCodeScanned("CABINE 14 - WC BTP")}
        >
          <Text style={styles.demoButtonText}>Simular Scan (Demo)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#f59e0b",
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  instructionText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 30,
    textAlign: "center",
  },
  bottomBar: {
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  demoButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  demoButtonText: { color: "#1e293b", fontSize: 16, fontWeight: "bold" },
});
