'use client';

import { useCallback } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { showError } from '@/components/core/common';

interface ChatAgentProxy {
  agent: string;
  pendingToolCallId: string | null;
}

const chatAgentProxy = proxy<ChatAgentProxy>({
  agent: '',
  pendingToolCallId: null,
});

export function setDefaultChatAgent(agent: string) {
  if (chatAgentProxy.agent === agent) {
    return;
  }
  chatAgentProxy.agent = agent;
}

export function useChatAgent(): [string, (agent: string) => void] {
  const agent = useSnapshot(chatAgentProxy).agent;
  const setAgent = useCallback((agent: string) => {
    chatAgentProxy.agent = agent;
  }, []);
  return [agent, setAgent];
}

export function useChatPendingToolCallId(): [string | null, (pendingToolCallId: string) => () => void] {
  const pendingToolCallId = useSnapshot(chatAgentProxy).pendingToolCallId;
  const setPendingToolCallId = useCallback((pendingToolCallId: string) => {
    if (chatAgentProxy.pendingToolCallId != null) {
      showError(
        `Pending tool call ID is already set with value ${chatAgentProxy.pendingToolCallId}. Cannot set to ${pendingToolCallId}.`,
      );
      return () => {
        showError(
          `Pending tool call ID is already set with value ${chatAgentProxy.pendingToolCallId}. Cannot set to ${pendingToolCallId}. Hence this action is not allowed.`,
        );
      };
    }
    chatAgentProxy.pendingToolCallId = pendingToolCallId;

    return () => {
      chatAgentProxy.pendingToolCallId = null;
    };
  }, []);
  return [pendingToolCallId, setPendingToolCallId];
}
