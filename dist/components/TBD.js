'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { HardHat, Mail, Clock, ArrowRight, Hammer, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageShell from './core/page/page-shell';
import { useManualReadySignal } from '../lib/core/client/loading-tracker';
export default function UnderConstruction() {
    const manualReadySignal = useManualReadySignal();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        manualReadySignal();
    }, [manualReadySignal]);
    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the email to your backend
        // console.log('Email submitted:', email);
        setSubmitted(true);
        setEmail('');
    };
    // Estimated completion date - adjust as needed
    const launchDate = new Date('2025-06-01T12:00:00Z');
    return (_jsx(PageShell, { title: "Under Construction", children: _jsx("div", { className: "flex h-full flex-col items-center justify-center bg-background p-4", children: _jsxs("div", { className: "w-full max-w-md space-y-8 text-center", children: [_jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 blur-xl" }), _jsx("div", { className: "relative flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-lg", children: _jsx(HardHat, { className: "h-10 w-10 text-primary" }) })] }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "font-bold text-4xl tracking-tight", children: "Under Construction" }), _jsx("p", { className: "text-muted-foreground", children: `We're working hard to bring you something amazing. This page is currently being built and will be ready
            soon.` })] }), _jsxs("div", { className: "flex justify-center space-x-6 py-6", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx(Hammer, { className: "mb-2 h-6 w-6 text-primary" }), _jsx("span", { className: "text-muted-foreground text-sm", children: "Building" })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx(Wrench, { className: "mb-2 h-6 w-6 text-primary" }), _jsx("span", { className: "text-muted-foreground text-sm", children: "Refining" })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx(Clock, { className: "mb-2 h-6 w-6 text-primary" }), _jsx("span", { className: "text-muted-foreground text-sm", children: "Coming Soon" })] })] }), _jsxs("div", { className: "rounded-lg border bg-card p-6 shadow-sm", children: [_jsxs("div", { className: "mb-4 flex items-center justify-center space-x-2", children: [_jsx(Mail, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "font-medium", children: "Get notified when we launch" })] }), !submitted ? (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [_jsx(Input, { type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full" }), _jsxs(Button, { type: "submit", className: "w-full", children: ["Notify Me", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] })] })) : (_jsx("div", { className: "rounded-md bg-primary/10 p-3 text-center text-sm", children: `Thanks! We'll notify you when we launch.` }))] }), _jsx("div", { className: "text-muted-foreground text-sm", children: _jsxs("p", { children: ["Expected launch: ", launchDate.toLocaleDateString()] }) })] }) }) }));
}
//# sourceMappingURL=TBD.js.map