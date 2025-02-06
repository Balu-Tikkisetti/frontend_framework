import "../css/Global.css";
import Search from "./header-components/Search";





const Global = () => {
  return (
    <div className="global-page">

   <Search />

      {/* global topics continer */}
       
       <div className="global-topics-container overflow-scroll">


       </div>


    </div>
  );
};

export default Global;
