'use client';

import { trackEvent } from '@/analytics/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';

interface HeroCTAButtonProps {
    children: React.ReactNode;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    email?: string;
}

interface PricingCTAButtonProps {
    children: React.ReactNode;
    planType: string;
    className?: string;
    email?: string;
}

/**
 * Utility to ensure navigation always goes to a clean path (without hash fragments)
 * and replaces the current history entry to avoid "go back" issues with hash links.
 */
function safePush(router: ReturnType<typeof useRouter>, path: string) {
    // Remove any hash or search from the current URL before pushing
    // This ensures the new route replaces the current one, preventing "go back" to a hash fragment
    router.replace(path);
}

export const HeroCTAButton = ({
    children,
    size = 'default',
    className = '',
    email,
}: HeroCTAButtonProps) => {
    const router = useRouter();
    const handleClick = () => {
        if (email) {
            posthog.identify(email);
            trackEvent('landing_cta', { source: '/dashboard' });
            safePush(router, '/dashboard');
        } else {
            trackEvent('landing_cta', { source: '/sign' });
            safePush(router, '/sign');
        }
    };

    return (
        <Button size={size} className={className} onClick={handleClick}>
            {children}
        </Button>
    );
};

export const PricingCTAButton = ({
    children,
    planType,
    className = '',
    email,
}: PricingCTAButtonProps) => {
    const router = useRouter();
    const handleClick = () => {
        if (email) {
            const target = `/dashboard?p=${planType}`;
            posthog.identify(email);
            trackEvent('landing_cta', { source: target });
            safePush(router, target);
        } else {
            const target = `/sign`;
            trackEvent('landing_cta', { source: target });
            safePush(router, target);
        }
    };

    return (
        <Button className={className} onClick={handleClick}>
            {children}
        </Button>
    );
};
