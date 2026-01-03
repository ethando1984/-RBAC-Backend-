import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Settings, Plus, Save, Activity, Trash2, Calendar, CheckCircle, Info } from 'lucide-react';
import { RoyaltyAmount } from '../components/RoyaltyAmount';
import { royaltyApi } from '../api/royaltyApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const RoyaltyRules: React.FC = () => {
    const { hasPermission } = usePermissions();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('base_rates');

    // RuleSet Form State
    const [ruleSetName, setRuleSetName] = useState(`RuleSet ${format(new Date(), 'yyyy-MM-dd')}`);
    const [currency, setCurrency] = useState('VND');
    const [rates, setRates] = useState<any[]>([
        { articleType: 'INVESTIGATION', baseAmount: 1200000 },
        { articleType: 'ANALYSIS', baseAmount: 800000 },
        { articleType: 'NEWS', baseAmount: 400000 },
        { articleType: 'SHORT_NEWS', baseAmount: 200000 },
    ]);
    const [multipliers, setMultipliers] = useState<any[]>([
        { multiplierType: 'EXCLUSIVE', keyName: 'Exclusive', factor: 1.5 },
        { multiplierType: 'BREAKING', keyName: 'Breaking', factor: 1.2 },
        { multiplierType: 'HOLIDAY', keyName: 'Holiday', factor: 2.0 },
    ]);
    const [mediaFees, setMediaFees] = useState<any[]>([
        { mediaType: 'IMAGE', feeAmount: 50000, feeMode: 'PER_UNIT', maxFeeAmount: 500000 },
        { mediaType: 'VIDEO', feeAmount: 100000, feeMode: 'PER_UNIT', maxFeeAmount: 1000000 },
    ]);
    const [policy, setPolicy] = useState<any>({
        editorOverrideMaxPercent: 10,
        managerOverrideMaxPercent: 50,
        requireNoteForOverride: true,
        allowManualBaseRateOverride: false,
    });

    // Queries
    const { data: ruleSets, isLoading: isLoadingRuleSets } = useQuery({
        queryKey: ['royalty-rulesets'],
        queryFn: () => royaltyApi.getRuleSets(),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => royaltyApi.createRuleSet(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['royalty-rulesets'] });
            alert('New Rule Set created successfully!');
            setActiveTab('rulesets');
        }
    });

    const activateMutation = useMutation({
        mutationFn: (id: string) => royaltyApi.activateRuleSet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['royalty-rulesets'] });
            alert('Rule Set activated!');
        }
    });

    if (!hasPermission('royalties:rules_manage')) {
        return (
            <div className="p-12 text-center text-red-500">Access Denied: royalties:rules_manage permission required.</div>
        );
    }

    const handleSave = () => {
        createMutation.mutate({
            name: ruleSetName,
            currency,
            effectiveFrom: new Date().toISOString(),
            rates,
            multipliers,
            mediaFees,
            policy
        });
    };

    const tabs = [
        { id: 'base_rates', name: 'Base Rates', icon: <Plus size={16} /> },
        { id: 'multipliers', name: 'Multipliers', icon: <Activity size={16} /> },
        { id: 'media_fees', name: 'Media Fees', icon: <Plus size={16} /> },
        { id: 'policies', name: 'Override Policies', icon: <Settings size={16} /> },
        { id: 'rulesets', name: 'All Rule Sets', icon: <Calendar size={16} /> },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Royalty Configuration</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage rates, multipliers, and policy limits for automated calculations</p>
                </div>
                {activeTab !== 'rulesets' && (
                    <button
                        onClick={handleSave}
                        disabled={createMutation.isPending}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
                    >
                        {createMutation.isPending ? 'Saving...' : <><Save size={16} className="mr-2" /> Save as New Ruleset</>}
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar Nav */}
                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-2">
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Configuration</div>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all
                                ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab.icon}
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {activeTab === 'base_rates' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Base Rates</h2>
                                    <p className="text-sm text-gray-500">Define the starting amount for each article type</p>
                                </div>
                                <button
                                    onClick={() => setRates([...rates, { articleType: 'NEW_TYPE', baseAmount: 0 }])}
                                    className="text-indigo-600 text-sm font-semibold flex items-center hover:underline"
                                >
                                    <Plus size={14} className="mr-1" /> Add Rate Row
                                </button>
                            </div>

                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Article Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Base Rate (VND)</th>
                                            <th className="px-6 py-3 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {rates.map((rate, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={rate.articleType}
                                                        onChange={(e) => {
                                                            const newRates = [...rates];
                                                            newRates[idx].articleType = e.target.value;
                                                            setRates(newRates);
                                                        }}
                                                        className="w-full border-gray-200 rounded text-sm focus:ring-indigo-500 border p-1"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        value={rate.baseAmount}
                                                        onChange={(e) => {
                                                            const newRates = [...rates];
                                                            newRates[idx].baseAmount = Number(e.target.value);
                                                            setRates(newRates);
                                                        }}
                                                        className="w-full border-gray-200 rounded text-sm focus:ring-indigo-500 border p-1"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setRates(rates.filter((_, i) => i !== idx))}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'multipliers' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Multipliers</h2>
                                    <p className="text-sm text-gray-500">Apply performance or special status factors</p>
                                </div>
                                <button
                                    onClick={() => setMultipliers([...multipliers, { multiplierType: 'TAG', keyName: '', factor: 1.0 }])}
                                    className="text-indigo-600 text-sm font-semibold flex items-center hover:underline"
                                >
                                    <Plus size={14} className="mr-1" /> Add Multiplier
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {multipliers.map((m, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase">{m.multiplierType}</span>
                                            <button onClick={() => setMultipliers(multipliers.filter((_, i) => i !== idx))} className="text-red-400"><Trash2 size={14} /></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-bold uppercase">Target Key</label>
                                                <input
                                                    type="text"
                                                    value={m.keyName}
                                                    onChange={(e) => {
                                                        const nm = [...multipliers];
                                                        nm[idx].keyName = e.target.value;
                                                        setMultipliers(nm);
                                                    }}
                                                    className="w-full border-gray-200 rounded text-sm p-1 border"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-bold uppercase">Factor (x)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={m.factor}
                                                    onChange={(e) => {
                                                        const nm = [...multipliers];
                                                        nm[idx].factor = Number(e.target.value);
                                                        setMultipliers(nm);
                                                    }}
                                                    className="w-full border-gray-200 rounded text-sm p-1 border"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'media_fees' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Media Fees</h2>
                                <p className="text-sm text-gray-500 text-gray-500">Fixed or variable fees for images and video contents</p>
                            </div>
                            <div className="space-y-4">
                                {mediaFees.map((f, idx) => (
                                    <div key={idx} className="p-5 border border-gray-200 rounded-xl flex items-center space-x-6">
                                        <div className="w-16 h-16 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 font-bold">
                                            {f.mediaType}
                                        </div>
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Fee Amount</label>
                                                <input
                                                    type="number"
                                                    value={f.feeAmount}
                                                    onChange={(e) => {
                                                        const nf = [...mediaFees];
                                                        nf[idx].feeAmount = Number(e.target.value);
                                                        setMediaFees(nf);
                                                    }}
                                                    className="w-full border border-gray-200 rounded p-1 text-sm outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Max Total Fee</label>
                                                <input
                                                    type="number"
                                                    value={f.maxFeeAmount}
                                                    onChange={(e) => {
                                                        const nf = [...mediaFees];
                                                        nf[idx].maxFeeAmount = Number(e.target.value);
                                                        setMediaFees(nf);
                                                    }}
                                                    className="w-full border border-gray-200 rounded p-1 text-sm outline-none"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <select
                                                    value={f.feeMode}
                                                    onChange={(e) => {
                                                        const nf = [...mediaFees];
                                                        nf[idx].feeMode = e.target.value;
                                                        setMediaFees(nf);
                                                    }}
                                                    className="w-full border border-gray-200 rounded p-1 text-sm outline-none"
                                                >
                                                    <option value="PER_UNIT">Per Unit</option>
                                                    <option value="FLAT">Flat Rate</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'policies' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Override Policies</h2>
                                <p className="text-sm text-gray-500">Security limits for manual modifications</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4 p-6 bg-amber-50 rounded-xl border border-amber-100">
                                    <h3 className="text-amber-900 font-bold text-sm flex items-center">
                                        <Info size={16} className="mr-2" /> Modification Limits
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-amber-700">Editor Max Adjustment (%)</label>
                                            <input
                                                type="number"
                                                value={policy.editorOverrideMaxPercent}
                                                onChange={(e) => setPolicy({ ...policy, editorOverrideMaxPercent: Number(e.target.value) })}
                                                className="w-full mt-1 border border-amber-200 rounded p-2 text-sm bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-amber-700">Manager Max Adjustment (%)</label>
                                            <input
                                                type="number"
                                                value={policy.managerOverrideMaxPercent}
                                                onChange={(e) => setPolicy({ ...policy, managerOverrideMaxPercent: Number(e.target.value) })}
                                                className="w-full mt-1 border border-amber-200 rounded p-2 text-sm bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                                    <h3 className="text-zinc-900 font-bold text-sm">Security Controls</h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={policy.requireNoteForOverride}
                                                onChange={(e) => setPolicy({ ...policy, requireNoteForOverride: e.target.checked })}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            />
                                            <span className="ml-3 text-sm text-gray-700 font-medium">Require mandatory audit note</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={policy.allowManualBaseRateOverride}
                                                onChange={(e) => setPolicy({ ...policy, allowManualBaseRateOverride: e.target.checked })}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            />
                                            <span className="ml-3 text-sm text-gray-700 font-medium">Allow manual article type override</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rulesets' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900">Rule Collection</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {isLoadingRuleSets ? (
                                    <div className="py-12 text-center text-gray-400">Loading rule sets...</div>
                                ) : ruleSets?.map((rs: any) => (
                                    <div key={rs.id} className="p-5 border border-gray-200 rounded-xl bg-white hover:border-indigo-300 transition-all flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-lg ${rs.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                                <CheckCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{rs.name}</div>
                                                <div className="text-xs text-gray-500 flex space-x-3">
                                                    <span>Effective: {format(new Date(rs.effectiveFrom), 'PPP')}</span>
                                                    <span>•</span>
                                                    <span>Currency: {rs.currency}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {rs.status !== 'ACTIVE' ? (
                                            <button
                                                onClick={() => activateMutation.mutate(rs.id)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-tighter"
                                            >
                                                Activate Now
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">Current</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoyaltyRules;
