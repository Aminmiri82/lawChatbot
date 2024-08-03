import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Button } from "react-native";
import AppText from "../../Components/AppText";
import Screen from "../../Components/Screen";
import colors from "../../config/colors";

import RNPickerSelect from "react-native-picker-select";
import AppDocumentPicker from "../../Components/AssistantsComponents/AppDocumentPicker";
import {
  uploadIndividualFiles,
  initializeAssistant,
  addFilesToAssistant,
} from "../../openai-backend/ApiBackEnd";
import AppButton from "../../Components/AppButton";
import { insertAssistant, initDB } from "../../database";
import Spinner from "react-native-loading-spinner-overlay";

function AssistantMakerScreen2({ navigation, route }) {
  const { name, instructions } = route.params;
  const [files, setFiles] = useState([]);
  const [model, setModel] = useState("GPT-4o-mini");
  const [isUploading, setIsUploading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const assistantList = [
    { label: "GPT-4o-mini", value: "gpt-4o-mini" },
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
    { label: "GPT-4", value: "gpt-4" },
    { label: "GPT-3.5", value: "gpt-3.5-turbo" },
  ];

  useEffect(() => {
    initDB().catch((error) => {
      console.log("Error initializing database: ", error);
    });
  }, []);

  const handleAddFile = (file) => {
    setFiles((prevFiles) => [...prevFiles, file]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name || !instructions) {
      console.log("Name or instructions are missing");
      return;
    }
    let fileIds = null;

    const assistant = await initializeAssistant({ name, instructions, model });
    if (files.length > 0) {
      setIsUploading(true);
      fileIds = await handleUploadFiles();
      console.log(
        "uploading files",
        fileIds,
        "to assistant",
        assistant.assistantId
      );
      setIsUploading(false);
    }
    setIsInitializing(true);
    if (fileIds!=null) {
      await addFilesToAssistant(assistant.assistantId, fileIds);
    }

    if (assistant.error) {
      console.log("Error initializing assistant:", assistant.error);
      setIsInitializing(false);
      return;
    }
    insertAssistant(assistant.assistantId, name, instructions, model, files)
      .then(() => {
        navigation.navigate("AssistantMenuScreen"); // Navigate back to the assistant menu
      })
      .catch((error) => {
        console.log("Error saving assistant:", error);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  };

  const handleUploadFiles = async () => {
    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadIndividualFiles(file));
      const fileIds = await Promise.all(uploadPromises);
      
      console.log("fileIds", fileIds);
      return fileIds;
    } catch (error) {
      console.log("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Screen>
      <Spinner
        visible={isUploading || isInitializing}
        textContent={
          isUploading ? "Uploading files..." : "Initializing assistant..."
        }
        textStyle={styles.spinnerTextStyle}
      />
      <View style={styles.topContainer}>
        <View style={styles.topTipContainer}>
          <AppText style={styles.topTip}>
            choose a model for your assistant
          </AppText>
        </View>
        <View style={styles.topPickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setModel(value)}
            items={assistantList}
          />
        </View>
        <View style={styles.gp4TipContainer}>
          <AppText style={styles.middleTip}>
            if you want to upload files for the knowledge base you need to
            choose gpt 4 turbo preview
          </AppText>
        </View>
      </View>
    
      <View style={styles.bottomContainer}>
        <View style={styles.bottomTipContainer}>
          <AppText style={styles.bottomTip}>
            upload .pdf .docx and .txt files to your assistant
          </AppText>
        </View>
        <AppDocumentPicker
          files={files}
          onAddFile={handleAddFile}
          onRemoveFile={handleRemoveFile}
        />
      </View>
      <AppButton
        title="Save Assistant"
        onPress={handleSave}
        style={styles.nextButton}
        textStyle={styles.nextButtonText}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    color: colors.dark,
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
    color: colors.dark,
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
  },
  bottomTip: {
    color: colors.dark,
    fontSize: 18,
    textAlign: "center",
  },
  doneButtonContainer: {
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "center",
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 16,
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
    borderRadius: 5,
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
    borderRadius: 5,
    elevation: 2,
    marginLeft: 10,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: colors.niceBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
    marginLeft: 10,
    position: "relative",
    width: "30%",
    left: "40%",
    bottom: "10%",
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  spinnerTextStyle: {
    color: "#FFF",
  },
});

export default AssistantMakerScreen2;
