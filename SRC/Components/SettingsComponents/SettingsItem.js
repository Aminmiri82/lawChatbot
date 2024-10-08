import React, { forwardRef } from "react";
import { View, StyleSheet, TouchableHighlight } from "react-native";
import AppText from "../AppText";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import colors from "../../config/colors";
import Icon from "../Icon";
import { useTheme } from "../../themes/ThemeProvidor";

const SettingsItem = forwardRef(
  ({ title, subTitle, IconComponent, onPress }, ref) => {
    const { colorsTh } = useTheme();
    return (
      <TouchableHighlight
        ref={ref}
        underlayColor={colors.light}
        onPress={onPress}
      >
        <View style={[styles.container, { backgroundColor: colorsTh.white }]}>
          <View style={styles.iconContainer}>{IconComponent}</View>

          <View style={styles.detailsContainer}>
            <AppText style={styles.title}>{title}</AppText>
          </View>
          {subTitle && (
            <View style={styles.subTitleContainer}>
              <AppText style={styles.subTitle}>{subTitle}</AppText>
            </View>
          )}

          <View style={styles.arrow}>
            <Icon
              iconSet="MCI"
              name="chevron-right"
              size={25}
              color={colorsTh.icon}
              iconColor={colorsTh.icon}
              style={styles.arrow}
            />
          </View>
        </View>
      </TouchableHighlight>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 15,
    // backgroundColor: colors.white,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  iconContainer: {
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontWeight: "500",
    fontSize: 16,
  },
  subTitleContainer: {
    marginRight: 10,
  },
  subTitle: {
    color: colors.medium,
    fontSize: 14,
  },
  arrow: {
    alignSelf: "center",
  },
});

export default SettingsItem;
