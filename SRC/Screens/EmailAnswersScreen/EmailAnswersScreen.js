import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { POSTMARK_API_KEY } from "@env";
import colors from "../../config/colors";
import Screen from "../../Components/Screen";
import AppText from "../../Components/AppText";
import { useTranslation } from "react-i18next";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const { t } = useTranslation();

  const handleSendEmail = async () => {
    if (!name || !question || !email) {
      Alert.alert(t("error"), t("emptyfields"));
      return; 
    }
    const postmarkApiUrl = "https://api.postmarkapp.com/email";
    const postmarkServerToken = POSTMARK_API_KEY;

    const emailBody = `
      Name: ${name}
      Question: ${question}
      Email to respond to: ${email}
    `;

    const emailData = {
      From: "Outgoing@dadafarin.net",
      To: "Incoming@dadafarin.net",
      Subject: "User Question",
      TextBody: emailBody,
      MessageStream: "outbound",
    };

    try {
      const response = await fetch(postmarkApiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": postmarkServerToken,
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(t("done"), t("EmailSent"));
      } else {
        Alert.alert(t("error"), `${t("EmailFailed")}: ${result.Message}`);
      }
    } catch (error) {
      Alert.alert(t("error"), `${t("EmailFailed")}: ${error.message}`);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.headerText}>{t("EmailAnswersExplanation")}</Text>

        <Text style={styles.labelText}>{t("UserName")}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t("UserNamePlaceholder")}
          placeholderTextColor="#888"
          style={styles.input}
        />

        <Text style={styles.labelText}>{t("UserQuestion")}</Text>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder={t("UserQuestionPlaceholder")}
          placeholderTextColor="#888"
          style={styles.questionInput}
          multiline
        />

        <Text style={styles.labelText}>{t("EmailToReceiveAnswer")}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("EmailToReceiveAnswerPlaceholder")}
          placeholderTextColor="#888"
          style={styles.input}
          keyboardType="email-address"
        />

        <TouchableOpacity onPress={handleSendEmail} style={styles.doneButton}>
          <AppText style={styles.doneButtonText}>{t("Send")}</AppText>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    margin: 20,
    paddingTop: 50,
  },
  headerText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  labelText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#333",
    width: "100%",
  },
  questionInput: {
    height: 120,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
    width: "100%",
  },
  doneButton: {
    backgroundColor: colors.niceBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ContactForm;