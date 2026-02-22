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
        <div className="flex h-screen bg-black text-gray-300 font-mono selection:bg-gray-800 selection:text-white overflow-hidden">
            <Sidebar activeItem={getActiveLabel()} onItemClick={handleNavClick} />
            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0a0a0a]">
                <Routes>
                    <Route path="/" element={<Navigate to="/workspaces" replace />} />
                    <Route path="/workspaces" element={<WorkspacesView onOpenWorkspace={(id) => navigate(`/workspaces/${id}`)} />} />
                    <Route path="/workspaces/:id" element={<WorkspaceDetailWrapper />} />
                    <Route path="/tools" element={<ToolsView />} />
                    <Route path="/tools/:toolName" element={<ToolDocPage />} />
                    <Route path="*" element={
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 mb-6 rounded-none bg-black border border-gray-800 flex items-center justify-center">
                                <span className="text-4xl text-gray-500">?</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-200 mb-2 uppercase tracking-widest">{getActiveLabel()}</h2>
                            <p className="text-gray-600 max-w-sm uppercase text-xs tracking-wider">
                                Section offline. Awaiting deployment.
                            </p>
                        </div>
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default App;
