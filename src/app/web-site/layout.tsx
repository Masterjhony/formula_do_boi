import { TransitionProvider } from "@/providers/TransitionProvider";
import { PostHogProvider } from "@/providers/PostHogProvider";

export default function WebSiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PostHogProvider>
            <TransitionProvider>{children}</TransitionProvider>
        </PostHogProvider>
    );
}
