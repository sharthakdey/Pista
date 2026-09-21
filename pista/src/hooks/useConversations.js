import { useCallback, useEffect, useState } from "react";
import { uid } from "../utils/format.js";

const KEY = "pista:conversations:v1";
const MAX = 25;

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

/**
 * Conversation history kept in the browser. If the backend later stores
 * conversations, swap read/write for API calls here — the Tutor page won't change.
 */
export function useConversations() {
  const [conversations, setConversations] = useState(read);
  const [activeId, setActiveId] = useState(() => read()[0]?.id || null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(conversations.slice(0, MAX))); } catch { /* ignore */ }
  }, [conversations]);

  const active = conversations.find((c) => c.id === activeId) || null;

  const startNew = useCallback(() => setActiveId(null), []);

  /** Appends a message, creating the conversation if needed. Returns the conversation id. */
  const appendMessage = useCallback((conversationId, message) => {
    const id = conversationId || uid("local");
    setConversations((list) => {
      const existing = list.find((c) => c.id === id);
      if (!existing) {
        const title = message.role === "user" ? message.content.slice(0, 60) : "New conversation";
        return [{ id, title, serverId: null, updatedAt: Date.now(), messages: [message] }, ...list];
      }
      const updated = { ...existing, updatedAt: Date.now(), messages: [...existing.messages, message] };
      return [updated, ...list.filter((c) => c.id !== id)];
    });
    setActiveId(id);
    return id;
  }, []);

  const updateMessage = useCallback((conversationId, messageId, patch) => {
    setConversations((list) => list.map((c) => c.id !== conversationId ? c : {
      ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
    }));
  }, []);

  const setServerId = useCallback((conversationId, serverId) => {
    setConversations((list) => list.map((c) => (c.id === conversationId ? { ...c, serverId } : c)));
  }, []);

  const remove = useCallback((conversationId) => {
    setConversations((list) => list.filter((c) => c.id !== conversationId));
    setActiveId((cur) => (cur === conversationId ? null : cur));
  }, []);

  return { conversations, active, activeId, setActiveId, startNew, appendMessage, updateMessage, setServerId, remove };
}
