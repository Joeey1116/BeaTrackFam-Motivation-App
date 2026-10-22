import { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  Keyboard,
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

  // Keyboard handling: this chat renders inside a pageSheet Modal, where
  // KeyboardAvoidingView mis-measures the keyboard frame (the sheet is
  // offset from the top of the window) — in build 18 the input row stayed
  // buried under the keyboard and Send was unreachable until the user
  // tapped the top of the screen to dismiss it. Instead, track the
  // keyboard height directly and pad the container by exactly that much:
  // the sheet's bottom edge sits on the window's bottom edge, so the
  // window-reported keyboard height IS the overlap. The input bar rides
  // on top of the keyboard and Send stays reachable while typing.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    Keyboard.dismiss();

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
          text: getResponse(text, userName, messages.length),
          fromUser: false,
        };

    setMessages((prev) => [...prev, userMsg, reply]);
    setInput('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
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
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
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
    </View>
  );
}

/**
 * Haven's reply engine — keyword/intent matching, fully on-device
 * (phase 1 by design; a real LLM companion is the planned phase 2).
 *
 * Build 19 coverage pass: build 18 only had six intents and a generic
 * random fallback, so everyday messages landed on non-sequiturs —
 * "I'm ok how are u" got "Thanks for sharing that with me…". Intents
 * are now ordered most-specific first, the fallback pool always ends
 * in a genuine follow-up question, and `turn` rotates the pool so the
 * same fallback never repeats back-to-back.
 */
function getResponse(text: string, userName?: string, turn = 0): string {
  const lower = text.toLowerCase();
  const name = userName ? ` ${userName}` : '';

  // Checking in on the companion / reporting your own state — before the
  // happy/greeting intents, which would otherwise swallow "good"/"hi".
  if (
    lower.match(/\bhow are (you|u)\b/) ||
    lower.match(/\b(i'm|im|i am)\s+(ok|okay|fine|good|alright|well|great)\b/) ||
    lower.match(/^\s*(i'm|im)\s+(ok|okay|fine|good|alright)\s*$/)
  ) {
    return `I'm good — better now that you're here${name} 💛 Glad you're doing okay. How's your day actually going so far?`;
  }

  // Explicitly asking for support — answer it directly, don't deflect.
  if (lower.match(/\b(support|help me|need help|need you|be there for me|someone to talk)\b/)) {
    return `I'm right here${name}, and I'm not going anywhere. You don't have to carry this alone. What's the hardest part right now — let's start there.`;
  }

  if (lower.match(/\b(stress|stressed|anxious|anxiety|worried|overwhelm|panic)\b/)) {
    return `That sounds really heavy${name}. It's okay to feel that way — stress means you care. Want to try a quick breathing exercise together? Or just keep talking, I'm here.`;
  }

  if (lower.match(/\b(sad|down|depress|lonely|alone|cry|empty|numb)\b/)) {
    return `I'm sorry you're feeling this way${name}. You're not alone — I'm right here. Sometimes just saying it out loud helps. What's weighing on you most right now?`;
  }

  if (lower.match(/\b(angry|mad|frustrated|annoyed|unfair)\b/)) {
    return `That sounds genuinely frustrating${name}. It makes sense you'd feel that way. What happened?`;
  }

  if (lower.match(/\b(tired|exhaust|sleep|insomnia|can't sleep|awake)\b/)) {
    return `Rest is productive too${name}. Your body and mind need it. Is there something keeping you up, or are you just running on empty?`;
  }

  if (lower.match(/\b(god|pray|prayer|faith|blessed|church|synagogue|bible|torah)\b/)) {
    return `Faith carries a lot of people through the hardest seasons${name}. What's on your heart that you're bringing to God right now?`;
  }

  if (lower.match(/\b(work|job|boss|money|bills|rent|broke)\b/)) {
    return `That pressure is real${name}, and it wears on a person. Is it one big thing hanging over you, or a pile of little ones?`;
  }

  if (lower.match(/\b(motivat|stuck|give up|procrastinat|lazy)\b/)) {
    return `You don't need to feel motivated to take one small step${name} — the feeling usually follows the step. What's one tiny thing you could do in the next ten minutes?`;
  }

  if (lower.match(/\b(grateful|thankful|gratitude)\b/)) {
    return `Gratitude changes the shape of a day${name}. What's one thing — big or tiny — you're thankful for right now?`;
  }

  if (lower.match(/\b(happy|great|amazing|excited|proud|awesome|fantastic)\b/)) {
    return `I love hearing that${name}! 🎉 Hold onto this feeling. What's making today good?`;
  }

  if (lower.match(/\b(thank|thanks)\b/)) {
    return `Always${name} 💛 That's what I'm here for.`;
  }

  if (lower.match(/^(hi|hey|hello|yo|morning|good morning|good evening)\b/)) {
    return `Hey${name}! Good to see you. How's your heart today?`;
  }

  // A direct question Haven can't truly answer — be honest, stay warm,
  // and hand the conversation back instead of faking an answer.
  if (lower.trim().endsWith('?') || lower.match(/^(what|why|how|who|when|where|can you|do you)\b/)) {
    return `That's a real question${name}, and I don't want to fake an answer for you. I'm a simple companion — but I'm a good listener. What's behind the question for you today?`;
  }

  // Long messages are usually venting — reflect, don't summarize.
  if (text.length > 140) {
    return `I read every word of that${name}. It sounds like there's a lot on your shoulders. Which part of it feels heaviest right now?`;
  }

  // Fallbacks: warm, and every one ends in a follow-up question so the
  // conversation moves instead of stalling on a canned line.
  const defaults = [
    `I hear you${name}. What part of that is sitting with you the most?`,
    `That makes sense${name}. What else is on your mind tonight?`,
    `I'm with you${name}. If you could change one thing about today, what would it be?`,
    `Tell me more about that${name} — when did it start feeling this way?`,
    `Okay${name}, I'm listening. What do you need most right now — advice, or just company?`,
  ];
  return defaults[turn % defaults.length];
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
