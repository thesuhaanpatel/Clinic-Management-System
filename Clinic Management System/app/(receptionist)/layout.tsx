import RoleBasedSidebar from "@/components/sidebar/RoleBasedSidebar";

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <RoleBasedSidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}