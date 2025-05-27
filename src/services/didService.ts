
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
    console.log('Creating D-ID talk with params:', params);
    
    const { data, error } = await supabase.functions.invoke('did-avatar', {
      body: {
        action: 'create',
        text: params.text,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`D-ID API error: ${error.message}`);
    }

    if (data.error) {
      console.error('D-ID service error:', data.error);
      throw new Error(`D-ID API error: ${data.error}`);
    }

    console.log('D-ID talk created:', data);
    return data;
  }

  async getTalkStatus(talkId: string): Promise<TalkResponse> {
    console.log('Getting D-ID talk status for ID:', talkId);
    
    const { data, error } = await supabase.functions.invoke('did-avatar', {
      body: {
        action: 'status',
        talkId,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`D-ID API error: ${error.message}`);
    }

    if (data.error) {
      console.error('D-ID service error:', data.error);
      throw new Error(`D-ID API error: ${data.error}`);
    }

    console.log('D-ID talk status:', data);
    return data;
  }

  async waitForCompletion(talkId: string, maxAttempts = 60): Promise<string> {
    console.log(`Starting to wait for D-ID talk completion. Talk ID: ${talkId}, Max attempts: ${maxAttempts}`);
    
    for (let i = 0; i < maxAttempts; i++) {
      console.log(`Attempt ${i + 1}/${maxAttempts} - Checking talk status...`);
      
      try {
        const status = await this.getTalkStatus(talkId);
        
        console.log(`Talk status: ${status.status}`);
        
        if (status.status === 'done' && status.result_url) {
          console.log('D-ID video generation completed successfully!');
          return status.result_url;
        }
        
        if (status.status === 'error') {
          throw new Error('D-ID video generation failed with error status');
        }
        
        // Wait 3 seconds before checking again (increased from 2 seconds)
        console.log('Waiting 3 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`Error on attempt ${i + 1}:`, error);
        
        // If we're getting consistent errors, throw after a few attempts
        if (i >= 5) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    throw new Error(`D-ID video generation timeout after ${maxAttempts} attempts (${maxAttempts * 3} seconds)`);
  }
}

export default DIDService;
