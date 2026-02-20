export enum GameStatus {
  WAITING = "waiting",
  PLAYING = "playing",
  PAUSED = "paused",
  FINISHED = "finished",
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
}
