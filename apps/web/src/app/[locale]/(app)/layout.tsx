import { Authenticated } from "convex/react";
export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
}) {
    return (
        <Authenticated>
            {children}
        </Authenticated>
    );
}