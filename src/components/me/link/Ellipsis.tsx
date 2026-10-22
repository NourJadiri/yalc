import "./Ellipsis.css";

/** Platform's Loader drawn from three real dots, so a slow poll looks like waiting; to anything that only sees text it is still "...". */
export default function Ellipsis() {
  return (
    <span className="ell" aria-hidden="true">
      <i>.</i>
      <i>.</i>
      <i>.</i>
    </span>
  );
}
