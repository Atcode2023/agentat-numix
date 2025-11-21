<template>
  <section class="chat-container">
    <div ref="chatMessagesRef" class="chat-messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-wrapper"
      >
        <div
          :class="[
            'message',
            message.sender === 'user' ? 'user-message' : 'bot-message',
          ]"
        >
          <div class="message-content">{{ message.text }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
      <!-- <div v-if="isTyping" class="message-wrapper">
        <div class="message bot-message typing-indicator">
          <div class="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div> -->
    </div>

    <di class="chat-input">
      <q-input
        v-model="newMessage"
        outlined
        dense
        bg-color="white"
        @keyup.enter="sendMessage"
      >
        <template v-slot:after>
          <q-btn
            round
            flat
            color="positive"
            icon="send"
            :disable="!newMessage.trim()"
            @click="sendMessage"
          />
        </template>
      </q-input>
    </di>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const chatMessagesRef = ref<HTMLElement | null>(null);
const messages = ref<Message[]>([
  {
    text: 'Hello! How can I help you today?',
    sender: 'bot',
    timestamp: new Date(),
  },
]);
const newMessage = ref('');
const isTyping = ref(false);

// Format timestamp to HH:MM format
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Send a message
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  // Add user message
  messages.value.push({
    text: newMessage.value,
    sender: 'user',
    timestamp: new Date(),
  });

  // Clear input
  const userMessage = newMessage.value;
  newMessage.value = '';

  // Scroll to bottom
  await scrollToBottom();

  // Simulate bot typing
  isTyping.value = true;

  // Simulate bot response after a delay
  setTimeout(() => {
    isTyping.value = false;

    // Add bot response
    messages.value.push({
      text: getBotResponse(userMessage),
      sender: 'bot',
      timestamp: new Date(),
    });

    // Scroll to bottom again
    scrollToBottom();
  }, 1500);
};

// Simple bot response function (placeholder)
const getBotResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello there! How can I assist you today?';
  } else if (lowerMessage.includes('help')) {
    return "I'm here to help! What do you need assistance with?";
  } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return 'Goodbye! Have a great day!';
  } else {
    return (
      'I understand you said: "' + message + '". How can I help with that?'
    );
  }
};

// Scroll to the bottom of the chat
const scrollToBottom = async () => {
  await nextTick();
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// Watch for new messages and scroll to bottom
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

onMounted(() => {
  scrollToBottom();
});
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 103px);
  max-width: 500px;
  margin: 0 auto;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: $dark;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
}

.message-wrapper {
  display: flex;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;

  .message-content {
    word-break: break-word;
  }

  .message-time {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-top: 4px;
    text-align: right;
  }
}

.user-message {
  margin-left: auto;
  background-color: $primary;
  color: white;
  border-bottom-right-radius: 4px;
}

.bot-message {
  margin-right: auto;
  background-color: #e9e9eb;
  color: #333;
  border-bottom-left-radius: 4px;
}

.typing-indicator {
  padding: 12px 16px;

  .dots {
    display: flex;
    align-items: center;

    span {
      height: 8px;
      width: 8px;
      margin: 0 2px;
      background-color: #888;
      border-radius: 50%;
      display: inline-block;
      animation: typing 1.4s infinite ease-in-out both;

      &:nth-child(1) {
        animation-delay: 0s;
      }

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes typing {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  20% {
    transform: scale(1.2);
    opacity: 1;
  }
  40% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
}

.chat-input {
  padding: 12px 16px;
  background-color: $dark;
  border-top: 2px solid $primary;
}
</style>
