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
 * Utility to clean the current browser path of any hash fragment and update the history,
 * then push the new path as intended.
 */
function safePush(router: ReturnType<typeof useRouter>, path: string) {
    // Remove hash from the current URL and replace the current history entry
    if (window.location.hash) {
        const { pathname, search } = window.location;
        const cleanUrl = `${pathname}${search}`;
        window.history.replaceState(null, '', cleanUrl);
    }
    router.push(path);
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
        const isProPlan = planType && planType !== 'free';
        const basePath = email ? '/dashboard' : '/sign';
        const target = isProPlan ? `${basePath}?p=${planType}` : basePath;

        if (email) {
            posthog.identify(email);
        }
        trackEvent('landing_cta', { source: target });
        safePush(router, target);
    };

    return (
        <Button className={className} onClick={handleClick}>
            {children}
        </Button>
    );
};
