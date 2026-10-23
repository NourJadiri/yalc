import type { TrackId } from "../../../types";
import type { BulletLine } from "../../ui/Bullet";

/** Each YALC line is one Platform line for good: Onsite Express is line 2, Day One Local line 4, Engineering Works line 5. */
export const LINE_OF: Record<TrackId, BulletLine> = { google: 2, aws: 4, eng: 5 };
