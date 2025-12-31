import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { updateProfile } from '../../features/auth/authSlice';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import Pagination from '../../components/admin/Pagination';
import DeleteConfirmationModal from '../../components/deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';
import { User } from '../../util/interface/IUser';
import { toast } from 'react-toastify';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { UserTableRowSkeleton } from '../../components/admin/UserTableRowSkeleton';
import BlockReasonModal from '../../components/BlockReasonModal';

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
  const [showBlockReasonModal, setShowBlockReasonModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await authService.getUserWithAllDetails({
          page: currentPage,
          limit: USERS_PER_PAGE,
          search: debouncedSearchTerm,
          status: statusFilter
        });
        setUsers(response.users);
        setTotalPages(response.totalPages);
        setTotalUsers(response.total);
      } catch (error) {
        toast.error(`${error}`);
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  const getStatusColor = (isVerified: boolean) => {
    return isVerified
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
      : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
  };

  const getStatusIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
    ) : (
      <XCircle className="w-3.5 h-3.5 mr-1.5" />
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const generateUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
      'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
      'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
      'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300',
      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300'
    ];
    return colors[index % colors.length];
  };

  const handleDeleteCancel = () => {
    setShowBlockReasonModal(false)
    setShowDeleteModal(false);
    setUserToBlock(null);
  };

  const onActionClick = () => {
    if (!userToBlock) return
    if (userToBlock.isVerified) {
      setShowBlockReasonModal(true);
    } else {
      handleStatus()
    }
  };

  const handleStatus = async (reason?: string) => {
    setButtonLoading(true)
    try {
      const updatedUser = await authService.updateUser(userToBlock?.id || '', reason);

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userToBlock?.id ? { ...user, isVerified: updatedUser.isVerified } : user
        )
      );

      if (currentUser?.id === userToBlock?.id) {
        dispatch(updateProfile({ user: updatedUser }));
      }
      setShowBlockReasonModal(false)
      setShowDeleteModal(false);
      setUserToBlock(null);
      toast.success(`User ${updatedUser.isVerified ? 'unblocked' : 'blocked'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error("Failed to update user status");
    } finally {
      setButtonLoading(false)
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Users</h2>
            <p className="text-slate-500 dark:text-slate-300 mt-1">Manage user accounts and access controls</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 p-5 mb-6 transition-colors">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 transition-colors"
                />
              </div>

              <div className="relative min-w-[160px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <Filter className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-600/50 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Profile</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Status</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {isLoading ? (
                    <>
                      {[...Array(USERS_PER_PAGE)].map((_, i) => (
                        <UserTableRowSkeleton key={i} />
                      ))}
                    </>
                  ) : users.length > 0 ? (
                    users.map((user, index) => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className={`w-10 h-10 ${getAvatarColor(index)} rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-gray-600 shadow-sm`}>
                            {generateUserInitials(user.name)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="md:hidden text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[150px]">{user.email}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell">
                          {user.email}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isVerified)}`}>
                            {getStatusIcon(user.isVerified)}
                            <span>{user.isVerified ? "Active" : "Inactive"}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                              onClick={() => navigate(`/admin/users/userDetails/${user.id}`)}
                            >
                              View
                            </button>
                            <button
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${user.isVerified
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
                                }`}
                              onClick={() => {
                                setUserToBlock(user)
                                setShowDeleteModal(true)
                              }}
                            >
                              {user.isVerified ? 'Block' : 'Unblock'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                          <div className="bg-slate-100 dark:bg-gray-700 p-3 rounded-full mb-3">
                            <Search className="w-6 h-6" />
                          </div>
                          <p className="font-medium">No users found</p>
                          <p className="text-sm mt-1">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * USERS_PER_PAGE + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * USERS_PER_PAGE, totalUsers)}</span> of <span className="font-medium text-slate-900 dark:text-white">{totalUsers}</span> results
                </p>
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
        onConfirm={onActionClick}
        itemType={DeleteConfirmationTypes.PROFILE}
        itemName={userToBlock?.name || ''}
        itemDetails={userToBlock ? `${userToBlock.email}` : ''}
        isLoading={buttonLoading}
        customMessage={`Are you sure you want to ${userToBlock?.isVerified ? 'block' : 'unblock'} this user?`}
        additionalInfo={userToBlock?.isVerified ? "This action will prevent the user from logging in." : "This will restore the user's access."}
        titleProp={userToBlock?.isVerified ? 'Block User' : 'Unblock User'}
        confirmTextProp={userToBlock?.isVerified ? 'Block User' : 'Unblock User'}
      />

      {showBlockReasonModal && 
      <BlockReasonModal
        isOpen={showBlockReasonModal}
        onClose={handleDeleteCancel}
        onConfirm={handleStatus}
        confirmButtonText='Block'
        label='Reason for blocking'
        title="Block User"
        subTitle="This action will prevent the user from logging in."
        placeholder="Please describe why this user is being blocked..."
        isLoading={buttonLoading}
      />}
    </div>
  );
};

export default AdminUsersPage;