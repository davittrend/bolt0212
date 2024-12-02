export interface PinterestToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
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