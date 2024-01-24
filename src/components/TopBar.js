import yubiLettermarkWhite from "../assets/images/yubiLogotypeWhite.svg";

const TopBar = () => {
  return (
    <div className="top-bar">
      <img
        className="logo"
        src={yubiLettermarkWhite}
        alt="yubi logo lettermark white"
      />

      <span>time to optimise your web apps</span>
    </div>
  );
};

export default TopBar;
