import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/themeContext';
import type { ThemePalette } from '../lib/themes';
import { supabase } from '../lib/supabase';
import { getPlan } from '../lib/storage';
import { containsCrisisLanguage } from './MoodCheckIn';
import { t as translate, useStrings } from '../lib/i18n';

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
  isCrisis?: boolean;
  /** System-style notice bubble (e.g. the daily-limit heads-up). */
  isNotice?: boolean;
}

/**
 * The daily-limit notice text lives in the locale tables
 * (companion.limitNotice) — it is shown ONCE per day, right after the
 * first lite-mode reply, when a free user reaches the buddy's daily
 * deep-mode (Gemini Pro) limit. The function flags that reply with
 * limitReached; Plus users never receive the flag, so they never see
 * this. Warm, not a paywall — the conversation continues in lite mode
 * either way.
 */

/** Local calendar day (YYYY-MM-DD) — the notice's once-a-day key. */
function localDayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface Props {
  userName?: string;
  onClose: () => void;
}

/**
 * Haven — a real AI buddy (phase 2, build 24).
 *
 * Replies come from the `buddy-chat` Supabase Edge Function, which
 * forwards the recent conversation (last ~20 messages, sent each call)
 * to Google Gemini server-side. Signed-in users get the real buddy.
 * Whenever the function can't answer — signed out, offline, not
 * configured, upstream error — the on-device scripted engine
 * (getResponse below) answers instead, so this tab never goes dead.
 *
 * Crisis language is checked ON-DEVICE before any network call and
 * surfaces the resources immediately, regardless of the AI. The
 * function re-checks server-side as a backstop.
 *
 * Daily limit: deep mode (Gemini Pro) is capped per user per day
 * server-side. When the function answers in lite mode because a free
 * user hit the cap, it flags the reply (limitReached) and this screen
 * appends the LIMIT_NOTICE once that day. Haven Plus subscribers are
 * exempt — the app asserts its on-device entitlement with each
 * request (the `plus` flag below, from lib/storage getPlan(), the
 * same source the Music and Themes screens read), and Plus users
 * never see the notice.
 */
export function CompanionChat({ userName, onClose }: Props) {
  const { palette } = useTheme();
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: userName
        ? t('companion.greetingNamed', { name: userName })
        : t('companion.greeting'),
      fromUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  // Session-level guard for the limit notice, on top of the
  // AsyncStorage per-day flag — the notice shows at most once a day
  // even if storage hiccups.
  const limitNoticeCheckedRef = useRef(false);

  // Keep the newest content on screen — new bubbles and the typing
  // indicator alike.
  useEffect(() => {
    const t = setTimeout(
      () => flatListRef.current?.scrollToEnd({ animated: true }),
      80
    );
    return () => clearTimeout(t);
  }, [messages, busy]);

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

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    Keyboard.dismiss();

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      fromUser: true,
    };
    setInput('');

    // Crisis pre-check — on-device, before any network call. The
    // resources land immediately and never depend on the AI answering.
    if (containsCrisisLanguage(text)) {
      const crisisReply: Message = {
        id: (Date.now() + 1).toString(),
        text: t('companion.crisisReply'),
        fromUser: false,
        isCrisis: true,
      };
      setMessages((prev) => [...prev, userMsg, crisisReply]);
      return;
    }

    // Conversation history for the buddy — the function is stateless,
    // so the recent thread rides along with every call. System notice
    // bubbles stay out of the history — they're UI, not conversation.
    const history = [...messages, userMsg]
      .filter((m) => !m.isNotice)
      .slice(-20)
      .map((m) => ({
        role: m.fromUser ? 'user' : 'assistant',
        content: m.text,
      }));

    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);

    let replyText: string | null = null;
    let limitReached = false;
    if (supabase) {
      try {
        // Assert the on-device Haven Plus entitlement with the
        // request: getPlan() is the app's single source for it (set
        // only by a verified StoreKit/Play purchase or restore).
        // Plus callers skip the free daily Pro cap server-side.
        const plan = await getPlan().catch(() => 'haven' as const);
        const { data, error } = await supabase.functions.invoke('buddy-chat', {
          body: { messages: history, plus: plan === 'haven-plus' },
        });
        if (
          !error &&
          data &&
          typeof data.reply === 'string' &&
          data.reply.trim()
        ) {
          replyText = data.reply.trim();
          limitReached = data.limitReached === true;
        }
      } catch {
        replyText = null;
      }
    }

    // Fallback: any failure (signed out, offline, function down) drops
    // to the on-device scripted engine — the tab never goes dead.
    const reply: Message = {
      id: (Date.now() + 1).toString(),
      text: replyText ?? getResponse(text, userName, messages.length),
      fromUser: false,
    };
    const toAppend: Message[] = [reply];

    // Free user hit the daily deep-mode cap: say so ONCE today,
    // warmly, right after the first lite-mode reply — then keep
    // talking. The flag is already in AsyncStorage after the first
    // show; the ref guards repeats within this session.
    if (limitReached && !limitNoticeCheckedRef.current) {
      limitNoticeCheckedRef.current = true;
      const noticeKey = `haven-limit-notice-${localDayKey()}`;
      let alreadyShown = false;
      try {
        alreadyShown = !!(await AsyncStorage.getItem(noticeKey));
        if (!alreadyShown) await AsyncStorage.setItem(noticeKey, '1');
      } catch {
        alreadyShown = false;
      }
      if (!alreadyShown) {
        toAppend.push({
          id: (Date.now() + 2).toString(),
          text: t('companion.limitNotice'),
          fromUser: false,
          isNotice: true,
        });
      }
    }

    setMessages((prev) => [...prev, ...toAppend]);
    setBusy(false);
  };

  return (
    <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('companion.chatTitle')}</Text>
          <Text style={styles.subtitle}>{t('companion.chatSubtitle')}</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={24} color={palette.text} />
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
              item.isNotice && styles.noticeBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.fromUser ? styles.userText : styles.aiText,
                item.isNotice && styles.noticeText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
        ListFooterComponent={
          busy ? (
            <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color={palette.textDim} />
              <Text style={styles.typingText}>{t('companion.typing')}</Text>
            </View>
          ) : null
        }
      />

      <Text style={styles.disclaimer}>
        {t('companion.disclaimer')}
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('companion.placeholder')}
          placeholderTextColor={palette.textDim}
          multiline
          onSubmitEditing={send}
        />
        <Pressable
          onPress={send}
          disabled={busy}
          style={[styles.sendBtn, busy && styles.sendBtnDisabled]}
        >
          <Ionicons name="send" size={20} color={palette.buttonText} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Haven's FALLBACK reply engine — keyword/intent matching, fully
 * on-device. Since build 24 the real buddy (buddy-chat Edge Function)
 * answers first; this engine only speaks when the function can't —
 * signed out, offline, not configured, or an upstream error — so the
 * Companion tab never goes dead.
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
    return translate('companion.replies.checkin', { name });
  }

  // Explicitly asking for support — answer it directly, don't deflect.
  if (lower.match(/\b(support|help me|need help|need you|be there for me|someone to talk)\b/)) {
    return translate('companion.replies.support', { name });
  }

  if (lower.match(/\b(stress|stressed|anxious|anxiety|worried|overwhelm|panic)\b/)) {
    return translate('companion.replies.stress', { name });
  }

  if (lower.match(/\b(sad|down|depress|lonely|alone|cry|empty|numb)\b/)) {
    return translate('companion.replies.sad', { name });
  }

  if (lower.match(/\b(angry|mad|frustrated|annoyed|unfair)\b/)) {
    return translate('companion.replies.angry', { name });
  }

  if (lower.match(/\b(tired|exhaust|sleep|insomnia|can't sleep|awake)\b/)) {
    return translate('companion.replies.tired', { name });
  }

  if (lower.match(/\b(god|pray|prayer|faith|blessed|church|synagogue|bible|torah)\b/)) {
    return translate('companion.replies.faith', { name });
  }

  if (lower.match(/\b(work|job|boss|money|bills|rent|broke)\b/)) {
    return translate('companion.replies.work', { name });
  }

  if (lower.match(/\b(motivat|stuck|give up|procrastinat|lazy)\b/)) {
    return translate('companion.replies.motivation', { name });
  }

  if (lower.match(/\b(grateful|thankful|gratitude)\b/)) {
    return translate('companion.replies.gratitude', { name });
  }

  if (lower.match(/\b(happy|great|amazing|excited|proud|awesome|fantastic)\b/)) {
    return translate('companion.replies.happy', { name });
  }

  if (lower.match(/\b(thank|thanks)\b/)) {
    return translate('companion.replies.thanks', { name });
  }

  if (lower.match(/^(hi|hey|hello|yo|morning|good morning|good evening)\b/)) {
    return translate('companion.replies.greeting', { name });
  }

  // A direct question Haven can't truly answer — be honest, stay warm,
  // and hand the conversation back instead of faking an answer.
  if (lower.trim().endsWith('?') || lower.match(/^(what|why|how|who|when|where|can you|do you)\b/)) {
    return translate('companion.replies.question', { name });
  }

  // Long messages are usually venting — reflect, don't summarize.
  if (text.length > 140) {
    return translate('companion.replies.long', { name });
  }

  // Fallbacks: warm, and every one ends in a follow-up question so the
  // conversation moves instead of stalling on a canned line.
  const defaults = [
    translate('companion.replies.default1', { name }),
    translate('companion.replies.default2', { name }),
    translate('companion.replies.default3', { name }),
    translate('companion.replies.default4', { name }),
    translate('companion.replies.default5', { name }),
  ];
  return defaults[turn % defaults.length];
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: p.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: p.text,
  },
  subtitle: {
    fontSize: 13,
    color: p.textDim,
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
    backgroundColor: p.button,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: p.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  crisisBubble: {
    borderWidth: 1,
    borderColor: '#ff4d6d',
  },
  // System-style notice (daily-limit heads-up): full-width, outlined,
  // no fill — clearly Haven pausing to explain, not a chat reply.
  // Warm, not alarming: palette border, dimmed centered text.
  noticeBubble: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: p.border,
    borderBottomLeftRadius: 18,
  },
  noticeText: {
    color: p.textDim,
    textAlign: 'center',
    fontSize: 13.5,
    lineHeight: 20,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: p.textDim,
    fontStyle: 'italic',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: p.buttonText,
  },
  aiText: {
    color: p.text,
  },
  disclaimer: {
    fontSize: 11,
    color: p.textDim,
    textAlign: 'center',
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: p.border,
  },
  input: {
    flex: 1,
    backgroundColor: p.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: p.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: p.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  });
}
