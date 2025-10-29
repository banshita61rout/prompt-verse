import "./App.css";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { Mycontext } from "./Mycontext";
function App() {
  const providerValues = {}; //passing values

  return (
    <div className="main">
      <Mycontext.Provider values={providerValues}>
        <Sidebar></Sidebar>
        <ChatWindow></ChatWindow>
      </Mycontext.Provider>
    </div>
  );
}

export default App;
