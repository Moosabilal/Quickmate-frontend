import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { updateProfile } from '../../features/auth/authSlice';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import Pagination from '../../components/admin/Pagination';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { useNavigate } from 'react-router-dom';
import { User } from '../../util/interface/IUser';
import { toast } from 'react-toastify';



const USERS_PER_PAGE = 6;

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.user);

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authService.getUserWithAllDetails({
          page: currentPage,
          limit: USERS_PER_PAGE,
          search: searchTerm,
          status: statusFilter
        });
        setUsers(response.users);
        setTotalPages(response.totalPages)
        setTotalUsers(response.total)
      } catch (error) {
        toast.error(`${error}`)
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const getStatusColor = (isVerified: boolean) => {
    return isVerified
      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
  };

  const getStatusIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };


  const generateUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'];
    return colors[index % colors.length];
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToBlock(null);
  };


  const handleStatus = async () => {
    try {
      const updatedUser = await authService.updateUser(userToBlock?.id || '');

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userToBlock?.id ? { ...user, isVerified: updatedUser.isVerified } : user
        )
      );

      if (currentUser?.id === userToBlock?.id) {
        dispatch(updateProfile({ user: updatedUser }));
      }
      setShowDeleteModal(false);
      setUserToBlock(null);


    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Users</h2>
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
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Profile</th>
                  <th className="text-left py-4 px-6 font-semibold">Name</th>
                  <th className="text-left py-4 px-6 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 font-semibold">Status</th>
                  <th className="text-right py-4 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td className="py-4 px-6">
                      <div className={`w-10 h-10 ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-medium text-sm">{generateUserInitials(user.name)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">{user.name}</td>
                    <td className="py-4 px-6 text-sm">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isVerified)}`}>
                        {getStatusIcon(user.isVerified)}
                        <span className="ml-1">{user.isVerified ? "Active" : "InActive"}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 px-3 py-1 rounded-lg text-sm"
                        onClick={() => navigate(`/admin/users/userDetails/${user.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 px-3 py-1 rounded-lg text-sm"
                        onClick={() => {
                          setUserToBlock(user)
                          setShowDeleteModal(true)
                        }
                        }
                      >
                        {user.isVerified ? 'Block User' : 'Unblock User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {users.length} of {totalUsers} users
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  total={totalUsers}
                  limit={USERS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleStatus}
        itemType={DeleteConfirmationTypes.PROFILE}
        itemName={userToBlock?.name || ''}
        itemDetails={userToBlock ? `${userToBlock.email}` : ''}
        customMessage="Are you sure you want to block this User?."
        additionalInfo="This action will prevent the user from logging into their account and accessing their bookings."
        titleProp={userToBlock?.isVerified ? 'Block User' : 'Unblock User'}
        confirmTextProp={userToBlock?.isVerified ? 'Block' : 'Unblock'}
      />
    </div>
  );
};

export default AdminUsersPage;
