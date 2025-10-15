"use client";

import { type Document } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { axiosClient } from "@/lib/axios-client";
import { formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Archive, EllipsisVertical, Trash } from "lucide-react";
import Link from "next/link";

const getDocuments = async () => {
  const response = await axiosClient.get("/document");
  return response.data as Document[];
};

export const MyDocuments = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-wrap gap-4">
      {data?.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
};

const DocumentCard = ({ document }: { document: Document }) => {
  return (
    <Card className="group bg-card h-[400px] w-[250px] overflow-hidden border-0 p-0 transition-all hover:shadow-md">
      <Link
        href={`/dashboard/document/${document.id}`}
        className="block h-full"
      >
        <CardContent className="h-[calc(100%-60px)] p-0">
          <A4DocumentPreview content={document.content} />
          <div className="flex justify-center border-t px-3 py-2">
            <div className="flex h-full w-full items-center justify-between">
              <div className="flex flex-col items-start justify-center">
                <p className="text-foreground truncate text-center text-sm font-medium">
                  {document.title}
                </p>
                <p className="text-muted-foreground truncate text-center text-xs font-medium">
                  Updated {formatRelativeDate(document.updated_at)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.preventDefault()}
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

const A4DocumentPreview = ({ content }: { content: string }) => {
  return (
    <div className="h-full w-full overflow-hidden p-3">
      <div className="bg-background relative h-full w-full overflow-hidden rounded-md border shadow-sm">
        {/* Document shadow effect */}
        <div className="from-background to-muted/20 absolute inset-0 rounded-md bg-gradient-to-br" />

        {/* Document content */}
        <div
          className="relative h-full w-full overflow-hidden p-4"
          style={{
            fontSize: "10px",
            lineHeight: "1.3",
            transform: "scale(0.6)",
            transformOrigin: "top left",
            width: "167%",
            height: "167%",
          }}
        >
          <div
            className="bg-background h-full w-full"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Document corner fold effect */}
        <div className="from-muted/40 absolute right-0 bottom-0 h-8 w-8 bg-gradient-to-tl to-transparent" />
      </div>
    </div>
  );
};
