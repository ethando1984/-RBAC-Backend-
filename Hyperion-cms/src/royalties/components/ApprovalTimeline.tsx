import React from 'react';
import type { RoyaltyApprovalHistory } from '../types/royalty';
import { RoyaltyAmount } from './RoyaltyAmount';
import { format } from 'date-fns';

interface Props {
    history: RoyaltyApprovalHistory[];
}

export const ApprovalTimeline: React.FC<Props> = ({ history }) => {
    if (!history || history.length === 0) return <div className="text-gray-400 text-sm">No history available</div>;

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {history.map((event, eventIdx) => (
                    <li key={event.id}>
                        <div className="relative pb-8">
                            {eventIdx !== history.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                    ${event.actionType.includes('REJECT') ? 'bg-red-500' : 'bg-blue-500'}`}>
                                        {/* Icon placeholder */}
                                        <div className="h-2 w-2 bg-white rounded-full"></div>
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {event.actionType} <span className="font-medium text-gray-900">by {event.actorEmail}</span>
                                        </p>
                                        {event.reasonNote && (
                                            <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">{event.reasonNote}</p>
                                        )}
                                        {event.oldAmount !== event.newAmount && (
                                            <div className="mt-1 text-sm">
                                                Changed from <RoyaltyAmount amount={event.oldAmount || 0} size="sm" /> to <RoyaltyAmount amount={event.newAmount || 0} size="sm" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                        <time dateTime={event.createdAt}>{format(new Date(event.createdAt), 'MMM d, HH:mm')}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
