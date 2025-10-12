"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ManageUser } from "./manage-user";
import { ButtonGroup } from "@/components/ui/button-group";
import { ArrowLeft, Share } from "lucide-react";
import { Download } from "lucide-react";
import { Editor } from "./editor";
import { axiosClient } from "@/lib/axios-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  type CreateDocumentResponse,
  type CreateDocumentRequest,
  type Document,
} from "@/app/types";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { type AxiosResponse } from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface EditorSectionProps {
  id: string;
}

export const EditorSection = ({ id }: EditorSectionProps) => {
  const getDocument = async (id: string) => {
    const response = await axiosClient.get(`/document/${id}`);
    return response.data as Document;
  };
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [documentContent, setDocumentContent] = useState<CreateDocumentRequest>(
    {
      title: "Untitled Document",
      content: "",
    },
  );
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const lastSavedContent = useRef(documentContent.content);
  const lastSavedTitle = useRef(documentContent.title);

  const saveDocument = useMutation({
    mutationFn: (
      documentContent: CreateDocumentRequest,
    ): Promise<AxiosResponse<CreateDocumentResponse>> => {
      return axiosClient.post(`/document`, documentContent);
    },
    onSuccess: (data) => {
      const documentID = data.data.id;
      console.log(documentID);
      toast.success("Document saved");
      window.location.href = `/dashboard/document/${documentID}`;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateDocument = useMutation({
    mutationFn: (
      documentContent: CreateDocumentRequest,
    ): Promise<AxiosResponse<CreateDocumentResponse>> => {
      return axiosClient.put(`/document/${id}`, documentContent);
    },
    onSuccess: () => {
      void refetchDocument();
      lastSavedContent.current = documentContent.content;
      lastSavedTitle.current = documentContent.title;
    },
  });

  const {
    data: document,
    isSuccess,
    refetch: refetchDocument,
  } = useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
    refetchInterval: 60 * 0.5 * 1000, // 1 minute
    refetchIntervalInBackground: true, // refetch even when the tab is not in focus
    staleTime: 0,
  });

  useEffect(() => {
    if (isSuccess) {
      setDocumentContent({
        title: document.title,
        content: document.content,
      });
      setLastUpdated(document.updated_at);
    }
  }, [isSuccess, document]);

  const handleAutoSave = (nextContent: CreateDocumentRequest) => {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    const timer = setTimeout(() => {
      const unchanged =
        nextContent.content === lastSavedContent.current &&
        nextContent.title === lastSavedTitle.current;
      if (unchanged) {
        return;
      }

      if (!nextContent.content.trim() && !nextContent.title.trim()) {
        return;
      }

      if (id === "new") {
        saveDocument.mutate(nextContent);
      } else {
        updateDocument.mutate(nextContent);
      }

      lastSavedContent.current = nextContent.content;
      lastSavedTitle.current = nextContent.title;
    }, 1000);

    setSaveTimer(timer);
  };

  return (
    <div className="h-screen w-full">
      <section className="flex h-max w-full items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant={"outline"} size={"icon"} asChild>
            <Link href={`/dashboard`}>
              <ArrowLeft />
              <span className="sr-only">Back to dashboard</span>
            </Link>
          </Button>
          <Input
            className="w-max border-none! bg-transparent! text-2xl! font-bold"
            value={documentContent.title}
            onChange={(e) => {
              const nextDoc = { ...documentContent, title: e.target.value };
              setDocumentContent(nextDoc);
              handleAutoSave(nextDoc);
            }}
          />
          {updateDocument.isPending ? (
            <Spinner />
          ) : (
            <p
              className="text-muted-foreground font-mono text-sm"
              title={formatDate(lastUpdated)}
            >
              Last updated: {formatRelativeDate(lastUpdated)}
            </p>
          )}
        </div>
        {id !== "new" && (
          <div className="flex items-center gap-2">
            <ButtonGroup>
              <Button size={"sm"} variant={"outline"}>
                <Share /> Share
              </Button>
              <ManageUser documentID={id} />
              <Button size={"sm"}>
                <Download />
                Download
              </Button>
            </ButtonGroup>
          </div>
        )}
      </section>
      <Editor
        documentContent={documentContent}
        setDocumentContent={setDocumentContent}
        documentID={id}
        handleAutoSave={handleAutoSave}
      />
    </div>
  );
};
