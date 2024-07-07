import { Outlet } from "react-router-dom";

export default function IntegrationsPage() {
  return (
    <div className="h-screen w-full p-10">
      <div className="flex flex-col justify-start h-screen">
        <h1 className="text-4xl font-bold text-primary mb-10">Integrations</h1>
        <Outlet />
      </div>
    </div>
  );
}
