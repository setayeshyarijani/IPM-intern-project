/**
 * Wraps English/numeric content (emails, dates, IDs) so it renders
 * correctly when embedded inside RTL (Persian) text — otherwise
 * punctuation and word order in short Latin strings can visually
 * flip when the surrounding paragraph direction is RTL.
 */
export default function Ltr({ children, style, className, ...rest }) {
  return (
    <span
      dir="ltr"
      className={className}
      style={{ unicodeBidi: 'isolate', display: 'inline-block', ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}
