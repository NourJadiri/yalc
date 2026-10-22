const NAME = "Bana";

/* One inline span per letter, so Tough love can set each on a split flap (personas.css) while it still reads as one word. */
export default function BanaName() {
  return (
    <h3>
      {[...NAME].map((letter, i) => (
        <span key={i} className="asst-flap">
          {letter}
        </span>
      ))}
    </h3>
  );
}
