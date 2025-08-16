export type ProjectImage = {
  src: string;
  originalW: number;
  originalH: number;
  name?: string;
  lastModified?: number;
};

export type DisplayState = {
  width: number;
  height: number;
  scale: number; 
};


export type EditorProjectSlice = {
  projectId: string;
  image?: ProjectImage;
};

export type EditorViewSlice = {
  display: DisplayState;
};

export type EditorActions = {
  setImageFromFile: (file: File) => Promise<void>;
  clearImage: () => void;
  setDisplayByContainer: (containerW: number, containerH: number) => void;
};







export type TextAlign = 'left' | 'center' | 'right';

export type TextLayer = {
  id: string;
  text: string;
  x: number;                
  y: number;                
  width?: number;           
  rotation: number;         // degrees
  fontFamily: string;
  fontSize: number;         
  fontWeight?: number | string;
  fill: string;             // color
  opacity: number;          // 0..1
  align: TextAlign;
  locked?: boolean;
  zIndex: number;
};

export type EditorState = {
  project: EditorProjectSlice;
  view: EditorViewSlice;
  actions: EditorActions;

  layers?: TextLayer[];
  selectedId?: string | null;
};