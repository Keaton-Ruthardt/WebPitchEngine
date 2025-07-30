const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.vercel.app/api'  // Replace with your actual backend URL
  : 'http://localhost:5000/api';

export interface PitcherOption {
  label: string;
  value: number;
}

export interface AnalysisRequest {
  pitcher_id: number;
  years: string[];
  opponent_type: 'specific' | 'average';
  batter_name?: string;
  handedness?: string;
  min_pitches: number;
}

export interface PitchRecommendation {
  pitch_type: string;
  count: string;
  score: number; // This is now the Pitch Effectiveness Rating (PER) 0-100
  pitches: number;
  whiff_rate: number;
  hard_hit_rate: number;
  called_strike_rate: number;
  weak_contact_rate: number;
  chase_rate: number;
}

export interface AnalysisResponse {
  pitcher_name: string;
  opponent_name: string;
  years: string[];
  league: string;
  total_pitches: number;
  recommendations: PitchRecommendation[];
}

export interface UploadResponse {
  message: string;
  pitcher_id: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getPitchers(league: string): Promise<PitcherOption[]> {
    return this.request<PitcherOption[]>(`/pitchers/${league}`);
  }

  async analyzePitcher(request: AnalysisRequest): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async uploadMiLBData(file: File, pitcherId: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pitcher_id', pitcherId);

    const response = await fetch(`${API_BASE_URL}/upload-milb`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string; pybaseball_available: boolean }> {
    return this.request<{ status: string; pybaseball_available: boolean }>('/health');
  }
}

export const apiService = new ApiService(); 