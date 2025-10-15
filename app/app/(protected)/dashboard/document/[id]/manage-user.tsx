"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Trash, User as UserIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { axiosClient } from "@/lib/axios-client";
import type { AccessLevel, Collaborator, User } from "@/app/types";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ManageUserProps {
  documentID: string;
  collaborators: Collaborator[];
  refetch: () => void;
}

const searchUsers = async (query: string, documentID: string) => {
  const response = await axiosClient.get(
    `/document/colab/search/${documentID}?query=${query}`,
  );
  return response.data as User[];
};

const addCollaborator = async (
  documentID: string,
  userID: string,
  access: AccessLevel,
) => {
  await axiosClient.post(`/document/colab/${documentID}`, {
    userID,
    access,
  });
};

const removeCollaborator = async (documentID: string, userID: string) => {
  await axiosClient.delete(`/document/colab/${documentID}`, {
    data: { userID },
  });
};

export const ManageUser = ({
  documentID,
  collaborators,
  refetch,
}: ManageUserProps) => {
  const [search, setSearch] = useState("");
  const [userAccess, setUserAccess] = useState<Record<string, AccessLevel>>({});
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const {
    data: users,
    isFetching,
    isSuccess,
  } = useQuery({
    enabled: debouncedSearch.trim().length > 0 && !!documentID,
    queryKey: ["users", debouncedSearch.trim(), documentID],
    queryFn: () => searchUsers(debouncedSearch, documentID),

    staleTime: 1000 * 60 * 5, // 5 minutes, avoids refetching often
  });

  const { mutate: addCollaboratorMutation } = useMutation({
    mutationFn: ({ userID, access }: { userID: string; access: AccessLevel }) =>
      addCollaborator(documentID, userID, access),
    onMutate: ({ userID }) => {
      setAddingUserId(userID);
    },
    onSuccess: () => {
      refetch();
      setAddingUserId(null);
    },
    onError: () => {
      setAddingUserId(null);
      toast.error("Failed to add collaborator");
    },
  });

  const { mutate: removeCollaboratorMutation } = useMutation({
    mutationFn: ({ userID }: { userID: string }) =>
      removeCollaborator(documentID, userID),
    onMutate: ({ userID }) => {
      setRemovingUserId(userID);
    },
    onSuccess: () => {
      refetch();
      setRemovingUserId(null);
    },
    onError: () => {
      setRemovingUserId(null);
      toast.error("Failed to remove collaborator");
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          <Lock />
          Manage Access
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Access</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false} className="rounded-lg border">
          <CommandInput
            placeholder="Search users by email..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {!search.trim() && (
              <CommandGroup heading="Collaborators">
                {collaborators.map((collaborator) => (
                  <CommandItem
                    key={collaborator.userID}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {collaborator.user.name.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2 font-medium">
                          {collaborator.user.name}
                          <Badge variant={"secondary"}>
                            {collaborator.access.toUpperCase()}
                          </Badge>
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {collaborator.user.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      size={"icon"}
                      variant={"destructive"}
                      disabled={removingUserId === collaborator.userID}
                      onClick={() =>
                        removeCollaboratorMutation({
                          userID: collaborator.userID,
                        })
                      }
                    >
                      {removingUserId === collaborator.userID ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Trash />
                      )}
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {search.trim() && isFetching && (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner className="mb-3 h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  Searching users...
                </p>
              </div>
            )}

            {search.trim() && !isFetching && users && users.length > 0 && (
              <CommandGroup heading="Users">
                {users.map((user) => {
                  const isCollaborator = collaborators?.find(
                    (collaborator) => collaborator.userID === user.id,
                  );
                  return (
                    <CommandItem
                      key={user.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.name.charAt(0) ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2 font-medium">
                            {user.name}

                            {isCollaborator && (
                              <Badge variant={"secondary"}>
                                {isCollaborator.access.toUpperCase()}
                              </Badge>
                            )}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      {isCollaborator ? (
                        <Button
                          size={"icon"}
                          disabled={removingUserId === user.id}
                          onClick={() =>
                            removeCollaboratorMutation({
                              userID: user.id,
                            })
                          }
                          variant={"destructive"}
                        >
                          {removingUserId === user.id ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <Trash />
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Select
                            value={userAccess[user.id] || "read"}
                            onValueChange={(value) =>
                              setUserAccess((prev) => ({
                                ...prev,
                                [user.id]: value as AccessLevel,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="read">Read</SelectItem>
                              <SelectItem value="write">Write</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size={"icon"}
                            variant={"secondary"}
                            disabled={addingUserId === user.id}
                            onClick={() =>
                              addCollaboratorMutation({
                                userID: user.id,
                                access: userAccess[user.id] || "read",
                              })
                            }
                          >
                            {addingUserId === user.id ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <Plus />
                            )}
                          </Button>
                        </div>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Not found state */}
            {search.trim() &&
              !isFetching &&
              isSuccess &&
              (!users || users.length === 0) && (
                <CommandEmpty>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-muted mb-3 rounded-full p-3">
                      <UserIcon className="text-muted-foreground/50 h-8 w-8" />
                    </div>
                    <p className="font-medium">No users found</p>
                    <p className="text-muted-foreground text-xs">
                      Try searching with a different email
                    </p>
                  </div>
                </CommandEmpty>
              )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
