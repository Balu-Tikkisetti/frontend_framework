
import "../css/Community.css"

const Community=()=>{

    return(
        <div className="community-page">
           
        {/* search container */}
      <nav className="navbar navbar-light bg-dark w-100">
  <form className="form-inline d-flex w-100" onSubmit={(e) => e.preventDefault()}>
    <input
      className="form-control flex-grow-1 mx-2"
      type="search"
      placeholder="Search"
      aria-label="Search"
    />
    <button className="btn btn-outline-success" type="submit">
    <i className="bi bi-binoculars-fill"></i>
    </button>
  </form>
</nav>

<div className="community-topics-container overflow-scroll">

</div>

        </div>
    )

}


export default Community;