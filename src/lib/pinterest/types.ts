export interface PinterestToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface PinterestUser {
  username: string;
  account_type: string;
  profile_image: string;
  website_url: string;
}

export interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  privacy: string;
  image_thumbnail_url?: string;
}

export interface PinterestAccount {
  id: string;
  user: PinterestUser;
  token: PinterestToken;
  lastRefreshed: number;
}

export interface PinData {
  title: string;
  description: string;
  link: string;
  imageUrl: string;
}

export interface ScheduledPin extends PinData {
  id: string;
  boardId: string;
  accountId: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  pinterestId?: string;
}

export interface APIResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
}