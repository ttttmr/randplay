export interface Base {
    id: string;
    link: string;
    title: string;
    pic: string;
    year: string;
    addedAt: string;
}

export interface Movie extends Base {
    titleAlias: string;
    duration: string;
    playable: boolean;
    rating: string;
}

export interface Book extends Base {
    author: string;
    publisher: string;
}