'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react'

// Reuse the type definition or import it
export type PolicyRule = {
    id: string
    label: string
    type: 'number' | 'select' | 'boolean'
    options?: string[]
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'
    value: any
    unit?: string
}

export type PolicyConfig = {
    scheme_name?: string
    criteria: PolicyRule[]
}

interface EligibilityCheckerProps {
    rules: PolicyConfig
}

export default function EligibilityChecker({ rules }: EligibilityCheckerProps) {
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [step, setStep] = useState(0)
    const [result, setResult] = useState<'eligible' | 'ineligible' | null>(null)
    const [failReason, setFailReason] = useState<string | null>(null)

    if (!rules || !rules.criteria || rules.criteria.length === 0) return null

    const currentRule = rules.criteria[step]

    const checkEligibility = (currentAnswers: Record<string, any>) => {
        for (const rule of rules.criteria) {
            const userVal = currentAnswers[rule.id]
            if (userVal === undefined) continue // Skip unchecked

            let passed = false
            const targetVal = rule.value

            // Type conversion
            const numUser = Number(userVal)
            const numTarget = Number(targetVal)

            switch (rule.operator) {
                case 'eq': passed = userVal == targetVal; break;
                case 'neq': passed = userVal != targetVal; break;
                case 'gt': passed = numUser > numTarget; break;
                case 'lt': passed = numUser < numTarget; break;
                case 'gte': passed = numUser >= numTarget; break;
                case 'lte': passed = numUser <= numTarget; break;
                case 'contains': passed = String(userVal).includes(String(targetVal)); break;
                default: passed = true;
            }

            if (!passed) {
                return { eligible: false, reason: `Failed criteria: ${rule.label} (Required: ${rule.operator} ${targetVal})` }
            }
        }
        return { eligible: true }
    }

    const handleAnswer = (val: any) => {
        const newAnswers = { ...answers, [currentRule.id]: val }
        setAnswers(newAnswers)

        // Check if this answer disqualifies immediately
        const check = checkEligibility(newAnswers)
        if (!check.eligible) {
            setResult('ineligible')
            setFailReason(check.reason!)
            return
        }

        // If eligible so far, go to next step
        if (step < rules.criteria.length - 1) {
            setStep(step + 1)
        } else {
            setResult('eligible')
        }
    }

    const reset = () => {
        setAnswers({})
        setStep(0)
        setResult(null)
        setFailReason(null)
    }

    return (
        <div className="max-w-xl mx-auto my-8 bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden font-sans">
            <div className="bg-emerald-900 p-6 text-white">
                <h3 className="text-xl font-bold font-serif mb-1">Check Eligibility</h3>
                <p className="text-emerald-200 text-sm">
                    {rules.scheme_name ? `For ${rules.scheme_name}` : 'Answer a few questions to see if you qualify.'}
                </p>
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    {result === 'eligible' ? (
                        <motion.div
                            key="eligible"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8" />
                            </div>
                            <h4 className="text-2xl font-bold text-green-800 mb-2">You are Eligible!</h4>
                            <p className="text-stone-600 mb-6">Based on your answers, you meet all the criteria for this scheme.</p>
                            <button className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                                Apply Now / View Forms
                            </button>
                            <button onClick={reset} className="block w-full mt-4 text-sm text-stone-400 hover:text-stone-600 underline">
                                Check Again
                            </button>
                        </motion.div>
                    ) : result === 'ineligible' ? (
                        <motion.div
                            key="ineligible"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8" />
                            </div>
                            <h4 className="text-2xl font-bold text-red-800 mb-2">Not Eligible</h4>
                            <p className="text-stone-600 mb-6">{failReason}</p>
                            <button onClick={reset} className="flex items-center gap-2 mx-auto text-emerald-700 font-bold hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors">
                                <RefreshCw className="w-4 h-4" /> Start Over
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                                <span>Question {step + 1} of {rules.criteria.length}</span>
                                <span>{Math.round(((step) / rules.criteria.length) * 100)}% Complete</span>
                            </div>

                            <h4 className="text-xl font-medium text-stone-900 leading-relaxed">
                                {currentRule.label}
                            </h4>

                            <div className="pt-4 space-y-3">
                                {currentRule.type === 'boolean' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleAnswer(true)}
                                            className="p-4 border-2 border-stone-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 font-bold text-stone-700 transition-all text-lg"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => handleAnswer(false)}
                                            className="p-4 border-2 border-stone-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 font-bold text-stone-700 transition-all text-lg"
                                        >
                                            No
                                        </button>
                                    </div>
                                )}

                                {currentRule.type === 'number' && (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="flex-1 p-4 text-lg border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAnswer(e.currentTarget.value)
                                            }}
                                        />
                                        <button className="bg-emerald-600 text-white px-6 rounded-xl font-bold hover:bg-emerald-700">
                                            Next
                                        </button>
                                    </div>
                                )}

                                {currentRule.type === 'select' && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {/* Fallback if no options provided */}
                                        {(currentRule.options || ['Yes', 'No']).map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => handleAnswer(opt)}
                                                className="p-3 text-left border-2 border-stone-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 font-medium text-stone-700 transition-all"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
