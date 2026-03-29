import { View, Text, FlatList, StyleSheet } from "react-native";

const history = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  cabin: `CABINE ${String((i % 19) + 1).padStart(2, "0")}`,
  date: `29/03/26 ${String(14 - Math.floor(i / 4)).padStart(2, "0")}:${String((60 - (i * 3)) % 60).padStart(2, "0")}`,
  type: "Higienizacao",
  employee: "LENI",
}));

export default function HistoryScreen() {
  return (
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.cabin}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.employee}>{item.employee}</Text>
          </View>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  badge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
  info: { flex: 1, marginLeft: 12 },
  type: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  employee: { fontSize: 12, color: "#64748b", marginTop: 1 },
  date: { fontSize: 12, color: "#94a3b8" },
});
