import type { MalObjekt } from "./DraggbartFelt";

export interface TreObjekt extends MalObjekt {
  children: TreObjekt[];
}
