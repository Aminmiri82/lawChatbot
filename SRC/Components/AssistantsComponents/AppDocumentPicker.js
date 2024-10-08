import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { ProgressView } from "@react-native-community/progress-view";
import AppText from "../AppText";
import colors from "../../config/colors";
import DocumentPicker from "react-native-document-picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../themes/ThemeProvidor";

const ProgressBar = ({ progress }) => {
  const { colorsTh } = useTheme();
  // Create an animated value for throbbing effect
  const { t } = useTranslation();
  const textScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (progress === 0) {
      // Start subtle throbbing animation if uploading
      Animated.loop(
        Animated.sequence([
          Animated.timing(textScale, {
            toValue: 1.05, // Smaller scale value for subtler effect
            duration: 600, // Longer duration for a more gradual animation
            useNativeDriver: true,
          }),
          Animated.timing(textScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation when done
      textScale.stopAnimation();
    }
  }, [progress]);

  const progressText = progress === 0 ? t("uploading") : t("uploadComplete");

  return (
    <View style={styles.progressBarContainer}>
      <ProgressView
        progressTintColor={colorsTh.blue}
        trackTintColor={colors.grey}
        progress={progress} // Directly use progress as it's either 0 or 1
        style={[styles.progressBar, { color: colorsTh.blue }]}
      />
      <Animated.Text
        style={[
          styles.progressText,
          {
            transform: [{ scale: textScale }],
            color: colorsTh.text,
          },
        ]}
      >
        {progressText}
      </Animated.Text>
    </View>
  );
};

function AppDocumentPicker({ files, onAddFile, onRemoveFile, progressMap }) {
  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf], // You can change this to allow other file types
      });

      if (res) {
        const pickedFile = {
          mimeType: res[0].type,
          name: res[0].name,
          size: res[0].size,
          uri: res[0].uri,
        };
        console.log("Picked file:", pickedFile);
        onAddFile(pickedFile);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User cancelled the picker");
      } else {
        console.error("Error picking document: ", err);
      }
    }
  };

  const renderThumbnail = (file) => {
    if (file.mimeType.startsWith("image/")) {
      return <Image source={{ uri: file.uri }} style={styles.thumbnail} />;
    } else {
      return (
        <Image
          source={require("../../assets/file.png")}
          style={styles.thumbnail}
        />
      );
    }
  };

  const renderProgressBar = (fileId) => {
    const progress = progressMap[fileId] || 0;
    return <ProgressBar progress={progress} />;
  };

  const { colorsTh } = useTheme();

  return (
    <>
      <View
        style={[
          styles.generalFileContainer,
          { backgroundColor: colorsTh.docPicker, shadowColor: colorsTh.text },
        ]}
      >
        <FlatList
          data={files}
          keyExtractor={(item) => item.id.toString()} // Use item.id instead of index
          numColumns={3}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.fileContainer,
                { backgroundColor: colorsTh.fileBackground },
              ]}
            >
              {renderThumbnail(item)}
              <AppText
                style={[styles.fileName, colorsTh.text]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.name}
              </AppText>
              {renderProgressBar(item.id)}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onRemoveFile(item.id)} // Use item.id for deletion
              >
                <AppText style={styles.deleteButtonText}>X</AppText>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={styles.addButton} onPress={pickDocument}>
        <AppText style={styles.addButtonText}>+</AppText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  generalFileContainer: {
    flex: 1,
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    borderColor: colors.lightGrey,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  fileContainer: {
    margin: 10,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginBottom: 5,
  },
  fileName: {
    textAlign: "center",
    marginTop: 2,
    fontSize: 12,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: colors.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  addButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  addButtonText: {
    fontSize: 30,
    color: colors.white,
    fontWeight: "bold",
  },
  progressBarContainer: {
    marginTop: 5,
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    marginTop: 2,
    fontSize: 12,
  },
});

export default AppDocumentPicker;
