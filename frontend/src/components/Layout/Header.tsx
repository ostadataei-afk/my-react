function Header() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: "56px",
        gap: "20px",
        background: "white",
      }}
    >
      <div>D1 Manager</div>
      <div>users</div>
      <button>🔁</button>
      <button>✏️</button>
      <button>🗑️</button>
      <div>● Online</div>
    </div>
  );
}
export default Header;