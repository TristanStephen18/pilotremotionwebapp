export type BackgroundType = 'color' | 'image' | 'video';

export interface PreviewInputProps {
  text: string;
  fontFamily: string;
  bgType: BackgroundType;
  bgValue: string; // hex color, image URL, or video URL
}
