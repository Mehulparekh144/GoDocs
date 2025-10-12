"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface ManageUserProps {
  documentID: string;
}

export const ManageUser = ({ documentID }: ManageUserProps) => {
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
      </DialogContent>
    </Dialog>
  );
};
