import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = React.useRef<FlatList>(null);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.assistantMessage]}>
        <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, item.isUser ? styles.userText : styles.assistantText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Fixed header */}
        <View style={[styles.headerWrap, { paddingTop: insets.top + 56 }]}>
          <Text style={styles.title}>Assistant</Text>
        </View>

        {/* Messages area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: insets.bottom + 20 },
          ]}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>Start a conversation with your cocktail assistant</Text>
            </View>
          }
        />

        {/* Input area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, inputText.trim() === "" && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={inputText.trim() === ""}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() === "" ? Colors.textSecondary : Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrap: {
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: "row",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  assistantMessage: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.accentPrimary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.buttonBackground,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: Colors.textPrimary,
  },
  assistantText: {
    color: Colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.inputBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    maxHeight: 104,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.buttonBackground,
  },
});

