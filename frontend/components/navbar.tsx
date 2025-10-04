import { useState } from "react"
import Link from "next/link"

export default function Navbar() {
    const [activeTab, setActiveTab] = useState<'meetings' | 'tasks'>('meetings')

    return (
        <nav className='flex flex-col space-y-2' aria-label="Main navigation">
            <Link
                href='/'
                onClick={() => setActiveTab('meetings')}
                aria-current={activeTab === 'meetings' ? 'page' : undefined}
                className={`block text-left px-4 py-2 rounded-lg ${activeTab === 'meetings' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}>
                Meetings
            </Link>
            <Link
                href='/tasks'
                onClick={() => setActiveTab('tasks')}
                aria-current={activeTab === 'tasks' ? 'page' : undefined}
                className={`block text-left px-4 py-2 rounded-lg ${activeTab === 'tasks' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}>
                Tasks
            </Link>
        </nav>
    )

}