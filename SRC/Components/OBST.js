import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "../config/colors";
import AppText from "./AppText";

function OBST({ title, subtitle }) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
      <AppText style={styles.subtitle}>{subtitle}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: colors.white,
    marginBottom: 20,
    overflow: "hidden",
    width: "90%",
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
    color: colors.black,
    textAlign: "center",
    width: "70%",
  },
  subtitle: {
    fontSize: 15,
    color: colors.grey,
    fontWeight: "bold",
    textAlign: "center",
    // width: "85%",
  },
});
export default OBST;
