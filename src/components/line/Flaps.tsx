import "./Flaps.css";

/** Each character on its own split flap. A flap flips into place when its character changes, as on a departure board. */
export default function Flaps({ text }: { text: string }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <span key={i + ch} className="flap">
          {ch}
        </span>
      ))}
    </>
  );
}
