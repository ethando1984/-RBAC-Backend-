import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { History, RotateCcw, Check, FileJson } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface PolicyVersionsModalProps {
    policyId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PolicyVersionsModal({ policyId, isOpen, onClose }: PolicyVersionsModalProps) {
    const queryClient = useQueryClient();
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

    const { data: versions, isLoading } = useQuery({
        queryKey: ['policy-versions', policyId],
        queryFn: () => policyId ? api.policies.getVersions(policyId) : Promise.resolve([]),
        enabled: !!policyId && isOpen
    });

    const rollbackMutation = useMutation({
        mutationFn: (versionId: string) => api.policies.rollback(policyId!, versionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policy-versions'] });
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            onClose();
        }
    });

    if (!policyId) return null;

    const activeVersion = versions?.find((v: any) => v.versionId === selectedVersion) || versions?.find((v: any) => v.isDefault);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Version History"
            description="View and rollback policy configurations."
            className="max-w-4xl"
        >
            <div className="grid grid-cols-12 gap-6 h-[500px]">
                {/* Version List */}
                <div className="col-span-4 border-r border-gray-100 pr-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="text-xs text-gray-400">Loading versions...</div>
                        ) : (
                            versions?.map((v: any) => (
                                <button
                                    key={v.versionId}
                                    onClick={() => setSelectedVersion(v.versionId)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-xl border transition-all relative",
                                        (selectedVersion === v.versionId || (!selectedVersion && v.isDefault))
                                            ? "bg-primary-50 border-primary-100 ring-1 ring-primary-100"
                                            : "bg-white border-gray-100 hover:border-gray-200"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-black text-gray-900">v{v.versionNumber}</span>
                                        {v.isDefault && (
                                            <span className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        {new Date(v.createdAt).toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-gray-300 mt-1">
                                        by {v.createdBy || 'System'}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Preview & Action */}
                <div className="col-span-8 flex flex-col h-full">
                    <div className="flex-1 bg-gray-900 rounded-2xl p-4 overflow-hidden relative group">
                        <div className="absolute top-4 right-4 flex gap-2">
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest bg-gray-800 px-2 py-1 rounded">
                                AWS IAM JSON Format
                            </span>
                        </div>
                        <pre className="font-mono text-[10px] text-emerald-400 h-full overflow-auto custom-scrollbar p-2">
                            {activeVersion ? JSON.stringify(JSON.parse(activeVersion.documentJson), null, 2) : '// Select a version'}
                        </pre>
                    </div>

                    <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-xs text-gray-500">
                            Viewing details for <span className="font-bold text-gray-900">v{activeVersion?.versionNumber}</span>
                        </div>
                        {activeVersion && !activeVersion.isDefault && (
                            <Button
                                variant="outline"
                                onClick={() => rollbackMutation.mutate(activeVersion.versionId)}
                                disabled={rollbackMutation.isPending}
                                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
                            >
                                <RotateCcw size={14} className="mr-2" />
                                {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback to this Version'}
                            </Button>
                        )}
                        {activeVersion && activeVersion.isDefault && (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide px-4 py-2 bg-emerald-50 rounded-lg">
                                <Check size={14} /> Current Active Version
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
