
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, LogOut, Mail, Phone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  company: {
    name: string;
  };
}

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [originalUsers, setOriginalUsers] = useState<User[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // get the base user data first
  const getBaseUsers = async () => {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/users');
      const userData = await res.json();
      setOriginalUsers(userData);
      return userData;
    } catch (err) {
      console.error('Failed to fetch users:', err);
      return [];
    }
  };

  const createMoreUsers = (pageNumber: number, baseData: User[]) => {
    const itemsPerPage = 10;
    const startIdx = (pageNumber - 1) * itemsPerPage;
    
    const newUserList = [];
    for (let i = 0; i < itemsPerPage; i++) {
      const userIdx = startIdx + i;
      const templateUser = baseData[userIdx % baseData.length];
      const copyNumber = Math.floor(userIdx / baseData.length) + 1;
      
      const modifiedUser = {
        ...templateUser,
        id: userIdx + 1,
        name: copyNumber > 1 ? `${templateUser.name} (${copyNumber})` : templateUser.name,
        email: `user${userIdx + 1}@example.com`,
        username: userIdx > 9 ? `${templateUser.username}_${userIdx + 1}` : templateUser.username,
        phone: templateUser.phone.replace(/\d{3}-\d{3}/, 
          `${String(userIdx + 1).padStart(3, '0')}-${String((userIdx + 1) * 2).padStart(3, '0')}`),
        website: `user${userIdx + 1}.${templateUser.website}`,
        address: {
          ...templateUser.address,
          suite: `Suite ${userIdx + 1}`,
          zipcode: `${(10000 + userIdx).toString().slice(0, 5)}-${(1000 + userIdx).toString().slice(0, 4)}`
        },
        company: {
          name: copyNumber > 1 ? `${templateUser.company.name} - Branch ${copyNumber}` : templateUser.company.name
        }
      };
      newUserList.push(modifiedUser);
    }
    return newUserList;
  };

  const loadUsers = async (page: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log(`Loading page ${page}...`);
    
    // simulate some loading time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      let baseUserData = originalUsers;
      if (baseUserData.length === 0) {
        baseUserData = await getBaseUsers();
      }
      
      if (baseUserData.length === 0) {
        setIsLoading(false);
        return;
      }

      const newUsers = createMoreUsers(page, baseUserData);
      
      if (page === 1) {
        setUsers(newUsers);
      } else {
        setUsers(prevUsers => [...prevUsers, ...newUsers]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // load first page on mount
  useEffect(() => {
    loadUsers(1);
  }, []);

  // handle scroll events
  useEffect(() => {
    const handleScrollEvent = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 800 && !isLoading) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        loadUsers(nextPage);
      }
    };

    window.addEventListener('scroll', handleScrollEvent);
    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, [isLoading, currentPage]);

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = (fullName: string) => {
    const nameParts = fullName.split(' ');
    let initials = '';
    for (let i = 0; i < Math.min(2, nameParts.length); i++) {
      initials += nameParts[i].charAt(0).toUpperCase();
    }
    return initials;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* top header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                User Directory
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <Button
              onClick={handleLogoutClick}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((userData) => (
            <Card key={userData.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600">
                    <AvatarFallback className="text-white font-semibold">
                      {getUserInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {userData.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">@{userData.username}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-green-500" />
                    <span>{userData.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="truncate">{userData.website}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{userData.company.name}</p>
                  <p className="text-xs text-gray-500">
                    {userData.address.city}, {userData.address.zipcode}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* loading spinner */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-700 font-medium">Loading more users...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* page info */}
        {users.length > 0 && (
          <div className="flex justify-center items-center py-4">
            <p className="text-gray-500 text-sm">
              Showing {users.length} users (Page {currentPage})
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserListPage;
