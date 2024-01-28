import yubiLettermarkBlack from "../assets/images/yubiLogotypeBlack.svg";

const TopBar = () => {
  return (
    <div className="top-bar">
      <img
        className="logo"
        src={yubiLettermarkBlack}
        alt="yubi logo lettermark white"
      />
    </div>
  );
};

export default TopBar;
