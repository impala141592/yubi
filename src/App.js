import "./assets/style/css/style.css";
import TopBar from "./components/TopBar";
import ImageOptimizer from "./components/ImageOptimizer";

function App() {
  return (
    <div className="Yubi">
      <TopBar />
      <div className="app-container">
        <ImageOptimizer />
      </div>
    </div>
  );
}

export default App;
