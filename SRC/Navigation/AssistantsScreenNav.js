import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AssistantMenuScreen from "../Screens/AssistantScreen/AssistantMenuScreen";
import BuildScreen from "../Screens/AssistantScreen/EmptyAssistantsMenuScreen";
import AppButton from "../Components/AppButton";
import AssistantMakerScreen1 from "../Screens/AssistantScreen/AssistantMakerScreen1";
import AssistantMakerScreen2 from "../Screens/AssistantScreen/AssistantMakerScreen2";
import AssistantEditorScreen1 from "../Screens/AssistantScreen/AssistantEditorScreen1";
import AssistantEditorScreen2 from "../Screens/AssistantScreen/AssistantEditorScreen2";

const AssistantsStack = createNativeStackNavigator();
const makeNewAssistantButton = (navigation) => (
  <AppButton
    title="new assistant"
    onPress={() => navigation.navigate("AssistantMakerScreen1")}
  />
);

function AssistantsScreenNav(props) {
  return (
    <AssistantsStack.Navigator>
      <AssistantsStack.Screen
        name="AssistantMenuScreen"
        component={AssistantMenuScreen}
        options={({ navigation }) => ({
          headerRight: () => makeNewAssistantButton(navigation),
        })}
      />
      <AssistantsStack.Screen
        name="AssistantMakerScreen1"
        component={AssistantMakerScreen1}
      />
      <AssistantsStack.Screen
        name="AssistantMakerScreen2"
        component={AssistantMakerScreen2}
      />
      <AssistantsStack.Screen
        name="AssistantEditorScreen1"
        component={AssistantEditorScreen1}
      />
      <AssistantsStack.Screen
        name="AssistantEditorScreen2"
        component={AssistantEditorScreen2}
      />
      <AssistantsStack.Screen name="BuildScreen" component={BuildScreen} />
    </AssistantsStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default AssistantsScreenNav;
