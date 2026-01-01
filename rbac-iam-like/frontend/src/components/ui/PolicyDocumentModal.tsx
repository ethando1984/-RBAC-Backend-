import { X, FileJson, Shield, CheckCircle, AlertCircle, Copy, Download } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface PolicyDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyDocument: any;
    policyName: string;
    affectedRoles?: number;
}

export function PolicyDocumentModal({
    isOpen,
    onClose,
    policyDocument,
    policyName,
    affectedRoles = 0
}: PolicyDocumentModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const jsonString = JSON.stringify(policyDocument, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${policyName.toLowerCase().replace(/\s+/g, '-')}-policy.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <Shield className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                Policy Sealed Successfully
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 font-medium">
                                AWS IAM-style JSON policy document generated for{' '}
                                <span className="font-bold text-gray-700">{policyName}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Impact Banner */}
                {affectedRoles > 0 && (
                    <div className="mx-8 mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">
                                Impact Analysis
                            </h3>
                            <p className="text-xs text-amber-700 mt-1">
                                This policy change affects{' '}
                                <span className="font-black">{affectedRoles} role{affectedRoles !== 1 ? 's' : ''}</span>{' '}
                                and will be applied immediately to all associated users.
                            </p>
                        </div>
                    </div>
                )}

                {/* JSON Content */}
                <div className="flex-1 overflow-auto px-8 py-6">
                    <div className="bg-gray-900 rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                                <FileJson className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                                    Policy Document (JSON)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        copied
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    )}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-300 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download
                                </button>
                            </div>
                        </div>
                        <pre className="p-6 text-xs font-mono text-gray-100 overflow-auto max-h-[500px] leading-relaxed">
                            <code className="language-json">{jsonString}</code>
                        </pre>
                    </div>

                    {/* Policy Info */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                                Version
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                                {policyDocument.Version || '2026-01-01'}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                                Statements
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                                {policyDocument.Statement?.length || 0} rule{policyDocument.Statement?.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">
                            Policy document saved and active
                        </span>
                    </div>
                    <Button onClick={onClose} className="px-6">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
