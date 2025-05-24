
import React, { useState, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async (pageNum: number) => {
    if (loading) return;
    
    setLoading(true);
    console.log(`Fetching users for page ${pageNum}`);
    
    try {
      // Simulate API delay for better UX demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`https://jsonplaceholder.typicode.com/users?_page=${pageNum}&_limit=10`);
      const newUsers: User[] = await response.json();
      
      if (newUsers.length === 0) {
        setHasMore(false);
      } else {
        // Since JSONPlaceholder only has 10 users, we'll simulate more by duplicating with different IDs
        const simulatedUsers = Array.from({ length: 10 }, (_, index) => {
          const baseUser = newUsers[index % newUsers.length];
          return {
            ...baseUser,
            id: (pageNum - 1) * 10 + index + 1,
            name: `${baseUser.name} ${Math.floor(((pageNum - 1) * 10 + index) / 10) > 0 ? `(${Math.floor(((pageNum - 1) * 10 + index) / 10) + 1})` : ''}`,
            email: `user${(pageNum - 1) * 10 + index + 1}@example.com`
          };
        });

        if (pageNum === 1) {
          setUsers(simulatedUsers);
        } else {
          setUsers(prev => [...prev, ...simulatedUsers]);
        }

        // Stop after 5 pages (50 users) for demo purposes
        if (pageNum >= 5) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        if (hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchUsers(nextPage);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, page, fetchUsers]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
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
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600">
                    <AvatarFallback className="text-white font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-green-500" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="truncate">{user.website}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.company.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.address.city}, {user.address.zipcode}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
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

        {/* End of List Indicator */}
        {!hasMore && users.length > 0 && (
          <div className="flex justify-center items-center py-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-gray-600 text-center font-medium">
                  You've reached the end! 🎉
                </p>
                <p className="text-gray-500 text-sm text-center mt-1">
                  Loaded {users.length} users total
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserListPage;
