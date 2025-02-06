import { useState } from "react";
import Signup from "./signup";
import Login from "./login";
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
  const [showSignup, setShowSignup] = useState<boolean>(false);

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleSignupClose = () => {
    setShowSignup(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showSignup ? (
        <Signup onClose={handleSignupClose} />
      ) : (
        <Login onSignupClick={handleSignupClick} />
      )}
    </div>
  );
};

export default App;