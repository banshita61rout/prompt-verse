import "./App.css";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
function App() {
  return (
    <div className="main">
      <Sidebar></Sidebar>
      <ChatWindow></ChatWindow>
    </div>
  );
}

export default App;
