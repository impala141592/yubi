import "./assets/style/css/style.css";
import TopBar from "./components/TopBar";
import ImageOptimizer from "./components/ImageOptimizer";

function App() {
  return (
    <div className="Yubi">
      <div className="app-container">
        <TopBar />
        <div className="tool">
          <ImageOptimizer />
        </div>
        <div className="footer"></div>
      </div>
    </div>
  );
}

export default App;
