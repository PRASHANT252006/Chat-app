const Avatar = ({ src, name, size = 44, online }) => {
  const letter = (name || "?").charAt(0).toUpperCase();
  const style = { width: size, height: size, fontSize: size * 0.42 };
  const face = src ? (
    <img className="avatar" src={src} alt={name} style={style} />
  ) : (
    <span className="avatar fallback" style={style}>
      {letter}
    </span>
  );
  if (online === undefined) return face;
  return (
    <span className="avatar-wrap">
      {face}
      {online && <span className="dot" aria-label="online" />}
    </span>
  );
};

export default Avatar;
