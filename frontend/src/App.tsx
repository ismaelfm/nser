import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import WorkspacesView from "./components/WorkspacesView";
import ToolsView from "./components/ToolsView";
import WorkspaceDetail from "./components/WorkspaceDetail";
import ToolDocPage from "./components/tool-docs/ToolDocPage";
import { useParams } from "react-router-dom";

// Wrapper for WorkspaceDetail to extract params
function WorkspaceDetailWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();
    return <WorkspaceDetail workspaceId={Number(id)} onBack={() => navigate('/workspaces')} />;
}

function App() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavClick = (label: string) => {
        switch (label) {
            case "Workspaces": navigate('/workspaces'); break;
            case "Tools": navigate('/tools'); break;
            case "AI Copilot": navigate('/ai-copilot'); break;
            case "Reports": navigate('/reports'); break;
            default: navigate('/workspaces');
        }
    };

    const getActiveLabel = () => {
        const path = location.pathname;
        if (path.startsWith('/workspaces')) return "Workspaces";
        if (path.startsWith('/tools')) return "Tools";
        if (path.startsWith('/ai-copilot')) return "AI Copilot";
        if (path.startsWith('/reports')) return "Reports";
        return "Workspaces";
    };

    return (
        <div className="flex h-screen bg-[#05080f] text-gray-100 font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-hidden">
            <Sidebar activeItem={getActiveLabel()} onItemClick={handleNavClick} />
            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-gradient-to-br from-[#05080f] via-[#0a0f18] to-[#0d1322]">
                <Routes>
                    <Route path="/" element={<Navigate to="/workspaces" replace />} />
                    <Route path="/workspaces" element={<WorkspacesView onOpenWorkspace={(id) => navigate(`/workspaces/${id}`)} />} />
                    <Route path="/workspaces/:id" element={<WorkspaceDetailWrapper />} />
                    <Route path="/tools" element={<ToolsView />} />
                    <Route path="/tools/:toolName" element={<ToolDocPage />} />
                    <Route path="*" element={
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 mb-6 rounded-full bg-gray-900/50 border border-gray-800 flex items-center justify-center">
                                <span className="text-4xl text-gray-600">🏗️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-200 mb-2">{getActiveLabel()}</h2>
                            <p className="text-gray-500 max-w-sm">
                                This section is currently under development. Check back later for updates.
                            </p>
                        </div>
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default App;
