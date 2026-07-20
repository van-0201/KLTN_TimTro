import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/layout.css';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="layout-container">
            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
            
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <div className="main-content">
                <Header onToggleSidebar={toggleSidebar} />
                <div className="content-area">
                    <div className="content-wrapper">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
