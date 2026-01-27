'use client'

import { useState } from 'react'
import { Plus, X, Wand2 } from 'lucide-react'

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

interface EligibilityEditorProps {
    value: PolicyConfig | null
    onChange: (config: PolicyConfig) => void
    onGenerate?: () => void
    isGenerating?: boolean
}

export default function EligibilityEditor({ value, onChange, onGenerate, isGenerating }: EligibilityEditorProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newRule, setNewRule] = useState<PolicyRule>({
        id: '',
        label: '',
        type: 'number',
        operator: 'lte',
        value: ''
    })

    const handleAddRule = () => {
        if (!newRule.id || !newRule.label) return

        const updatedConfig = {
            scheme_name: value?.scheme_name || '',
            criteria: [...(value?.criteria || []), { ...newRule, id: newRule.id.toLowerCase().replace(/\s+/g, '_') }]
        }
        onChange(updatedConfig)
        setIsAdding(false)
        setNewRule({
            id: '',
            label: '',
            type: 'number',
            operator: 'lte',
            value: ''
        })
    }

    const removeRule = (index: number) => {
        if (!value) return
        const newCriteria = [...value.criteria]
        newCriteria.splice(index, 1)
        onChange({ ...value, criteria: newCriteria })
    }

    return (
        <div className="bg-white p-6 border border-stone-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700">
                    <Wand2 className="w-4 h-4" />
                    <h3 className="font-bold uppercase text-xs tracking-widest">Policy Decoder Rules</h3>
                </div>
                {onGenerate && (
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                    >
                        {isGenerating ? 'Analyzing...' : 'Auto-Extract'}
                    </button>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-xs font-bold text-stone-400 mb-1">Scheme Name</label>
                <input
                    className="w-full p-2 border rounded bg-stone-50 text-sm"
                    placeholder="e.g. PM Kisan Samman Nidhi"
                    value={value?.scheme_name || ''}
                    onChange={(e) => onChange({ ...value, criteria: value?.criteria || [], scheme_name: e.target.value })}
                />
            </div>

            <div className="space-y-2 mb-4">
                {value?.criteria?.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-stone-50 p-2 rounded border text-sm group">
                        <div>
                            <span className="font-bold text-stone-700">{rule.label}</span>
                            <span className="text-stone-400 mx-2">
                                {rule.operator === 'lte' ? '≤' :
                                    rule.operator === 'gte' ? '≥' :
                                        rule.operator === 'eq' ? '=' : rule.operator}
                            </span>
                            <span className="font-mono text-emerald-600">{rule.value} {rule.unit}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeRule(idx)}
                            className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {(!value?.criteria || value.criteria.length === 0) && (
                    <div className="text-center p-4 border border-dashed rounded text-stone-400 text-xs">
                        No rules defined. <br /> Add manually or use AI extraction.
                    </div>
                )}
            </div>

            {isAdding ? (
                <div className="bg-stone-50 p-3 rounded border border-emerald-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            placeholder="Internal ID (e.g. land_size)"
                            className="p-2 border rounded text-xs"
                            value={newRule.id}
                            onChange={e => setNewRule({ ...newRule, id: e.target.value })}
                        />
                        <input
                            placeholder="User Question Label"
                            className="p-2 border rounded text-xs"
                            value={newRule.label}
                            onChange={e => setNewRule({ ...newRule, label: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <select
                            className="p-2 border rounded text-xs"
                            value={newRule.type}
                            onChange={e => setNewRule({ ...newRule, type: e.target.value as any })}
                        >
                            <option value="number">Number</option>
                            <option value="boolean">Yes/No</option>
                            <option value="select">Select</option>
                        </select>
                        <select
                            className="p-2 border rounded text-xs"
                            value={newRule.operator}
                            onChange={e => setNewRule({ ...newRule, operator: e.target.value as any })}
                        >
                            <option value="eq">Equals (=)</option>
                            <option value="lte">Max (≤)</option>
                            <option value="gte">Min (≥)</option>
                            <option value="contains">Contains</option>
                        </select>
                        <input
                            placeholder="Value"
                            className="p-2 border rounded text-xs"
                            value={newRule.value}
                            onChange={e => setNewRule({ ...newRule, value: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleAddRule}
                            className="flex-1 bg-emerald-600 text-white text-xs py-2 rounded font-bold"
                        >
                            Add Rule
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-3 bg-white border text-xs py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-emerald-300 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Rule
                </button>
            )}
        </div>
    )
}
