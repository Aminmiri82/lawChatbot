import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AppText from "../../Components/AppText";
import Screen from "../../Components/Screen";
import colors from "../../config/colors";
import Spinner from "react-native-loading-spinner-overlay";
import RNPickerSelect from "react-native-picker-select";
import AppDocumentPicker from "../../Components/AssistantsComponents/AppDocumentPicker";
import {
  initDB,
  fetchAssistantById,
  insertAssistant,
  deleteAssistantById,
  updateChatItemByAssistantId,
} from "../../database";
import {
  uploadIndividualFiles,
  initializeAssistant,
  addFilesToAssistant,
} from "../../openai-backend/ApiBackEnd";
import { useTranslation } from "react-i18next";
import { set } from "lodash";
import { useTheme } from "../../themes/ThemeProvidor";
import AppButton from "../../Components/AppButton";

function AssistantEditorScreen2({ navigation, route }) {
  const { colorsTh } = useTheme();
  const { t } = useTranslation();
  const { id, name, instructions, imageUri } = route.params;
  const [files, setFiles] = useState([]);
  const [fileIds, setFileIds] = useState([]);
  const [parsedFiles, setParsedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [uploadCount, setUploadCount] = useState(0);
  const [model, setModel] = useState("GPT-4o-mini");

  const assistantList = [
    { label: "GPT-4o-mini", value: "gpt-4o-mini" },
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
    { label: "GPT-4", value: "gpt-4" },
    { label: "GPT-3.5", value: "gpt-3.5-turbo" },
  ];
  const isUploadingRef = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        const assistant = await fetchAssistantById(id);

        setModel(assistant.model);
        console.log("assistant.model", assistant.model);
        console.log("Raw assistant.files:", assistant.files);

        try {
          // Directly parse the JSON string assuming it's always in the correct format
          const filesArray = JSON.parse(assistant.files);

          console.log("Parsed files array:", filesArray);
          setParsedFiles(filesArray);
        } catch (error) {
          console.error("Error parsing assistant.files:", error.message);
        }
      } catch (error) {
        console.log(
          "Error initializing database or fetching Assistant: ",
          error
        );
      }
    };

    initialize();
  }, [id]);

  useEffect(() => {
    console.log("files given to usestate", files);

    isUploadingRef.current = true;
    console.log("uploading old files");

    // Function to handle file uploads
    const uploadFiles = async () => {
      try {
        await uploadOldFiles(parsedFiles);
      } finally {
        isUploadingRef.current = false;
      }
    };
    console.log("parsed files in second useeffect", parsedFiles);
    uploadFiles();
  }, [parsedFiles]);
  useEffect(() => {
    if (uploadCount === 0) {
      setIsUploading(false);
    }
  }, [uploadCount]);

  const handleSave = async () => {
    if (!name || !instructions) {
      console.log("Name or instructions are missing");
      return;
    }

    setIsInitializing(true);

    try {
      const assistant = await initializeAssistant({
        name,
        instructions,
        model,
      });

      if (fileIds.length > 0) {
        console.log("Adding files to assistant and creating vector store");
        const fileIdsOnly = fileIds.map((file) => file.fileId); // Extract only the fileId
        await addFilesToAssistant(assistant.assistantId, fileIdsOnly);
      }

      if (assistant.error) {
        console.log("Error initializing assistant:", assistant.error);
        return;
      }
      console.log("Assistant successfully initialized");
      console.log("calling updateAssistant");
      await deleteAssistantById(id); //deletes old assistant
      await insertAssistant(
        assistant.assistantId,
        name,
        instructions,
        model,
        files,
        imageUri
      ); //inserts into assistant table
      await updateChatItemByAssistantId(id, assistant.assistantId); //updates assistantId in chatItems table
      navigation.navigate("AssistantMenuScreen");
    } catch (error) {
      console.log("Error saving assistant:", error);
      Alert.alert(t("error"), t("shecanError"));
    } finally {
      setIsInitializing(false);
    }
  };
  const uploadOldFiles = async (parsedFiles) => {
    console.log("uploading old files");

    try {
      const uploadPromises = parsedFiles.map((file) => {
        console.log("Uploading file:", file, "Files array:", files);
        return handleAddFile(file);
      });

      await Promise.all(uploadPromises);

      console.log("All files have been uploaded.");
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };
  const handleAddFile = async (file) => {
    console.log("File URI:", file);
    const uniqueId = file.uri || Date.now().toString();
    console.log("Unique ID:", uniqueId);
    setFiles((prevFiles) => [...prevFiles, { ...file, id: uniqueId }]);

    setIsUploading(true);

    try {
      const fileId = await uploadIndividualFiles(
        file,
        (progress) => onProgress(uniqueId, progress),
        reportError
      );

      // Update fileIds state with the returned fileId
      setFileIds((prevFileIds) => [
        ...prevFileIds,
        { fileId: fileId, appId: uniqueId }, // Assuming `uniqueId` is the same as `file.id`
      ]);
    } catch (error) {
      console.error("Error in handleAddFile:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const reportError = (fileId, errorMessage) => {
    Alert.alert(
      "Upload Failed",
      `File upload failed: ${errorMessage}`,
      [
        {
          text: "Retry",
          onPress: () => {
            const failedFile = files.find((file) => file.id === fileId);
            if (failedFile) {
              handleAddFile(failedFile); // Retry the failed upload
            }
          },
        },
        {
          text: "Delete",
          onPress: () => handleRemoveFile(fileId),
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const handleRemoveFile = (uniqueId) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== uniqueId));
    setFileIds((prevFileIds) =>
      prevFileIds.filter((file) => file.appId !== uniqueId)
    );
  };

  const onProgress = (fileId, progress) => {
    setProgressMap((prevMap) => ({
      ...prevMap,
      [fileId]: progress,
    }));
    console.log(`Progress ${progress}%`);
  };

  const handleDelete = () => {
    deleteAssistantById(id)
      .then(() => {
        navigation.navigate("AssistantMenuScreen"); // Navigate back to the assistant menu
      })
      .catch((error) => {
        console.log("Error deleting assistant: ", error);
      });
  };

  return (
    <Screen
      style={[styles.container, { backgroundColor: colorsTh.background }]}
    >
      <Spinner
        visible={isInitializing}
        textContent={"Initializing assistant..."}
        textStyle={styles.spinnerTextStyle}
      />
      <View style={styles.topContainer}>
        <View style={styles.topTipContainer}>
          <AppText style={[styles.topTip, { color: colorsTh.text }]}>
            {t("chooseModel")}
          </AppText>
        </View>
        <View style={styles.topPickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setModel(value)}
            items={assistantList}
            value={model}
            style={{
              inputIOS: [styles.pickerIOS, { color: colorsTh.text }],
              inputAndroid: [styles.pickerAndroid, { color: colorsTh.text }],
              placeholder: {
                color: colorsTh.text, // Customize placeholder color
                fontSize: 16,
              },
            }}
            useNativeAndroidPickerStyle={false} // Disable native styling for Android
            placeholder={{ label: "Select a model", value: null }}
            placeholderTextColor={colorsTh.text}
          />
        </View>
        <View style={styles.gp4TipContainer}>
          <AppText style={[styles.middleTip, { color: colorsTh.text }]}>
            {t("fileUploadReq")}
          </AppText>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.bottomTipContainer}>
          <AppText style={[styles.bottomTip, { color: colorsTh.text }]}>
            {t("fileUpload")}
          </AppText>
        </View>
        <AppDocumentPicker
          files={files}
          onAddFile={handleAddFile}
          onRemoveFile={handleRemoveFile}
          progressMap={progressMap}
        />
      </View>
      <View style={styles.ButtonContainer}>
        <AppButton
          title={t("delete")}
          onPress={handleDelete}
          style={styles.deleteAssistantButton}
          textStyle={[styles.deleteButtonText, { color: colorsTh.text }]}
        />
        <AppButton
          title={t("next")}
          onPress={handleSave}
          style={styles.doneButton}
          textStyle={[styles.doneButtonText, { color: colorsTh.text }]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    alignItems: "center",
    padding: 10,
  },
  topTipContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    padding: 10,
  },
  topTip: {
    fontSize: 30,
    textAlign: "center",
  },
  topPickerContainer: {
    width: "80%",
    padding: 10,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
  },

  gp4TipContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    padding: 10,
  },
  middleTip: {
    fontSize: 16,
    textAlign: "center",
  },
  bottomContainer: {
    width: "100%",
    marginTop: 10,
    height: "50%",
    padding: 10,
    alignItems: "center",
  },
  bottomTipContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  bottomTip: {
    fontSize: 18,
    textAlign: "center",
  },
  doneButtonContainer: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "center",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  instructions: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  ButtonContainer: {
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  deleteAssistantButton: {
    backgroundColor: colors.deleteRed,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    elevation: 2, // For a slight shadow effect
    marginRight: 10, // Add margin to the right for spacing
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  doneButton: {
    backgroundColor: colors.niceBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    elevation: 2,
    marginLeft: 10,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AssistantEditorScreen2;
