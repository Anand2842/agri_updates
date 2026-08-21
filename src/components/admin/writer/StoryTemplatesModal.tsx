'use client';

import React from 'react';
import { X, LayoutTemplate, FlaskConical, Zap, DollarSign, TrendingUp } from 'lucide-react';

export interface StoryTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultTitle: string;
    defaultExcerpt: string;
    htmlContent: string;
}

const TEMPLATES: StoryTemplate[] = [
    {
        id: 'research',
        title: 'Research Study & Scientific Breakdown',
        description: 'Structured outline for breaking down academic papers, soil science, or seed trials.',
        category: 'Research',
        icon: FlaskConical,
        defaultTitle: 'Study Breakdown: [Crop/Technology] Shows [X]% Yield Increase',
        defaultExcerpt: 'Key findings from recent agricultural field trials exploring new crop varieties and agronomic methodologies.',
        htmlContent: `
<h2>Background & Problem Context</h2>
<p>Explain the historical context, current farming challenges, or soil condition that prompted this research study.</p>

<h2>Methodology & Field Trials</h2>
<p>Detail how the study was conducted: geographic regions, crop varieties tested, duration, and control groups.</p>

<h2>Key Scientific Findings</h2>
<ul>
    <li><strong>Primary Finding:</strong> Significant enhancement observed under trial conditions.</li>
    <li><strong>Input Efficiency:</strong> Reduction in water/fertilizer requirements.</li>
    <li><strong>Disease Resistance:</strong> Impact on pest and disease incidence.</li>
</ul>

<h2>Practical Takeaways for Farmers</h2>
<p>Summarize actionable insights and practical recommendations for growers looking to adopt these practices.</p>
`
    },
    {
        id: 'startup',
        title: 'Agri-Startup Spotlight',
        description: 'Comprehensive profile covering founders, technology, business model, and funding.',
        category: 'Startups',
        icon: Zap,
        defaultTitle: 'Startup Spotlight: How [Startup Name] is Revolutionizing [Domain]',
        defaultExcerpt: 'An in-depth look at [Startup Name], their proprietary technology, and how they empower Indian farmers.',
        htmlContent: `
<h2>The Problem Statement</h2>
<p>Describe the core inefficiency or bottleneck in the agricultural value chain that this startup addresses.</p>

<h2>The Innovation & Solution</h2>
<p>Detail the proprietary product, hardware, IoT device, AI model, or supply chain marketplace developed by the team.</p>

<h2>Traction & Farmer Impact</h2>
<ul>
    <li><strong>Farmer Reach:</strong> Number of growers or acres onboarded.</li>
    <li><strong>Cost Reduction:</strong> Measurable savings or yield boost achieved.</li>
    <li><strong>Market Footprint:</strong> States and regions currently active.</li>
</ul>

<h2>Funding & Future Roadmap</h2>
<p>Overview of seed/Series A funding, key investors, and plans for the next 12-18 months.</p>
`
    },
    {
        id: 'policy',
        title: 'Government Scheme & Subsidy Guide',
        description: 'Clear step-by-step explainer of central and state agricultural policies and grants.',
        category: 'Grants',
        icon: DollarSign,
        defaultTitle: 'Guide: How Farmers Can Claim [Subsidy Name] Scheme (2026)',
        defaultExcerpt: 'Everything you need to know about eligibility, financial assistance rates, documents, and application procedure.',
        htmlContent: `
<h2>Overview & Objectives of the Scheme</h2>
<p>Introduce the scheme, sponsoring ministry/state government, and the primary objective (e.g. drip irrigation, solar pumps, organic certification).</p>

<h2>Financial Subsidies & Benefits</h2>
<ul>
    <li><strong>Subsidy Amount:</strong> Up to [X]% of total project cost.</li>
    <li><strong>Maximum Ceiling:</strong> ₹[Amount] per beneficiary or hectare.</li>
    <li><strong>Direct Benefit Transfer:</strong> Direct credit timeline and bank criteria.</li>
</ul>

<h2>Eligibility Criteria</h2>
<p>Specify who qualifies: landholding size (small/marginal), registration requirements, and state prerequisites.</p>

<h2>Required Documents & Application Steps</h2>
<ol>
    <li>Aadhaar Card linked with active bank account (NPCI enabled).</li>
    <li>Land record documentation (7/12, 8A, or title deed).</li>
    <li>Quotation or invoice from an authorized vendor.</li>
</ol>
`
    },
    {
        id: 'market',
        title: 'Market & Mandi Price Advisory',
        description: 'Timely analysis of commodity rates, supply trends, and strategic selling guidance.',
        category: 'Research',
        icon: TrendingUp,
        defaultTitle: '[Crop Name] Market Outlook: Mandi Price Trends & Selling Strategy',
        defaultExcerpt: 'Analysis of current mandi arrivals, export demand, and price projections for [Crop Name].',
        htmlContent: `
<h2>Current Mandi Price Analysis</h2>
<p>Overview of prevailing modal prices across key APMC mandis compared to MSP and historical averages.</p>

<h2>Supply & Weather Factors</h2>
<p>How recent rainfall patterns, sowing estimates, or pest alerts are impacting harvest volume and market arrivals.</p>

<h2>Demand & Export Projections</h2>
<p>Domestic processing demand and global export opportunities shaping forward prices.</p>

<h2>Strategic Advisory for Growers</h2>
<p>Actionable guidance on whether to sell immediately or store produce for anticipated rate improvements.</p>
`
    }
];

interface StoryTemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: StoryTemplate) => void;
}

export default function StoryTemplatesModal({ isOpen, onClose, onSelectTemplate }: StoryTemplatesModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-stone-50/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
                            <LayoutTemplate className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-serif font-bold text-base text-stone-900">Choose an Editorial Template</h3>
                            <p className="text-xs text-stone-500">Insert pre-structured outlines to accelerate your writing.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {TEMPLATES.map((tmpl) => {
                        const Icon = tmpl.icon;
                        return (
                            <div
                                key={tmpl.id}
                                onClick={() => {
                                    onSelectTemplate(tmpl);
                                    onClose();
                                }}
                                className="p-4 rounded-xl border border-stone-200/80 hover:border-stone-400 hover:bg-stone-50/50 cursor-pointer transition-all flex flex-col justify-between group shadow-2xs"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-colors">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                                            {tmpl.category}
                                        </span>
                                    </div>
                                    <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-stone-950 mb-1">
                                        {tmpl.title}
                                    </h4>
                                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                                        {tmpl.description}
                                    </p>
                                </div>

                                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-900">
                                    <span className="text-[11px] text-stone-400">Use Template</span>
                                    <span className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-stone-900 transition-all">→</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
