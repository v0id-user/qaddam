'use client';

import { trackEvent } from "@/analytics/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
interface HeroCTAButtonProps {
    href: string;
    children: React.ReactNode;
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    email?: string;
}

interface PricingCTAButtonProps {
    href: string;
    children: React.ReactNode;
    planType: string;
    className?: string;
}

export const HeroCTAButton = ({ href, children, size = "default", className = "", email }: HeroCTAButtonProps) => {
    const router = useRouter();
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (email) {
            posthog.identify(email);
            trackEvent('landing_cta', { source: '/dashboard' });
            router.push('/dashboard');
          } else {
            trackEvent('landing_cta', { source: '/sign' });
            router.push('/sign');
          }
    };

    return (
        <Button
            size={size}
            className={className}
            asChild
        >
            <a href={href} onClick={handleClick}>
                {children}
            </a>
        </Button>
    );
};

export const PricingCTAButton = ({ href, children, planType, className = "" }: PricingCTAButtonProps) => {
    const handleClick = () => {
        trackEvent('landing_cta', { source: `pricing_${planType}` });
    };

    return (
        <Button
            className={className}
            asChild
        >
            <a href={href} onClick={handleClick}>
                {children}
            </a>
        </Button>
    );
};