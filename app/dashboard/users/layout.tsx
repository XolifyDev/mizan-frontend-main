import { ProGate } from "@/components/ProGate";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProGate feature="Team members">{children}</ProGate>;
}
