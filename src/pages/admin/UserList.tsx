import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MoreVertical, Eye, Edit, Trash2, Filter,UserCheck,UserX,Clock} from 'lucide-react';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { authService } from '../../services/authService';
import { updateProfile } from '../../features/auth/authSlice';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  phone: string;
  bookings: number;
  status: 'Active' | 'Inactive' | 'Blocked';
  joinDate: string;
}

const AdminUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await authService.getUserWithAllDetails();
        setUsers(response);

    }
    fetchUsers()
  },[])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
      case 'Inactive':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300';
      case 'Blocked':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <UserCheck className="w-3 h-3" />;
      case 'Inactive':
        return <Clock className="w-3 h-3" />;
      case 'Blocked':
        return <UserX className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const filteredUsers = users
  .map(user => ({
    ...user,
    status: user.isVerified ? 'Active' : 'Inactive'
  }))
  .filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
    ];
    return colors[index % colors.length];
  };

  const handleStatus = async (userId: string) => {
    try {
    const updatedUser = await authService.updateUser(userId); 

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, isVerified: updatedUser.isVerified } : user
      )
    );

    const currentUser = useAppSelector(state => state.auth.user);
    const dispatch = useAppDispatch();

    if (currentUser?.id === userId) {
      dispatch(updateProfile({ user: updatedUser }));
    }
  } catch (error) {
    console.error('Error updating user status:', error);
  }
}

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Users</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage your users and their accounts</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                
                {/* <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button> */}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Profile</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                    {/* <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Phone</th> */}
                    {/* <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Bookings</th> */}
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className={`w-10 h-10 ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-medium text-sm">
                            {generateUserInitials(user.name)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                      </td>
                      {/* <td className="py-4 px-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{user.phone}</div>
                      </td> */}
                      {/* <td className="py-4 px-6">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{user.bookings}</span>
                      </td> */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {getStatusIcon(user.status)}
                            <span>{user.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          {/* <Link
                            to={`/admin/users/${user.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-all duration-200">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all duration-200">
                            <Trash2 className="w-4 h-4" />
                          </button> */}
                          <button className="p-2 text-gray-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all duration-200"
                          onClick={() => {handleStatus(user.id)}}
                          >
                            {user.isVerified === false ? 'Unblock User' : 'Block User'}
                          </button>
                          
                          {/* <div className="relative">
                            <button
                              onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {showDropdown === user.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-10">
                                <Link
                                  to={`/admin/users/${user.id}`}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 block"
                                >
                                  View Details
                                </Link>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                  Send Message
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                  Reset Password
                                </button>
                                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                                <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900">
                                  {user.isVerified === false ? 'Unblock User' : 'Block User'}
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900">
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200">
                    Previous
                  </button>
                  <button className="px-3 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                    1
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200">
                    2
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsersPage;