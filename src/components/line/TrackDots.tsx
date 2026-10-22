import Bullet from "../ui/Bullet";
import "./TrackDots.css";

/** The line being ridden as a map draws it: its bullet at the head of a stretch of line with three small stops. */
export default function TrackDots({ bullet }: { bullet: string }) {
  return (
    <div className="gdots" aria-hidden="true">
      <Bullet line="track" size="lg">
        {bullet}
      </Bullet>
      <i />
      <i />
      <i />
    </div>
  );
}
