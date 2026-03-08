/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export const useUserManagement = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [dialogLoading, setDialogLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });

  const usersFetched = useRef(false);
  const rolesFetched = useRef(false);
  const searchTimeout = useRef<any>(null);

  // Dialog states
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  /*
  ==============================
  FETCH USERS
  ==============================
  */

  const fetchUsers = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
    }) => {
      setLoading(true);

      try {
        const page = params?.page ?? pagination.page;
        const limit = params?.limit ?? pagination.limit;
        const search = params?.search ?? filters.search;
        const role = params?.role ?? filters.role;
        const status = params?.status ?? filters.status;

        const query: any = { page, limit };

        if (search) query.search = search;
        if (role !== "all") query.role = role;
        if (status !== "all") query.isActive = status === "active";
        console.log("query", query);

        const response = await api.get("/user", { params: query });
        const result = response.data;
        console.log("user", response);

        const usersData = result || [];

        const paginationData = result?.pagination || result.pagination || {};

        setUsers(usersData);

        setPagination({
          page,
          limit,
          total: paginationData.total || 0,
          pages: paginationData.pages || 0,
        });
      } catch (error: any) {
        if (error.response?.status !== 429) {
          toast({
            title: "Error",
            description: "Failed to fetch users",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [], // important to keep stable
  );

  /*
  ==============================
  INITIAL USERS FETCH (ONCE)
  ==============================
  */

  useEffect(() => {
    if (usersFetched.current) return;

    usersFetched.current = true;
    fetchUsers({ page: 1, limit: 10 });
  }, []);

  /*
  ==============================
  FETCH ROLES (ONCE)
  ==============================
  */

  useEffect(() => {
    if (rolesFetched.current) return;

    rolesFetched.current = true;

    const loadRoles = async () => {
      setRolesLoading(true);

      try {
        const response = await api.get("/role");
        const result = response.data;

        setRoles(result.data?.roles || result.roles || result.data || []);
      } catch (error: any) {
        if (error.response?.status !== 429) {
          toast({
            title: "Error",
            description: "Failed to fetch roles",
            variant: "destructive",
          });
        }
      } finally {
        setRolesLoading(false);
      }
    };

    loadRoles();
  }, []);

  /*
  ==============================
  SEARCH (DEBOUNCE)
  ==============================
  */

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      fetchUsers({
        page: 1,
        search: value,
        role: filters.role,
        status: filters.status,
      });
    }, 500);
  };

  /*
  ==============================
  FILTERS
  ==============================
  */

  const handleRoleChange = (value: string) => {
    setFilters((prev) => ({ ...prev, role: value }));

    fetchUsers({
      page: 1,
      role: value,
      search: filters.search,
      status: filters.status,
    });
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));

    fetchUsers({
      page: 1,
      status: value,
      search: filters.search,
      role: filters.role,
    });
  };

  /*
  ==============================
  PAGINATION
  ==============================
  */

  const handlePageChange = (page: number) => {
    fetchUsers({
      page,
      search: filters.search,
      role: filters.role,
      status: filters.status,
    });
  };

  const handleLimitChange = (limit: number) => {
    fetchUsers({
      page: 1,
      limit,
      search: filters.search,
      role: filters.role,
      status: filters.status,
    });
  };

  /*
  ==============================
  CRUD ACTIONS
  ==============================
  */

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleAssignRole = (user: any) => {
    setSelectedUser(user);
    setSelectedRoleId("");
    setIsRoleDialogOpen(true);
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await api.put(`/user/${user.id}`, { isActive: !user.isActive });

      toast({
        title: "Success",
        description: `User ${user.isActive ? "deactivated" : "activated"} successfully`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setDialogLoading(true);

    try {
      await api.delete(`/user/${selectedUser.id}`);

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUserSubmit = async (values: any) => {
    setDialogLoading(true);

    try {
      if (selectedUser) {
        await api.put(`/user/${selectedUser.id}`, values);

        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        if (!values.password) {
          toast({
            title: "Error",
            description: "Password is required",
            variant: "destructive",
          });
          return;
        }

        await api.post("/user", values);

        toast({
          title: "Success",
          description: "User created successfully",
        });
      }

      setIsUserDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Operation failed",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleRoleAssign = async () => {
    if (!selectedUser || !selectedRoleId) return;

    setDialogLoading(true);

    try {
      await api.post(`/user/${selectedUser.id}/assign-role`, {
        roleId: selectedRoleId,
      });

      toast({
        title: "Success",
        description: "Role assigned successfully",
      });

      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const refresh = () => fetchUsers();

  return {
    users,
    roles,
    loading,
    rolesLoading,
    dialogLoading,
    pagination,
    filters,
    selectedUser,
    selectedRoleId,

    isUserDialogOpen,
    isRoleDialogOpen,
    isDeleteDialogOpen,

    setIsUserDialogOpen,
    setIsRoleDialogOpen,
    setIsDeleteDialogOpen,
    setSelectedRoleId,

    handleSearch,
    handleRoleChange,
    handleStatusChange,
    handlePageChange,
    handleLimitChange,

    handleCreateUser,
    handleEditUser,
    handleAssignRole,
    handleToggleStatus,
    handleDeleteClick,
    handleDeleteConfirm,

    handleUserSubmit,
    handleRoleAssign,

    refresh,
  };
};
