import { NavLink } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="w-full h-[52px] bg-base border-b border-white/10 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
            <div className="flex items-center">
                <span className="font-mono font-bold text-[14px] tracking-wider text-offwhite">SHOPPERIQ</span>
                <span style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '16px',
                    backgroundColor: '#2DD4BF',
                    marginLeft: '4px',
                    verticalAlign: 'middle',
                    animation: 'blink 1s step-end infinite'
                }} />
            </div>

            <div className="flex items-center space-x-8">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
                <NavLink to="/affinity" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Affinity</NavLink>
                <NavLink to="/segments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Segments</NavLink>
                <NavLink to="/recommend" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Recommend</NavLink>
                <NavLink to="/intelligence" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Intelligence</NavLink>
                <NavLink to="/insights" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Insights</NavLink>
            </div>

            <div className="flex items-center space-x-3">
                <span className="font-mono text-[10px] text-[#2DD4BF] tracking-widest">3,900 CUSTOMERS · LIVE</span>
                <div className="w-2 h-2 rounded-none animate-pulse" style={{ backgroundColor: '#34D399' }}></div>
            </div>
        </nav>
    );
}
