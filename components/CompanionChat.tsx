import { useState, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { containsCrisisLanguage } from './MoodCheckIn';

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
  isCrisis?: boolean;
}

interface Props {
  userName?: string;
  onClose: () => void;
}

/**
 * AI Companion — a friendly chat friend.
 * Warm, scripted responses (phase 1). Full LLM is phase 2.
 * Detects crisis language and quietly surfaces resources.
 * Never forces hotlines — just makes them available.
 */
export function CompanionChat({ userName, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: userName
        ? `Hey ${userName} 💛 I'm here. What's on your mind?`
        : `Hey 💛 I'm here. What's on your mind?`,
      fromUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      fromUser: true,
    };

    const isCrisis = containsCrisisLanguage(text);
    const reply = isCrisis
      ? {
          id: (Date.now() + 1).toString(),
          text: "I'm really glad you told me. You matter, and you don't have to carry this alone.\n\nIf you need someone right now:\n• Call or text 988 (Suicide & Crisis Lifeline)\n• Text HOME to 741741 (Crisis Text Line)\n• Call 1-800-799-7233 (Domestic Violence Hotline)\n\nI'm still here. Keep talking to me.",
          fromUser: false,
          isCrisis: true,
        }
      : {
          id: (Date.now() + 1).toString(),
          text: getResponse(text, userName),
          fromUser: false,
        };

    setMessages((prev) => [...prev, userMsg, reply]);
    setInput('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Companion</Text>
          <Text style={styles.subtitle}>Always here for you 💛</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.fromUser ? styles.userBubble : styles.aiBubble,
              item.isCrisis && styles.crisisBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.fromUser ? styles.userText : styles.aiText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      <Text style={styles.disclaimer}>
        Support resources are always available in Settings → Help.
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Talk to me..."
          placeholderTextColor="#555"
          multiline
          onSubmitEditing={send}
        />
        <Pressable onPress={send} style={styles.sendBtn}>
          <Ionicons name="send" size={20} color="#000" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function getResponse(text: string, userName?: string): string {
  const lower = text.toLowerCase();
  const name = userName ? ` ${userName}` : '';

  if (lower.match(/\b(stress|stressed|anxious|anxiety|worried|overwhelm)\b/)) {
    return `That sounds really heavy${name}. It's okay to feel that way — stress means you care. Want to try a quick breathing exercise together? Or just keep talking, I'm here.`;
  }

  if (lower.match(/\b(sad|down|depress|lonely|alone|cry)\b/)) {
    return `I'm sorry you're feeling this way${name}. You're not alone — I'm right here. Sometimes just saying it out loud helps. What's weighing on you most right now?`;
  }

  if (lower.match(/\b(happy|great|good|amazing|excited|proud)\b/)) {
    return `I love hearing that${name}! 🎉 Hold onto this feeling. What's making today good?`;
  }

  if (lower.match(/\b(tired|exhaust|sleep|insomnia)\b/)) {
    return `Rest is productive too${name}. Your body and mind need it. Is there something keeping you up, or are you just running on empty?`;
  }

  if (lower.match(/\b(thank|thanks)\b/)) {
    return `Always${name} 💛 That's what I'm here for.`;
  }

  if (lower.match(/\b(hi|hey|hello|morning|evening)\b/)) {
    return `Hey${name}! Good to see you. How's your heart today?`;
  }

  // Default warm responses
  const defaults = [
    `I hear you${name}. Tell me more — I'm listening.`,
    `That makes sense${name}. What else is on your mind?`,
    `Thanks for sharing that with me${name}. I'm here, keep going.`,
    `I'm with you${name}. What do you need right now?`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1a1a1a',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  crisisBubble: {
    borderWidth: 1,
    borderColor: '#ff4d6d',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
  },
  aiText: {
    color: '#fff',
  },
  disclaimer: {
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#fff',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
