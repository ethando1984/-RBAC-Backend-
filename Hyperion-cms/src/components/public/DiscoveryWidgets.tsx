import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, UserPlus } from 'lucide-react';

export const StaffPicks: React.FC = () => {
    const picks = [
        { id: '1', title: 'The Future of Journalism in the Age of AI', author: 'Elena Vance', date: 'Oct 12' },
        { id: '2', title: 'Why Minimal Design is So Hard to Get Right', author: 'Mark Scout', date: 'Oct 10' },
        { id: '3', title: 'Investigative Report: The Rise of Shadow Economies', author: 'Burt Goodman', date: 'Oct 8' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Staff Picks
            </h3>
            <div className="space-y-4">
                {picks.map((pick) => (
                    <div key={pick.id} className="space-y-1 group">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-5 w-5 rounded-full bg-gray-200 flex-shrink-0" />
                            <span className="text-xs font-medium text-gray-900">{pick.author}</span>
                        </div>
                        <Link to={`/p/article/${pick.id}`} className="block text-sm font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors leading-snug font-serif">
                            {pick.title}
                        </Link>
                    </div>
                ))}
            </div>
            <Link to="/p/staff-picks" className="text-xs text-blue-600 hover:underline font-medium block pt-2">
                See more from editors
            </Link>
        </div>
    );
};

export const RecommendedTopicsCards: React.FC = () => {
    const topics = ['Technology', 'Machine Learning', 'UX Design', 'Journalism', 'Data Science', 'Programming', 'Sustainability'];

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Recommended Topics
            </h3>
            <div className="flex flex-wrap gap-2">
                {topics.map(topic => (
                    <Link
                        key={topic}
                        to={`/p/topic/${topic.toLowerCase()}`}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        {topic}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const WhoToFollow: React.FC = () => {
    const users = [
        { name: 'Dr. Sarah Chen', bio: 'AI researcher and ethicist. Thinking about the future of tech.' },
        { name: 'Marcus Aurelius', bio: 'Journalist focusing on climate change and human rights.' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Who to follow
            </h3>
            <div className="space-y-4">
                {users.map(user => (
                    <div key={user.name} className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900">{user.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{user.bio}</p>
                        </div>
                        <button className="h-8 px-3 rounded-full border border-black text-xs font-medium hover:bg-black hover:text-white transition-all">
                            Follow
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
