const CornerBrackets = () => {
  return (
    <>
      {/* Top-left */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30" />
      {/* Top-right */}
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-cyan-500/30" />
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-cyan-500/30" />
      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-500/30" />
    </>
  );
};

export default CornerBrackets;
