'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useEffect } from 'react';

import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { useGlobalStore } from '@/store/global';

const checkHasConversation = async () => {
  const hasMessages = await messageService.hasMessages();
  const hasAgents = await sessionService.hasSessions();
  return hasMessages || hasAgents;
};

const Redirect = memo(() => {
  const router = useRouter();
  // get settings str from query
  const searchParams = useSearchParams();
  const settings = searchParams.get('settings');
  const [setConfig] = useGlobalStore((s) => [s.updatePreference]);

  useEffect(() => {
    checkHasConversation().then((hasData) => {
      if (hasData) {
        router.replace('/chat');
      } else {
        router.replace('/welcome');
      }
    });
  }, []);

  useEffect(() => {
    if (settings) {
      try {
        const json = JSON.parse(settings);
        const { openAI } = json as {
          openAI: {
            OPENAI_API_KEY?: string;
            endpoint?: string;
          };
        };
        if (openAI) {
          // 调用 updatePreference 更新配置
          updatePreference(openAI, 'Updating OpenAI settings from URL');
        }
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, [settings, updatePreference]);

  return null;
});

export default Redirect;
