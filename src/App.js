import * as React from "react";
import './App.css';
import CliMode from './components/CliMode';



const App =({contract, currentUser, nearConfig, wallet }) => {

  console.log("contract : " + contract);
  console.log("currentUser : " + currentUser);
  console.log("nearConfig : " + nearConfig);
  console.log("wallet : " + wallet);
  return (
    <div className="App">
      <h1>Welcome </h1>
      <CliMode contract={contract} currentUser={currentUser} nearConfig={nearConfig} wallet={wallet} />
    </div>
  );
};
export default App;