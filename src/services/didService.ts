
import { supabase } from '@/integrations/supabase/client';

export interface CreateTalkParams {
  text: string;
  voice?: {
    type: 'microsoft';
    voice_id: string;
  };
  presenter?: {
    type: 'talk';
    source_url: string;
  };
}

export interface TalkResponse {
  id: string;
  status: 'created' | 'started' | 'done' | 'error';
  result_url?: string;
}

class DIDService {
  async createTalk(params: CreateTalkParams): Promise<TalkResponse> {
    const { data, error } = await supabase.functions.invoke('did-avatar', {
      body: {
        action: 'create',
        text: params.text,
      },
    });

    if (error) {
      throw new Error(`D-ID API error: ${error.message}`);
    }

    return data;
  }

  async getTalkStatus(talkId: string): Promise<TalkResponse> {
    const { data, error } = await supabase.functions.invoke('did-avatar', {
      body: {
        action: 'status',
        talkId,
      },
    });

    if (error) {
      throw new Error(`D-ID API error: ${error.message}`);
    }

    return data;
  }

  async waitForCompletion(talkId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getTalkStatus(talkId);
      
      if (status.status === 'done' && status.result_url) {
        return status.result_url;
      }
      
      if (status.status === 'error') {
        throw new Error('D-ID video generation failed');
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('D-ID video generation timeout');
  }
}

export default DIDService;
