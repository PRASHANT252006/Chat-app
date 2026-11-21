const Avatar = ({ src, name, size = 44 }) => {
  const letter = (name || "?").charAt(0).toUpperCase();
  const style = { width: size, height: size, fontSize: size * 0.42 };
  return src ? (
    <img className="avatar" src={src} alt={name} style={style} />
  ) : (
    <span className="avatar fallback" style={style}>
      {letter}
    </span>
  );
};

export default Avatar;
