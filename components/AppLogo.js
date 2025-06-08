import React from 'react';
import { BookOpen } from 'lucide-react';

const AppLogo = ({ className = "h-8 w-auto" }) => (
    <div className="flex items-center justify-center p-2">
        <BookOpen className={className} strokeWidth={1.5} />
    </div>
);

export default AppLogo;