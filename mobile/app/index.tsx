import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useState, useCallback } from "react";

const recentOrders = [
  { id: "1", cabin: "CABINE 14", time: "14:11", type: "Higienizacao" },
  { id: "2", cabin: "CABINE 10", time: "14:05", type: "Higienizacao" },
  { id: "3", cabin: "CABINE 12", time: "14:05", type: "Higienizacao" },
  { id: "4", cabin: "CABINE 13", time: "13:57", type: "Higienizacao" },
  { id: "5", cabin: "CABINE 11", time: "13:55", type: "Higienizacao" },
  { id: "6", cabin: "CABINE 08", time: "13:49", type: "Higienizacao" },
  { id: "7", cabin: "CABINE 07", time: "13:45", type: "Higienizacao" },
  { id: "8", cabin: "CABINE 18", time: "13:40", type: "Higienizacao" },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
    >
      {/* Scan Button */}
      <TouchableOpacity style={styles.scanButton} onPress={() => router.push("/scanner")} activeOpacity={0.8}>
        <Text style={styles.scanIcon}>📷</Text>
        <View>
          <Text style={styles.scanTitle}>FINALIZAR ORDEM DE SERVICO</Text>
          <Text style={styles.scanSubtitle}>Toque para escanear QR Code</Text>
        </View>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#eff6ff" }]}>
          <Text style={[styles.statValue, { color: "#2563eb" }]}>47</Text>
          <Text style={styles.statLabel}>OS Hoje</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#f0fdf4" }]}>
          <Text style={[styles.statValue, { color: "#16a34a" }]}>1.248</Text>
          <Text style={styles.statLabel}>OS Mes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#fefce8" }]}>
          <Text style={[styles.statValue, { color: "#ca8a04" }]}>19</Text>
          <Text style={styles.statLabel}>Cabines</Text>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordens Recentes</Text>
        {recentOrders.map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <View style={styles.orderIcon}>
              <Text style={{ fontSize: 16 }}>✅</Text>
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderCabin}>{order.cabin}</Text>
              <Text style={styles.orderType}>{order.type}</Text>
            </View>
            <Text style={styles.orderTime}>{order.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    gap: 16,
    elevation: 4,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanIcon: { fontSize: 40 },
  scanTitle: { color: "#1e293b", fontSize: 16, fontWeight: "bold" },
  scanSubtitle: { color: "#475569", fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: "#64748b", marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  orderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  orderInfo: { flex: 1, marginLeft: 12 },
  orderCabin: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  orderType: { fontSize: 12, color: "#64748b", marginTop: 1 },
  orderTime: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
});
