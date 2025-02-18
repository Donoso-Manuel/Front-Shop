import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../context/useAuth"; // Import the AuthContext
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import "../styles/Layout.css";

function Layout({children }) {
  const [collapsed, setCollapsed] = useState(false);
  

  const { userRole, isAuthenticated, setUserRole, setIsAuthenticated } = useAuth();

  return (
    <div className="layout">
      <NavBar 
        setUserRole={setUserRole} 
        userRole={userRole} 
        setIsAuthenticated={setIsAuthenticated} 
        isAuthenticated={isAuthenticated}
      />
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
       // onCategorySelect={onCategorySelect} 
      />
      <main className={`main-container ${collapsed ? "collapsed" : ""}`}>
        {children}
      </main>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
//  onCategorySelect: PropTypes.func.isRequired,
};

export default Layout;
