import { PostHogProvider } from "@/providers/PostHogProvider";

export default function WebLpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PostHogProvider>{children}</PostHogProvider>;
}
