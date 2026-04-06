import { TransitionProvider } from "@/providers/TransitionProvider";

export default function WebSiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <TransitionProvider>{children}</TransitionProvider>;
}
