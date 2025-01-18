import React from 'react';
import useUserStore, { User } from '../hooks/useCanvas';

const UserList: React.FC = () => {
    const { users } = useUserStore();
    return (
        <div className="w-64 p-4">
            <h3 className="text-lg font-bold mb-4">Connected Users</h3>
            <ul className="space-y-2">
                {users.map((user: User) => (
                    <li key={user.userId} className="text-sm">
                        <span
                            className="inline-block w-4 h-4 mr-2 rounded-full"
                            style={{ backgroundColor: user.color }}
                        ></span>
                        {user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;