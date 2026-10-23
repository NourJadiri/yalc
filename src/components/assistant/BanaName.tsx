const NAME = "Bana";

/* Said once, whole; the letters, one inline span each so Tough love can set each on a split flap (personas.css), are
   hidden from assistive technology, which would read them one by one. */
export default function BanaName() {
  return (
    <h3>
      <span className="asst-said">{NAME}</span>
      <span aria-hidden="true">
        {[...NAME].map((letter, i) => (
          <span key={i} className="asst-flap">
            {letter}
          </span>
        ))}
      </span>
    </h3>
  );
}
