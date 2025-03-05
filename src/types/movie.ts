export interface MovieBase {
  id: string;
  link: string;
  title: string;
  titleAlias: string;
  pic: string;

  year: string;
  duration: string;

  playable: boolean;

  addedAt: string;
}

export interface Movie extends MovieBase {
  rating: string;
}
