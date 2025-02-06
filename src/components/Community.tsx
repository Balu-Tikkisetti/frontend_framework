import "../css/Community.css";
import Search from "./header-components/Search";

const Community = () => {
  return (
    <div className="community-page">
      <Search />

      <div className="community-topics-container overflow-scroll"></div>
    </div>
  );
};

export default Community;
